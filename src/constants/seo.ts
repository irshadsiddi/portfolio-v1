import type { Metadata } from "next";
import { SITE } from "./site";

export const SITE_URL = "https://irshadsiddi.tech";
export const SOCIAL_PREVIEW_IMAGE = {
  url: "/og-image.webp",
  width: 1200,
  height: 630,
  type: "image/webp",
  alt: `${SITE.name} | irshadsiddi.tech`,
};

export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Siddi Mohammad Irshad", template: "%s — Siddi Mohammad Irshad" },
  description: "Full-stack and agentic AI engineer.",
  authors: [{ name: SITE.name }],
  openGraph: { type: "website", siteName: SITE.name, images: [SOCIAL_PREVIEW_IMAGE] },
  twitter: { card: "summary_large_image", images: [SOCIAL_PREVIEW_IMAGE] },
  icons: { icon: [{ url: SITE.profileImage, type: "image/png" }] },
};

export const HOME_METADATA: Metadata = {
  title: "Siddi Mohammad Irshad — Full-Stack & Agentic AI Engineer",
  description:
    "Portfolio of Siddi Mohammad Irshad, a full-stack and agentic AI engineer building thoughtful intelligent systems.",
  openGraph: {
    title: "Siddi Mohammad Irshad — Engineer",
    description: "Selected experience, projects, open-source work, education, and achievements.",
    type: "website",
    url: SITE_URL,
    siteName: SITE.name,
    images: [SOCIAL_PREVIEW_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siddi Mohammad Irshad — Engineer",
    description: "Selected experience, projects, open-source work, education, and achievements.",
    images: [SOCIAL_PREVIEW_IMAGE],
  },
};
