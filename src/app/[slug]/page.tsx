import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";

import { projects } from "@/constants/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);

  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false },
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} — Siddi Mohammad Irshad`,
      description: project.description,
      type: "article",
    },
    twitter: {
      card: "summary",
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    notFound();
  }

  const project = projects[index]!;
  const next = projects[(index + 1) % projects.length]!;

  return (
    <main className="project-page page-width document-width px-3 pt-24 pb-20 max-small:pt-10 max-small:pb-12 max-document:px-4">
      {/* Back */}
      <Link
        href="/"
        className="project-back inline-flex items-center gap-2 font-mono text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} />
        All projects
      </Link>

      {/* Header */}
      <header className="project-head mt-12 mb-10">
        <span className="eyebrow ui-eyebrow">
          {project.number} · {project.metric}
          {project.year ? ` · ${project.year}` : ""}
        </span>

        <h1 className="ui-project-detail-title">{project.title}</h1>

        <p className="max-w-152 text-lg leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      </header>

      {/* Terminal Preview */}
      <div className="project-terminal self-start overflow-hidden rounded-xl border border-border bg-background">
        <div className="preview-bar flex items-center gap-1 border-b border-border px-3 py-2">
          <i className="size-1.5 rounded-full bg-border" />
          <i className="size-1.5 rounded-full bg-border" />
          <i className="size-1.5 rounded-full bg-border" />

          <span className="ui-preview-filename">{project.slug}.log</span>
        </div>

        <pre className="m-0 p-6 font-mono text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground">
          {project.preview.join("\n")}
        </pre>
      </div>

      {/* Project Content */}
      <div className="project-body ui-project-body min-w-0">
        <aside className="grid content-start gap-5 text-sm">
          <div>
            <span className="mb-1 block font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Role
            </span>
            {project.role}
          </div>

          <div>
            <span className="mb-1 block font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Stack
            </span>

            <div className="pcard-tags flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <em key={tag} className="ui-project-detail-tag">
                  {tag}
                </em>
              ))}
            </div>
          </div>

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="pcard-link mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              <Github size={15} />
              GitHub
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground"
            >
              {project.demoLabel ?? "Live Demo"} <ArrowUpRight size={15} />
            </a>
          )}
          {project.reference && (
            <a
              href={project.reference.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground"
            >
              {project.reference.label} <ArrowUpRight size={15} />
            </a>
          )}
        </aside>

        <article className="min-w-0 wrap-break-word">
          {project.details.map((detail) => (
            <p key={detail} className="mt-0 mb-5 text-base leading-relaxed">
              {detail}
            </p>
          ))}

          <h2 className="mt-8 mb-3 font-serif text-3xl font-normal">Highlights</h2>

          <ul>
            {project.highlights.map((highlight) => (
              <li key={highlight} className="mb-2 text-muted-foreground">
                {highlight}
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* Next Project */}
      <Link
        href={`/${next.slug}`}
        className="project-next mt-20 block border-t border-border pt-8 text-inherit no-underline"
      >
        <span className="eyebrow ui-eyebrow">Next project</span>

        <strong className="mt-2 flex items-center gap-2 font-serif text-4xl font-normal transition-all duration-200 can-hover:group-hover:italic">
          {next.title}
          <ArrowUpRight size={20} />
        </strong>
      </Link>
    </main>
  );
}
