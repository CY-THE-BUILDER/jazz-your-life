import { JazzPick } from "@/types/jazz";

const mobilePattern =
  /android|iphone|ipad|ipod|mobile|windows phone|blackberry|opera mini/i;

function withCampaign(url: string) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("utm_campaign")) {
    parsed.searchParams.set("utm_campaign", "jazz-your-life");
  }

  return parsed.toString();
}

function extractSpotifyEntity(url: string) {
  const match = url.match(/open\.spotify\.com\/(album|track)\/([a-zA-Z0-9]+)/);
  if (!match) {
    return null;
  }

  return {
    type: match[1] as "album" | "track",
    id: match[2]
  };
}

export function isMobileSpotifyContext(userAgent = "") {
  return mobilePattern.test(userAgent);
}

export function getSpotifyNavigationTarget(userAgent = "") {
  return isMobileSpotifyContext(userAgent) ? "_self" : "_blank";
}

export function getSpotifyActionUrl(
  pick: Pick<JazzPick, "spotifyUrl">,
  userAgent = ""
) {
  const canonicalUrl = withCampaign(pick.spotifyUrl);
  const entity = extractSpotifyEntity(canonicalUrl);

  if (!entity || !isMobileSpotifyContext(userAgent)) {
    return canonicalUrl;
  }

  if (/android/i.test(userAgent)) {
    return `https://spotify.link/content_linking?~campaign=jazz-your-life-web&$deeplink_path=${encodeURIComponent(
      `spotify:${entity.type}:${entity.id}`
    )}&$fallback_url=${encodeURIComponent(canonicalUrl)}`;
  }

  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return `https://spotify.link/content_linking?~campaign=jazz-your-life-web&$canonical_url=${encodeURIComponent(
      canonicalUrl
    )}`;
  }

  return canonicalUrl;
}
