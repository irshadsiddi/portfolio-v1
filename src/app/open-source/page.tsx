import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { PrBrowser } from "@/components/pr-browser";
import { GITHUB_PROFILE_URL } from "@/constants/github";

const title = "Open Source Pull Requests";
const description = "Every pull request I've opened across open source projects, live from GitHub.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} — Siddi Mohammad Irshad`,
    description,
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function OpenSourcePage() {
  return (
    <main className="project-page page-width ui-detail-page">
      <Link href="/#opensource" className="project-back ui-page-back">
        <ArrowLeft size={15} />
        Back home
      </Link>

      <header className="project-head ui-page-head">
        <span className="eyebrow ui-eyebrow">Open Source</span>

        <h1 className="ui-open-source-title">All pull requests</h1>

        <p className="ui-page-description">{description}</p>
      </header>

      <div className="ui-open-source-toolbar">
        <PrBrowser />
      </div>

      <a
        href={GITHUB_PROFILE_URL}
        target="_blank"
        rel="noreferrer"
        className="oss-more ui-oss-more"
      >
        View profile on GitHub
        <ArrowUpRight size={13} />
      </a>
    </main>
  );
}
