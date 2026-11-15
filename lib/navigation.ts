export const DEFAULT_SIGNED_IN_PATH = "/store";

/**
 * Returns a safe in-app path to send a user to after signing in.
 * Rejects absolute URLs and protocol-relative paths so the `next` query
 * parameter can never be used as an open redirect.
 */
export function safeNextPath(
  value: string | string[] | undefined,
  fallback: string = DEFAULT_SIGNED_IN_PATH,
): string {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return fallback;
  }

  const trimmed = candidate.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.includes("://")
  ) {
    return fallback;
  }

  return trimmed;
}

export function signInHref(nextPath: string = DEFAULT_SIGNED_IN_PATH): string {
  return `/sign-in?next=${encodeURIComponent(nextPath)}`;
}
