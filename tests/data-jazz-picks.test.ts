import { describe, expect, it } from "vitest";
import { jazzPicks } from "@/data/jazz-picks";

describe("curated jazz picks", () => {
  it("only ship album recommendations in the curated feed", () => {
    for (const pick of jazzPicks) {
      expect(pick.type).toBe("album");
      expect(pick.durationLabel.toLowerCase()).not.toBe("album");
    }
  });

  it("use spotify search urls instead of stale hardcoded ids", () => {
    for (const pick of jazzPicks) {
      expect(pick.spotifyUrl.startsWith("https://open.spotify.com/search/")).toBe(true);
      expect(pick.shareUrl).toBe(pick.spotifyUrl);
    }
  });

  it("ship fallback art only as a last resort in data and rely on API hydration for live covers", () => {
    for (const pick of jazzPicks) {
      expect(typeof pick.imageUrl).toBe("string");
      expect(pick.imageUrl.length).toBeGreaterThan(0);
      expect(pick.artworkSourceUrl?.startsWith("https://open.spotify.com/")).toBe(true);
    }
  });
});
