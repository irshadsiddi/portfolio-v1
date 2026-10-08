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
    <main className="project-page page-width oss-page document-width px-3 pt-24 pb-20 max-document:px-4">
      <Link
        href="/#opensource"
        className="project-back inline-flex items-center gap-1.5 font-mono text-2xl text-muted-foreground no-underline transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} />
        Back home
      </Link>

      <header className="project-head mt-12 mb-10">
        <span className="eyebrow ui-eyebrow">Open Source</span>

        <h1 className="ui-open-source-title">All pull requests</h1>

        <p className="max-w-152 text-2xl leading-2 text-muted-foreground">{description}</p>
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
