import { GITHUB_USER } from "@/constants/github";
export const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "portfolio-irshad",
};
export function fetchGithubResponses() {
  return Promise.all([
    fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`author:${GITHUB_USER} type:pr`)}&per_page=100&sort=created&order=desc`,
      { headers: githubHeaders },
    ),
    fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; portfolio-irshad)" },
    }),
  ]);
}
