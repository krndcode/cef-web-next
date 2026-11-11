import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(500),
}).strict();

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 100);
}

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
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid category name and description." }, { status: 400 });
    }
    const slug = slugify(parsed.data.name);
    if (!slug) {
      return NextResponse.json({ error: "Choose a category name that can form a URL." }, { status: 400 });
    }
    const result = await getStoreDb().query(
      `UPDATE production_categories SET name = $2, slug = $3, description = $4
       WHERE id = $1 RETURNING id`,
      [id, parsed.data.name, slug, parsed.data.description],
    );
    if (!result.rows[0]) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }
    return NextResponse.json({ updated: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "A category with that name already exists." }, { status: 409 });
    }
    console.error("Production category could not be updated.", error);
    return NextResponse.json({ error: "Could not update the category." }, { status: 500 });
  }
}
