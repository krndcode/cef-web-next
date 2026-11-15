import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStoreUser } from "@/lib/store-auth";
import { safeNextPath } from "@/lib/navigation";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In | CEF Bookstore",
  description:
    "Sign in to your Christ The Entirety Foundation bookstore account to place orders and download study resources.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    email?: string | string[];
    verify?: string | string[];
    verified?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next, email, verify, verified } = await searchParams;
  const nextPath = safeNextPath(next);
  const initialEmail = typeof email === "string" ? email : "";
  const initialNotice =
    verified === "1"
      ? "Your email address is confirmed. Sign in to continue to the store."
      : undefined;

  let alreadySignedIn = false;
  try {
    alreadySignedIn = Boolean(await getStoreUser());
  } catch (error) {
    console.error("Could not check the bookstore session.", error);
  }

  if (alreadySignedIn) {
    redirect(nextPath);
  }

  return (
    <SignInForm
      nextPath={nextPath}
      initialEmail={initialEmail}
      startInVerification={verify === "1"}
      initialNotice={initialNotice}
    />
  );
}
