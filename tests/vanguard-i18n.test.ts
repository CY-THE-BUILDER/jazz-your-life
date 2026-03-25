import { describe, expect, it } from "vitest";
import {
  detectPreferredLocale,
  getUiCopy,
  isTraditionalChineseLocale,
  localizePick,
  localizeCuratedReason
} from "@/lib/vanguard-i18n";
import { JazzPick } from "@/types/jazz";

const curatedPick = {
  id: "kind-of-blue",
  title: "Kind of Blue",
  artist: "Miles Davis",
  type: "album",
  subgenre: "Modal Jazz",
  vibeTags: ["Classic"],
  recommendationReason: "當你想把房間的光線降下來，這張會用極少的音符把空氣拉得很深。",
  imageUrl: "https://example.com/kob.jpg",
  spotifyUrl: "https://open.spotify.com/album/example",
  shareUrl: "https://open.spotify.com/album/example",
  year: 1959,
  durationLabel: "45 min",
  accentColor: "#b08f57",
  source: "curated"
} satisfies JazzPick;

describe("vanguard i18n", () => {
  it("treats Traditional Chinese locales as zh-Hant and everything else as English", () => {
    expect(isTraditionalChineseLocale("zh-Hant")).toBe(true);
    expect(isTraditionalChineseLocale("zh-TW")).toBe(true);
    expect(isTraditionalChineseLocale("en-US")).toBe(false);
    expect(detectPreferredLocale(["en-US", "ja-JP"])).toBe("en");
    expect(detectPreferredLocale(["en-US", "zh-TW"])).toBe("zh-Hant");
  });

  it("returns polished English curated copy for translated picks", () => {
    expect(localizeCuratedReason(curatedPick, "en")).toContain("room to exhale");
    expect(localizeCuratedReason(curatedPick, "zh-Hant")).toBe(curatedPick.recommendationReason);
  });

  it("keeps curated Chinese and English reasons fully separate when switching locales", () => {
    const englishPick = localizePick(curatedPick, "en");
    const switchedBack = localizePick(englishPick, "zh-Hant");

    expect(englishPick.recommendationReason).toContain("room to exhale");
    expect(switchedBack.recommendationReason).toBe(
      "當你想把房間的光線降下來，這張會用極少的音符把空氣拉得很深。"
    );
  });

  it("ships English and Chinese UI dictionaries for the footer language toggle", () => {
    expect(getUiCopy("zh-Hant").languageLabel).toBe("語言");
    expect(getUiCopy("en").languageLabel).toBe("Language");
    expect(getUiCopy("en").shareSheetAction).toBe("Share the record");
  });

  it("localizes spotify toasts and connection labels in both languages", () => {
    const zh = getUiCopy("zh-Hant");
    const en = getUiCopy("en");

    expect(zh.toastSpotifyConnected).toBe("Spotify 已連接。");
    expect(zh.toastDisconnected).toBe("已中斷 Spotify 連線。");
    expect(zh.spotifyConnectedLabel("Hank")).toBe("已連接 Hank");

    expect(en.toastSpotifyConnected).toBe("Spotify connected.");
    expect(en.toastDisconnected).toBe("Spotify disconnected.");
    expect(en.spotifyConnectedLabel("Hank")).toBe("Connected: Hank");
  });

  it("keeps interactive copy fully localized across buttons, share UI, and spotify notifications", () => {
    const zh = getUiCopy("zh-Hant");
    const en = getUiCopy("en");

    expect(zh.openSpotify).toBe("前往 Spotify");
    expect(zh.share).toBe("分享");
    expect(zh.save).toBe("收藏");
    expect(zh.spotifyDisconnect).toBe("中斷連線");
    expect(zh.shareSheetEyebrow).toBe("分享這一刻");
    expect(zh.toastSpotifyDenied).toBe("已取消 Spotify 授權。");

    expect(en.openSpotify).toBe("Open in Spotify");
    expect(en.share).toBe("Share");
    expect(en.save).toBe("Save");
    expect(en.spotifyDisconnect).toBe("Disconnect");
    expect(en.shareSheetEyebrow).toBe("Pass this one on");
    expect(en.toastSpotifyDenied).toBe("Spotify authorization was cancelled.");
  });
});
