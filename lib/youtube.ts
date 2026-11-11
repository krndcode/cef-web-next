const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      !YOUTUBE_HOSTS.has(parsedUrl.hostname.toLowerCase())
    ) {
      return null;
    }

    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const candidate =
      parsedUrl.hostname.endsWith("youtu.be")
        ? pathSegments[0]
        : parsedUrl.searchParams.get("v") ??
          (["embed", "shorts", "live", "v"].includes(pathSegments[0] ?? "")
            ? pathSegments[1]
            : null);

    return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}
