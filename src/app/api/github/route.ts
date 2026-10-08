import { NextResponse } from "next/server";
import { fetchGithubData } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchGithubData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
