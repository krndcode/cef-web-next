"use client";

import Image from "next/image";
import { Play, Plus, Check, Eye } from "lucide-react";
import { useState } from "react";
import type { ProductionVideo } from "@/lib/production-queries";

type VideoCardProps = {
  video: ProductionVideo;
  active: boolean;
  inPlaylist: boolean;
  onSelect: (video: ProductionVideo) => void;
  onTogglePlaylist: (videoId: string) => void;
};

export default function VideoCard({
  video,
  active,
  inPlaylist,
  onSelect,
  onTogglePlaylist,
}: VideoCardProps) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-gray-900 transition ${
        active
          ? "border-cefBlue/70 shadow-lg shadow-cefPurple/10"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(video)}
        aria-label={`Play ${video.title}`}
        className="group relative block aspect-video w-full overflow-hidden bg-gray-800 text-left"
      >
        <Image
          src={thumbnailFailed ? "/thor.jpg" : video.thumbnailUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          onError={() => setThumbnailFailed(true)}
        />
        <span className="absolute inset-0 bg-gray-950/20 transition group-hover:bg-gray-950/50" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cefPurple text-white shadow-lg transition group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
          </span>
        </span>
        {video.duration && (
          <span className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-[11px] font-semibold text-white">
            {video.duration}
          </span>
        )}
        {video.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-cefBlue px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-950">
            Featured
          </span>
        )}
      </button>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-cefBlue">
            {video.categoryName}
          </span>
          <button
            type="button"
            onClick={() => onTogglePlaylist(video.id)}
            aria-label={inPlaylist ? "Remove from playlist" : "Add to playlist"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-gray-300 transition hover:border-cefBlue hover:text-cefBlue"
          >
            {inPlaylist ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSelect(video)}
          className="line-clamp-2 text-left font-semibold leading-6 text-white transition hover:text-purple-200"
        >
          {video.title}
        </button>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">
          {video.description}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-gray-500">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          {video.views.toLocaleString()} views
        </p>
      </div>
    </article>
  );
}
