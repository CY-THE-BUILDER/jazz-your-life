import { JazzPick } from "@/types/jazz";
import { buildSpotifySearchUrl } from "@/lib/spotify-recommendations";

type FetchLike = typeof fetch;

type OEmbedResponse = {
  thumbnail_url?: string;
};

type ItunesResult = {
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  artworkUrl100?: string;
};

type ItunesResponse = {
  results?: ItunesResult[];
};

const publicArtworkHydrationCache = new Map<string, Promise<JazzPick>>();

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesNormalized(haystack: string, needle: string) {
  const normalizedHaystack = normalizeText(haystack);
  const normalizedNeedle = normalizeText(needle);

  return (
    normalizedHaystack === normalizedNeedle ||
    normalizedHaystack.includes(normalizedNeedle) ||
    normalizedNeedle.includes(normalizedHaystack)
  );
}

function scoreItunesResult(pick: JazzPick, result: ItunesResult) {
  const titleCandidate = pick.type === "track" ? result.trackName : result.collectionName;
  let score = 0;

  if (titleCandidate && includesNormalized(titleCandidate, pick.title)) {
    score += 3;
  }

  if (result.artistName && includesNormalized(result.artistName, pick.artist)) {
    score += 3;
  }

  if (pick.type === "track" && result.collectionName) {
    score += 1;
  }

  return score;
}

function upscaleItunesArtwork(url: string) {
  return url.replace(/\/\d+x\d+bb\./, "/600x600bb.");
}

export async function fetchSpotifyOEmbedThumbnail(
  spotifyUrl: string,
  fetchImpl: FetchLike = fetch
) {
  const response = await fetchImpl(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`,
    {
      cache: "force-cache"
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OEmbedResponse;
  return data.thumbnail_url ?? null;
}

function isSpotifyAlbumUrl(url: string) {
  return /open\.spotify\.com\/album\//.test(url);
}

export function buildItunesArtworkSearchUrl(pick: JazzPick) {
  const term = `${pick.title} ${pick.artist}`;
  const entity = pick.type === "track" ? "song" : "album";
  return `https://itunes.apple.com/search?media=music&entity=${entity}&limit=5&term=${encodeURIComponent(term)}`;
}

export async function fetchItunesArtwork(pick: JazzPick, fetchImpl: FetchLike = fetch) {
  const response = await fetchImpl(buildItunesArtworkSearchUrl(pick), {
    cache: "force-cache"
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ItunesResponse;
  const result =
    (data.results ?? [])
      .map((entry) => ({ entry, score: scoreItunesResult(pick, entry) }))
      .sort((left, right) => right.score - left.score)[0]?.entry ?? null;

  if (!result?.artworkUrl100 || scoreItunesResult(pick, result) < 4) {
    return null;
  }

  return upscaleItunesArtwork(result.artworkUrl100);
}

export async function hydratePublicArtworkForPick(
  pick: JazzPick,
  fetchImpl: FetchLike = fetch
) {
  if (fetchImpl === fetch) {
    const cacheKey = `${pick.id}:${pick.spotifyUrl}:${pick.artworkSourceUrl ?? ""}`;
    const cached = publicArtworkHydrationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const pending = hydratePublicArtworkForPickUncached(pick, fetchImpl);
    publicArtworkHydrationCache.set(cacheKey, pending);
    return pending;
  }

  return hydratePublicArtworkForPickUncached(pick, fetchImpl);
}

async function hydratePublicArtworkForPickUncached(
  pick: JazzPick,
  fetchImpl: FetchLike = fetch
) {
  const exactSpotifyUrl = isSpotifyAlbumUrl(pick.spotifyUrl) ? pick.spotifyUrl : null;
  const exactThumbnailUrl = exactSpotifyUrl
    ? await fetchSpotifyOEmbedThumbnail(exactSpotifyUrl, fetchImpl)
    : null;

  if (exactThumbnailUrl && exactSpotifyUrl) {
    return {
      ...pick,
      imageUrl: exactThumbnailUrl,
      artworkSourceUrl: exactSpotifyUrl
    };
  }

  const thumbnailUrl = await fetchSpotifyOEmbedThumbnail(
    pick.artworkSourceUrl ?? pick.spotifyUrl,
    fetchImpl
  );

  if (thumbnailUrl) {
    return {
      ...pick,
      imageUrl: thumbnailUrl
    };
  }

  const itunesArtworkUrl = await fetchItunesArtwork(pick, fetchImpl);
  if (!itunesArtworkUrl) {
    return exactSpotifyUrl
      ? {
          ...pick,
          spotifyUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          }),
          shareUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          })
        }
      : pick;
  }

  return {
    ...pick,
    imageUrl: itunesArtworkUrl,
    ...(exactSpotifyUrl
      ? {
          spotifyUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          }),
          shareUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          })
        }
      : {})
  };
}

export function clearPublicArtworkHydrationCache() {
  publicArtworkHydrationCache.clear();
}
