"use client";

import { openSourceContribution } from "@/constants/lab";
import Link from "next/link";
import { PrBrowser } from "@/components/pr-browser";
import { ArrowUpRight } from "lucide-react";
export function OpenSourceSection() {
  return (
    <section
      id="opensource"
      data-reveal
      className="content-section page-width oss-section document-width block scroll-mt-16 border-t border-dotted border-(--document-rule) px-3 py-section-padding max-document:px-4"
    >
      <div className="oss-grid ui-open-source-grid">
        <div className="oss-intro">
          <h2 className="ui-section-title">Open Source</h2>
          <p className="m-0 max-w-52 text-sm leading-relaxed text-muted-foreground max-navigation:max-w-none">
            Contributions I've made to open source projects.
          </p>
        </div>
        <div className="oss-main">
          <article className="mb-6 border-b border-border pb-6">
            <h3 className="mt-0 font-serif text-2xl font-normal">{openSourceContribution.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {openSourceContribution.description}
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              {openSourceContribution.reference}
            </p>
          </article>
          <PrBrowser
            limit={5}
            footer={(total: number, hidden: number) => (
              <Link href="/open-source" className="oss-more ui-open-source-link">
                {hidden > 0 ? `View all ${total} pull requests` : "Open full list"}{" "}
                <ArrowUpRight size={13} />
              </Link>
            )}
          />
        </div>
      </div>
    </section>
  );
}
