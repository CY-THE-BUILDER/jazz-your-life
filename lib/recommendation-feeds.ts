import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { RecommendationFeed, Vibe, vibeOptions } from "@/types/jazz";

export function ensureUniqueFeeds(
  feeds: Partial<Record<Vibe, RecommendationFeed>>,
  options?: {
    seed?: number;
    savedIds?: Set<string>;
    priorityVibe?: Vibe;
  }
) {
  const reservedIds = new Set<string>();
  const savedIds = options?.savedIds ?? new Set<string>();
  const seed = options?.seed ?? 0;
  const nextFeeds = {} as Partial<Record<Vibe, RecommendationFeed>>;
  const vibesInOrder = vibeOptions
    .filter((vibe) => Boolean(feeds[vibe]))
    .sort((left, right) => {
      if (options?.priorityVibe === left) {
        return -1;
      }

      if (options?.priorityVibe === right) {
        return 1;
      }

      const leftFeed = feeds[left];
      const rightFeed = feeds[right];
      const leftOptions =
        (leftFeed?.picks.length ?? 0) + (leftFeed?.reservePicks?.length ?? 0);
      const rightOptions =
        (rightFeed?.picks.length ?? 0) + (rightFeed?.reservePicks?.length ?? 0);

      if (leftOptions !== rightOptions) {
        return leftOptions - rightOptions;
      }

      return vibeOptions.indexOf(left) - vibeOptions.indexOf(right);
    });

  for (const [index, vibe] of vibesInOrder.entries()) {
    const feed = feeds[vibe];
    if (!feed) {
      continue;
    }

    const targetLength = Math.max(feed.picks.length, 5);
    const selected = feed.picks.filter((pick) => {
      if (reservedIds.has(pick.id)) {
        return false;
      }

      reservedIds.add(pick.id);
      return true;
    });

    if (selected.length < targetLength) {
      const reservePicks = (feed.reservePicks ?? []).filter((pick) => !reservedIds.has(pick.id));

      for (const pick of reservePicks) {
        if (selected.length >= targetLength) {
          break;
        }

        if (reservedIds.has(pick.id)) {
          continue;
        }

        selected.push(pick);
        reservedIds.add(pick.id);
      }

      if (selected.length < targetLength) {
        const fallback = getCuratedPicksForVibe(vibe, {
          limit: targetLength * 4,
          seed: seed + index,
          excludeIds: new Set([
            ...savedIds,
            ...reservedIds,
            ...selected.map((pick) => pick.id)
          ])
        });

        for (const pick of fallback) {
          if (selected.length >= targetLength) {
            break;
          }

          if (reservedIds.has(pick.id)) {
            continue;
          }

          selected.push(pick);
          reservedIds.add(pick.id);
        }
      }
    }

    nextFeeds[vibe] = {
      ...feed,
      picks: selected
    };
  }

  return nextFeeds;
}
