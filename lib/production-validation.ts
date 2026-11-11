export function isSafeStudyNotesUrl(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }
  if (value.startsWith("/")) {
    try {
      const localUrl = new URL(value, "https://cef.local");
      return (
        localUrl.origin === "https://cef.local" &&
        !localUrl.pathname.split("/").includes("..")
      );
    } catch {
      return false;
    }
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
