"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { normalizeEmail } from "@/lib/store-client";
import { validateEmail } from "@/lib/auth-validation";
import AuthAlert from "./AuthAlert";
import Button from "./Button";
import TextField from "./TextField";
import { useResendCooldown } from "./useResendCooldown";

type VerifyEmailCardProps = {
  email: string;
  onEmailChange?: (value: string) => void;
  editableEmail?: boolean;
  /** Runs after Neon Auth confirms the code. Should finish signing in. */
  onVerified: () => void | Promise<void>;
  onBack: () => void;
  backLabel?: string;
  /** Sends a fresh code as soon as the card appears. */
  autoSend?: boolean;
  initialMessage?: string;
};

/**
 * Shared six-digit email verification step. Used by sign-up and by sign-in
 * whenever an account has not confirmed its email address yet.
 */
export default function VerifyEmailCard({
  email,
  onEmailChange,
  editableEmail = false,
  onVerified,
  onBack,
  backLabel = "Back to sign in",
  autoSend = false,
  initialMessage,
}: VerifyEmailCardProps) {
  const cooldown = useResendCooldown(60);
  const autoSent = useRef(false);

  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialMessage ?? "");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendCode = useCallback(async () => {
    const target = normalizeEmail(email);
    const emailError = validateEmail(target);

    if (emailError) {
      setEmailError(emailError);
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      const result = await neonAuthClient.emailOtp.sendVerificationOtp({
        email: target,
        type: "email-verification",
      });

      if (result.error) {
        setError(
          result.error.message || "Could not send the verification code.",
        );
        return;
      }

      setNotice(`A six-digit verification code was sent to ${target}.`);
      cooldown.start();
    } catch (requestError) {
      console.error("Could not send the verification code.", requestError);
      setError("Could not send the verification code. Please try again.");
    } finally {
      setSending(false);
    }
  }, [cooldown, email]);

  useEffect(() => {
    if (!autoSend || autoSent.current) {
      return;
    }
    if (!normalizeEmail(email)) {
      return;
    }

    autoSent.current = true;

    // Deferred so the send does not synchronously cascade renders from the
    // effect body; it also keeps StrictMode from firing two requests.
    const timer = window.setTimeout(() => void sendCode(), 0);
    return () => window.clearTimeout(timer);
  }, [autoSend, email, sendCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCodeError(undefined);
    setError("");

    const target = normalizeEmail(email);
    const emailError = validateEmail(target);
    if (emailError) {
      setEmailError(emailError);
      return;
    }
    setEmailError(undefined);

    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the six-digit code from your email.");
      return;
    }

    setVerifying(true);

    try {
      const result = await neonAuthClient.emailOtp.verifyEmail({
        email: target,
        otp: code,
      });

      if (result.error) {
        setCodeError(
          result.error.message ||
            "That code is invalid or has expired. Request a new one and try again.",
        );
        return;
      }

      setNotice("Email confirmed. Finishing sign-in…");
      await onVerified();
    } catch (requestError) {
      console.error("Email verification failed.", requestError);
      setError("Could not verify your email. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <>
      {notice && <AuthAlert kind="success">{notice}</AuthAlert>}
      {error && <AuthAlert className={notice ? "mt-3" : ""}>{error}</AuthAlert>}

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {editableEmail ? (
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              onEmailChange?.(event.target.value);
              setEmailError(undefined);
              setError("");
            }}
            onBlur={() => setEmailError(validateEmail(email) ?? undefined)}
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
            required
            maxLength={254}
            error={emailError}
            hint="Use the address you registered with."
          />
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-cefPage px-4 py-3">
            <Mail
              className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Code sent to
              </p>
              <p className="truncate text-sm font-semibold text-gray-900">
                {email || "your email address"}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => void sendCode()}
          loading={sending}
          loadingText="Sending..."
          disabled={cooldown.remaining > 0 || verifying}
          className="py-3"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {cooldown.remaining > 0
            ? `Resend code in ${cooldown.remaining}s`
            : "Send verification code"}
        </Button>

        <TextField
          label="Verification code"
          name="code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
            setCodeError(undefined);
            setError("");
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          required
          minLength={6}
          maxLength={6}
          hint="Enter the six-digit code from the email we sent you."
          error={codeError}
          inputClassName="text-center text-2xl font-bold tracking-[0.5em]"
        />

        <Button
          type="submit"
          loading={verifying}
          loadingText="Confirming..."
          disabled={code.length !== 6}
          className="mt-1"
        >
          Confirm email
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-1 text-sm font-semibold text-gray-500 transition hover:text-cefPurple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </button>
    </>
  );
}
