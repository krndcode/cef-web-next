"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  TriangleAlert,
} from "lucide-react";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/auth-validation";
import { resetPasswordWithToken } from "@/lib/auth-password";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthHeading from "@/components/auth/AuthHeading";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/auth/Button";
import PasswordField from "@/components/auth/PasswordField";
import PasswordStrength from "@/components/auth/PasswordStrength";

type ResetPasswordFormProps = {
  token: string | null;
  nextPath: string;
};

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

export default function ResetPasswordForm({
  token,
  nextPath,
}: ResetPasswordFormProps) {
  const [status, setStatus] = useState<"form" | "success" | "expired">(
    token ? "form" : "expired",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const signInHref = `/sign-in?next=${encodeURIComponent(nextPath)}`;
  const forgotHref = `/forgot-password?next=${encodeURIComponent(nextPath)}`;

  function clearError(field: keyof FieldErrors) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus("expired");
      return;
    }

    const nextErrors: FieldErrors = {};
    const passwordError = validatePassword(password);
    const confirmError = validatePasswordConfirmation(password, confirmPassword);

    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await resetPasswordWithToken(password, token);

      if (result.error) {
        const message = result.error.message ?? "";

        if (/token|expired|invalid/i.test(message)) {
          setStatus("expired");
          return;
        }

        setError(
          message ||
            "Could not update your password. Please request a new reset link.",
        );
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setStatus("success");
    } catch (requestError) {
      console.error("Password reset failed.", requestError);
      setError("Could not update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "expired") {
    return (
      <AuthLayout>
        <AuthHeading
          icon={TriangleAlert}
          eyebrow="Link expired"
          title="This reset link has expired"
          description="Password reset links can only be used once and expire after one hour. Request a new link to choose a new password."
        />

        <div className="space-y-3">
          <Link
            href={forgotHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cefPurple px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/15 transition hover:bg-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Request a new reset link
          </Link>

          <Link
            href={signInHref}
            className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-gray-500 transition hover:text-cefPurple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout>
        <AuthHeading
          icon={CheckCircle2}
          eyebrow="Password updated"
          title="Your password is ready"
          description="Your password has been changed. Sign in with your new password to continue to the bookstore."
        />

        <div className="space-y-3">
          <Link
            href={signInHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cefPurple px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/15 transition hover:bg-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
          >
            Sign in with your new password
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-6 border-t border-gray-100 pt-5 text-center text-xs leading-5 text-gray-500">
          For your security, any other devices signed in with the old password
          may need to sign in again.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeading
        icon={KeyRound}
        eyebrow="Choose a new password"
        title="Set a new password"
        description="Create a new password for your CEF bookstore account. Use at least 12 characters."
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <PasswordField
          label="New password"
          name="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearError("password");
            clearError("confirmPassword");
          }}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              password: validatePassword(password) ?? undefined,
            }))
          }
          autoComplete="new-password"
          placeholder="Create a new password"
          icon={LockKeyhole}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          error={fieldErrors.password}
        />

        {password && <PasswordStrength password={password} />}

        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearError("confirmPassword");
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
          placeholder="Repeat your new password"
          icon={LockKeyhole}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          error={fieldErrors.confirmPassword}
        />

        <Button
          type="submit"
          loading={busy}
          loadingText="Updating password..."
          className="mt-1"
        >
          Update password
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <Link
          href={signInHref}
          className="flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-cefPurple transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
