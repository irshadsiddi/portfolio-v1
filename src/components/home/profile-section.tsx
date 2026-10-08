"use client";
import { education, profile } from "@/constants/experience";
import { SectionTitle } from "./section-title";
export function ProfileSection() {
  return (
    <>
      <section
        data-reveal
        className="statement page-width ui-statement"
        aria-labelledby="profile-title"
      >
        <SectionTitle>Profile</SectionTitle>
        <div>
          <p id="profile-title" className="statement-lead ui-statement-lead">
            {profile.heading}
          </p>
          <p>{profile.description}</p>
          <div className="ui-education-panel">
            <p className="eyebrow ui-eyebrow">Education</p>
            <h3 className="ui-education-institute">{education.institution}</h3>
            <p className="ui-education-degree">{education.degree}</p>
            <p className="ui-education-meta">
              <span>{education.dates}</span>
              <span>{education.location}</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
