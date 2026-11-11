"use client";

import Image from "next/image";
import {
  Check,
  Download,
  ListPlus,
  Play,
  Share2,
  Video as VideoIcon,
} from "lucide-react";
import type { ProductionVideo } from "@/lib/production-queries";

type HeroBroadcastProps = {
  video: ProductionVideo | null;
  nextUp: ProductionVideo[];
  playlistIds: string[];
  notice: string;
  onSelect: (video: ProductionVideo) => void;
  onShare: (video: ProductionVideo) => void;
  onTogglePlaylist: (videoId: string) => void;
};

export default function HeroBroadcast({
  video,
  nextUp,
  playlistIds,
  notice,
  onSelect,
  onShare,
  onTogglePlaylist,
}: HeroBroadcastProps) {
  const inPlaylist = video ? playlistIds.includes(video.id) : false;

  return (
    <section className="relative overflow-hidden bg-gray-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-56 h-[34rem] w-[34rem] rounded-full bg-cefPurple/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-72 right-0 h-[34rem] w-[34rem] rounded-full bg-cefBlue/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cefBlue">
          <VideoIcon className="h-4 w-4" aria-hidden="true" />
          CEF Production · Now Playing
        </div>

        {video ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)] lg:gap-10">
            <div className="min-w-0">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/30">
                <iframe
                  key={video.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="mt-7">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cefPurple px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {video.isFeatured ? "Featured Broadcast" : "Now Playing"}
                  </span>
                  <span className="text-xs font-semibold text-cefBlue">
                    {video.categoryName}
                  </span>
                  {video.duration && (
                    <span className="text-xs text-gray-400">{video.duration}</span>
                  )}
                </div>
                <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
                  {video.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
                  {video.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onShare(video)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => onTogglePlaylist(video.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    {inPlaylist ? (
                      <Check className="h-4 w-4 text-cefBlue" aria-hidden="true" />
                    ) : (
                      <ListPlus className="h-4 w-4" aria-hidden="true" />
                    )}
                    {inPlaylist ? "In Playlist" : "Add to Playlist"}
                  </button>
                  {video.studyNotesUrl ? (
                    <a
                      href={video.studyNotesUrl}
                      target={video.studyNotesUrl.startsWith("/") ? undefined : "_blank"}
                      rel={video.studyNotesUrl.startsWith("/") ? undefined : "noreferrer"}
                      download={video.studyNotesUrl.startsWith("/") ? true : undefined}
                      className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-800"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download Study Notes
                    </a>
                  ) : (
                    <span
                      title="Study notes have not been added for this broadcast."
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-gray-400"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Study Notes Unavailable
                    </span>
                  )}
                </div>
                <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-cefBlue">
                  {notice}
                </p>
              </div>
            </div>

            <aside aria-labelledby="next-up-heading" className="lg:pt-1">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cefBlue">
                    Keep watching
                  </p>
                  <h2 id="next-up-heading" className="mt-1 font-serif text-xl font-bold">
                    Next Up in Series
                  </h2>
                </div>
                <span className="text-xs text-gray-500">{nextUp.length} broadcasts</span>
              </div>
              <div className="space-y-3">
                {nextUp.length ? (
                  nextUp.map((nextVideo) => (
                    <button
                      key={nextVideo.id}
                      type="button"
                      onClick={() => onSelect(nextVideo)}
                      className="group flex w-full gap-3 rounded-xl border border-white/10 bg-white/5 p-2 text-left transition hover:border-cefBlue/40 hover:bg-white/10"
                    >
                      <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-gray-800 sm:w-32">
                        <Image
                          src={nextVideo.thumbnailUrl}
                          alt=""
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 transition group-hover:opacity-100">
                          <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                        </span>
                      </span>
                      <span className="min-w-0 py-1">
                        <span className="block line-clamp-2 text-xs font-semibold leading-5 text-gray-100 group-hover:text-white">
                          {nextVideo.title}
                        </span>
                        <span className="mt-1 block truncate text-[10px] uppercase tracking-wide text-cefBlue">
                          {nextVideo.categoryName}
                        </span>
                        {nextVideo.duration && (
                          <span className="mt-1 block text-[10px] text-gray-500">
                            {nextVideo.duration}
                          </span>
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-gray-400">
                    More broadcasts will appear here.
                  </p>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="font-serif text-3xl font-bold sm:text-5xl">
                Faith for the journey. Stories for the soul.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300">
                Watch teaching, worship, testimonies, and ministry stories from
                Christ The Entirety Foundation.
              </p>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/thor.jpg"
                alt="CEF worship and ministry broadcasts"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gray-950/45 p-6 text-center">
                <p className="max-w-sm text-sm font-medium leading-6 text-white">
                  No broadcasts are published yet. Please check back soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
