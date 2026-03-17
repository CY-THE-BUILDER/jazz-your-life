export type FavoriteFortune = {
  id: string;
  text: string;
  dateSaved: string;
  sourceDate: string;
};

export type StreakState = {
  todayOpened: boolean;
  lastOpenDate: string | null;
  streakCount: number;
};

export type DailyRecord = {
  date: string;
  dailyMessageId: string;
  extraDrawCount: number;
};

export type HistoryState = Record<string, DailyRecord>;

export const STORAGE_KEYS = {
  seed: "fortune-cookie-seed",
  favorites: "fortune-cookie-favorites",
  streak: "fortune-cookie-streak",
  history: "fortune-cookie-history"
} as const;

export function safeStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeStorageSet<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createSeed(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `seed-${Math.random().toString(36).slice(2)}`;
}

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayString(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
