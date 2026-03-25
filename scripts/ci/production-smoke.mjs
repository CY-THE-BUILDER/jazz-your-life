#!/usr/bin/env node

const siteUrl = process.env.SMOKE_SITE_URL ?? "https://vanguard.noesis.studio";
const hanRegex = /[\u3400-\u9fff]/;

function fail(message) {
  throw new Error(message);
}

async function fetchWithManualRedirect(path) {
  return fetch(new URL(path, siteUrl), {
    redirect: "manual",
    headers: {
      "cache-control": "no-store"
    }
  });
}

async function fetchJson(path) {
  const response = await fetch(new URL(path, siteUrl), {
    headers: {
      "cache-control": "no-store"
    }
  });

  if (!response.ok) {
    fail(`Expected ${path} to return 200, got ${response.status}`);
  }

  return response.json();
}

function assertEnglishString(value, label) {
  if (hanRegex.test(value)) {
    fail(`${label} leaked Chinese copy: ${value}`);
  }
}

function assertChineseString(value, label) {
  if (!hanRegex.test(value)) {
    fail(`${label} did not contain Chinese copy: ${value}`);
  }
}

function assertLocalizedFeed(payload, locale, vibe) {
  if (!payload || !Array.isArray(payload.picks)) {
    fail(`${locale} ${vibe} payload missing picks array`);
  }

  if (payload.picks.length !== 5) {
    fail(`${locale} ${vibe} expected 5 picks, got ${payload.picks.length}`);
  }

  if (locale === "en") {
    assertEnglishString(payload.headline, `${vibe} headline`);
    assertEnglishString(payload.note, `${vibe} note`);
    for (const [index, pick] of payload.picks.entries()) {
      assertEnglishString(pick.recommendationReason, `${vibe} pick ${index + 1} reason`);
    }
  } else {
    assertChineseString(payload.headline, `${vibe} headline`);
    assertChineseString(payload.note, `${vibe} note`);
    for (const [index, pick] of payload.picks.entries()) {
      assertChineseString(pick.recommendationReason, `${vibe} pick ${index + 1} reason`);
    }
  }
}

async function main() {
  const home = await fetch(new URL("/", siteUrl), { headers: { "cache-control": "no-store" } });
  if (!home.ok) {
    fail(`Homepage returned ${home.status}`);
  }

  const login = await fetchWithManualRedirect("/api/spotify/login");
  if (login.status !== 307) {
    fail(`/api/spotify/login expected 307, got ${login.status}`);
  }

  const loginLocation = login.headers.get("location");
  if (!loginLocation?.includes("accounts.spotify.com/authorize")) {
    fail("Spotify login redirect did not point to Spotify authorize.");
  }

  const expectedCallback = `${siteUrl}/api/spotify/callback`;
  if (!decodeURIComponent(loginLocation).includes(expectedCallback)) {
    fail(`Spotify login redirect did not include ${expectedCallback}`);
  }

  const session = await fetchJson("/api/spotify/session");
  if (!session || typeof session.configured !== "boolean") {
    fail("Spotify session payload malformed.");
  }

  const englishExploratory = await fetchJson(
    "/api/jazz/recommendations?vibe=Exploratory&limit=5&locale=en"
  );
  const englishFusion = await fetchJson(
    "/api/jazz/recommendations?vibe=Fusion&limit=5&locale=en"
  );
  const chineseExploratory = await fetchJson(
    "/api/jazz/recommendations?vibe=Exploratory&limit=5&locale=zh-Hant"
  );
  const chineseFocus = await fetchJson(
    "/api/jazz/recommendations?vibe=Focus&limit=5&locale=zh-Hant"
  );

  assertLocalizedFeed(englishExploratory, "en", "Exploratory");
  assertLocalizedFeed(englishFusion, "en", "Fusion");
  assertLocalizedFeed(chineseExploratory, "zh-Hant", "Exploratory");
  assertLocalizedFeed(chineseFocus, "zh-Hant", "Focus");

  console.log(`Smoke passed for ${siteUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
