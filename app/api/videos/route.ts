import { NextResponse } from "next/server";
import { getPublishedProductionVideos } from "@/lib/production-queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const categorySlug = new URL(request.url).searchParams.get("categorySlug") ?? undefined;
  try {
    const videos = await getPublishedProductionVideos(categorySlug);
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Could not load production videos.", error);
    return NextResponse.json(
      { error: "Could not load production videos." },
      { status: 500 },
    );
  }
}
