import { describe, expect, it } from "vitest";
import { resolveSpotifyStatusToast } from "@/lib/spotify-status";

describe("spotify status localization", () => {
  it("does not resolve a spotify toast until locale initialization is ready", () => {
    const result = resolveSpotifyStatusToast(
      "https://vanguard.noesis.studio/?spotify=connected",
      "en",
      false
    );

    expect(result).toBeNull();
  });

  it("uses the resolved English locale when the spotify callback flag is present", () => {
    const result = resolveSpotifyStatusToast(
      "https://vanguard.noesis.studio/?spotify=connected",
      "en",
      true
    );

    expect(result?.text).toBe("Spotify connected.");
    expect(result?.nextUrl).toBe("https://vanguard.noesis.studio/");
  });

  it("uses the resolved Traditional Chinese locale when the spotify callback flag is present", () => {
    const result = resolveSpotifyStatusToast(
      "https://vanguard.noesis.studio/?spotify=connected",
      "zh-Hant",
      true
    );

    expect(result?.text).toBe("Spotify 已連接。");
    expect(result?.nextUrl).toBe("https://vanguard.noesis.studio/");
  });
});
