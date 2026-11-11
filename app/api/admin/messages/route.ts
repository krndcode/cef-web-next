import { NextResponse } from "next/server";
import { getStoreUser } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await getStoreUser();
    if (admin?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const result = await getStoreDb().query(
      `SELECT id, name, email, topic, message, status, is_read, reply, replied_at, created_at
       FROM support_messages
       ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
                created_at DESC
       LIMIT 100`,
    );
    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    console.error("Support inbox could not be loaded.", error);
    return NextResponse.json({ error: "Could not load support messages." }, { status: 500 });
  }
}
