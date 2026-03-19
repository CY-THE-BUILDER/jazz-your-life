import { JazzPick, RecommendationFeed, Vibe } from "@/types/jazz";

export type RecommendationOrigin = "top" | "recent" | "saved" | "search";
export type ListenerSignal = "top" | "recent" | "saved";

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

export type ListenerTasteProfile = {
  topArtistNames: string[];
  recentArtistNames: string[];
  savedArtistNames: string[];
  favoriteGenres: string[];
  favoriteDecadeStart: number | null;
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

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function describeDecade(year: number | null) {
  if (!year) {
    return null;
  }

  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

function uniqueByFrequency(values: string[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([value]) => value);
}

function hashValue(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
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

export function buildTasteProfile(
  topArtists: SpotifyArtistEntity[],
  topTracks: SpotifyTrackEntity[],
  recentlyPlayed: SpotifyTrackEntity[],
  savedTracks: SpotifyTrackEntity[]
): ListenerTasteProfile {
  const allAlbumYears = [...topTracks, ...recentlyPlayed, ...savedTracks]
    .map((track) => Number(track.album.release_date?.slice(0, 4) ?? ""))
    .filter((year) => !Number.isNaN(year));

  return {
    topArtistNames: uniqueByFrequency(topArtists.map((artist) => artist.name)).slice(0, 6),
    recentArtistNames: uniqueByFrequency(
      recentlyPlayed.flatMap((track) => track.artists.map((artist) => artist.name))
    ).slice(0, 6),
    savedArtistNames: uniqueByFrequency(
      savedTracks.flatMap((track) => track.artists.map((artist) => artist.name))
    ).slice(0, 6),
    favoriteGenres: uniqueByFrequency(topArtists.flatMap((artist) => artist.genres ?? [])).slice(0, 4),
    favoriteDecadeStart:
      allAlbumYears.length > 0
        ? Math.floor(
            allAlbumYears.reduce((sum, year) => sum + year, 0) / allAlbumYears.length / 10
          ) * 10
        : null
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
    preferredTypes: ["album"]
  },
  Exploratory: {
    searchTerms: ["spiritual jazz", "post-bop", "contemporary jazz"],
    preferredSubgenres: ["Modal Jazz", "Contemporary Jazz", "Jazz"],
    preferredDecades: [
      [1960, 1969],
      [2000, 2035]
    ],
    preferredTypes: ["album"]
  },
  Fusion: {
    searchTerms: ["jazz fusion", "jazz funk", "electric jazz"],
    preferredSubgenres: ["Fusion", "Contemporary Jazz"],
    preferredDecades: [
      [1970, 1979],
      [2000, 2035]
    ],
    preferredTypes: ["album"]
  },
  "Late Night": {
    searchTerms: ["modal jazz", "spiritual jazz", "night jazz"],
    preferredSubgenres: ["Modal Jazz", "Jazz", "Contemporary Jazz"],
    preferredDecades: [
      [1950, 1969],
      [1990, 2035]
    ],
    preferredTypes: ["album"]
  },
  Focus: {
    searchTerms: ["cool jazz", "piano jazz", "contemporary jazz"],
    preferredSubgenres: ["Cool Jazz", "Contemporary Jazz", "Jazz"],
    preferredDecades: [
      [1950, 1969],
      [1990, 2035]
    ],
    preferredTypes: ["album"]
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

export function buildAlbumRecommendationReason(params: {
  albumId: string;
  albumTitle: string;
  albumArtist: string;
  albumYear: number;
  subgenre: string;
  activeVibe: Vibe;
  tasteProfile: ListenerTasteProfile;
  sourceArtistName: string;
  origin: RecommendationOrigin;
  sourceTrackTitle?: string;
  sourceAlbumTitle?: string;
}) {
  const evidence: string[] = [];
  const support: string[] = [];
  const favoriteDecade = describeDecade(params.tasteProfile.favoriteDecadeStart);
  const topArtists = new Set(params.tasteProfile.topArtistNames.map(normalizeText));
  const savedArtists = new Set(params.tasteProfile.savedArtistNames.map(normalizeText));
  const recentArtists = new Set(params.tasteProfile.recentArtistNames.map(normalizeText));
  const albumArtistKey = normalizeText(params.albumArtist);
  const sourceArtistKey = normalizeText(params.sourceArtistName);

  if (topArtists.has(albumArtistKey) || topArtists.has(sourceArtistKey)) {
    evidence.push(`你最近明顯常回到 ${params.sourceArtistName}，這張把那條線拉成更完整的一次聆聽。`);
  }

  if (savedArtists.has(albumArtistKey)) {
    evidence.push(`你收藏過 ${params.albumArtist} 相關的內容，回到這張專輯本身會比單點其中一首更對味。`);
  }

  if (recentArtists.has(albumArtistKey) && params.sourceTrackTitle) {
    evidence.push(`你最近播過〈${params.sourceTrackTitle}〉，回到它所在的整張專輯，情緒會更連貫。`);
  } else if (recentArtists.has(albumArtistKey)) {
    evidence.push(`你最近剛聽過 ${params.albumArtist}，這張接起來很自然。`);
  }

  if (
    params.sourceAlbumTitle &&
    normalizeText(params.sourceAlbumTitle) !== normalizeText(params.albumTitle)
  ) {
    evidence.push(`你最近常聽的《${params.sourceAlbumTitle}》如果想再往外延伸，這張會是很順的一步。`);
  }

  if (params.origin === "search") {
    evidence.push(`沿著 ${params.sourceArtistName} 這條線往外走時，《${params.albumTitle}》會比只停在單曲更能看出完整樣子。`);
  }

  if (params.albumYear > 0) {
    evidence.push(`《${params.albumTitle}》身上的 ${params.albumYear} 年代感，和你最近偏好的聲響區間很接近。`);
  }

  if (params.tasteProfile.favoriteGenres.some((genre) => normalizeText(genre).includes(normalizeText(params.subgenre)))) {
    support.push(`你的常聽裡一直有 ${params.subgenre} 這種質地，這張很容易接上。`);
  } else {
    support.push(`它的 ${params.subgenre.toLowerCase()} 氣質很完整，適合整張放完。`);
  }

  if (favoriteDecade) {
    support.push(`你最近常聽的年代感多半落在 ${favoriteDecade}，這張也在那個聲響區間裡。`);
  }

  if (params.activeVibe === "Late Night") {
    support.push("夜裡把整張放完，層次會比停在單曲更耐聽。");
  }

  if (params.activeVibe === "Focus") {
    support.push("它的推進感收得很整齊，適合陪一段比較長的專注。");
  }

  if (params.activeVibe === "Fusion") {
    support.push("節奏和電氣感是成套成立的，整張聽會更過癮。");
  }

  if (params.activeVibe === "Exploratory") {
    support.push("這張的轉折和留白都夠，從頭聽到尾才會真的打開。");
  }

  if (params.activeVibe === "Classic") {
    support.push("它的進入門檻很低，但細節經得起一整張慢慢聽。");
  }

  const candidates = [...evidence, ...support];
  const primaryPool = evidence.length > 0 ? evidence : support;
  const primary =
    primaryPool[hashValue(params.albumId) % Math.max(primaryPool.length, 1)] ??
    `這張和你最近的聆聽方向很貼近，值得直接從第一首開始。`;
  const secondaryPool = candidates.filter((sentence) => sentence !== primary);
  const secondary =
    secondaryPool[hashValue(params.albumId) % Math.max(secondaryPool.length, 1)] ??
    "如果今天想少選一點，直接把整張交給它就好。";

  return `${primary}${secondary}`;
}

export function buildTrackPick(
  track: SpotifyTrackEntity,
  sourceArtist: SpotifyArtistEntity,
  fallbackVibe: Vibe,
  origin: RecommendationOrigin,
  reasonOverride?: string
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
    recommendationReason: reasonOverride ?? buildReason(sourceArtist.name, origin, fallbackVibe),
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
  origin: RecommendationOrigin,
  reasonOverride?: string
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
    recommendationReason: reasonOverride ?? buildReason(sourceArtist.name, origin, fallbackVibe),
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
