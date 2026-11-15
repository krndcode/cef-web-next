export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,32}$/;

export function validateName(value: string): string | null {
  const name = value.trim();
  if (name.length < 2) {
    return "Enter your full name.";
  }
  if (name.length > 120) {
    return "Your name must be 120 characters or fewer.";
  }
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) {
    return "Enter your email address.";
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePhone(value: string): string | null {
  const phone = value.trim();
  if (!phone) {
    return null;
  }
  if (!PHONE_PATTERN.test(phone)) {
    return "Enter a valid phone number, including the country code.";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return "Enter a password.";
  }
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    return `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (!confirmation) {
    return "Confirm your password.";
  }
  if (password !== confirmation) {
    return "The passwords do not match.";
  }
  return null;
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  tone: "empty" | "weak" | "fair" | "good" | "strong";
};

/**
 * Lightweight, client-side strength meter. Length carries the most weight
 * because Neon Auth requires at least 12 characters.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Enter a password", tone: "empty" };
  }

  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const normalized = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

  if (normalized <= 1) {
    return { score: normalized, label: "Weak", tone: "weak" };
  }
  if (normalized === 2) {
    return { score: normalized, label: "Fair", tone: "fair" };
  }
  if (normalized === 3) {
    return { score: normalized, label: "Good", tone: "good" };
  }
  return { score: normalized, label: "Strong", tone: "strong" };
}
