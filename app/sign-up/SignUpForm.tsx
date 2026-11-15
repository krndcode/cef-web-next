"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  CircleUserRound,
  LockKeyhole,
  Mail,
  MailCheck,
  Phone,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { normalizeEmail, syncStoreProfile } from "@/lib/store-client";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
} from "@/lib/auth-validation";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthHeading from "@/components/auth/AuthHeading";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/auth/Button";
import PasswordField from "@/components/auth/PasswordField";
import PasswordStrength from "@/components/auth/PasswordStrength";
import TextField from "@/components/auth/TextField";
import VerifyEmailCard from "@/components/auth/VerifyEmailCard";

type SignUpFormProps = {
  nextPath: string;
};

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

/**
 * Saves the optional phone number once the new account is confirmed and has an
 * authenticated session.
 */
async function saveOptionalPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) {
    return;
  }

  try {
    await fetch("/api/store/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: trimmed }),
    });
  } catch (phoneError) {
    console.error("Could not save the optional phone number.", phoneError);
  }
}

export default function SignUpForm({ nextPath }: SignUpFormProps) {
  const router = useRouter();

  const [status, setStatus] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const signInHref = `/sign-in?next=${encodeURIComponent(nextPath)}`;

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }

  function friendlySignUpError(message: string): string {
    if (/already|exists|in use/i.test(message)) {
      return "An account with this email already exists. Sign in instead, or reset your password.";
    }
    return (
      message ||
      "Could not create your account. Please check your details and try again."
    );
  }

  function validateForm(): FieldErrors {
    const nextErrors: FieldErrors = {};
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    const confirmError = validatePasswordConfirmation(
      password,
      confirmPassword,
    );

    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;
    if (!acceptedTerms) {
      nextErrors.terms =
        "Please accept the terms and privacy policy to create an account.";
    }

    return nextErrors;
  }

  /**
   * Ends the unverified session (if the auth project created one) so the new
   * account cannot reach the store before its email is confirmed.
   */
  async function discardUnverifiedSession() {
    try {
      await neonAuthClient.signOut();
    } catch (signOutError) {
      console.error("Could not clear the unverified session.", signOutError);
    }
  }

  async function submitSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("");
      return;
    }

    setBusy(true);
    setError("");
    const normalizedEmail = normalizeEmail(email);

    try {
      const result = await neonAuthClient.signUp.email({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      if (result.error) {
        const message = result.error.message ?? "";

        // Some deployments report "verify your email" as a sign-up error
        // instead of returning an unverified user. Either way, continue to
        // the confirmation step.
        if (/verif/i.test(message)) {
          await discardUnverifiedSession();
          setPendingEmail(normalizedEmail);
          setStatus("verify");
          return;
        }

        setError(friendlySignUpError(message));
        return;
      }

      // Every new account has to confirm its email address: the store is not
      // usable until Neon Auth marks the address as verified.
      if (result.data?.user?.emailVerified !== true) {
        await discardUnverifiedSession();
        setPendingEmail(normalizedEmail);
        setStatus("verify");
        return;
      }

      const sync = await syncStoreProfile();
      if (sync.ok) {
        await saveOptionalPhone(phone);
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setError(sync.error);
    } catch (requestError) {
      console.error("Bookstore sign-up request failed.", requestError);
      setError("Could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Runs after Neon Auth accepts the six-digit code. Verification normally
   * establishes the session; the fallback covers projects that disable that.
   */
  async function finishVerifiedSignUp() {
    const sync = await syncStoreProfile();
    if (sync.ok) {
      await saveOptionalPhone(phone);
      router.replace(nextPath);
      router.refresh();
      return;
    }

    const verifiedEmail = normalizeEmail(pendingEmail || email);

    if (verifiedEmail && password) {
      try {
        const attempt = await neonAuthClient.signIn.email({
          email: verifiedEmail,
          password,
          rememberMe: true,
        });

        if (!attempt.error) {
          const retry = await syncStoreProfile();
          if (retry.ok) {
            await saveOptionalPhone(phone);
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

    router.replace(
      `/sign-in?next=${encodeURIComponent(
        nextPath,
      )}&email=${encodeURIComponent(verifiedEmail)}&verified=1`,
    );
  }

  if (status === "verify") {
    return (
      <AuthLayout>
        <AuthHeading
          icon={MailCheck}
          eyebrow="Confirm your email"
          title="One last step"
          description={`For your security, confirm ${
            pendingEmail || "your email address"
          } before you can sign in. Enter the six-digit code from the email we sent you.`}
        />

        <VerifyEmailCard
          email={pendingEmail}
          autoSend
          onVerified={finishVerifiedSignUp}
          onBack={() => {
            setStatus("form");
            setError("");
          }}
          backLabel="Back to the form"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeading
        icon={UserRoundPlus}
        eyebrow="Create account"
        title="Join the CEF community"
        description="Create an account to buy books, follow your orders, and download free study resources."
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={submitSignUp} noValidate className="mt-6 space-y-4">
        <TextField
          label="Full name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            clearFieldError("name");
          }}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              name: validateName(name) ?? undefined,
            }))
          }
          autoComplete="name"
          placeholder="Your full name"
          icon={CircleUserRound}
          required
          minLength={2}
          maxLength={120}
          error={fieldErrors.name}
        />

        <TextField
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError("email");
          }}
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

        <TextField
          label="Phone number"
          name="phone"
          type="tel"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            clearFieldError("phone");
          }}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              phone: validatePhone(phone) ?? undefined,
            }))
          }
          autoComplete="tel"
          placeholder="+233 24 000 0000"
          icon={Phone}
          inputMode="tel"
          maxLength={32}
          hint="Optional — used for delivery updates."
          error={fieldErrors.phone}
        />

        <PasswordField
          label="Password"
          name="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
            clearFieldError("confirmPassword");
          }}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              password: validatePassword(password) ?? undefined,
            }))
          }
          autoComplete="new-password"
          placeholder="Create a password"
          icon={LockKeyhole}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          error={fieldErrors.password}
        />

        {password && <PasswordStrength password={password} />}

        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearFieldError("confirmPassword");
          }}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              confirmPassword:
                validatePasswordConfirmation(password, confirmPassword) ??
                undefined,
            }))
          }
          autoComplete="new-password"
          placeholder="Repeat your password"
          icon={LockKeyhole}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          error={fieldErrors.confirmPassword}
        />

        <div className="space-y-1.5 pt-1">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg text-sm leading-6 text-gray-600 focus-within:ring-2 focus-within:ring-cefPurple/40 focus-within:ring-offset-2">
            <input
              type="checkbox"
              name="terms"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked);
                clearFieldError("terms");
              }}
              aria-invalid={fieldErrors.terms ? true : undefined}
              aria-describedby={
                fieldErrors.terms ? "signup-terms-error" : undefined
              }
              className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-cefPurple"
              required
            />
            <span>
              I agree to the store&apos;s terms of service and privacy policy,
              and to receiving essential account emails.
            </span>
          </label>
          {fieldErrors.terms && (
            <p
              id="signup-terms-error"
              className="text-xs font-medium text-red-600"
            >
              {fieldErrors.terms}
            </p>
          )}
        </div>

        <Button
          type="submit"
          loading={busy}
          loadingText="Creating your account..."
          className="mt-1"
        >
          Create account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>

        <p className="flex items-start gap-2 text-xs leading-5 text-gray-500">
          <ShieldCheck
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cefPurple"
            aria-hidden="true"
          />
          We&apos;ll email you a six-digit code. You must confirm your address
          before your first sign-in.
        </p>
      </form>

      <p className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="rounded font-bold text-cefPurple transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
        >
          Sign in
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
    </AuthLayout>
  );
}
