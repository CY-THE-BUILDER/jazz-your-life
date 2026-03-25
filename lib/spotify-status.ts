import { AppLocale } from "@/types/jazz";
import { getUiCopy } from "@/lib/vanguard-i18n";

export function resolveSpotifyStatusToast(
  url: string,
  locale: AppLocale,
  isReady: boolean
) {
  if (!isReady) {
    return null;
  }

  const currentUrl = new URL(url);
  const spotifyStatus = currentUrl.searchParams.get("spotify");
  if (!spotifyStatus) {
    return null;
  }

  const copy = getUiCopy(locale);
  let text: string | null = null;

  if (spotifyStatus === "connected") {
    text = copy.toastSpotifyConnected;
  } else if (spotifyStatus === "denied") {
    text = copy.toastSpotifyDenied;
  } else if (spotifyStatus === "misconfigured") {
    text = copy.toastSpotifyMisconfigured;
  } else if (spotifyStatus === "error") {
    text = copy.toastSpotifyError;
  }

  currentUrl.searchParams.delete("spotify");

  return {
    text,
    nextUrl: currentUrl.toString()
  };
}
