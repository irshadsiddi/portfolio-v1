import type { OssPr, PrStatus } from "./types";
import { fmtDate } from "./format";
import { githubHeaders as headers } from "./client";
export async function parsePullRequests(response: Response): Promise<OssPr[]> {
  const json = (await response.json()) as {
    items?: {
      state: string;
      title: string;
      created_at: string;
      html_url: string;
      repository_url: string;
      pull_request?: { url?: string; merged_at?: string | null };
    }[];
  };
  const items = json.items ?? [];

  const prs: OssPr[] = items.map((item) => {
    const repo = item.repository_url.split("repos/")[1] ?? item.repository_url;
    const status: PrStatus =
      item.state === "open" ? "open" : item.pull_request?.merged_at ? "merged" : "closed";
    return {
      status,
      title: item.title,
      repo,
      adds: null,
      dels: null,
      date: fmtDate(item.created_at),
      ts: item.created_at.slice(0, 10),
      url: item.html_url,
    };
  });

  // best-effort +/− stats (skip quietly when rate-limited)
  await Promise.all(
    items.slice(0, 30).map(async (item, i) => {
      if (!item.pull_request?.url) return;
      try {
        const res = await fetch(item.pull_request.url, { headers });
        if (!res.ok) return;
        const detail = (await res.json()) as { additions?: number; deletions?: number };
        if (!prs[i]) return;
        prs[i]!.adds = detail.additions ?? null;
        prs[i]!.dels = detail.deletions ?? null;
      } catch {
        /* ignore */
      }
    }),
  );
  return prs;
}
