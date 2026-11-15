export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type SyncResult = { ok: true } | { ok: false; error: string };

/**
 * Makes sure the signed-in Neon Auth user also has a bookstore account.
 * Safe to call after sign-in, sign-up and email verification.
 */
export async function syncStoreProfile(): Promise<SyncResult> {
  try {
    const response = await fetch("/api/store/profile", { method: "POST" });
    let result: { error?: string } = {};

    try {
      result = (await response.json()) as { error?: string };
    } catch {
      result = {};
    }

    if (!response.ok) {
      return {
        ok: false,
        error: result.error ?? "Could not prepare your bookstore account.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("Bookstore profile synchronization failed.", error);
    return {
      ok: false,
      error: "Could not reach the store. Please check your connection and try again.",
    };
  }
}
