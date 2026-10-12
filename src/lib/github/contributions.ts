import { GITHUB_USER } from "@/constants/github";
import { getGithubHeaders } from "./client";
import type { HeatCell } from "./types";

const levels: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};
export async function fetchContributionCalendar(): Promise<{
  weeks: HeatCell[][];
  total: number;
} | null> {
  if (!process.env.GITHUB_TOKEN?.trim()) return null;
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...getGithubHeaders(), "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      query: `query($login: String!) {
      user(login: $login) { contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date contributionCount contributionLevel } }
      } } }
    }`,
      variables: { login: GITHUB_USER },
    }),
  });
  if (!response.ok) return null;
  const json = (await response.json()) as {
    errors?: unknown[];
    data?: {
      user?: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number;
            weeks: {
              contributionDays: {
                date: string;
                contributionCount: number;
                contributionLevel: string;
              }[];
            }[];
          };
        };
      };
    };
  };
  const calendar = json.data?.user?.contributionsCollection.contributionCalendar;
  if (json.errors?.length || !calendar) return null;
  return {
    total: calendar.totalContributions,
    weeks: calendar.weeks.map((week) => {
      const cells: HeatCell[] = Array.from({ length: 7 }, () => ({
        date: null,
        level: -1,
        count: null,
      }));
      for (const day of week.contributionDays) {
        cells[new Date(`${day.date}T00:00:00Z`).getUTCDay()] = {
          date: day.date,
          count: day.contributionCount,
          level: levels[day.contributionLevel] ?? 0,
        };
      }
      return cells;
    }),
  };
}
