import { GITHUB_USER } from "@/constants/github";
export function getGithubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-irshad",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
export function fetchGithubResponses() {
  return Promise.allSettled([
    fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`author:${GITHUB_USER} type:pr is:public`)}&per_page=100&sort=created&order=desc`,
      { headers: getGithubHeaders(), cache: "no-store", signal: AbortSignal.timeout(15_000) },
    ),
    fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; portfolio-irshad)" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    }),
  ]);
}
