import { afterEach, describe, expect, it } from "vitest";
import {
  buildSpotifyAuthorizeUrl,
  getSpotifyRedirectUri,
  getSpotifyScopes
} from "@/lib/spotify-auth";

describe("spotify auth configuration", () => {
  afterEach(() => {
    delete process.env.SPOTIFY_REDIRECT_URI;
  });

  it("uses the same computed redirect uri for login and callback exchanges", () => {
    expect(getSpotifyRedirectUri("https://vanguard.noesis.studio")).toBe(
      "https://vanguard.noesis.studio/api/spotify/callback"
    );

    process.env.SPOTIFY_REDIRECT_URI = "https://custom.example.com/api/spotify/callback";

    expect(getSpotifyRedirectUri("https://vanguard.noesis.studio")).toBe(
      "https://custom.example.com/api/spotify/callback"
    );
  });

  it("builds a PKCE authorization url without provider-specific login restrictions", () => {
    const originalClientId = process.env.SPOTIFY_CLIENT_ID;
    process.env.SPOTIFY_CLIENT_ID = "client123";

    const url = buildSpotifyAuthorizeUrl({
      origin: "https://vanguard.noesis.studio",
      state: "state123",
      challenge: "challenge123"
    });

    expect(url.origin + url.pathname).toBe("https://accounts.spotify.com/authorize");
    expect(url.searchParams.get("client_id")).toBe("client123");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://vanguard.noesis.studio/api/spotify/callback"
    );
    expect(url.searchParams.get("scope")).toBe(getSpotifyScopes());
    expect(url.searchParams.get("login_hint")).toBeNull();
    expect(url.searchParams.get("provider")).toBeNull();

    process.env.SPOTIFY_CLIENT_ID = originalClientId;
  });
});
