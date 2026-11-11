import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import {
  adminProductSchema,
  parseGhsToPesewas,
} from "@/lib/store-validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function validImagePath(value: string): boolean {
  return (
    value === "" ||
    (value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.split("/").includes(".."))
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = await context.params;
    const parsed = adminProductSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Check all product fields and try again." }, { status: 400 });
    }
    const product = parsed.data;
    const price = parseGhsToPesewas(product.priceGhs);
    if (price === null || !validImagePath(product.imageUrl)) {
      return NextResponse.json(
        { error: "Enter a valid price and a local image path beginning with /." },
        { status: 400 },
      );
    }

    const result = await getStoreDb().query(
      `UPDATE store_products
       SET title = $2, category = $3, description = $4, price_pesewas = $5,
           stock_quantity = $6, image_url = $7, badge = $8,
           is_active = $9, updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [
        id,
        product.title,
        product.category,
        product.description,
        price,
        product.stockQuantity,
        product.imageUrl || null,
        product.badge || null,
        product.isActive,
      ],
    );

    if (result.rowCount !== 1) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Admin product update failed.", error);
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}
