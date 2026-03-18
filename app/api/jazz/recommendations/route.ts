import { NextRequest, NextResponse } from "next/server";
import { getCuratedPicksForVibe, jazzPicks } from "@/data/jazz-picks";
import {
  clearSpotifyCookies,
  getValidSpotifyAccessToken,
  spotifyGet
} from "@/lib/spotify-auth";
import {
  buildAlbumPick,
  buildCuratedFeed,
  buildTrackPick,
  dedupePicks,
  isJazzAdjacentArtist,
  parseVibe,
  scorePickForVibe,
  SpotifyAlbumEntity,
  SpotifyArtistEntity,
  SpotifyTrackEntity,
  vibeProfiles
} from "@/lib/spotify-recommendations";
import { hydratePublicArtworkForPick } from "@/lib/cover-art";
import { JazzPick } from "@/types/jazz";

export const dynamic = "force-dynamic";

type PagingResponse<T> = {
  items: T[];
};

type TopItemsResponse<T> = PagingResponse<T>;

type RecentlyPlayedItem = {
  track: SpotifyTrackEntity;
};

type SearchResponse = {
  tracks?: { items: SpotifyTrackEntity[] };
  albums?: { items: SpotifyAlbumEntity[] };
};

function matchesCuratedJazzArtist(name: string) {
  const lowered = name.toLowerCase();
  return jazzPicks.some(
    (pick) =>
      pick.artist.toLowerCase().includes(lowered) ||
      lowered.includes(pick.artist.toLowerCase())
  );
}

async function getTopArtists(accessToken: string) {
  const [shortTerm, mediumTerm] = await Promise.all([
    spotifyGet<TopItemsResponse<SpotifyArtistEntity>>(accessToken, "/me/top/artists", {
      time_range: "short_term",
      limit: 10
    }),
    spotifyGet<TopItemsResponse<SpotifyArtistEntity>>(accessToken, "/me/top/artists", {
      time_range: "medium_term",
      limit: 10
    })
  ]);

  return [...shortTerm.items, ...mediumTerm.items];
}

async function getTopTracks(accessToken: string) {
  const [shortTerm, mediumTerm] = await Promise.all([
    spotifyGet<TopItemsResponse<SpotifyTrackEntity>>(accessToken, "/me/top/tracks", {
      time_range: "short_term",
      limit: 10
    }),
    spotifyGet<TopItemsResponse<SpotifyTrackEntity>>(accessToken, "/me/top/tracks", {
      time_range: "medium_term",
      limit: 10
    })
  ]);

  return [...shortTerm.items, ...mediumTerm.items];
}

async function getRecentlyPlayed(accessToken: string) {
  const recent = await spotifyGet<PagingResponse<RecentlyPlayedItem>>(
    accessToken,
    "/me/player/recently-played",
    {
      limit: 12
    }
  );

  return recent.items.map((item) => item.track);
}

async function getSavedTracks(accessToken: string) {
  const saved = await spotifyGet<PagingResponse<{ track: SpotifyTrackEntity }>>(
    accessToken,
    "/me/tracks",
    {
      limit: 12
    }
  );

  return saved.items.map((item) => item.track);
}

async function searchSpotify(
  accessToken: string,
  params: { q: string; type: "track" | "album" | "track,album"; limit: number }
) {
  return spotifyGet<SearchResponse>(accessToken, "/search", {
    q: params.q,
    type: params.type,
    limit: params.limit
  });
}

async function hydrateCuratedPick(accessToken: string, pick: JazzPick) {
  const query = `${pick.type}:"${pick.title}" artist:"${pick.artist}"`;
  const response = await searchSpotify(accessToken, {
    q: query,
    type: pick.type,
    limit: 1
  });

  if (pick.type === "track") {
    const track = response.tracks?.items[0];
    if (!track) {
      return hydratePublicArtworkForPick(pick);
    }

    const sourceArtist = track.artists[0];
    return buildTrackPick(track, sourceArtist, pick.vibeTags[0], "search");
  }

  const album = response.albums?.items[0];
  if (!album) {
    return hydratePublicArtworkForPick(pick);
  }

  const sourceArtist = album.artists?.[0] ?? { id: "unknown", name: pick.artist, genres: [] };
  return buildAlbumPick(album, sourceArtist, pick.vibeTags[0], "search");
}

async function buildSearchDrivenPicks(
  accessToken: string,
  activeVibe: JazzPick["vibeTags"][number],
  seedArtists: SpotifyArtistEntity[],
  excludedTrackIds: Set<string>,
  excludedAlbumIds: Set<string>
) {
  const searchResults = await Promise.all(
    seedArtists.slice(0, 4).map(async (artist) => {
      const queries = vibeProfiles[activeVibe].searchTerms.map(
        (term) => `artist:"${artist.name}" ${term}`
      );

      const responses = await Promise.all(
        queries.map((query) =>
          searchSpotify(accessToken, {
            q: query,
            type: "track,album",
            limit: 5
          })
        )
      );

      const picks = responses.flatMap((response) => {
        const trackPicks = (response.tracks?.items ?? [])
          .filter((track) => !excludedTrackIds.has(track.id))
          .map((track) => buildTrackPick(track, artist, activeVibe, "search"));

        const albumPicks = (response.albums?.items ?? [])
          .filter((album) => !excludedAlbumIds.has(album.id))
          .map((album) => buildAlbumPick(album, artist, activeVibe, "search"));

        return [...trackPicks, ...albumPicks];
      });

      return picks.sort(
        (left, right) => scorePickForVibe(right, activeVibe) - scorePickForVibe(left, activeVibe)
      );
    })
  );

  return dedupePicks(searchResults.flat())
    .filter((pick) => scorePickForVibe(pick, activeVibe) > 0)
    .sort((left, right) => scorePickForVibe(right, activeVibe) - scorePickForVibe(left, activeVibe));
}

