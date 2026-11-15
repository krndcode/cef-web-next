"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-cefPurple text-white shadow-lg shadow-purple-900/15 hover:bg-purple-900 focus-visible:ring-cefPurple",
  outline:
    "border border-gray-200 bg-white text-cefPurple hover:border-cefPurple hover:bg-purple-50 focus-visible:ring-cefPurple",
};

export default function Button({
  variant = "primary",
  loading = false,
  loadingText,
  children,
  className = "",
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${variantClassNames[variant]} ${className}`}
    >
      {loading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
