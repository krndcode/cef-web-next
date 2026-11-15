/**
 * Free parchment PDFs are hosted on Google Drive. Admins paste a share link
 * and customers are sent there after checkout. This module is pure so it can
 * validate the link in the admin form, the product API, and the download
 * redirect route.
 */

const DRIVE_FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;
const GOOGLE_FILE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);
const GOOGLE_DOC_KINDS = new Set([
  "document",
  "spreadsheets",
  "presentation",
]);

export type GoogleDriveFile = {
  fileId: string;
  /** Canonical Google Drive page that previews the file and offers download. */
  viewUrl: string;
  /** Google's direct-download URL, useful for links we control. */
  downloadUrl: string;
};

function extractFileId(url: URL): string | null {
  if (url.protocol !== "https:" || !GOOGLE_FILE_HOSTS.has(url.hostname)) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const first = segments[0];

  // https://drive.google.com/file/d/<id>/view (also /file/u/0/d/<id>/view)
  if (first === "file") {
    const marker = segments.indexOf("d");
    return marker > 0 ? segments[marker + 1] ?? null : null;
  }

  // https://docs.google.com/document/d/<id>/edit (and Sheets/Slides)
  if (first && GOOGLE_DOC_KINDS.has(first) && segments[1] === "d") {
    return segments[2] ?? null;
  }

  // https://drive.google.com/open?id=<id>
  // https://drive.google.com/uc?export=download&id=<id>
  if (segments.length === 1 && (first === "open" || first === "uc")) {
    return url.searchParams.get("id");
  }

  return null;
}

/**
 * Returns the canonical Google Drive URLs for a pasted share link, or null
 * when the value is not a single Google Drive file (folders are rejected).
 */
export function parseGoogleDriveLink(value: unknown): GoogleDriveFile | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 500) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const fileId = extractFileId(url);
  if (!fileId || !DRIVE_FILE_ID.test(fileId)) {
    return null;
  }

  return {
    fileId,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

export function isGoogleDriveLink(value: unknown): boolean {
  return parseGoogleDriveLink(value) !== null;
}
