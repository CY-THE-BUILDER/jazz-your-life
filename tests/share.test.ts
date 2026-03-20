import { describe, expect, it, vi } from "vitest";
import {
  buildFacebookShareUrl,
  buildInstagramLaunchUrl,
  buildInstagramWebUrl,
  buildPickSharePayload,
  buildSmsShareUrl,
  copyShareUrl,
  isMobileUserAgent
} from "@/lib/share";
import { JazzPick } from "@/types/jazz";

const pick: JazzPick = {
  id: "kind-of-blue",
  title: "Kind of Blue",
  artist: "Miles Davis",
  type: "album",
  subgenre: "Modal Jazz",
  vibeTags: ["Classic", "Late Night", "Focus"],
  recommendationReason: "把房間的光線降下來，這張會用極少的音符把空氣拉得很深。",
  imageUrl: "https://example.com/kob.jpg",
  spotifyUrl: "https://open.spotify.com/album/example",
  shareUrl: "https://open.spotify.com/album/example",
  year: 1959,
  durationLabel: "45 min",
  accentColor: "#b08f57"
};

describe("share helpers", () => {
  it("builds a curator-style payload from a pick", () => {
    const payload = buildPickSharePayload(pick);

    expect(payload.title).toBe("Kind of Blue · Miles Davis");
    expect(payload.text).toContain("Kind of Blue");
    expect(payload.text).toContain("Miles Davis");
    expect(payload.url).toBe("https://open.spotify.com/album/example");
  });

  it("builds a facebook share url with the source link", () => {
    const url = buildFacebookShareUrl(buildPickSharePayload(pick));

    expect(url).toContain("facebook.com/sharer/sharer.php");
    expect(url).toContain(encodeURIComponent("https://open.spotify.com/album/example"));
  });

  it("builds a text share url with copy", () => {
    const url = buildSmsShareUrl(buildPickSharePayload(pick));

    expect(url.startsWith("sms:?&body=")).toBe(true);
    expect(url).toContain(encodeURIComponent("Kind of Blue · Miles Davis"));
  });

  it("exposes instagram launch targets", () => {
    expect(buildInstagramLaunchUrl()).toBe("instagram://app");
    expect(buildInstagramWebUrl()).toBe("https://www.instagram.com/");
  });

  it("detects mobile user agents for direct share redirects", () => {
    expect(isMobileUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(isMobileUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe(false);
  });

  it("copies only the spotify url for copy-link actions", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText
      }
    });

    const result = await copyShareUrl("https://open.spotify.com/album/example");

    expect(result.status).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://open.spotify.com/album/example");
  });
});
