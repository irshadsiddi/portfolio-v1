export type PrStatus = "merged" | "open" | "closed";

export type OssPr = {
  status: PrStatus;
  title: string;
  repo: string;
  adds: number | null;
  dels: number | null;
  date: string;
  ts: string;
  url: string;
};

export type HeatCell = {
  date: string | null;
  level: number;
  count: number | null;
};

export type GithubData = {
  ok: boolean;
  prs: OssPr[];
  weeks: HeatCell[][];
  total: number;
  fetchedAt: string;
};
