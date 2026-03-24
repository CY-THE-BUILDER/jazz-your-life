import { describe, expect, it } from "vitest";
import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { ensureUniqueFeeds } from "@/lib/recommendation-feeds";
import { buildCuratedFeed } from "@/lib/spotify-recommendations";
import { JazzPick } from "@/types/jazz";
import { vibeOptions } from "@/types/jazz";

describe("recommendation feeds", () => {
  it("ensures the same 25-slot batch does not repeat an album across flavors", () => {
    const feeds = Object.fromEntries(
      vibeOptions.map((vibe) => [
        vibe,
        buildCuratedFeed(vibe, getCuratedPicksForVibe(vibe, { limit: 5, seed: 9 }))
      ])
    );

    const uniqueFeeds = ensureUniqueFeeds(feeds, { seed: 9 });
    const allIds = vibeOptions.flatMap((vibe) => uniqueFeeds[vibe]?.picks.map((pick) => pick.id) ?? []);

    expect(allIds).toHaveLength(25);
    expect(new Set(allIds).size).toBe(25);
  });

  it("backfills a duplicated shelf with other albums from the same flavor", () => {
    const classicShelf = getCuratedPicksForVibe("Classic", { limit: 5, seed: 2 });
    const duplicateHead = classicShelf[0];
    const feeds = {
      Classic: buildCuratedFeed("Classic", classicShelf),
      Exploratory: buildCuratedFeed("Exploratory", [duplicateHead, ...getCuratedPicksForVibe("Exploratory", { limit: 4, seed: 2 })]),
      Fusion: buildCuratedFeed("Fusion", getCuratedPicksForVibe("Fusion", { limit: 5, seed: 2 })),
      "Late Night": buildCuratedFeed("Late Night", getCuratedPicksForVibe("Late Night", { limit: 5, seed: 2 })),
      Focus: buildCuratedFeed("Focus", getCuratedPicksForVibe("Focus", { limit: 5, seed: 2 }))
    };

    const uniqueFeeds = ensureUniqueFeeds(feeds, { seed: 2 });
    const exploratoryIds = uniqueFeeds.Exploratory?.picks.map((pick) => pick.id) ?? [];

    expect(exploratoryIds).not.toContain(duplicateHead.id);
    expect(uniqueFeeds.Exploratory?.picks).toHaveLength(5);
  });

  it("uses personalized reserve picks before falling back to curated albums", () => {
    const duplicate = getCuratedPicksForVibe("Classic", { limit: 1, seed: 3 })[0];
    const spotifyPick = (id: string, title: string): JazzPick => ({
      ...duplicate,
      id,
      title,
      artist: "Spotify Artist",
      source: "spotify",
      vibeTags: ["Exploratory"],
      imageUrl: `https://i.scdn.co/image/${id}`,
      spotifyUrl: `https://open.spotify.com/album/${id}`,
      shareUrl: `https://open.spotify.com/album/${id}`
    });

    const feeds = {
      Classic: buildCuratedFeed("Classic", [duplicate]),
      Exploratory: {
        mode: "personalized" as const,
        headline: "順著你最近的耳朵走",
        note: "test",
        picks: [duplicate],
        reservePicks: [spotifyPick("spotify-1", "Reserve One")]
      }
    };

    const uniqueFeeds = ensureUniqueFeeds(feeds, { seed: 3 });
    expect(uniqueFeeds.Exploratory?.picks[0].id).toBe("spotify-1");
    expect(uniqueFeeds.Exploratory?.picks[0].source).toBe("spotify");
    expect(uniqueFeeds.Exploratory?.picks[0].imageUrl).toContain("i.scdn.co");
  });
});
