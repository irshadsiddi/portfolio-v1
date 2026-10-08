import type { GithubData } from "./types";
const TTL_MS = 30 * 60 * 1000;
let cache: { at: number; data: GithubData } | null = null;
export function readGithubCache() {
  return cache && Date.now() - cache.at < TTL_MS ? cache.data : null;
}
export function cacheGithubData(data: GithubData) {
  if (data.prs.length > 0 && data.weeks.length > 0) cache = { at: Date.now(), data };
}
