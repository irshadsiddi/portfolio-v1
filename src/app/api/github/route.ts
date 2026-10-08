import { NextResponse } from "next/server";
import { fetchGithubData } from "@/lib/github";

export const revalidate = 1800;

export async function GET() {
  const data = await fetchGithubData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
