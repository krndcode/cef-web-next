import type { Metadata } from "next";
import { safeNextPath } from "@/lib/navigation";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | CEF Bookstore",
  description:
    "Request a secure password reset link for your Christ The Entirety Foundation bookstore account.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { next } = await searchParams;

  return <ForgotPasswordForm nextPath={safeNextPath(next)} />;
}
