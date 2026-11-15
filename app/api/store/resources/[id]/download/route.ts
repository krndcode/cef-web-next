import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getStoreUser } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import {
  resolveResourceFilePath,
  safeResourceSlug,
} from "@/lib/store-resources";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getStoreUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to download this resource." }, { status: 401 });
    }

    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    const result = await getStoreDb().query<{
      title: string;
      slug: string;
      download_path: string;
    }>(
      `SELECT p.title, p.slug, p.download_path
       FROM store_resource_access a
       JOIN store_products p ON p.id = a.product_id
       WHERE a.user_id = $1 AND p.id = $2 AND p.is_active = TRUE
         AND p.product_type = 'free_resource'`,
      [user.id, id],
    );
    const resource = result.rows[0];
    if (!resource?.download_path) {
      return NextResponse.json(
        { error: "Complete checkout before downloading this file." },
        { status: 403 },
      );
    }

    const filePath = resolveResourceFilePath(resource.download_path);
    if (!filePath) {
      return NextResponse.json({ error: "Resource file path is invalid." }, { status: 404 });
    }

    let file: Buffer;
    try {
      file = await readFile(filePath);
    } catch (error) {
      console.error("Checked-out PDF could not be read.", error);
      return NextResponse.json({ error: "The PDF file is not available yet." }, { status: 404 });
    }

    const title = safeResourceSlug(resource.title);
    const filename = `${title || safeResourceSlug(resource.slug) || "cef-resource"}.pdf`.replace(
      /["\\\r\n]/g,
      "_",
    );

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
          filename,
        )}`,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Free resource download failed.", error);
    return NextResponse.json(
      { error: "Could not download this resource. Please try again." },
      { status: 500 },
    );
  }
}
