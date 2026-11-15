"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { normalizeEmail, syncStoreProfile } from "@/lib/store-client";
import { validateEmail, PASSWORD_MAX_LENGTH } from "@/lib/auth-validation";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthHeading from "@/components/auth/AuthHeading";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/auth/Button";
import PasswordField from "@/components/auth/PasswordField";
import TextField from "@/components/auth/TextField";
import VerifyEmailCard from "@/components/auth/VerifyEmailCard";

type SignInFormProps = {
  nextPath: string;
  initialEmail?: string;
  startInVerification?: boolean;
  initialNotice?: string;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function SignInForm({
  nextPath,
  initialEmail = "",
  startInVerification = false,
  initialNotice,
}: SignInFormProps) {
  const router = useRouter();

  const [view, setView] = useState<"sign-in" | "verify">(
    startInVerification ? "verify" : "sign-in",
  );
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [verificationEmail, setVerificationEmail] = useState(initialEmail);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState(initialNotice ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const signUpHref = `/sign-up?next=${encodeURIComponent(nextPath)}`;
  const forgotHref = `/forgot-password?next=${encodeURIComponent(nextPath)}`;

  function updateEmail(value: string) {
    setEmail(value);
    setFieldErrors((current) => ({ ...current, email: undefined }));
    setError("");
  }

  function updatePassword(value: string) {
    setPassword(value);
    setFieldErrors((current) => ({ ...current, password: undefined }));
    setError("");
  }

  function normalizeSignInError(message: string): string {
    if (/invalid|credential|password|incorrect/i.test(message)) {
      return "The email or password you entered is incorrect. Please try again.";
    }
    return message || "Could not sign in. Please try again.";
  }

  async function submitSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const nextErrors: FieldErrors = {};
    const emailError = validateEmail(email);
    if (emailError) {
      nextErrors.email = emailError;
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    } else if (password.length > PASSWORD_MAX_LENGTH) {
      nextErrors.password = `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`;
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("");
      return;
    }

    setBusy(true);
    setError("");
    const normalizedEmail = normalizeEmail(email);

    try {
      const result = await neonAuthClient.signIn.email({
        email: normalizedEmail,
        password,
        rememberMe: remember,
      });

      if (result.error) {
        const message =
          result.error.message || "Could not sign in with those details.";
        const errorCode =
          (result.error as { code?: string }).code?.toLowerCase() ?? "";

        // Either the project requires verification, or the account itself is
        // unconfirmed. Both cases go to the same confirmation step.
        if (/verif/.test(message.toLowerCase()) || /verif/.test(errorCode)) {
          setVerificationEmail(normalizedEmail);
          setView("verify");
          return;
        }

        setError(normalizeSignInError(message));
        return;
      }

      // Some auth projects allow an unverified account to sign in. Never let
      // that session reach the store: drop it and require confirmation first.
      if (result.data?.user && result.data.user.emailVerified !== true) {
        try {
          await neonAuthClient.signOut();
        } catch (signOutError) {
          console.error(
            "Could not clear the unverified session.",
            signOutError,
          );
        }

        setVerificationEmail(normalizedEmail);
        setView("verify");
        return;
      }

      const sync = await syncStoreProfile();
      if (!sync.ok) {
        setError(sync.error);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (requestError) {
      console.error("Bookstore sign-in request failed.", requestError);
      setError("Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Runs after Neon Auth accepts the six-digit code. Verification normally
   * establishes the session; the fallback covers projects that disable that.
   */
  async function finishVerifiedSignIn() {
    const sync = await syncStoreProfile();
    if (sync.ok) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    if (password) {
      try {
        const attempt = await neonAuthClient.signIn.email({
          email: normalizeEmail(verificationEmail),
          password,
          rememberMe: remember,
        });

        if (!attempt.error) {
          const retry = await syncStoreProfile();
          if (retry.ok) {
            router.replace(nextPath);
            router.refresh();
            return;
          }
        }
      } catch (requestError) {
        console.error(
          "Could not sign in after email verification.",
          requestError,
        );
      }
    }

    setEmail(verificationEmail);
    setPassword("");
    setView("sign-in");
    setNotice("Your email is verified. Sign in to continue to the store.");
  }

  return (
    <AuthLayout>
      {view === "verify" ? (
        <>
          <AuthHeading
            icon={ShieldCheck}
            eyebrow="Email verification"
            title="Confirm your email"
            description={`For your security, confirm ${
              verificationEmail || "your email address"
            } before signing in to the bookstore.`}
          />

          <VerifyEmailCard
            email={verificationEmail}
            onEmailChange={setVerificationEmail}
            editableEmail
            autoSend
            onVerified={finishVerifiedSignIn}
            onBack={() => {
              setEmail(verificationEmail);
              setView("sign-in");
              setNotice("");
              setError("");
            }}
          />
        </>
      ) : (
        <>
          <AuthHeading
            icon={LockKeyhole}
            eyebrow="Member bookstore"
            title="Welcome back"
            description="Sign in to browse publications, place orders, and manage your account."
          />

          {notice && <AuthAlert kind="success">{notice}</AuthAlert>}
          {error && (
            <AuthAlert className={notice ? "mt-3" : ""}>{error}</AuthAlert>
          )}

          <form onSubmit={submitSignIn} noValidate className="mt-6 space-y-4">
            <TextField
              label="Email address"
              name="email"
              type="email"
              value={email}
              onChange={(event) => updateEmail(event.target.value)}
              onBlur={() =>
                setFieldErrors((current) => ({
                  ...current,
                  email: validateEmail(email) ?? undefined,
                }))
              }
              autoComplete="email"
              placeholder="you@example.com"
              icon={Mail}
              required
              maxLength={254}
              error={fieldErrors.email}
            />

            <PasswordField
              label="Password"
              name="password"
              value={password}
              onChange={(event) => updatePassword(event.target.value)}
              onBlur={() => {
                if (!password) {
                  setFieldErrors((current) => ({
                    ...current,
                    password: "Enter your password.",
                  }));
                }
              }}
              autoComplete="current-password"
              placeholder="Enter your password"
              icon={LockKeyhole}
              required
              maxLength={PASSWORD_MAX_LENGTH}
              error={fieldErrors.password}
              labelAccessory={
                <Link
                  href={forgotHref}
                  className="rounded text-xs font-semibold text-cefPurple transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
                >
                  Forgot password?
                </Link>
              }
            />

            <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-lg text-sm text-gray-600 focus-within:ring-2 focus-within:ring-cefPurple/40 focus-within:ring-offset-2">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-cefPurple"
              />
              Remember me
            </label>

            <Button
              type="submit"
              loading={busy}
              loadingText="Signing in..."
              className="mt-1"
            >
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setVerificationEmail(email);
              setView("verify");
              setNotice("");
              setError("");
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-1 text-sm font-semibold text-cefPurple transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Need to verify your email?
          </button>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Or
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            New to the store?{" "}
            <Link
              href={signUpHref}
              className="rounded font-bold text-cefPurple transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-gray-500">
            Just browsing?{" "}
            <Link
              href="/store"
              className="rounded font-bold text-cefPurple transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
            >
              Visit the bookstore
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
