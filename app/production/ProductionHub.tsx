"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ListVideo } from "lucide-react";
import type {
  ProductionCategory,
  ProductionVideo,
} from "@/lib/production-queries";
import CategoryNav from "./CategoryNav";
import HeroBroadcast from "./HeroBroadcast";
import VideoGrid from "./VideoGrid";

type ProductionHubProps = {
  categories: ProductionCategory[];
  videos: ProductionVideo[];
};

export default function ProductionHub({
  categories,
  videos,
}: ProductionHubProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState(
    videos.find((video) => video.isFeatured)?.id ?? videos[0]?.id ?? "",
  );
  const [autoplay, setAutoplay] = useState(false);
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const countedVideos = useRef(new Set<string>());

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return videos.filter((video) => {
      const matchesCategory =
        !selectedCategory || video.categorySlug === selectedCategory;
      const matchesSearch =
        !query ||
        [video.title, video.description, video.categoryName]
          .some((value) => value.toLocaleLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory, videos]);

  const activeVideo =
    filteredVideos.find((video) => video.id === selectedVideoId) ??
    filteredVideos[0] ??
    videos.find((video) => video.id === selectedVideoId) ??
    null;

  useEffect(() => {
    if (!activeVideo || countedVideos.current.has(activeVideo.id)) {
      return;
    }
    countedVideos.current.add(activeVideo.id);
    void fetch(`/api/videos/${activeVideo.id}/view`, { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          console.error("Could not record production video view.", response.status);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not record production video view.", error);
      });
  }, [activeVideo]);

  const playlist = videos.filter((video) => playlistIds.includes(video.id));
  const nextUp = filteredVideos
    .filter((video) => video.id !== activeVideo?.id)
    .slice(0, 3);

  function selectVideo(video: ProductionVideo, scrollToPlayer = false) {
    setAutoplay(true);
    setSelectedVideoId(video.id);
    if (scrollToPlayer) {
      document.getElementById("featured-player")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function togglePlaylist(videoId: string) {
    setPlaylistIds((current) =>
      current.includes(videoId)
        ? current.filter((id) => id !== videoId)
        : [...current, videoId],
    );
    setNotice(
      playlistIds.includes(videoId)
        ? "Removed from your playlist."
        : "Added to your playlist.",
    );
  }

  async function shareVideo(video: ProductionVideo) {
    setNotice("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: video.youtubeUrl,
        });
        setNotice("Broadcast shared.");
        return;
      }
      await navigator.clipboard.writeText(video.youtubeUrl);
      setNotice("YouTube link copied to clipboard.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("Could not share the production video.", error);
      setNotice("Could not share the broadcast. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100">
      <HeroBroadcast
        video={activeVideo}
        autoplay={autoplay}
        nextUp={nextUp}
        playlistIds={playlistIds}
        notice={notice}
        onSelect={(video) => {
          setAutoplay(true);
          selectVideo(video);
        }}
        onShare={shareVideo}
        onTogglePlaylist={togglePlaylist}
      />

      <CategoryNav
        categories={categories}
        selectedSlug={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cefBlue">
              Explore the library
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
              All Broadcasts
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Teaching, worship, testimonies, and stories from the foundation.
            </p>
          </div>
          <label className="relative block w-full md:max-w-sm">
            <span className="sr-only">Search broadcasts</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos, topics, categories..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cefBlue/60 focus:ring-2 focus:ring-cefBlue/20"
            />
          </label>
        </div>

        {playlist.length > 0 && (
          <section aria-labelledby="playlist-heading" className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-cefBlue" aria-hidden="true" />
              <h2 id="playlist-heading" className="font-serif text-xl font-bold text-white">
                My Playlist
              </h2>
              <span className="text-xs text-gray-500">{playlist.length} saved</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {playlist.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    setSearch("");
                    selectVideo(video, true);
                  }}
                  className="min-w-52 max-w-64 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-cefBlue/50"
                >
                  <span className="line-clamp-2 block text-xs font-semibold leading-5 text-white">
                    {video.title}
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-cefBlue">
                    {video.categoryName}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <VideoGrid
          videos={filteredVideos}
          activeVideoId={activeVideo?.id ?? null}
          playlistIds={playlistIds}
          onSelect={(video) => selectVideo(video, true)}
          onTogglePlaylist={togglePlaylist}
        />
      </main>
    </div>
  );
}
