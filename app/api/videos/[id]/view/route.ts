import { NextResponse } from "next/server";
import { getStoreDb } from "@/lib/store-db";
import { isSameOriginRequest } from "@/lib/store-auth";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  try {
    const result = await getStoreDb().query(
      `UPDATE production_videos
       SET views = views + 1
       WHERE id = $1 AND published_at IS NOT NULL AND published_at <= NOW()
       RETURNING id`,
      [id],
    );
    if (result.rowCount !== 1) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }
    return NextResponse.json({ counted: true });
  } catch (error) {
    console.error("Could not record production video view.", error);
    return NextResponse.json({ error: "Could not record video view." }, { status: 500 });
  }
}
