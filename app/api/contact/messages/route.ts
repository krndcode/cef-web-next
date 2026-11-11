import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

const messageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase().max(254),
  topic: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(5000),
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the message details and try again." }, { status: 400 });
  }

  try {
    await getStoreDb().query(
      `INSERT INTO support_messages (id, name, email, topic, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), parsed.data.name, parsed.data.email, parsed.data.topic, parsed.data.message],
    );
    return NextResponse.json({ sent: true }, { status: 201 });
  } catch (error) {
    console.error("Contact message could not be saved.", error);
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }
}
