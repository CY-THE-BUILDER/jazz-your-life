import { describe, expect, it } from "vitest";
import {
  buildAlbumPick,
  buildAlbumRecommendationReason,
  buildSpotifySearchUrl,
  buildTasteProfile,
  buildTrackPick,
  inferVibes,
  scorePickForVibe
} from "@/lib/spotify-recommendations";

describe("spotify recommendation mapping", () => {
  it("maps a Spotify track to a pick with the exact album image and track url", () => {
    const pick = buildTrackPick(
      {
        id: "track-123",
        name: "Actual Track",
        duration_ms: 301000,
        artists: [{ id: "artist-1", name: "Nubya Garcia" }],
        album: {
          id: "album-1",
          name: "Source",
          release_date: "2020-08-21",
          images: [{ url: "https://i.scdn.co/image/album-cover" }]
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/track-123"
        }
      },
      {
        id: "artist-1",
        name: "Nubya Garcia",
        genres: ["contemporary jazz", "jazz saxophone"]
      },
      "Late Night",
      "search"
    );

    expect(pick.imageUrl).toBe("https://i.scdn.co/image/album-cover");
    expect(pick.spotifyUrl).toBe("https://open.spotify.com/track/track-123");
    expect(pick.shareUrl).toBe("https://open.spotify.com/track/track-123");
    expect(pick.type).toBe("track");
  });

  it("maps a Spotify album to a pick with the exact album url", () => {
    const pick = buildAlbumPick(
      {
        id: "album-1",
        name: "Kind of Blue",
        release_date: "1959-08-17",
        images: [{ url: "https://i.scdn.co/image/kob" }],
        external_urls: {
          spotify: "https://open.spotify.com/album/album-1"
        },
        artists: [{ id: "artist-1", name: "Miles Davis" }]
      },
      {
        id: "artist-1",
        name: "Miles Davis",
        genres: ["modal jazz", "jazz trumpet"]
      },
      "Classic",
      "search"
    );

    expect(pick.imageUrl).toBe("https://i.scdn.co/image/kob");
    expect(pick.spotifyUrl).toBe("https://open.spotify.com/album/album-1");
    expect(pick.type).toBe("album");
    expect(pick.artist).toBe("Miles Davis");
  });

  it("falls back to a Spotify search URL when an exact item has not been hydrated yet", () => {
    expect(
      buildSpotifySearchUrl({
        title: "Kind of Blue",
        artist: "Miles Davis",
        type: "album"
      })
    ).toBe(
      "https://open.spotify.com/search/album%3AKind%20of%20Blue%20artist%3AMiles%20Davis"
    );
  });

  it("does not force every inferred result to include the active vibe", () => {
    const inferred = inferVibes(["modal jazz", "jazz trumpet"], "Fusion");
    expect(inferred.vibeTags).toContain("Late Night");
    expect(inferred.vibeTags).not.toContain("Fusion");
  });

  it("scores the same pick differently across vibes", () => {
    const fusionPick = buildAlbumPick(
      {
        id: "album-2",
        name: "Head Hunters",
        release_date: "1973-10-26",
        images: [{ url: "https://i.scdn.co/image/headhunters" }],
        external_urls: {
          spotify: "https://open.spotify.com/album/album-2"
        },
        artists: [{ id: "artist-2", name: "Herbie Hancock" }]
      },
      {
        id: "artist-2",
        name: "Herbie Hancock",
        genres: ["jazz fusion", "jazz funk"]
      },
      "Fusion",
      "search"
    );

    expect(scorePickForVibe(fusionPick, "Fusion")).toBeGreaterThan(
      scorePickForVibe(fusionPick, "Classic")
    );
  });

  it("can derive an album recommendation reason from listening taste instead of repeating the same template", () => {
    const tasteProfile = buildTasteProfile(
      [
        {
          id: "artist-2",
          name: "Herbie Hancock",
          genres: ["jazz fusion", "jazz funk"]
        }
      ],
      [
        {
          id: "track-1",
          name: "Chameleon",
          duration_ms: 900000,
          artists: [{ id: "artist-2", name: "Herbie Hancock" }],
          album: {
            id: "album-2",
            name: "Head Hunters",
            release_date: "1973-10-26"
          }
        }
      ],
      [],
      []
    );

    const reason = buildAlbumRecommendationReason({
      albumId: "album-3",
      albumTitle: "Thrust",
      albumArtist: "Herbie Hancock",
      albumYear: 1974,
      subgenre: "Fusion",
      activeVibe: "Fusion",
      tasteProfile,
      sourceArtistName: "Herbie Hancock",
      origin: "search",
      sourceAlbumTitle: "Head Hunters"
    });

    expect(reason).toContain("Herbie Hancock");
    expect(reason).toContain("Head Hunters");
    expect(reason).not.toContain("這首");
  });
});
