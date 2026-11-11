import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import {
  adminProductSchema,
  parseGhsToPesewas,
} from "@/lib/store-validation";

export const runtime = "nodejs";

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function validImagePath(value: string): boolean {
  return (
    value === "" ||
    (value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.split("/").includes(".."))
  );
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

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
    const slug = slugify(product.title);
    if (!slug) {
      return NextResponse.json({ error: "Product title cannot create a valid URL." }, { status: 400 });
    }

    await getStoreDb().query(
      `INSERT INTO store_products (
         id, slug, title, category, description, price_pesewas,
         stock_quantity, image_url, badge, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        randomUUID(),
        slug,
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
    return NextResponse.json({ created: true }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "A product with a similar title already exists." },
        { status: 409 },
      );
    }
    console.error("Admin product creation failed.", error);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
