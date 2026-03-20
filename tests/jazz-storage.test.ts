import { beforeEach, describe, expect, it } from "vitest";
import { getSavedPicks, savePicks } from "@/lib/jazz-storage";
import { JazzPick } from "@/types/jazz";

const savedPick: JazzPick = {
  id: "kind-of-blue",
  title: "Kind of Blue",
  artist: "Miles Davis",
  type: "album",
  subgenre: "Modal Jazz",
  vibeTags: ["Classic", "Late Night", "Focus"],
  recommendationReason: "當你想把房間的光線降下來，這張會用極少的音符把空氣拉得很深。",
  imageUrl: "https://example.com/kob.jpg",
  spotifyUrl: "https://open.spotify.com/album/example",
  shareUrl: "https://open.spotify.com/album/example",
  year: 1959,
  durationLabel: "45 min",
  accentColor: "#b08f57"
};

describe("jazz storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists saved picks across reload-like reads", () => {
    savePicks([savedPick]);

    expect(getSavedPicks()).toEqual([savedPick]);
    expect(getSavedPicks()).toEqual([savedPick]);
  });

  it("ignores malformed local storage without clearing valid future saves", () => {
    window.localStorage.setItem("daily-jazz-saved-picks", "{bad json");
    expect(getSavedPicks()).toEqual([]);

    savePicks([savedPick]);
    expect(getSavedPicks()).toEqual([savedPick]);
  });
});
