"use client";
import Link from "next/link";
import { projects } from "@/constants/projects";
import { ProjectCard } from "@/components/project-card";
import { SectionTitle } from "./section-title";
import { ArrowUpRight } from "lucide-react";
export function ProjectsSection() {
  return (
    <>
      <section
        id="projects"
        data-reveal
        className="content-section page-width ui-editorial-section"
      >
        <SectionTitle>Selected Projects</SectionTitle>
        <div className="section-main min-w-0">
          <div className="pcard-list grid grid-cols-2 gap-3 max-document:grid-cols-1">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
          <Link href="/projects" className="section-view-all ui-section-view-all">
            View all projects <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>
    </>
  );
}
