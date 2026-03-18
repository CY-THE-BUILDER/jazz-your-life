import { JazzPick, RecommendationFeed, Vibe } from "@/types/jazz";

export type RecommendationOrigin = "top" | "recent" | "saved" | "search";

export type SpotifyArtistEntity = {
  id: string;
  name: string;
  genres?: string[];
};

export type SpotifyImageEntity = {
  url: string;
};

export type SpotifyAlbumEntity = {
  id: string;
  name: string;
  album_type?: "album" | "single" | "compilation";
  images?: SpotifyImageEntity[];
  release_date?: string;
  external_urls?: { spotify?: string };
  artists?: SpotifyArtistEntity[];
};

export type SpotifyTrackEntity = {
  id: string;
  name: string;
  duration_ms: number;
  artists: SpotifyArtistEntity[];
  album: SpotifyAlbumEntity;
  external_urls?: { spotify?: string };
};

const vibeValues: Vibe[] = ["Classic", "Exploratory", "Fusion", "Late Night", "Focus"];

const genreToVibes: Array<{ match: RegExp; vibes: Vibe[]; subgenre: string }> = [
  { match: /fusion|jazz funk|nu jazz|broken beat|jazztronica/i, vibes: ["Fusion", "Exploratory"], subgenre: "Fusion" },
  { match: /hard bop|bebop|post-bop/i, vibes: ["Classic", "Exploratory"], subgenre: "Hard Bop" },
  { match: /cool jazz|west coast jazz/i, vibes: ["Classic", "Focus"], subgenre: "Cool Jazz" },
  { match: /modal jazz|spiritual jazz/i, vibes: ["Exploratory", "Late Night"], subgenre: "Modal Jazz" },
  { match: /contemporary jazz|modern jazz|jazz saxophone|indie jazz|jazz trio/i, vibes: ["Focus", "Late Night"], subgenre: "Contemporary Jazz" },
  { match: /jazz/i, vibes: ["Classic", "Late Night"], subgenre: "Jazz" }
];

export function parseVibe(value: string | null): Vibe {
  return vibeValues.includes(value as Vibe) ? (value as Vibe) : "Classic";
}

export function formatMinutes(durationMs: number) {
  const minutes = Math.max(1, Math.round(durationMs / 60000));
  return `${minutes} min`;
}

