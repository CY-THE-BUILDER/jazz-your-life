import { describe, expect, it } from "vitest";
import { getSpotifyActionUrl } from "@/lib/spotify-actions";

describe("spotify action urls", () => {
  it("uses the exact spotify url for play actions", () => {
    expect(
      getSpotifyActionUrl({
        spotifyUrl: "https://open.spotify.com/album/album-1"
      })
    ).toBe("https://open.spotify.com/album/album-1");
  });
});
