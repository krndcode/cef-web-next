import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

/**
 * Free PDF parchments are kept outside `public/` so they can only be fetched
 * through the checkout-gated download route. Set STORE_RESOURCE_DIR when the
 * deployment stores uploads on a mounted volume instead of the app folder.
 */
export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export const RESOURCE_URL_PREFIX = "/resources/";

export function getResourceRoot(): string {
  const configured = process.env.STORE_RESOURCE_DIR?.trim();
  return configured
    ? resolve(configured)
    : resolve(process.cwd(), "private-resources");
}

export function getResourceDirectory(): string {
  return resolve(getResourceRoot(), "resources");
}

export function isPdfFileName(name: string): boolean {
  return /\.pdf$/i.test(name.trim());
}

/** Every real PDF starts with the ASCII marker `%PDF-`. */
export function hasPdfSignature(bytes: Uint8Array): boolean {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d];
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every((value, index) => bytes[index] === value);
}

export function safeResourceSlug(value: string): string {
  return value
    .replace(/\.pdf$/i, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export type SavedPdfResource = {
  downloadPath: string;
  fileName: string;
  size: number;
};

export async function savePdfResource(input: {
  bytes: Uint8Array;
  originalName: string;
}): Promise<SavedPdfResource> {
  const directory = getResourceDirectory();
  const base = safeResourceSlug(input.originalName) || "cef-resource";
  const fileName = `${base}-${randomUUID().slice(0, 8)}.pdf`;
  const filePath = resolve(directory, fileName);
  if (!filePath.startsWith(`${directory}${sep}`)) {
    throw new Error("The generated PDF path left the resource directory.");
  }

  await mkdir(directory, { recursive: true });
  // `wx` refuses to overwrite an existing file, so a name collision can never
  // replace another parchment.
  await writeFile(filePath, input.bytes, { flag: "wx" });

  return {
    downloadPath: `${RESOURCE_URL_PREFIX}${fileName}`,
    fileName,
    size: input.bytes.byteLength,
  };
}

/**
 * Turns a stored `download_path` such as `/resources/guide.pdf` into an
 * absolute file path, rejecting anything outside the private resource folder.
 */
export function resolveResourceFilePath(downloadPath: string): string | null {
  if (typeof downloadPath !== "string") {
    return null;
  }

  const clean = downloadPath.trim();
  if (
    !clean.startsWith(RESOURCE_URL_PREFIX) ||
    clean.startsWith("//") ||
    clean.split("/").includes("..") ||
    !isPdfFileName(clean)
  ) {
    return null;
  }

  const directory = getResourceDirectory();
  const filePath = resolve(getResourceRoot(), clean.slice(1));
  if (!filePath.startsWith(`${directory}${sep}`)) {
    return null;
  }

  return filePath;
}

export function resourceFileNameFromPath(downloadPath: string): string {
  return downloadPath.split("/").filter(Boolean).at(-1) ?? "cef-resource.pdf";
}
