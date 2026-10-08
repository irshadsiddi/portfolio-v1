import { HOME_METADATA } from "@/constants/seo";
import { HomeProvider } from "@/components/home/home-provider";
import { SiteHeader } from "@/components/header";
import { Heatmap } from "@/components/heatmap";
import { HeroSection } from "@/components/home/hero-section";
import { ProfileSection } from "@/components/home/profile-section";
import { ExperienceSection } from "@/components/home/experience-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { SiteFooter } from "@/components/home/site-footer";
import { CommandPalette } from "@/components/home/command-palette";
import { OpenSourceSection } from "@/components/home/open-source-section";
import { SkillsSection } from "@/components/home/skills-section";
import { LabSection } from "@/components/home/lab-section";
import { RecognitionSection } from "@/components/home/recognition-section";

export const metadata = HOME_METADATA;

export default function Page() {
  return (
    <HomeProvider>
      <div className="site-shell ui-site-shell">
        <div className="ambient ui-ambient" aria-hidden="true" />
        <div className="grain ui-grain" aria-hidden="true" />
        <div className="frame-marks ui-frame-marks" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>

        <SiteHeader />

        <main>
          <HeroSection />
          <ProfileSection />

          <ExperienceSection />

          <ProjectsSection />

          <OpenSourceSection />
          <Heatmap />
          <SkillsSection />

          <LabSection />

          <RecognitionSection />
        </main>

        <SiteFooter />

        <CommandPalette />
      </div>
    </HomeProvider>
  );
}
