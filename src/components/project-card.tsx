"use client";

import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";

import { projects, type Project } from "@/constants/projects";

const projectActionClass = "ui-project-action";
const projectTagClass = "ui-project-tag";

export function ProjectFrame({ slug }: { slug: string }) {
  const project = projects.find((item) => item.slug === slug);
  return (
    <div className="pframe ui-pframe" aria-hidden="true">
      <div className="pframe-bar ui-pframe-bar">
        {[0, 1, 2].map((dot) => (
          <i key={dot} className="ui-preview-window-dot" />
        ))}
        <span className="ui-preview-app-name">{project?.title}</span>
      </div>
      <div className="pframe-body ui-preview-canvas">
        <pre className="m-0 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {project?.preview.join("\n")}
        </pre>
      </div>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="pcard group ui-pcard"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
    >
      <ProjectFrame slug={project.slug} />

      <div className="pcard-main ui-pcard-main">
        <div className="pcard-meta ui-pcard-meta">
          <span className="text-foreground">{project.number}</span>
          {project.metric}
          {project.year ? ` · ${project.year}` : ""}
        </div>

        <h3 className="ui-project-card-title">
          <Link
            href={`/${project.slug}`}
            className="pcard-stretch text-inherit no-underline after:absolute after:inset-0 after:z-1"
          >
            {project.title}
          </Link>
        </h3>

        <p className="ui-project-card-description">{project.description}</p>

        <div className="pcard-tags ui-pcard-tags">
          {project.tags.map((tag) => (
            <em key={tag} className={projectTagClass}>
              {tag}
            </em>
          ))}
        </div>

        <div className="pcard-actions ui-pcard-actions">
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className={projectActionClass}>
              {project.demoLabel ?? "Live Demo"} <ArrowUpRight size={13} />
            </a>
          )}

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className={projectActionClass}
            >
              <Github size={13} /> Source <ArrowUpRight size={13} />
            </a>
          )}

          <span className="pcard-more ui-pcard-more">Case study →</span>
        </div>
      </div>
    </article>
  );
}
