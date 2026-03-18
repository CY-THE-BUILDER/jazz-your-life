"use client";

import { Vibe, vibeOptions } from "@/types/jazz";

type VibeFilterProps = {
  activeVibe: Vibe;
  onChange: (vibe: Vibe) => void;
};

export function VibeFilter({ activeVibe, onChange }: VibeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Jazz vibe filter" role="tablist">
      {vibeOptions.map((vibe) => {
        const isActive = vibe === activeVibe;

        return (
          <button
            key={vibe}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(vibe)}
            className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
              isActive
                ? "border-olive-200 bg-olive-50 text-ink shadow-glow"
                : "border-white/10 bg-white/5 text-mist hover:border-white/20 hover:bg-white/10 hover:text-cream"
            }`}
          >
            {vibe}
          </button>
        );
      })}
    </div>
  );
}
