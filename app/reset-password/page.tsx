import type { Metadata } from "next";
import { safeNextPath } from "@/lib/navigation";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | CEF Bookstore",
  description:
    "Choose a new password for your Christ The Entirety Foundation bookstore account.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
    code?: string | string[];
    error?: string | string[];
    next?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = firstValue(params.token) || firstValue(params.code);
  const errorCode = firstValue(params.error);
  const nextPath = safeNextPath(params.next);

  return (
    <ResetPasswordForm
      token={errorCode ? null : token || null}
      nextPath={nextPath}
    />
  );
}
