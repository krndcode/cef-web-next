import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStoreUser } from "@/lib/store-auth";
import { safeNextPath } from "@/lib/navigation";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create Account | CEF Bookstore",
  description:
    "Create a Christ The Entirety Foundation bookstore account to order books and download study resources.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SignUpPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);

  let alreadySignedIn = false;
  try {
    alreadySignedIn = Boolean(await getStoreUser());
  } catch (error) {
    console.error("Could not check the bookstore session.", error);
  }

  if (alreadySignedIn) {
    redirect(nextPath);
  }

  return <SignUpForm nextPath={nextPath} />;
}
