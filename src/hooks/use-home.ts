"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { projects } from "@/constants/projects";
import { SITE, SOCIAL_LINKS, RESUME_LINKS } from "@/constants/site";
import { navItems } from "@/constants/navigation";
import { playThemeWarp } from "@/lib/theme-warp";
const EMAIL = SITE.email;
export type Cmd = { group: string; title: string; meta: string; run: () => void };
export function useHome() {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState("about");
  const [time, setTime] = useState("--:--:--");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navItems.forEach(([, id]) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => {
      reveal.disconnect();
      spy.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeExpandedMenu = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeExpandedMenu);
    return () => desktop.removeEventListener("change", closeExpandedMenu);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("portfolio-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") setSearchOpen(false);
      const target = event.target as HTMLElement;
      if (
        event.key.toLowerCase() === "t" &&
        !event.metaKey &&
        !event.ctrlKey &&
        target.tagName !== "INPUT"
      ) {
        document.getElementById("theme-toggle")?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = (event?: React.MouseEvent<HTMLButtonElement>) => {
    const next = !document.documentElement.classList.contains("dark");
    const applyTheme = () => {
      setDark(next);
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("portfolio-theme", next ? "dark" : "light");
    };
    void playThemeWarp({
      originX: event?.clientX ?? window.innerWidth / 2,
      originY: event?.clientY ?? window.innerHeight / 2,
      toDark: next,
      onSwitch: applyTheme,
    });
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const goTo = (id: string) => {
    setSearchOpen(false);
    setMenuOpen(false);
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  };

  const commands = useMemo<Cmd[]>(() => {
    const open = (url: string) => () => window.open(url, "_blank", "noopener");
    return [
      {
        group: "Actions",
        title: "Copy email",
        meta: EMAIL,
        run: () => {
          void copyEmail();
        },
      },
      { group: "Actions", title: "View résumé", meta: "PDF", run: open(RESUME_LINKS.preview) },
      {
        group: "Actions",
        title: "Print portfolio",
        meta: "Print view",
        run: () => window.setTimeout(() => window.print(), 50),
      },
      { group: "Actions", title: "Toggle theme", meta: "T", run: () => toggleTheme() },
      ...navItems.map(([title, id]) => ({
        group: "Navigate",
        title: `Go to ${title}`,
        meta: "Section",
        run: () => goTo(id),
      })),
      { group: "Navigate", title: "Go to Activity", meta: "Section", run: () => goTo("activity") },
      { group: "Navigate", title: "Go to Skills", meta: "Section", run: () => goTo("skills") },
      ...projects.map((p) => ({
        group: "Projects",
        title: p.title,
        meta: p.tags.slice(0, 3).join(" · "),
        run: () => router.push(`/${p.slug}`),
      })),
      {
        group: "Links",
        title: "Open GitHub",
        meta: "github.com/irshadsiddi",
        run: open(SOCIAL_LINKS.github),
      },
      {
        group: "Links",
        title: "Open LinkedIn",
        meta: "linkedin.com",
        run: open(SOCIAL_LINKS.linkedin),
      },
      { group: "Links", title: "Open X / Twitter", meta: "x.com", run: open(SOCIAL_LINKS.x) },
    ];
  }, [router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.title} ${c.meta} ${c.group}`.toLowerCase().includes(q));
  }, [query, commands]);

  const runCommand = (cmd: Cmd) => {
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
    setCursor(0);
    cmd.run();
  };

  return {
    active,
    dark,
    menuOpen,
    goTo,
    setSearchOpen,
    setMenuOpen,
    toggleTheme,
    time,
    copied,
    copyEmail,
    searchOpen,
    query,
    setQuery,
    cursor,
    setCursor,
    results,
    runCommand,
  };
}
