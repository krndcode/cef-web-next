"use client";

import type { ProductionVideo } from "@/lib/production-queries";
import VideoCard from "./VideoCard";

type VideoGridProps = {
  videos: ProductionVideo[];
  activeVideoId: string | null;
  playlistIds: string[];
  onSelect: (video: ProductionVideo) => void;
  onTogglePlaylist: (videoId: string) => void;
};

export default function VideoGrid({
  videos,
  activeVideoId,
  playlistIds,
  onSelect,
  onTogglePlaylist,
}: VideoGridProps) {
  if (!videos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
        <p className="font-semibold text-white">No broadcasts found</p>
        <p className="mt-2 text-sm text-gray-400">
          Try another category or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          active={video.id === activeVideoId}
          inPlaylist={playlistIds.includes(video.id)}
          onSelect={onSelect}
          onTogglePlaylist={onTogglePlaylist}
        />
      ))}
    </div>
  );
}
