import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/cv/Irshad_Resume.pdf",
        headers: [
          { key: "Content-Type", value: "application/pdf" },
          { key: "Content-Disposition", value: 'inline; filename="Irshad_Resume.pdf"' },
        ],
      },
    ];
  },
  // Keep production builds from replacing the running dev server's manifests.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
});

export default nextConfig;
