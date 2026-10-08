import type { CSSProperties } from "react";
import { skills, wideSkill } from "@/constants/skills";
export function SkillsSection() {
  return (
    <section
      id="skills"
      data-reveal
      className="content-section page-width oss-section ui-skills-section"
    >
      <div className="oss-grid ui-skills-layout">
        <div className="oss-intro">
          <h2 className="ui-section-title">Skills &amp; Technologies</h2>
          <p className="m-0 max-w-52 text-sm leading-relaxed text-muted-foreground max-navigation:max-w-none">
            The tools I reach for — interfaces, state, data layers, and the systems underneath them.
          </p>
        </div>
        <div className="skills-panel ui-skills-panel">
          <div className="skills-grid flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span
                key={skill.name}
                className="skill-chip ui-skill-chip"
                style={
                  {
                    animationDelay: `${Math.min(i * 45, 700)}ms`,
                    "--skill-color": skill.hoverColor,
                    "--skill-color-dark": skill.darkHoverColor ?? skill.hoverColor,
                  } as CSSProperties
                }
              >
                <skill.Icon size={14} aria-hidden="true" />
                {skill.name}
              </span>
            ))}
          </div>
          <span
            className="skill-chip skill-chip-wide ui-wide-skill-chip"
            style={
              {
                animationDelay: "760ms",
                "--skill-color": wideSkill.hoverColor,
                "--skill-color-dark": wideSkill.darkHoverColor ?? wideSkill.hoverColor,
              } as CSSProperties
            }
          >
            <wideSkill.Icon size={14} aria-hidden="true" />
            {wideSkill.name}
          </span>
        </div>
      </div>
    </section>
  );
}
