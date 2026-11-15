"use client";

import { getPasswordStrength } from "@/lib/auth-validation";

const toneClassNames = {
  empty: "text-gray-500",
  weak: "text-red-600",
  fair: "text-amber-600",
  good: "text-cefBlueInk",
  strong: "text-emerald-700",
} as const;

const barClassNames = {
  empty: "bg-gray-200",
  weak: "bg-red-500",
  fair: "bg-amber-500",
  good: "bg-cefBlue",
  strong: "bg-emerald-600",
} as const;

export default function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const filled = strength.score;

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-gray-500">Password strength</span>
        <span className={`font-semibold ${toneClassNames[strength.tone]}`}>
          {strength.label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 rounded-full transition-colors ${
              segment <= filled
                ? barClassNames[strength.tone]
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs leading-5 text-gray-500">
        Use at least 12 characters with a mix of letters, numbers, and symbols.
      </p>
    </div>
  );
}
