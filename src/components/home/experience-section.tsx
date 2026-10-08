"use client";
import { experiences } from "@/constants/experience";
import { SectionTitle } from "./section-title";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
export function ExperienceSection() {
  const [expanded, setExpanded] = useState<number | null>(0);
  return (
    <>
      <section
        id="experience"
        data-reveal
        className="content-section page-width ui-experience-section"
      >
        <SectionTitle>Experience</SectionTitle>
        <div className="experience-list relative border-t border-solid border-border">
          {experiences.map((item, index) => (
            <article className="experience ui-experience" key={item.role}>
              <div className="experience-date font-mono text-xs leading-normal text-muted-foreground">
                {item.date}
              </div>
              <div className="experience-body ui-experience-body">
                <div className="experience-top ui-experience-top">
                  <h3>{item.role}</h3>
                  <span>{item.company}</span>
                </div>
                <p>{item.summary}</p>
                <button
                  type="button"
                  className={`detail-toggle ui-detail-toggle ${expanded === index ? "is-open" : ""}`}
                  aria-expanded={expanded === index}
                  aria-controls={`exp-details-${index}`}
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  Technical details <ChevronDown size={14} />
                </button>
                <div
                  id={`exp-details-${index}`}
                  className={`technical-detail ui-technical-detail ${expanded === index ? "is-open" : ""}`}
                >
                  <div
                    className={`technical-detail-inner rounded-sm border border-solid border-border bg-transparent bg-none p-4 print:overflow-visible! print:bg-transparent! print:bg-none! print:shadow-none!`}
                  >
                    <p>{item.detail}</p>
                    <div>
                      {item.stack.map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
