"use client";

import { JazzPick } from "@/types/jazz";

type ShareSheetProps = {
  pick: JazzPick | null;
  onClose: () => void;
  onShareTextLink: (pick: JazzPick) => void;
  onShareImage: (pick: JazzPick) => void;
};

export function ShareSheet({
  pick,
  onClose,
  onShareTextLink,
  onShareImage
}: ShareSheetProps) {
  if (!pick) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-card/95 p-6 shadow-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mist/80">分享這張</p>
            <h3 id="share-sheet-title" className="mt-2 font-display text-3xl text-cream">
              {pick.title}
            </h3>
            <p className="mt-1 text-sm text-mist">{pick.artist}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-mist transition hover:bg-white/5 hover:text-cream"
          >
            關閉
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onShareTextLink(pick)}
            className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <p className="text-sm font-medium text-cream">文字＋連結</p>
          </button>
          <button
            type="button"
            onClick={() => onShareImage(pick)}
            className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <p className="text-sm font-medium text-cream">圖片分享</p>
          </button>
        </div>
      </div>
    </div>
  );
}
