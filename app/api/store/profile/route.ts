import { NextResponse } from "next/server";
import { getNeonAuth } from "@/lib/neon-auth";
import {
  ensureStoreUserForNeonAuth,
  StoreEmailVerificationRequiredError,
  isSameOriginRequest,
} from "@/lib/store-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const { data, error } = await getNeonAuth().getSession();
    if (error) {
      throw new Error(`Could not validate the Neon Auth session: ${error.message}`);
    }
    const authUser = data?.user;
    if (!authUser) {
      return NextResponse.json(
        { error: "Sign in to access the bookstore." },
        { status: 401 },
      );
    }

    const user = await ensureStoreUserForNeonAuth({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
    });
    if (!user.isActive) {
      return NextResponse.json(
        { error: "This store account is disabled. Contact store support." },
        { status: 403 },
      );
    }
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof StoreEmailVerificationRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Store profile synchronization failed.", error);
    return NextResponse.json(
      { error: "Could not prepare your store account. Please try again." },
      { status: 500 },
    );
  }
}
