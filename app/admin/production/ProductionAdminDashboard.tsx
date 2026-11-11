"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CirclePlay,
  Clapperboard,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  Plus,
  Shield,
  Star,
  Trash2,
} from "lucide-react";
import {
  CategoryManager,
  CollapsibleCategorySection,
  ItemRow,
} from "@/app/admin/shared/AdminListComponents";
import type {
  ProductionCategory,
  ProductionVideo,
} from "@/lib/production-queries";
import type { StoreUser } from "@/lib/store-types";

type DashboardProps = {
  admin: StoreUser;
  categories: ProductionCategory[];
  videos: ProductionVideo[];
  draftsOnly?: boolean;
  embedded?: boolean;
};

type ApiResult = { error?: string; ok: boolean };

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-purple-100";

async function sendRequest(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<ApiResult> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result: { error?: string } = await response.json();
  return { ...result, ok: response.ok };
}

function VideoFields({
  video,
  categories,
}: {
  video?: ProductionVideo;
  categories: ProductionCategory[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold text-gray-700">
        Video title
        <input
          name="title"
          required
          minLength={2}
          maxLength={180}
          defaultValue={video?.title}
          className={fieldClassName}
        />
      </label>
      <label className="text-xs font-bold text-gray-700">
        YouTube URL
        <input
          name="youtubeUrl"
          required
          type="url"
          defaultValue={video?.youtubeUrl}
          placeholder="https://youtu.be/..."
          className={fieldClassName}
        />
      </label>
      <label className="text-xs font-bold text-gray-700">
        Category
        <select
          name="categoryId"
          required
          defaultValue={video?.categoryId ?? categories[0]?.id ?? ""}
          className={fieldClassName}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold text-gray-700">
        Duration (optional)
        <input
          name="duration"
          maxLength={30}
          defaultValue={video?.duration ?? ""}
          placeholder="e.g. 42:18"
          className={fieldClassName}
        />
      </label>
      <label className="text-xs font-bold text-gray-700 sm:col-span-2">
        Description
        <textarea
          name="description"
          required
          minLength={5}
          maxLength={4000}
          rows={3}
          defaultValue={video?.description}
          className={fieldClassName}
        />
      </label>
      <label className="text-xs font-bold text-gray-700 sm:col-span-2">
        Study notes URL (optional)
        <input
          name="studyNotesUrl"
          defaultValue={video?.studyNotesUrl ?? ""}
          placeholder="https://... or /study-notes.pdf"
          className={fieldClassName}
        />
      </label>
    </div>
  );
}

export default function ProductionAdminDashboard({
  admin,
  categories,
  videos,
  draftsOnly = false,
  embedded = false,
}: DashboardProps) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const visibleVideos = draftsOnly
    ? videos.filter((video) => video.publishedAt === null)
    : videos;

  async function submitCategory(
    category: ProductionCategory | undefined,
    data: FormData,
  ): Promise<boolean> {
    setError("");
    setNotice("");
    setBusy("category");
    try {
      const result = await sendRequest(
        category
          ? `/api/admin/production/categories/${category.id}`
          : "/api/admin/production/categories",
        category ? "PATCH" : "POST",
        {
          name: String(data.get("name") ?? ""),
          description: String(data.get("description") ?? ""),
        },
      );
      if (!result.ok) {
        setError(result.error ?? "Could not save this category.");
        return false;
      }
      setNotice(category ? "Category updated." : "Category added.");
      router.refresh();
      return true;
    } catch (requestError) {
      console.error("Production category save request failed.", requestError);
      setError("Could not reach the media library. Please try again.");
      return false;
    } finally {
      setBusy("");
    }
  }

  async function submitVideo(
    event: FormEvent<HTMLFormElement>,
    video?: ProductionVideo,
  ): Promise<boolean> {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setNotice("");
    setBusy(video?.id ?? "new");
    const payload = {
      title: String(data.get("title") ?? ""),
      youtubeUrl: String(data.get("youtubeUrl") ?? ""),
      categoryId: String(data.get("categoryId") ?? ""),
      duration: String(data.get("duration") ?? ""),
      description: String(data.get("description") ?? ""),
      studyNotesUrl: String(data.get("studyNotesUrl") ?? ""),
    };

    try {
      const result = await sendRequest(
        video ? `/api/admin/videos/${video.id}` : "/api/admin/videos",
        video ? "PATCH" : "POST",
        video
          ? payload
          : {
              ...payload,
              isFeatured: data.get("isFeatured") === "on",
            },
      );
      if (!result.ok) {
        setError(result.error ?? "Could not save this broadcast.");
        return false;
      }
      setNotice(video ? "Broadcast details saved." : "Broadcast published.");
      if (!video) {
        form.reset();
      } else {
        setEditingVideoId(null);
      }
      router.refresh();
      return true;
    } catch (requestError) {
      console.error("Production video save request failed.", requestError);
      setError("Could not reach the media library. Please try again.");
      return false;
    } finally {
      setBusy("");
    }
  }

  async function updateVideo(
    video: ProductionVideo,
    payload: { isFeatured?: boolean; isPublished?: boolean },
  ) {
    setError("");
    setNotice("");
    setBusy(video.id);
    try {
      const result = await sendRequest(
        `/api/admin/videos/${video.id}`,
        "PATCH",
        payload,
      );
      if (!result.ok) {
        setError(result.error ?? "Could not update this broadcast.");
        return;
      }
      setNotice(
        payload.isFeatured !== undefined
          ? payload.isFeatured
            ? "Featured broadcast updated."
            : "Featured status removed."
          : payload.isPublished
            ? "Broadcast published."
            : "Broadcast unpublished.",
      );
      router.refresh();
    } catch (requestError) {
      console.error("Production video status update failed.", requestError);
      setError("Could not reach the media library. Please try again.");
    } finally {
      setBusy("");
    }
  }

  async function deleteVideo(video: ProductionVideo) {
    if (!window.confirm(`Permanently delete "${video.title}"?`)) {
      return;
    }
    setError("");
    setNotice("");
    setBusy(video.id);
    try {
      const result = await sendRequest(`/api/admin/videos/${video.id}`, "DELETE");
      if (!result.ok) {
        setError(result.error ?? "Could not delete this broadcast.");
        return;
      }
      setNotice("Broadcast deleted.");
      router.refresh();
    } catch (requestError) {
      console.error("Production video deletion failed.", requestError);
      setError("Could not reach the media library. Please try again.");
    } finally {
      setBusy("");
    }
  }

  const categoryCounts = new Map(
    categories.map((category) => [
      category.id,
      videos.filter((video) => video.categoryId === category.id).length,
    ]),
  );

  return (
    <div className={embedded ? "text-gray-800" : "min-h-screen bg-gray-50 text-gray-800"}>
      {!embedded && (
        <header className="cef-hero-backdrop text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-5 px-4 py-8 sm:px-6 lg:px-8">
            <div>
              <h1 className="font-serif text-3xl font-bold sm:text-4xl">
                Production Studio
              </h1>
              <p className="mt-2 text-sm text-purple-100/80">
                Publish and curate CEF broadcasts · Signed in as {admin.name}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold">
              <Shield className="h-4 w-4 text-purple-200" aria-hidden="true" />
              Administrator
            </span>
          </div>
        </header>
      )}

      <div className={embedded ? "space-y-8" : "mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"}>
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {notice}
          </p>
        )}

        <CategoryManager
          categories={categories}
          itemCounts={categoryCounts}
          busy={busy === "category"}
          onAdd={(data) => submitCategory(undefined, data)}
          onSave={(id, data) => {
            const category = categories.find((item) => item.id === id);
            return category
              ? submitCategory(category, data)
              : Promise.resolve(false);
          }}
        />

        <section
          id="add-broadcast"
          aria-labelledby="add-video-heading"
          className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-cefPurple">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="add-video-heading" className="font-serif text-xl font-bold text-gray-950">
                Add a broadcast
              </h2>
              <p className="text-xs text-gray-500">
                Published videos appear on the Production page immediately.
              </p>
            </div>
          </div>
          {categories.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              Add a category before creating a broadcast.
            </p>
          ) : (
            <form onSubmit={(event) => void submitVideo(event)} className="space-y-5">
              <VideoFields categories={categories} />
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input type="checkbox" name="isFeatured" className="h-4 w-4 accent-cefPurple" />
                Set as featured broadcast
              </label>
              <div>
                <button
                  type="submit"
                  disabled={busy !== ""}
                  className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-800 disabled:opacity-60"
                >
                  <CirclePlay className="h-4 w-4" aria-hidden="true" />
                  {busy === "new" ? "Publishing..." : "Publish broadcast"}
                </button>
              </div>
            </form>
          )}
        </section>

        <section aria-labelledby="manage-videos-heading" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-cefBlue">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="manage-videos-heading" className="font-serif text-2xl font-bold text-gray-950">
                Manage broadcasts
              </h2>
              <p className="text-xs text-gray-500">
                {visibleVideos.length} {draftsOnly ? "draft broadcast" : "video"}{visibleVideos.length === 1 ? "" : "s"} · Feature, publish, edit, or remove content.
              </p>
            </div>
          </div>

          {draftsOnly && visibleVideos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-7 text-sm text-gray-700">
              No draft broadcasts.
            </p>
          ) : categories.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-7 text-sm text-gray-500">
              Add a category to organize broadcasts.
            </p>
          ) : (
            categories.map((category) => {
              const categoryVideos = visibleVideos.filter(
                (video) => video.categoryId === category.id,
              );
              if (draftsOnly && categoryVideos.length === 0) return null;
              return (
                <CollapsibleCategorySection
                  key={category.id}
                  name={category.name}
                  description={category.description}
                  count={categoryVideos.length}
                  emptyText="No broadcasts in this category yet."
                >
                  {categoryVideos.map((video) => {
                    const isPublished = video.publishedAt !== null;
                    const editing = editingVideoId === video.id;
                    const editingBusy = busy === video.id;
                    return (
                      <ItemRow
                        key={video.id}
                        formId={`broadcast-edit-${video.id}`}
                        title={video.title}
                        subtitle={`${video.views.toLocaleString()} views${video.duration ? ` · ${video.duration}` : ""}`}
                        thumbnail={
                          <Image
                            src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                            alt=""
                            fill
                            sizes="80px"
                            unoptimized
                            className="object-cover"
                          />
                        }
                        badges={
                          <>
                            {video.isFeatured && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-[10px] font-bold uppercase text-cefPurple">
                                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                                Featured
                              </span>
                            )}
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                              isPublished
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {isPublished ? "Published" : "Draft"}
                            </span>
                          </>
                        }
                        editing={editing}
                        busy={editingBusy}
                        onCancel={() => setEditingVideoId(null)}
                        actions={
                          <>
                            <button
                              type="button"
                              disabled={busy !== ""}
                              onClick={() => setEditingVideoId(video.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:border-cefPurple hover:text-cefPurple disabled:opacity-50"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={busy !== ""}
                              onClick={() => void updateVideo(video, { isFeatured: !video.isFeatured })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50"
                            >
                              <Star className="h-3.5 w-3.5" aria-hidden="true" />
                              {video.isFeatured ? "Remove featured" : "Feature"}
                            </button>
                            <button
                              type="button"
                              disabled={busy !== ""}
                              onClick={() => void updateVideo(video, { isPublished: !isPublished })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50"
                            >
                              {isPublished ? (
                                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                              {isPublished ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              type="button"
                              disabled={busy !== ""}
                              onClick={() => void deleteVideo(video)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Delete
                            </button>
                            <a
                              href={video.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-cefPurple hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                              Open on YouTube
                            </a>
                          </>
                        }
                      >
                        <form
                          id={`broadcast-edit-${video.id}`}
                          onSubmit={(event) => void submitVideo(event, video)}
                          className="space-y-4"
                        >
                          <VideoFields video={video} categories={categories} />
                        </form>
                      </ItemRow>
                    );
                  })}
                </CollapsibleCategorySection>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
