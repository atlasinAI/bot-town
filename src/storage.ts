import type { BuildingId } from './data/bots';
import { BOTS, botsIn } from './data/bots';

const RATINGS_KEY = 'bot-town-v1-ratings';
const SEEN_KEY = 'bot-town-v1-seen';

type Ratings = Record<string, number>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export function getRating(botId: string): number {
  const n = readJson<Ratings>(RATINGS_KEY, {})[botId] ?? 0;
  return n >= 1 && n <= 5 ? n : 0;
}

export function setRating(botId: string, stars: number): void {
  const all = readJson<Ratings>(RATINGS_KEY, {});
  if (stars < 1 || stars > 5) delete all[botId];
  else all[botId] = stars;
  writeJson(RATINGS_KEY, all);
}

export function getSeen(): Set<string> {
  const arr = readJson<string[]>(SEEN_KEY, []);
  return new Set(arr.filter((id) => typeof id === 'string'));
}

export function markSeen(botId: string): { firstTime: boolean; completedBuilding: BuildingId | null } {
  const seen = getSeen();
  const firstTime = !seen.has(botId);
  if (firstTime) {
    seen.add(botId);
    writeJson(SEEN_KEY, [...seen]);
  }
  let completedBuilding: BuildingId | null = null;
  if (firstTime) {
    const bot = BOTS.find((b) => b.id === botId);
    if (bot && isBuildingComplete(bot.building, seen)) {
      completedBuilding = bot.building;
    }
  }
  return { firstTime, completedBuilding };
}

export function isBuildingComplete(building: BuildingId, seen = getSeen()): boolean {
  const list = botsIn(building);
  return list.length > 0 && list.every((b) => seen.has(b.id));
}

export function seenCount(building: BuildingId, seen = getSeen()): number {
  return botsIn(building).filter((b) => seen.has(b.id)).length;
}