export function buildSpotifySearchUrl(params: {
  title: string;
  artist: string;
  type: "track" | "album";
}) {
  const query = `${params.type}:${params.title} artist:${params.artist}`;
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

export function inferVibes(genres: string[], fallback: Vibe): { vibeTags: Vibe[]; subgenre: string } {
  const matched = genreToVibes.find((entry) => genres.some((genre) => entry.match.test(genre)));
  if (!matched) {
    return {
      vibeTags: [fallback, "Exploratory"],
      subgenre: fallback === "Fusion" ? "Fusion" : "Contemporary Jazz"
    };
  }

  const vibeTags = Array.from(new Set(matched.vibes)).slice(0, 3);
  return {
    vibeTags,
    subgenre: matched.subgenre
  };
}

export const vibeProfiles: Record<
  Vibe,
  {
    searchTerms: string[];
    preferredSubgenres: string[];
    preferredDecades: Array<[number, number]>;
    preferredTypes: Array<"track" | "album">;
  }
> = {
  Classic: {
    searchTerms: ["hard bop", "cool jazz", "modal jazz"],
    preferredSubgenres: ["Hard Bop", "Cool Jazz", "Modal Jazz", "Jazz"],
    preferredDecades: [
      [1950, 1959],
      [1960, 1969]
    ],
    preferredTypes: ["album", "track"]
  },
  Exploratory: {
    searchTerms: ["spiritual jazz", "post-bop", "contemporary jazz"],
    preferredSubgenres: ["Modal Jazz", "Contemporary Jazz", "Jazz"],
    preferredDecades: [
      [1960, 1969],
      [2000, 2035]
    ],
    preferredTypes: ["album", "track"]
  },
  Fusion: {
    searchTerms: ["jazz fusion", "jazz funk", "electric jazz"],
    preferredSubgenres: ["Fusion", "Contemporary Jazz"],
    preferredDecades: [
      [1970, 1979],
      [2000, 2035]
    ],
    preferredTypes: ["album", "track"]
  },
  "Late Night": {
    searchTerms: ["modal jazz", "spiritual jazz", "night jazz"],
    preferredSubgenres: ["Modal Jazz", "Jazz", "Contemporary Jazz"],
    preferredDecades: [
      [1950, 1969],
      [1990, 2035]
    ],
    preferredTypes: ["album", "track"]
  },
  Focus: {
    searchTerms: ["cool jazz", "piano jazz", "contemporary jazz"],
    preferredSubgenres: ["Cool Jazz", "Contemporary Jazz", "Jazz"],
    preferredDecades: [
      [1950, 1969],
      [1990, 2035]
    ],
    preferredTypes: ["track", "album"]
  }
};

export function scorePickForVibe(pick: JazzPick, vibe: Vibe) {
  const profile = vibeProfiles[vibe];
  let score = 0;

  if (pick.vibeTags.includes(vibe)) {
    score += 8;
  }

  if (profile.preferredSubgenres.includes(pick.subgenre)) {
    score += 6;
  }

  if (profile.preferredTypes.includes(pick.type)) {
    score += pick.type === profile.preferredTypes[0] ? 3 : 1;
  }

  if (profile.preferredDecades.some(([start, end]) => pick.year >= start && pick.year <= end)) {
    score += 4;
  }

  return score;
}

export function isJazzAdjacentArtist(artist: SpotifyArtistEntity) {
  const haystack = [artist.name, ...(artist.genres ?? [])].join(" ");
  return /jazz|fusion|bebop|bop|swing|blue note|improv|soul jazz/i.test(haystack);
}

export function buildReason(artistName: string, origin: RecommendationOrigin, vibe: Vibe) {
  if (origin === "top") {
    return `你最近在 ${artistName} 這條線上停留得夠久，今天就順勢往前聽。`;
  }

  if (origin === "saved") {
    return `你收過 ${artistName} 相關的聲音，這首很適合接在後面。`;
  }

  if (origin === "search") {
    return `從你常聽的 ${artistName} 稍微再走遠一點，這首剛好接得上。`;
  }

  if (vibe === "Late Night") {
    return `你最近夜裡常聽到 ${artistName} 這種質地，這首會把那道光延續下去。`;
  }

  return `從你最近播過的 ${artistName} 出發，這首會把熟悉感再往前推一點。`;
}

export function buildTrackPick(
  track: SpotifyTrackEntity,
  sourceArtist: SpotifyArtistEntity,
  fallbackVibe: Vibe,
  origin: RecommendationOrigin
): JazzPick {
  const releaseYear = Number(track.album.release_date?.slice(0, 4) ?? new Date().getFullYear());
  const { subgenre, vibeTags } = inferVibes(sourceArtist.genres ?? [], fallbackVibe);

  return {
    id: `spotify-track-${track.id}`,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    type: "track",
    subgenre,
    vibeTags,
    recommendationReason: buildReason(sourceArtist.name, origin, fallbackVibe),
    imageUrl: track.album.images?.[0]?.url ?? buildSpotifySearchUrl({
      title: track.name,
      artist: track.artists[0]?.name ?? sourceArtist.name,
      type: "track"
    }),
    spotifyUrl: track.external_urls?.spotify ?? `https://open.spotify.com/track/${track.id}`,
    shareUrl: track.external_urls?.spotify ?? `https://open.spotify.com/track/${track.id}`,
    year: Number.isNaN(releaseYear) ? new Date().getFullYear() : releaseYear,
    durationLabel: formatMinutes(track.duration_ms),
    accentColor: "#8ea58c",
    source: "spotify",
    seedArtist: sourceArtist.name
  };
}

export function buildAlbumPick(
  album: SpotifyAlbumEntity,
  sourceArtist: SpotifyArtistEntity,
  fallbackVibe: Vibe,
  origin: RecommendationOrigin
): JazzPick {
  const releaseYear = Number(album.release_date?.slice(0, 4) ?? new Date().getFullYear());
  const { subgenre, vibeTags } = inferVibes(sourceArtist.genres ?? [], fallbackVibe);
  const albumArtist = album.artists?.map((artist) => artist.name).join(", ") ?? sourceArtist.name;

  return {
    id: `spotify-album-${album.id}`,
    title: album.name,
    artist: albumArtist,
    type: "album",
    subgenre,
    vibeTags,
    recommendationReason: buildReason(sourceArtist.name, origin, fallbackVibe),
    imageUrl: album.images?.[0]?.url ?? buildSpotifySearchUrl({
      title: album.name,
      artist: albumArtist,
      type: "album"
    }),
    spotifyUrl: album.external_urls?.spotify ?? `https://open.spotify.com/album/${album.id}`,
    shareUrl: album.external_urls?.spotify ?? `https://open.spotify.com/album/${album.id}`,
    year: Number.isNaN(releaseYear) ? new Date().getFullYear() : releaseYear,
    durationLabel: "Album",
    accentColor: "#8ea58c",
    source: "spotify",
    seedArtist: sourceArtist.name
  };
}

export function dedupePicks(picks: JazzPick[]) {
  return picks.reduce<JazzPick[]>((list, pick) => {
    if (list.some((entry) => entry.spotifyUrl === pick.spotifyUrl)) {
      return list;
    }

    return [...list, pick];
  }, []);
}

export function buildCuratedFeed(vibe: Vibe, picks: JazzPick[]): RecommendationFeed {
  return {
    mode: "curated",
    headline: "先從這裡聽起",
    note: "先把範圍收得剛剛好，讓今天第一張不必在太多選擇裡猶豫。",
    picks
  };
}
