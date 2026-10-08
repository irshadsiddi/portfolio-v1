import type { Metadata, Viewport } from "next";
import "../styles/global.css";
import { SITE } from "@/constants/site";

export const metadata: Metadata = {
  title: {
    default: "Siddi Mohammad Irshad",
    template: "%s — Siddi Mohammad Irshad",
  },
  description: "Full-stack and agentic AI engineer.",
  authors: [{ name: "Siddi Mohammad Irshad" }],
  openGraph: {
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      {
        url: SITE.profileImage,
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#151515",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;500;600&display=swap"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("portfolio-theme");document.documentElement.classList.toggle("dark",t?t==="dark":true)}catch(e){}})();`,
          }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
