"use client";

import { useEffect, useState } from "react";
import type { GithubData } from "@/lib/github";

const TTL_MS = 30 * 60 * 1000;

let cached: { at: number; data: GithubData } | null = null;
let inflight: Promise<GithubData> | null = null;

async function loadGithub(): Promise<GithubData> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  if (inflight) return inflight;

  inflight = fetch("/api/github")
    .then(async (res) => {
      if (!res.ok) {
        return {
          ok: false,
          prs: [],
          weeks: [],
          total: 0,
          fetchedAt: new Date().toISOString(),
        } satisfies GithubData;
      }
      return (await res.json()) as GithubData;
    })
    .then((data) => {
      if (data.ok) cached = { at: Date.now(), data };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Shared client fetch for heatmap + PR list (one request per page load). */
export function useGithub() {
  const [data, setData] = useState<GithubData | null>(cached?.data ?? null);

  useEffect(() => {
    let alive = true;
    loadGithub().then((next) => {
      if (alive) setData(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
