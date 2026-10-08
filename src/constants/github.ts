export const GITHUB_USER = "irshadsiddi";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USER}`;

export type SamplePr = {
  status: "merged" | "open" | "closed";
  title: string;
  repo: string;
  adds: number;
  dels: number;
  date: string;
  ts: string;
};

// shown when /api/github is empty or rate-limited
export const samplePullRequests: SamplePr[] = [];
