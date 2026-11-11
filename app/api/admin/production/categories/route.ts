import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(500),
}).strict();

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const admin = await getStoreUser();
    if (admin?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a category name and description." }, { status: 400 });
    }
    const slug = slugify(parsed.data.name);
    if (!slug) {
      return NextResponse.json({ error: "Choose a category name that can form a URL." }, { status: 400 });
    }
    await getStoreDb().query(
      `INSERT INTO production_categories (id, name, slug, description, "order")
       VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX("order") + 1 FROM production_categories), 1))`,
      [randomUUID(), parsed.data.name, slug, parsed.data.description],
    );
    return NextResponse.json({ created: true }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "A category with that name already exists." }, { status: 409 });
    }
    console.error("Production category could not be created.", error);
    return NextResponse.json({ error: "Could not create the category." }, { status: 500 });
  }
}
