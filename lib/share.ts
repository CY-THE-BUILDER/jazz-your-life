import { JazzPick } from "@/types/jazz";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

export function buildPickSharePayload(pick: JazzPick): SharePayload {
  return {
    title: `${pick.title} · ${pick.artist}`,
    text: `今天想把《${pick.title}》留給你。${pick.artist}，${pick.recommendationReason}`,
    url: pick.shareUrl
  };
}

export async function copyShareText(payload: SharePayload) {
  if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "unavailable" as const };
  }

  await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${payload.url}`);
  return { status: "copied" as const };
}

export async function copyShareUrl(url: string) {
  if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "unavailable" as const };
  }

  await navigator.clipboard.writeText(url);
  return { status: "copied" as const };
}

export async function sharePick(payload: SharePayload) {
  if (typeof window === "undefined") {
    return { status: "unavailable" as const };
  }

  if (navigator.share) {
    await navigator.share(payload);
    return { status: "shared" as const };
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(payload.url);
    return { status: "copied" as const };
  }

  return { status: "unavailable" as const };
}
