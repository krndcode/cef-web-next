"use client";

import { neonAuthClient } from "@/lib/neon-auth-client";

type AuthResult = {
  error?: { message?: string } | null;
};

/**
 * The password-reset endpoints are part of the Better Auth server API, but the
 * generated Neon Auth client type only documents the methods used elsewhere in
 * this app. Keep the cast in one place so the rest of the UI stays typed.
 */
type PasswordResetApi = {
  requestPasswordReset: (input: {
    email: string;
    redirectTo: string;
  }) => Promise<AuthResult>;
  resetPassword: (input: {
    newPassword: string;
    token: string;
  }) => Promise<AuthResult>;
};

function passwordResetApi(): PasswordResetApi {
  return neonAuthClient as unknown as PasswordResetApi;
}

/**
 * Asks Neon Auth to email a reset link. The same generic success message is
 * shown to the user whether or not the email is registered.
 */
export async function sendPasswordResetEmail(
  email: string,
  redirectTo: string,
): Promise<AuthResult> {
  return passwordResetApi().requestPasswordReset({ email, redirectTo });
}

/**
 * Completes the reset flow with the token Neon Auth appends to the redirect
 * URL (`/reset-password?token=...`).
 */
export async function resetPasswordWithToken(
  newPassword: string,
  token: string,
): Promise<AuthResult> {
  return passwordResetApi().resetPassword({ newPassword, token });
}