function buildSignalDrivenPicks(
  activeVibe: JazzPick["vibeTags"][number],
  topArtists: SpotifyArtistEntity[],
  topTracks: SpotifyTrackEntity[],
  recentlyPlayed: SpotifyTrackEntity[],
  savedTracks: SpotifyTrackEntity[]
) {
  const topArtistMap = new Map(topArtists.map((artist) => [artist.id, artist]));
  const candidates = [
    ...topTracks.map((track) => ({ track, origin: "top" as const })),
    ...savedTracks.map((track) => ({ track, origin: "saved" as const })),
    ...recentlyPlayed.map((track) => ({ track, origin: "recent" as const }))
  ];

  return dedupePicks(
    candidates
      .map(({ track, origin }) => {
        const sourceArtist =
          track.artists
            .map((artist) => topArtistMap.get(artist.id) ?? artist)
            .find(isJazzAdjacentArtist) ?? track.artists[0];

        return {
          pick: buildTrackPick(track, sourceArtist, activeVibe, origin),
          allowed:
            isJazzAdjacentArtist(sourceArtist) ||
            matchesCuratedJazzArtist(sourceArtist.name)
        };
      })
      .filter((entry) => entry.allowed)
      .map((entry) => entry.pick)
  )
    .filter((pick) => scorePickForVibe(pick, activeVibe) > 0)
    .sort((left, right) => scorePickForVibe(right, activeVibe) - scorePickForVibe(left, activeVibe));
}

export async function GET(request: NextRequest) {
  const vibe = parseVibe(request.nextUrl.searchParams.get("vibe"));
  const accessToken = await getValidSpotifyAccessToken();

  if (!accessToken) {
    const hydratedCurated = await Promise.all(
      getCuratedPicksForVibe(vibe).map((pick) => hydratePublicArtworkForPick(pick))
    );

    return NextResponse.json(buildCuratedFeed(vibe, hydratedCurated), {
      headers: { "Cache-Control": "no-store" }
    });
  }

  try {
    const [topArtists, topTracks, recentlyPlayed, savedTracks] = await Promise.all([
      getTopArtists(accessToken),
      getTopTracks(accessToken),
      getRecentlyPlayed(accessToken),
      getSavedTracks(accessToken)
    ]);

    const seedArtists = topArtists.filter(
      (artist) => isJazzAdjacentArtist(artist) || matchesCuratedJazzArtist(artist.name)
    );

    const excludedTrackIds = new Set([
      ...topTracks.map((track) => track.id),
      ...recentlyPlayed.map((track) => track.id),
      ...savedTracks.map((track) => track.id)
    ]);
    const excludedAlbumIds = new Set([
      ...topTracks.map((track) => track.album.id),
      ...recentlyPlayed.map((track) => track.album.id),
      ...savedTracks.map((track) => track.album.id)
    ]);

    const searchedPicks = await buildSearchDrivenPicks(
      accessToken,
      vibe,
      seedArtists,
      excludedTrackIds,
      excludedAlbumIds
    );
    const signalPicks = buildSignalDrivenPicks(
      vibe,
      topArtists,
      topTracks,
      recentlyPlayed,
      savedTracks
    );
    const personalizedPicks = dedupePicks([...searchedPicks, ...signalPicks])
      .sort((left, right) => scorePickForVibe(right, vibe) - scorePickForVibe(left, vibe))
      .slice(0, 5);

    if (personalizedPicks.length >= 3) {
      const seedNames = Array.from(
        new Set(personalizedPicks.map((pick) => pick.seedArtist).filter(Boolean))
      ).slice(0, 3);

      return NextResponse.json(
        {
          mode: "personalized",
          headline: "順著你的聆聽習慣往下走",
          note:
            seedNames.length > 0
              ? `從你最近常聽的 ${seedNames.join("、")} 出發，替你接出今天這一輪。`
              : "這一輪會順著你最近的播放與收藏，把更貼近此刻的選擇先收好。",
          picks: personalizedPicks
        },
        {
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    const hydratedCurated = await Promise.all(
      getCuratedPicksForVibe(vibe).map((pick) => hydrateCuratedPick(accessToken, pick))
    );

    return NextResponse.json(
      buildCuratedFeed(vibe, hydratedCurated),
      {
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch {
    clearSpotifyCookies();
    const hydratedCurated = await Promise.all(
      getCuratedPicksForVibe(vibe).map((pick) => hydratePublicArtworkForPick(pick))
    );

    return NextResponse.json(buildCuratedFeed(vibe, hydratedCurated), {
      headers: { "Cache-Control": "no-store" }
    });
  }
}
