import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { resolveResourceFilePath } from "@/lib/store-resources";
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

    const product = await getStoreDb().query<{ download_path: string | null }>(
      `SELECT download_path FROM store_products
       WHERE id = $1 AND is_active = TRUE AND product_type = 'free_resource'`,
      [id],
    );
    const downloadPath = product.rows[0]?.download_path;
    const filePath = downloadPath ? resolveResourceFilePath(downloadPath) : null;
    if (!filePath) {
      return NextResponse.json(
        { error: "This free resource is not available for download yet." },
        { status: 404 },
      );
    }

    // Refuse to grant access to a product whose PDF has not been uploaded, so
    // customers never reach a download that can only fail.
    try {
      await access(filePath, constants.R_OK);
    } catch {
      console.error("Free resource checkout found a missing PDF.", downloadPath);
      return NextResponse.json(
        {
          error:
            "The PDF file for this resource has not been uploaded yet. Please check back soon.",
        },
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
