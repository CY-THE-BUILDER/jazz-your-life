import { JazzPick } from "@/types/jazz";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

function buildShareRecommendationLine(pick: JazzPick) {
  const leadVibe = pick.vibeTags[0];

  if (leadVibe === "Late Night") {
    return "適合把夜色放低一點再開始，餘韻會留得很長。";
  }

  if (leadVibe === "Fusion") {
    return "律動和推進力都很漂亮，整張放下去很容易一路聽完。";
  }

  if (leadVibe === "Exploratory") {
    return "想把耳朵再往外推一點時，這張很值得整張放完。";
  }

  if (leadVibe === "Focus") {
    return "線條乾淨，呼吸也穩，很適合陪一段需要專心的時間。";
  }

  return "分寸很穩，也很耐聽，任何時候放下去都能把氣氛安定下來。";
}

function serializeSharePayload(payload: SharePayload) {
  return `${payload.title}\n${payload.text}\n${payload.url}`;
}

export function buildPickSharePayload(pick: JazzPick): SharePayload {
  return {
    title: `${pick.title} · ${pick.artist}`,
    text: `今天想把《${pick.title}》留給你。${pick.artist}，${buildShareRecommendationLine(pick)}`,
    url: pick.shareUrl
  };
}

export async function copyShareText(payload: SharePayload) {
  if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "unavailable" as const };
  }

  await navigator.clipboard.writeText(serializeSharePayload(payload));
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
    await navigator.clipboard.writeText(serializeSharePayload(payload));
    return { status: "copied" as const };
  }

  return { status: "unavailable" as const };
}
