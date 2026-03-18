"use client";

import Image from "next/image";
import { getSpotifyActionUrl } from "@/lib/spotify-actions";
import { JazzPick } from "@/types/jazz";

type RecommendationCardProps = {
  pick: JazzPick;
  isSaved: boolean;
  onToggleSave: (pick: JazzPick) => void;
  onShare: (pick: JazzPick) => void;
};

export function RecommendationCard({
  pick,
  isSaved,
  onToggleSave,
  onShare
}: RecommendationCardProps) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-card/90 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={pick.imageUrl}
          alt={`${pick.title} by ${pick.artist}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-mist/80">
            {pick.source === "spotify" ? (
              <span className="rounded-full border border-olive-100/30 bg-olive-100/10 px-2.5 py-1 text-olive-50">
                來自你的 Spotify
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {pick.type}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {pick.subgenre}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {pick.year}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-2xl text-cream">{pick.title}</h3>
            <p className="text-sm text-mist">{pick.artist}</p>
          </div>

          <p className="text-sm leading-6 text-cream/82">{pick.recommendationReason}</p>
        </div>

        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-mist/80">
          <span>{pick.durationLabel}</span>
          <span>{pick.vibeTags.join(" / ")}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={getSpotifyActionUrl(pick)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-olive-50 px-4 py-2 text-sm font-medium text-ink transition hover:bg-olive-100"
          >
            前往 Spotify
          </a>
          <button
            type="button"
            onClick={() => onShare(pick)}
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cream transition hover:bg-white/10"
          >
            分享
          </button>
          <button
            type="button"
            onClick={() => onToggleSave(pick)}
            aria-pressed={isSaved}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              isSaved
                ? "border-brass/40 bg-brass/20 text-cream"
                : "border-white/12 bg-transparent text-mist hover:bg-white/5 hover:text-cream"
            }`}
          >
            {isSaved ? "已收藏" : "收藏"}
          </button>
        </div>
      </div>
    </article>
  );
}
