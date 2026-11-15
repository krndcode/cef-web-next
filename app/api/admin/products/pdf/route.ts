import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import {
  hasPdfSignature,
  isPdfFileName,
  MAX_PDF_BYTES,
  savePdfResource,
} from "@/lib/store-resources";

export const runtime = "nodejs";

/**
 * Stores a parchment PDF outside the public folder and returns the
 * `/resources/...` path that a product's `download_path` should use.
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_PDF_BYTES + 2 * 1024 * 1024
    ) {
      return NextResponse.json(
        { error: "PDF files must be 25 MB or smaller." },
        { status: 413 },
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Could not read the uploaded file." },
        { status: 400 },
      );
    }

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Choose a PDF file to upload." },
        { status: 400 },
      );
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: "PDF files must be 25 MB or smaller." },
        { status: 413 },
      );
    }
    if (!isPdfFileName(file.name)) {
      return NextResponse.json(
        { error: "Only PDF files can be uploaded." },
        { status: 400 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasPdfSignature(bytes)) {
      return NextResponse.json(
        { error: "That file is not a valid PDF. Export it as a PDF and try again." },
        { status: 400 },
      );
    }

    const saved = await savePdfResource({
      bytes,
      originalName: file.name,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Admin PDF upload failed.", error);
    return NextResponse.json(
      {
        error:
          "Could not save the PDF. Make sure the server can write to its private resource folder.",
      },
      { status: 500 },
    );
  }
}
