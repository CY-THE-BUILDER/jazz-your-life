import { JazzPick } from "@/types/jazz";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

export type ShareImagePayload = {
  title: string;
  artist: string;
  reason: string;
  imageUrl: string;
  accentColor: string;
  subgenre: string;
  year: number;
};

export function buildPickSharePayload(pick: JazzPick): SharePayload {
  return {
    title: `${pick.title} · ${pick.artist}`,
    text: `今天想把《${pick.title}》留給你。${pick.artist}，${pick.recommendationReason}`,
    url: pick.shareUrl
  };
}

export function buildFacebookShareUrl(payload: SharePayload) {
  const url = new URL("https://www.facebook.com/sharer/sharer.php");
  url.searchParams.set("u", payload.url);
  url.searchParams.set("quote", `${payload.title}\n${payload.text}`);
  return url.toString();
}

export function buildSmsShareUrl(payload: SharePayload) {
  return `sms:?&body=${encodeURIComponent(`${payload.title}\n${payload.text}\n${payload.url}`)}`;
}

export function buildInstagramLaunchUrl() {
  return "instagram://app";
}

export function buildInstagramWebUrl() {
  return "https://www.instagram.com/";
}

export function isMobileUserAgent(userAgent: string) {
  return /iphone|ipad|ipod|android/i.test(userAgent);
}

export function buildShareImagePayload(pick: JazzPick): ShareImagePayload {
  return {
    title: pick.title,
    artist: pick.artist,
    reason: pick.recommendationReason,
    imageUrl: pick.imageUrl,
    accentColor: pick.accentColor,
    subgenre: pick.subgenre,
    year: pick.year
  };
}

export function buildShareImageUrl(payload: ShareImagePayload, origin: string) {
  const url = new URL("/api/share-image", origin);
  url.searchParams.set("title", payload.title);
  url.searchParams.set("artist", payload.artist);
  url.searchParams.set("reason", payload.reason);
  url.searchParams.set("imageUrl", payload.imageUrl);
  url.searchParams.set("accentColor", payload.accentColor);
  url.searchParams.set("subgenre", payload.subgenre);
  url.searchParams.set("year", String(payload.year));
  return url.toString();
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

export async function sharePickImage(payload: {
  title: string;
  text: string;
  imageUrl: string;
}) {
  if (typeof window === "undefined") {
    return { status: "unavailable" as const };
  }

  const response = await fetch(payload.imageUrl);
  if (!response.ok) {
    return { status: "unavailable" as const };
  }

  const blob = await response.blob();
  const file = new File([blob], "jazz-your-life-share.png", {
    type: blob.type || "image/png"
  });

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      files: [file]
    });
    return { status: "shared" as const };
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = "jazz-your-life-share.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
  return { status: "downloaded" as const };
}
