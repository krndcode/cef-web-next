import { getStoreDb } from "@/lib/store-db";

export type ProductionCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
};

export type ProductionVideo = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration: string | null;
  isFeatured: boolean;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  views: number;
  publishedAt: string | null;
  studyNotesUrl: string | null;
};

type VideoRow = Omit<ProductionVideo, "publishedAt"> & {
  publishedAt: Date | null;
};

const VIDEO_SELECT = `
  SELECT v.id, v.title, v.description, v.youtube_url AS "youtubeUrl",
         v.youtube_id AS "youtubeId", v.thumbnail_url AS "thumbnailUrl",
         v.duration, v.is_featured AS "isFeatured",
         v.category_id AS "categoryId", c.name AS "categoryName",
         c.slug AS "categorySlug", v.views,
         v.published_at AS "publishedAt",
         v.study_notes_url AS "studyNotesUrl"
  FROM production_videos v
  JOIN production_categories c ON c.id = v.category_id`;

function mapVideo(row: VideoRow): ProductionVideo {
  return {
    ...row,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function getProductionCategories(): Promise<ProductionCategory[]> {
  const result = await getStoreDb().query<ProductionCategory>(
    `SELECT id, name, slug, description, "order"
     FROM production_categories
     ORDER BY "order", name`,
  );
  return result.rows;
}

export async function getPublishedProductionVideos(
  categorySlug?: string,
): Promise<ProductionVideo[]> {
  const values: string[] = [];
  let filter = "WHERE v.published_at IS NOT NULL AND v.published_at <= NOW()";
  if (categorySlug) {
    values.push(categorySlug);
    filter += " AND c.slug = $1";
  }
  const result = await getStoreDb().query<VideoRow>(
    `${VIDEO_SELECT}
     ${filter}
     ORDER BY v.is_featured DESC, v.published_at DESC, v.created_at DESC`,
    values,
  );
  return result.rows.map(mapVideo);
}

export async function getAdminProductionVideos(): Promise<ProductionVideo[]> {
  const result = await getStoreDb().query<VideoRow>(
    `${VIDEO_SELECT}
     ORDER BY v.is_featured DESC, v.published_at DESC NULLS LAST, v.created_at DESC`,
  );
  return result.rows.map(mapVideo);
}
