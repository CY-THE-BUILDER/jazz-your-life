"use client";

import { ToastMessage } from "@/types/jazz";

type ToastProps = {
  toasts: ToastMessage[];
};

export function Toasts({ toasts }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm text-cream shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur"
          role="status"
          aria-live="polite"
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
