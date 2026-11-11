import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { isSafeStudyNotesUrl } from "@/lib/production-validation";
import { extractYouTubeId } from "@/lib/youtube";
import { z } from "zod";

export const runtime = "nodejs";

const videoInputSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(5).max(4000),
  youtubeUrl: z.string().trim().url().max(2048),
  categoryId: z.uuid(),
  duration: z.string().trim().max(30).optional().default(""),
  isFeatured: z.boolean().optional().default(false),
  studyNotesUrl: z.string().trim().max(2048).optional().default(""),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const parsed = videoInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the video details and try again." },
        { status: 400 },
      );
    }

    const video = parsed.data;
    const youtubeId = extractYouTubeId(video.youtubeUrl);
    if (!youtubeId) {
      return NextResponse.json(
        { error: "Enter a valid YouTube video, Shorts, or embed URL." },
        { status: 400 },
      );
    }
    if (!isSafeStudyNotesUrl(video.studyNotesUrl)) {
      return NextResponse.json(
        { error: "Study notes must use a web URL or a safe local path." },
        { status: 400 },
      );
    }

    const client = await getStoreDb().connect();
    try {
      await client.query("BEGIN");
      const category = await client.query(
        "SELECT id FROM production_categories WHERE id = $1",
        [video.categoryId],
      );
      if (category.rowCount !== 1) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
      }

      if (video.isFeatured) {
        await client.query(
          "UPDATE production_videos SET is_featured = FALSE WHERE is_featured = TRUE",
        );
      }
      const id = randomUUID();
      await client.query(
        `INSERT INTO production_videos (
           id, title, description, youtube_url, youtube_id, thumbnail_url,
           duration, is_featured, category_id, published_at, study_notes_url
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
        [
          id,
          video.title,
          video.description,
          video.youtubeUrl,
          youtubeId,
          `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
          video.duration || null,
          video.isFeatured,
          video.categoryId,
          video.studyNotesUrl || null,
        ],
      );
      await client.query("COMMIT");
      return NextResponse.json({ created: true, id }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin production video creation failed.", error);
    return NextResponse.json({ error: "Could not create the video." }, { status: 500 });
  }
}
