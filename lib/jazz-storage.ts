import { JazzPick } from "@/types/jazz";

const SAVED_PICKS_KEY = "daily-jazz-saved-picks";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSavedPicks(): JazzPick[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(SAVED_PICKS_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is JazzPick =>
        Boolean(value) &&
        typeof value === "object" &&
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        typeof value.artist === "string"
    );
  } catch {
    return [];
  }
}

export function savePicks(picks: JazzPick[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SAVED_PICKS_KEY, JSON.stringify(picks));
}
