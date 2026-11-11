import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(["new", "in_progress", "replied", "closed"]).optional(),
  reply: z.string().trim().min(1).max(5000).optional(),
  isRead: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const admin = await getStoreUser();
    if (admin?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message update." }, { status: 400 });
    }

    const { status, reply, isRead } = parsed.data;
    const result = await getStoreDb().query(
      `UPDATE support_messages
       SET status = COALESCE($2, CASE WHEN $3::text IS NOT NULL THEN 'in_progress' ELSE status END),
           is_read = COALESCE($4, CASE
             WHEN $2 = 'new' THEN FALSE
             WHEN $2 IS NOT NULL THEN TRUE
             ELSE is_read
           END),
           reply = COALESCE($3, reply),
           replied_at = CASE
             WHEN $2 = 'replied' THEN COALESCE(replied_at, NOW())
             WHEN $2 IN ('new', 'in_progress') OR $3::text IS NOT NULL THEN NULL
             ELSE replied_at
           END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id, status, reply, isRead],
    );
    if (result.rowCount !== 1) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }
    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Support message could not be updated.", error);
    return NextResponse.json({ error: "Could not update this message." }, { status: 500 });
  }
}
