import type { GithubData } from "./types";
import { GITHUB_REFRESH_MS } from "@/constants/github";
let cache: { at: number; data: GithubData } | null = null;
export function readGithubCache() {
  return cache && Date.now() - cache.at < GITHUB_REFRESH_MS ? cache.data : null;
}
export function cacheGithubData(data: GithubData) {
  if (data.ok) cache = { at: Date.now(), data };
}
