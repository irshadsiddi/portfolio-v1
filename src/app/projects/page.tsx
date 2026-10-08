import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProjectCard } from "@/components/project-card";
import { projects } from "@/constants/projects";

const title = "All Projects";
const description = "Every product, open source tool, and case study I've built, in one place.";

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

export default function ProjectsPage() {
  return (
    <main className="project-page page-width document-width px-3 pt-24 pb-20 max-document:px-4">
      <Link
        href="/"
        className="project-back inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} />
        Back home
      </Link>

      <header className="project-head mt-12 mb-10">
        <span className="eyebrow ui-eyebrow">Projects</span>

        <h1 className="ui-open-source-title">All projects</h1>

        <p className="max-w-max text-base leading-relaxed text-muted-foreground">{description}</p>
      </header>

      <div className="pcard-list grid grid-cols-2 gap-3 max-document:grid-cols-1">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </main>
  );
}
