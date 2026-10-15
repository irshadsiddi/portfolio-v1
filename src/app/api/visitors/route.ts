import { NextResponse } from "next/server";
import { VISITOR_CACHE_SECONDS } from "@/constants/analytics";

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json(
    { visitors: null },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) return unavailable();

  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
  url.searchParams.set("projectId", projectId);
  if (process.env.VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  }

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: VISITOR_CACHE_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return unavailable();

    const data = await response.json();
    const visitors = data?.data?.visitors;
    if (!Number.isSafeInteger(visitors) || visitors < 0) return unavailable();

    return NextResponse.json(
      { visitors },
      {
        headers: {
          "Cache-Control": `public, max-age=60, s-maxage=${VISITOR_CACHE_SECONDS}, stale-while-revalidate=600`,
        },
      },
    );
  } catch {
    return unavailable();
  }
}
