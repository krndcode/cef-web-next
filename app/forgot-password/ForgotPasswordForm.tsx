"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
  MailCheck,
  Send,
} from "lucide-react";
import { normalizeEmail } from "@/lib/store-client";
import { validateEmail } from "@/lib/auth-validation";
import { sendPasswordResetEmail } from "@/lib/auth-password";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthHeading from "@/components/auth/AuthHeading";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/auth/Button";
import TextField from "@/components/auth/TextField";
import { useResendCooldown } from "@/components/auth/useResendCooldown";

type ForgotPasswordFormProps = {
  nextPath: string;
};

export default function ForgotPasswordForm({
  nextPath,
}: ForgotPasswordFormProps) {
  const resendCooldown = useResendCooldown(60);

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const signInHref = `/sign-in?next=${encodeURIComponent(nextPath)}`;

  async function requestResetLink() {
    if (resendCooldown.remaining > 0) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      // The redirect URL must also be allowed in the Neon Auth project
      // settings (Auth → URL configuration).
      const redirectTo = `${window.location.origin}/reset-password`;
      const result = await sendPasswordResetEmail(
        normalizeEmail(email),
        redirectTo,
      );
      if (result.error) {
        console.error(
          "Neon Auth rejected the password reset request.",
          result.error,
        );
      }
      setSent(true);
      resendCooldown.start();
    } catch (requestError) {
      console.error("Password reset request failed.", requestError);
      // Never reveal whether the address exists. Show the same generic
      // confirmation even if the request fails.
      setSent(true);
      resendCooldown.start();
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailError = validateEmail(email);
    setFieldError(emailError ?? undefined);

    if (emailError) {
      setError("");
      return;
    }

    await requestResetLink();
  }

  if (sent) {
    return (
      <AuthLayout>
        <AuthHeading
          icon={MailCheck}
          eyebrow="Reset link sent"
          title="Check your email"
          description={`If an account exists for ${
            email || "that address"
          }, we've sent a password reset link. The link expires in one hour.`}
        />

        <div className="rounded-2xl border border-gray-200 bg-cefPage p-4 text-sm leading-6 text-gray-600">
          Didn&apos;t get the email? Check your spam or promotions folder, then
          try resending. For your security, we show this same message whether or
          not an account exists.
        </div>

        {error && <AuthAlert className="mt-4">{error}</AuthAlert>}

        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            onClick={() => void requestResetLink()}
            loading={busy}
            loadingText="Sending..."
            disabled={resendCooldown.remaining > 0}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {resendCooldown.remaining > 0
              ? `Resend reset link in ${resendCooldown.remaining}s`
              : "Resend reset link"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError("");
            }}
            className="w-full rounded-lg py-1 text-center text-sm font-semibold text-gray-500 transition hover:text-cefPurple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
          >
            Use a different email address
          </button>
        </div>

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

  return (
    <AuthLayout>
      <AuthHeading
        icon={KeyRound}
        eyebrow="Account recovery"
        title="Forgot your password?"
        description="Enter the email address you use for the CEF store and we'll send you a secure link to choose a new password."
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <TextField
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldError(undefined);
            setError("");
          }}
          onBlur={() => setFieldError(validateEmail(email) ?? undefined)}
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          required
          maxLength={254}
          error={fieldError}
          hint="We'll send the reset link to this address."
        />

        <Button
          type="submit"
          loading={busy}
          loadingText="Sending reset link..."
          className="mt-1"
        >
          Send reset link
          <Send className="h-4 w-4" aria-hidden="true" />
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

      <p className="mt-4 text-center text-sm text-gray-500">
        New to the store?{" "}
        <Link
          href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
          className="rounded font-bold text-cefPurple transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
        >
          Create an account
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </p>
    </AuthLayout>
  );
}
