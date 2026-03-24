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

  it("keeps all five shelves filled to five picks while preserving at least one Spotify pick per personalized flavor", () => {
    const makePick = (id: string, vibe: "Classic" | "Exploratory" | "Fusion" | "Late Night" | "Focus", source: "spotify" | "curated"): JazzPick => ({
      id,
      title: id,
      artist: source === "spotify" ? "Spotify Artist" : "Curated Artist",
      type: "album",
      subgenre: vibe === "Fusion" ? "Fusion" : vibe === "Focus" ? "Piano Jazz" : "Jazz",
      vibeTags: [vibe],
      recommendationReason: "test",
      imageUrl: source === "spotify" ? `https://i.scdn.co/image/${id}` : `https://example.com/${id}.jpg`,
      spotifyUrl: `https://open.spotify.com/album/${id}`,
      shareUrl: `https://open.spotify.com/album/${id}`,
      year: 1970,
      durationLabel: "40 min",
      accentColor: "#999999",
      source
    });

    const duplicateSpotify = makePick("dup-spotify", "Fusion", "spotify");
    const feeds = {
      Classic: {
        mode: "personalized" as const,
        headline: "c",
        note: "c",
        picks: [duplicateSpotify, makePick("classic-1", "Classic", "spotify"), makePick("classic-2", "Classic", "spotify"), makePick("classic-3", "Classic", "spotify"), makePick("classic-4", "Classic", "spotify")],
        reservePicks: [makePick("classic-r1", "Classic", "spotify"), makePick("classic-r2", "Classic", "spotify")]
      },
      Exploratory: {
        mode: "personalized" as const,
        headline: "e",
        note: "e",
        picks: [duplicateSpotify, makePick("explore-1", "Exploratory", "spotify")],
        reservePicks: [makePick("explore-r1", "Exploratory", "spotify"), makePick("explore-r2", "Exploratory", "spotify")]
      },
      Fusion: {
        mode: "personalized" as const,
        headline: "f",
        note: "f",
        picks: [duplicateSpotify, makePick("fusion-1", "Fusion", "spotify")],
        reservePicks: [makePick("fusion-r1", "Fusion", "spotify"), makePick("fusion-r2", "Fusion", "spotify")]
      },
      "Late Night": {
        mode: "personalized" as const,
        headline: "l",
        note: "l",
        picks: [duplicateSpotify, makePick("late-1", "Late Night", "spotify")],
        reservePicks: [makePick("late-r1", "Late Night", "spotify"), makePick("late-r2", "Late Night", "spotify")]
      },
      Focus: {
        mode: "personalized" as const,
        headline: "o",
        note: "o",
        picks: [duplicateSpotify, makePick("focus-1", "Focus", "spotify")],
        reservePicks: [makePick("focus-r1", "Focus", "spotify"), makePick("focus-r2", "Focus", "spotify")]
      }
    };

    const uniqueFeeds = ensureUniqueFeeds(feeds, { seed: 4, priorityVibe: "Late Night" });

    for (const vibe of vibeOptions) {
      expect(uniqueFeeds[vibe]?.picks).toHaveLength(5);
      expect(uniqueFeeds[vibe]?.picks.some((pick) => pick.source === "spotify")).toBe(true);
    }

    const ids = vibeOptions.flatMap((vibe) => uniqueFeeds[vibe]?.picks.map((pick) => pick.id) ?? []);
    expect(new Set(ids).size).toBe(25);
  });

  it("uses provided recent ids when deduping on the server so the last shelf is not immediately repeated", () => {
    const repeatedShelf = getCuratedPicksForVibe("Focus", {
      limit: 5,
      seed: 14,
      rotation: 5
    });
    const feeds = {
      Focus: buildCuratedFeed("Focus", repeatedShelf)
    };

    const uniqueFeeds = ensureUniqueFeeds(feeds, {
      seed: 14,
      recentIdsByVibe: {
        Focus: repeatedShelf.map((pick) => pick.id)
      }
    });

    const nextSignature = uniqueFeeds.Focus?.picks.map((pick) => pick.id).join("|");
    const repeatedSignature = repeatedShelf.map((pick) => pick.id).join("|");

    expect(nextSignature).not.toBe(repeatedSignature);
  });
});
