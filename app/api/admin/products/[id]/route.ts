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
    if (!["V.O.C Books", "Study Parchments", "Other Products"].includes(product.category)) {
      const current = await getStoreDb().query<{ category: string }>(
        "SELECT category FROM store_products WHERE id = $1",
        [id],
      );
      if (!current.rows[0]) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
      if (current.rows[0].category !== product.category) {
        return NextResponse.json({ error: "Choose an available store category." }, { status: 400 });
      }
    }
    const price = parseGhsToPesewas(product.priceGhs);
    if (
      price === null ||
      !validImagePath(product.imageUrl) ||
      (product.productType === "free_resource" &&
        (!product.downloadPath.startsWith("/resources/") ||
          product.downloadPath.startsWith("//") ||
          product.downloadPath.split("/").includes("..")))
    ) {
      return NextResponse.json(
        { error: "Use a valid price, local image path, and PDF file path in /resources/." },
        { status: 400 },
      );
    }

    const result = await getStoreDb().query(
      `UPDATE store_products
       SET title = $2, category = $3, description = $4, price_pesewas = $5,
           stock_quantity = $6, image_url = $7, badge = $8,
           product_type = $9, download_path = $10, is_active = $11, updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [
        id,
        product.title,
        product.category,
        product.description,
        product.productType === "free_resource" ? 0 : price,
        product.productType === "free_resource" ? 0 : product.stockQuantity,
        product.imageUrl || null,
        product.badge || null,
        product.productType,
        product.productType === "free_resource" ? product.downloadPath : null,
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
