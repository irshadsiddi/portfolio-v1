"use client";

import { Link } from "next-view-transitions";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Github } from "lucide-react";

import { projects, type Project } from "@/constants/projects";

const projectActionClass = "ui-project-action";
const projectTagClass = "ui-project-tag";

export function ProjectFrame({ slug }: { slug: string }) {
  const project = projects.find((item) => item.slug === slug);
  return (
    <div
      className="pframe ui-pframe"
      style={{ viewTransitionName: `project-preview-${slug}` }}
      aria-hidden="true"
    >
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
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <article
      className="pcard group ui-pcard"
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const card = event.currentTarget;
        pointer.current = { x: event.clientX, y: event.clientY };
        if (frame.current) return;
        frame.current = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${pointer.current.x - rect.left}px`);
          card.style.setProperty("--my", `${pointer.current.y - rect.top}px`);
          frame.current = 0;
        });
      }}
      onPointerLeave={() => {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
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
              {project.demoLabel ?? "Live Demo"} <ArrowUpRight className="action-arrow" size={13} />
            </a>
          )}

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className={projectActionClass}
            >
              <Github size={13} /> Source <ArrowUpRight className="action-arrow" size={13} />
            </a>
          )}

          <span className="pcard-more ui-pcard-more">Case study →</span>
        </div>
      </div>
    </article>
  );
}
