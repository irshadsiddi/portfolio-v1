"use client";

import { useEffect, useState } from "react";
import type { GithubData } from "@/lib/github";

import { GITHUB_REFRESH_MS } from "@/constants/github";

let cached: { at: number; data: GithubData } | null = null;
let inflight: Promise<GithubData> | null = null;

async function loadGithub(): Promise<GithubData> {
  if (cached && Date.now() - cached.at < GITHUB_REFRESH_MS) return cached.data;
  if (inflight) return inflight;

  inflight = fetch("/api/github", { cache: "no-store" })
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
    .catch(
      () =>
        ({
          ok: false,
          prs: [],
          weeks: [],
          total: 0,
          fetchedAt: new Date().toISOString(),
        }) satisfies GithubData,
    )
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Shared client fetch for heatmap + PR list (deduplicated requests with periodic refresh). */
export function useGithub() {
  const [data, setData] = useState<GithubData | null>(cached?.data ?? null);

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      void loadGithub().then((next) => {
        if (alive) setData((previous) => (next.ok ? next : (previous ?? next)));
      });
    };
    refresh();
    const timer = window.setInterval(refresh, GITHUB_REFRESH_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return data;
}
