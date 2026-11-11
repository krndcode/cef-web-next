import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to download this resource." }, { status: 401 });
    }

    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    const product = await getStoreDb().query<{ id: string }>(
      `SELECT id FROM store_products
       WHERE id = $1 AND is_active = TRUE AND product_type = 'free_resource'
         AND download_path LIKE '/resources/%.pdf'`,
      [id],
    );
    if (!product.rows[0]) {
      return NextResponse.json(
        { error: "This free resource is not available for download yet." },
        { status: 404 },
      );
    }

    await getStoreDb().query(
      `INSERT INTO store_resource_access (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [user.id, id],
    );
    return NextResponse.json({
      downloadUrl: `/api/store/resources/${id}/download`,
    });
  } catch (error) {
    console.error("Free resource checkout failed.", error);
    return NextResponse.json(
      { error: "Could not prepare this download. Please try again." },
      { status: 500 },
    );
  }
}
