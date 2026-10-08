"use client";
import Image from "next/image";
import { useHomeContext } from "./home-provider";
import { SITE, SOCIAL_LINKS, RESUME_LINKS } from "@/constants/site";
import { Github, Linkedin, ArrowUpRight, Check, Copy, FileText } from "lucide-react";
export function HeroSection() {
  const { time, copied, copyEmail } = useHomeContext();
  return (
    <>
      <section id="about" className="hero page-width ui-hero">
        <div className="hero-cover ui-hero-cover">
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
              <span className="whitespace-nowrap">{time} IST</span>
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
          <div className="link-pills ui-link-pills" aria-label="Links">
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer">
              <Github size={14} /> GitHub <ArrowUpRight size={11} />
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={14} /> LinkedIn <ArrowUpRight size={11} />
            </a>
            <a href={SOCIAL_LINKS.x} target="_blank" rel="noreferrer">
              <span className="x-mark">𝕏</span> Twitter <ArrowUpRight size={11} />
            </a>
            <button type="button" onClick={copyEmail}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Mail"}
            </button>
            <a href={RESUME_LINKS.preview} target="_blank" rel="noreferrer">
              <FileText size={14} /> View résumé <ArrowUpRight size={11} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
