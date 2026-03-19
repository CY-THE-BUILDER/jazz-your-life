import { describe, expect, it } from "vitest";
import {
  getSpotifyActionUrl,
  getSpotifyNavigationTarget
} from "@/lib/spotify-actions";

describe("spotify action urls", () => {
  it("keeps desktop playback on the canonical Spotify web url", () => {
    expect(
      getSpotifyActionUrl(
        {
          spotifyUrl: "https://open.spotify.com/album/album1"
        },
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      )
    ).toBe("https://open.spotify.com/album/album1?utm_campaign=jazz-your-life");
    expect(getSpotifyNavigationTarget("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(
      "_blank"
    );
  });

  it("uses Spotify content linking on iOS so the app can open directly", () => {
    expect(
      getSpotifyActionUrl(
        {
          spotifyUrl: "https://open.spotify.com/album/album1"
        },
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
      )
    ).toContain(
      "https://spotify.link/content_linking?~campaign=jazz-your-life-web&$canonical_url="
    );
    expect(getSpotifyNavigationTarget("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe(
      "_self"
    );
  });

  it("uses Spotify content linking on Android with a fallback web url", () => {
    const url = getSpotifyActionUrl(
      {
        spotifyUrl: "https://open.spotify.com/album/album1"
      },
      "Mozilla/5.0 (Linux; Android 14; Pixel 9)"
    );

    expect(url).toContain("https://spotify.link/content_linking?~campaign=jazz-your-life-web");
    expect(url).toContain("$fallback_url=");
    expect(url).toContain("spotify%3Aalbum%3Aalbum1");
  });
});
