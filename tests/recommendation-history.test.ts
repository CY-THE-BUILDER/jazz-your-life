import { beforeEach, describe, expect, it } from "vitest";
import {
  createRecommendationSessionSeed,
  getGlobalRecommendationIds,
  getRecommendationRotation,
  getRecentRecommendationIds,
  rememberRecommendationIds
} from "@/lib/recommendation-history";

describe("recommendation history", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps recent ids and increments rotation each time a shelf is remembered", () => {
    expect(getRecommendationRotation("Fusion")).toBe(0);

    rememberRecommendationIds("Fusion", ["head-hunters", "sextant"]);
    expect(getRecentRecommendationIds("Fusion")).toEqual(["head-hunters", "sextant"]);
    expect(getRecommendationRotation("Fusion")).toBe(1);
    expect(getGlobalRecommendationIds()).toEqual(["head-hunters", "sextant"]);

    rememberRecommendationIds("Fusion", ["heavy-weather", "black-focus"]);
    expect(getRecentRecommendationIds("Fusion")).toEqual([
      "heavy-weather",
      "black-focus",
      "head-hunters",
      "sextant"
    ]);
    expect(getRecommendationRotation("Fusion")).toBe(2);
    expect(getGlobalRecommendationIds()).toEqual([
      "heavy-weather",
      "black-focus",
      "head-hunters",
      "sextant"
    ]);
  });

  it("reads legacy array history without crashing", () => {
    window.localStorage.setItem(
      "daily-jazz-history",
      JSON.stringify({
        Focus: ["time-out", "source"]
      })
    );

    expect(getRecentRecommendationIds("Focus")).toEqual(["time-out", "source"]);
    expect(getRecommendationRotation("Focus")).toBe(0);
  });

  it("creates a new session seed every time the app starts", () => {
    expect(createRecommendationSessionSeed()).toBe(1);
    expect(createRecommendationSessionSeed()).toBe(2);
    expect(createRecommendationSessionSeed()).toBe(3);
  });
});
