"use client";

import type { ReactNode } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

type AuthAlertProps = {
  kind?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
};

const kindClassNames = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
} as const;

export default function AuthAlert({
  kind = "error",
  children,
  className = "",
}: AuthAlertProps) {
  const Icon = kind === "success" ? CheckCircle2 : CircleAlert;

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-live={kind === "error" ? "assertive" : "polite"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-6 ${kindClassNames[kind]} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
