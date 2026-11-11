import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { isSafeStudyNotesUrl } from "@/lib/production-validation";
import { extractYouTubeId } from "@/lib/youtube";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const videoPatchSchema = z
  .object({
    title: z.string().trim().min(2).max(180).optional(),
    description: z.string().trim().min(5).max(4000).optional(),
    youtubeUrl: z.string().trim().url().max(2048).optional(),
    categoryId: z.uuid().optional(),
    duration: z.string().trim().max(30).nullable().optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    studyNotesUrl: z.string().trim().max(2048).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }
    const parsed = videoPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the video details and try again." }, { status: 400 });
    }

    const patch = parsed.data;
    const youtubeId = patch.youtubeUrl
      ? extractYouTubeId(patch.youtubeUrl)
      : undefined;
    if (patch.youtubeUrl && !youtubeId) {
      return NextResponse.json(
        { error: "Enter a valid YouTube video, Shorts, or embed URL." },
        { status: 400 },
      );
    }
    if (!isSafeStudyNotesUrl(patch.studyNotesUrl)) {
      return NextResponse.json(
        { error: "Study notes must use a web URL or a safe local path." },
        { status: 400 },
      );
    }

    const client = await getStoreDb().connect();
    try {
      await client.query("BEGIN");
      if (patch.categoryId) {
        const category = await client.query(
          "SELECT id FROM production_categories WHERE id = $1",
          [patch.categoryId],
        );
        if (category.rowCount !== 1) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
        }
      }

      if (patch.isFeatured) {
        const target = await client.query<{ published_at: Date | null }>(
          "SELECT published_at FROM production_videos WHERE id = $1",
          [id],
        );
        if (target.rowCount !== 1) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "Video not found." }, { status: 404 });
        }
        if (patch.isPublished === false || (!patch.isPublished && !target.rows[0].published_at)) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "Publish a video before setting it as featured." },
            { status: 400 },
          );
        }
      }

      if (patch.isFeatured) {
        await client.query(
          "UPDATE production_videos SET is_featured = FALSE WHERE is_featured = TRUE AND id <> $1",
          [id],
        );
      }

      const updates: string[] = [];
      const values: unknown[] = [id];
      function addUpdate(column: string, value: unknown) {
        values.push(value);
        updates.push(`${column} = $${values.length}`);
      }

      if (patch.title !== undefined) addUpdate("title", patch.title);
      if (patch.description !== undefined) addUpdate("description", patch.description);
      if (patch.youtubeUrl !== undefined) {
        addUpdate("youtube_url", patch.youtubeUrl);
        addUpdate("youtube_id", youtubeId);
        addUpdate("thumbnail_url", `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
      }
      if (patch.categoryId !== undefined) addUpdate("category_id", patch.categoryId);
      if (patch.duration !== undefined) addUpdate("duration", patch.duration || null);
      if (patch.studyNotesUrl !== undefined) {
        addUpdate("study_notes_url", patch.studyNotesUrl || null);
      }
      if (patch.isFeatured !== undefined) addUpdate("is_featured", patch.isFeatured);
      if (patch.isPublished !== undefined) {
        addUpdate("published_at", patch.isPublished ? new Date() : null);
        if (!patch.isPublished) addUpdate("is_featured", false);
      }
      updates.push("updated_at = NOW()");

      const result = await client.query(
        `UPDATE production_videos
         SET ${updates.join(", ")}
         WHERE id = $1
         RETURNING id`,
        values,
      );
      if (result.rowCount !== 1) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Video not found." }, { status: 404 });
      }
      await client.query("COMMIT");
      return NextResponse.json({ updated: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin production video update failed.", error);
    return NextResponse.json({ error: "Could not update the video." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    const result = await getStoreDb().query(
      "DELETE FROM production_videos WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rowCount !== 1) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Admin production video deletion failed.", error);
    return NextResponse.json({ error: "Could not delete the video." }, { status: 500 });
  }
}
