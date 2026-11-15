import { NextResponse } from "next/server";
import { parseGoogleDriveLink } from "@/lib/google-drive";
import { getStoreUser } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Checks the customer's free-resource access and then sends them to the
 * parchment's Google Drive file. The Drive link is never rendered into the
 * public catalog; it is only revealed through this gated redirect.
 */
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

    const result = await getStoreDb().query<{ download_path: string | null }>(
      `SELECT p.download_path
       FROM store_resource_access a
       JOIN store_products p ON p.id = a.product_id
       WHERE a.user_id = $1 AND p.id = $2 AND p.is_active = TRUE
         AND p.product_type = 'free_resource'`,
      [user.id, id],
    );
    const resource = result.rows[0];
    if (!resource) {
      return NextResponse.json(
        { error: "Complete checkout before downloading this file." },
        { status: 403 },
      );
    }

    const drive = parseGoogleDriveLink(resource.download_path);
    if (!drive) {
      return NextResponse.json(
        { error: "The Google Drive link for this PDF is not available yet." },
        { status: 404 },
      );
    }

    const response = NextResponse.redirect(drive.viewUrl, 307);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    console.error("Free resource download failed.", error);
    return NextResponse.json(
      { error: "Could not open this resource. Please try again." },
      { status: 500 },
    );
  }
}
