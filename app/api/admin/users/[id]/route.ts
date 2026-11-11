import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const actor = await getStoreUser();
    if (actor?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = await context.params;
    const input = z.object({ isActive: z.boolean() }).safeParse(await request.json());
    if (!input.success) {
      return NextResponse.json({ error: "Choose whether the account is active." }, { status: 400 });
    }
    if (id === actor.id) {
      return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
    }

    const result = await getStoreDb().query(
      `UPDATE store_users
       SET is_active = $2, updated_at = NOW()
       WHERE id = $1 AND role = 'customer'
       RETURNING id`,
      [id, input.data.isActive],
    );
    if (result.rowCount !== 1) {
      return NextResponse.json(
        { error: "Customer account not found; administrator accounts cannot be changed here." },
        { status: 404 },
      );
    }

    if (!input.data.isActive) {
      await getStoreDb().query("DELETE FROM store_sessions WHERE user_id = $1", [id]);
    }
    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Admin user status update failed.", error);
    return NextResponse.json({ error: "Could not update customer account." }, { status: 500 });
  }
}
