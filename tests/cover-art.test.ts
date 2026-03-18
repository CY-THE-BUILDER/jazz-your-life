import { describe, expect, it, vi } from "vitest";
import { jazzPicks } from "@/data/jazz-picks";
import {
  buildItunesArtworkSearchUrl,
  fetchItunesArtwork,
  hydratePublicArtworkForPick
} from "@/lib/cover-art";

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body
  } as Response;
}

describe("public artwork hydration", () => {
  it("builds catalog-specific iTunes search urls for albums and tracks", () => {
    const albumPick = jazzPicks.find((pick) => pick.type === "album");
    const trackPick = jazzPicks.find((pick) => pick.type === "track");

    if (!albumPick || !trackPick) {
      throw new Error("Expected both album and track picks.");
    }

    expect(buildItunesArtworkSearchUrl(albumPick)).toContain("entity=album");
    expect(buildItunesArtworkSearchUrl(trackPick)).toContain("entity=song");
  });

  it("keeps Spotify oEmbed as the first stop when the canonical item is available", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("https://open.spotify.com/oembed")) {
        return jsonResponse({
          thumbnail_url: "https://image-cdn.spotify.com/kind-of-blue.jpg"
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const hydrated = await hydratePublicArtworkForPick(jazzPicks[0], fetchMock as typeof fetch);

    expect(hydrated.imageUrl).toBe("https://image-cdn.spotify.com/kind-of-blue.jpg");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to iTunes artwork when Spotify oEmbed cannot resolve the cover", async () => {
    const trackPick = jazzPicks.find((pick) => pick.type === "track");
    if (!trackPick) {
      throw new Error("Expected at least one curated track.");
    }

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("https://open.spotify.com/oembed")) {
        return jsonResponse({}, false);
      }

      if (url.startsWith("https://itunes.apple.com/search")) {
        return jsonResponse({
          results: [
            {
              trackName: trackPick.title,
              collectionName: "Time Out",
              artistName: trackPick.artist,
              artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music/100x100bb.jpg"
            }
          ]
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const hydrated = await hydratePublicArtworkForPick(trackPick, fetchMock as typeof fetch);

    expect(hydrated.imageUrl).toBe(
      "https://is1-ssl.mzstatic.com/image/thumb/Music/600x600bb.jpg"
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(buildItunesArtworkSearchUrl(trackPick)).toContain("entity=song");
  });

  it("queries the right catalog for every curated recommendation type and returns non-default art", async () => {
    const requestLog: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requestLog.push(url);

      if (url.startsWith("https://open.spotify.com/oembed")) {
        return jsonResponse({}, false);
      }

      if (url.startsWith("https://itunes.apple.com/search")) {
        const parsed = new URL(url);
        const term = parsed.searchParams.get("term") ?? "";
        const match =
          jazzPicks.find((pick) => term === `${pick.title} ${pick.artist}`) ?? jazzPicks[0];
        const type = parsed.searchParams.get("entity");

        return jsonResponse({
          results: [
            type === "song"
              ? {
                  trackName: match.title,
                  collectionName: `${match.title} Session`,
                  artistName: match.artist,
                  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/${encodeURIComponent(match.title)}/100x100bb.jpg`
                }
              : {
                  collectionName: match.title,
                  artistName: match.artist,
                  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/${encodeURIComponent(match.title)}/100x100bb.jpg`
                }
          ]
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const hydrated = await Promise.all(
      jazzPicks.map((pick) => hydratePublicArtworkForPick(pick, fetchMock as typeof fetch))
    );

    for (const pick of hydrated) {
      expect(pick.imageUrl.startsWith("data:image/svg+xml")).toBe(false);
      expect(pick.imageUrl).toContain("600x600bb");
    }

    for (const pick of jazzPicks) {
      const expectedEntity = pick.type === "track" ? "entity=song" : "entity=album";
      expect(
        requestLog.some(
          (url) =>
            url.includes("https://itunes.apple.com/search") &&
            url.includes(expectedEntity) &&
            url.includes(encodeURIComponent(`${pick.title} ${pick.artist}`))
        )
      ).toBe(true);
    }
  });

  it("rejects weak iTunes matches instead of attaching the wrong cover", async () => {
    const albumPick = jazzPicks.find((pick) => pick.type === "album");
    if (!albumPick) {
      throw new Error("Expected at least one curated album.");
    }

    const fetchMock = vi.fn(async () =>
      jsonResponse({
        results: [
          {
            collectionName: "Completely Different Record",
            artistName: "Someone Else",
            artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music/100x100bb.jpg"
          }
        ]
      })
    );

    const artwork = await fetchItunesArtwork(albumPick, fetchMock as typeof fetch);

    expect(artwork).toBeNull();
  });
});
