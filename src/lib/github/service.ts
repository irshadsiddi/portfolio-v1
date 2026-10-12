import { fetchContributionCalendar } from "./contributions";
import { parseContributions } from "./parsers";
import type { GithubData, HeatCell } from "./types";
import { fetchGithubResponses } from "./client";
import { parsePullRequests } from "./pull-requests";
import { readGithubCache, cacheGithubData } from "./cache";
export async function fetchGithubData(): Promise<GithubData> {
  const cached = readGithubCache();
  if (cached) return cached;

  const empty: GithubData = {
    ok: false,
    prs: [],
    weeks: [],
    total: 0,
    fetchedAt: new Date().toISOString(),
  };

  try {
    const [[searchRes, contribRes], calendar] = await Promise.all([
      fetchGithubResponses(),
      fetchContributionCalendar().catch(() => null),
    ]);
    const prs =
      searchRes.status === "fulfilled" && searchRes.value.ok
        ? await parsePullRequests(searchRes.value)
        : [];

    let weeks: HeatCell[][] = [];
    let total = 0;
    if (contribRes.status === "fulfilled" && contribRes.value.ok) {
      ({ weeks, total } = parseContributions(await contribRes.value.text()));
    }

    if (calendar) ({ weeks, total } = calendar);

    const data: GithubData = {
      ok: prs.length > 0 || weeks.length > 0,
      prs,
      weeks,
      total,
      fetchedAt: new Date().toISOString(),
    };
    cacheGithubData(data);
    return data;
  } catch {
    return empty;
  }
}
