import { Vibe } from "@/types/jazz";

const HISTORY_KEY = "daily-jazz-history";

type RecommendationHistoryEntry = {
  ids: string[];
  rotation: number;
};

type RecommendationHistory = Partial<Record<Vibe, RecommendationHistoryEntry | string[]>>;

function isBrowser() {
  return typeof window !== "undefined";
}

function readHistory(): RecommendationHistory {
  if (!isBrowser()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(HISTORY_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as RecommendationHistory;
  } catch {
    return {};
  }
}

function writeHistory(history: RecommendationHistory) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function normalizeEntry(entry: RecommendationHistory[Vibe]): RecommendationHistoryEntry {
  if (Array.isArray(entry)) {
    return {
      ids: entry.filter((value): value is string => typeof value === "string").slice(0, 20),
      rotation: 0
    };
  }

  if (entry && typeof entry === "object") {
    return {
      ids: Array.isArray(entry.ids)
        ? entry.ids.filter((value): value is string => typeof value === "string").slice(0, 20)
        : [],
      rotation: typeof entry.rotation === "number" ? entry.rotation : 0
    };
  }

  return {
    ids: [],
    rotation: 0
  };
}

export function getRecentRecommendationIds(vibe: Vibe) {
  const history = readHistory();
  return normalizeEntry(history[vibe]).ids;
}

export function getRecommendationRotation(vibe: Vibe) {
  const history = readHistory();
  return normalizeEntry(history[vibe]).rotation;
}

export function rememberRecommendationIds(vibe: Vibe, ids: string[]) {
  const history = readHistory();
  const entry = normalizeEntry(history[vibe]);

  writeHistory({
    ...history,
    [vibe]: {
      ids: Array.from(new Set(ids)).slice(0, 20),
      rotation: entry.rotation + 1
    }
  });
}
