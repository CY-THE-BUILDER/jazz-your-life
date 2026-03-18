type SharePayload = {
  title: string;
  text: string;
  url: string;
};

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
