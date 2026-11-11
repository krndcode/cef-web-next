import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const actor = await getStoreUser();
    if (actor?.role !== "admin" || !actor.isPrimaryAdmin) {
      return NextResponse.json({ error: "Only the primary administrator can add admins." }, { status: 403 });
    }

    const parsed = z.object({ email: z.email().trim().toLowerCase().max(254) })
      .strict().safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter the email of an existing verified store account." }, { status: 400 });
    }

    const result = await getStoreDb().query<{ email: string }>(
      `UPDATE store_users
       SET role = 'admin', updated_at = NOW()
       WHERE LOWER(email) = $1 AND role = 'customer' AND is_active = TRUE
         AND neon_auth_user_id IS NOT NULL
       RETURNING email`,
      [parsed.data.email],
    );
    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "No active customer account was found for that email, or it is already an administrator." },
        { status: 404 },
      );
    }
    return NextResponse.json({ added: true, email: result.rows[0].email });
  } catch (error) {
    console.error("Administrator could not be added.", error);
    return NextResponse.json({ error: "Could not add administrator." }, { status: 500 });
  }
}
