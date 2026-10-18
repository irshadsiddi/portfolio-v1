"use client";
import Image from "next/image";
import { useHomeContext } from "./home-provider";
import { SITE, SOCIAL_LINKS, RESUME_LINKS, HERO_ACTIONS } from "@/constants/site";
import { Github, Linkedin, ArrowUpRight, Check, Mail, FileText } from "lucide-react";
export function HeroSection() {
  const { time, copied, copyEmail } = useHomeContext();
  return (
    <>
      <section id="about" className="hero page-width ui-hero">
        <div className="hero-cover ui-hero-cover" data-theme-live="cover">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={SITE.coverPoster}
            aria-label={SITE.coverAlt}
          >
            <source src={SITE.coverVideo} type="video/mp4" />
          </video>
          <span>{SITE.coverCaption}</span>
        </div>
        <div className="hero-profile ui-hero-profile">
          <div className="profile-mark ui-profile-mark">
            <Image
              src={SITE.profileImage}
              alt={SITE.name}
              fill
              priority
              sizes="(max-width: 640px) 72px, 100px"
              className="scale-110 object-cover"
            />
          </div>
          <div className="hero-copy ui-hero-copy">
            <p className="avail-badge ui-avail-badge">
              <span className="pulse-dot ui-pulse-dot" />
              {SITE.availability}
            </p>
            <h1>{SITE.name}</h1>
            <p className="hero-role ui-hero-role">{SITE.role}</p>
            <p className="hero-location ui-hero-location">
              <span>{SITE.location}</span>
              <span className="whitespace-nowrap" data-theme-live="hero-clock">
                {time} IST
              </span>
            </p>
          </div>
          <div className="profile-now ui-profile-now" aria-label="Current status">
            <span className="eq ui-eq" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              <b>Now</b> {SITE.nowStatus}
            </span>
          </div>
        </div>
        <div className="hero-intro ui-hero-intro">
          <p>{SITE.intro}</p>
          <div className="hero-actions">
            <div className="hero-primary-actions" aria-label={HERO_ACTIONS.primaryLabel}>
              <a
                className="hero-resume"
                href={RESUME_LINKS.preview}
                target="_blank"
                rel="noreferrer"
              >
                <FileText size={15} aria-hidden="true" />
                {HERO_ACTIONS.resume}
                <ArrowUpRight className="action-arrow" size={14} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="hero-contact"
                onClick={copyEmail}
                title={HERO_ACTIONS.copyHint}
              >
                {copied ? (
                  <Check size={15} aria-hidden="true" />
                ) : (
                  <Mail size={15} aria-hidden="true" />
                )}
                <span aria-live="polite">
                  {copied ? HERO_ACTIONS.copied : HERO_ACTIONS.contact}
                </span>
              </button>
            </div>
            <div className="hero-social-links" aria-label={HERO_ACTIONS.socialLabel}>
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer">
                <Github size={14} aria-hidden="true" /> GitHub{" "}
                <ArrowUpRight className="action-arrow" size={11} aria-hidden="true" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
                <Linkedin size={14} aria-hidden="true" /> LinkedIn{" "}
                <ArrowUpRight className="action-arrow" size={11} aria-hidden="true" />
              </a>
              <a href={SOCIAL_LINKS.x} target="_blank" rel="noreferrer">
                <span className="x-mark" aria-hidden="true">
                  𝕏
                </span>{" "}
                Twitter <ArrowUpRight className="action-arrow" size={11} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
