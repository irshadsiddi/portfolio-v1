"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useHomeContext } from "./home/home-provider";
import { navItems, primaryNavItems } from "@/constants/navigation";
import { Command, Search, Sun, Moon, Menu, X } from "lucide-react";
import { IconButton } from "./home/icon-button";
export function SiteHeader() {
  const { active, dark, menuOpen, goTo, setSearchOpen, setMenuOpen, toggleTheme } =
    useHomeContext();
  const desktopNav = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const scrollSentinel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sentinel = scrollSentinel.current;
    const element = header.current;
    if (!sentinel || !element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.scrolled = String(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const nav = desktopNav.current;
    if (!nav) return;
    let disposed = false;
    let frame = 0;

    const measure = () => {
      if (disposed) return;
      const selected = nav.querySelector<HTMLButtonElement>('[aria-current="location"]');
      const visible = !!selected && nav.getBoundingClientRect().width > 0;
      nav.dataset.indicatorVisible = String(visible);
      if (selected && visible) {
        const bounds = selected.getBoundingClientRect();
        const parentBounds = nav.getBoundingClientRect();
        nav.style.setProperty("--indicator-x", `${bounds.left - parentBounds.left}px`);
        nav.style.setProperty("--indicator-width", `${bounds.width}px`);
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (disposed) return;
        nav.dataset.indicatorReady = "true";
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    nav.querySelectorAll("button").forEach((button) => observer.observe(button));
    void document.fonts.ready.then(measure);

    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [active]);
  return (
    <>
      <span ref={scrollSentinel} className="header-scroll-sentinel" aria-hidden="true" />
      <header
        ref={header}
        className="site-header sticky top-0 z-40 document-width my-0 print:hidden!"
      >
        <nav className="topbar ui-topbar" aria-label="Primary navigation">
          <button className="wordmark ui-wordmark" type="button" onClick={() => goTo("about")}>
            SM<span>IR</span>
          </button>
          <div ref={desktopNav} className="desktop-nav ui-desktop-nav">
            {primaryNavItems.map(([label, id]) => (
              <button
                type="button"
                key={id}
                className={active === id ? "is-active" : undefined}
                aria-current={active === id ? "location" : undefined}
                onClick={() => goTo(id)}
              >
                {label}
              </button>
            ))}
            <span className="nav-active-indicator" aria-hidden="true" />
          </div>
          <div className="nav-tools ui-nav-tools">
            <button
              type="button"
              className="search-trigger ui-search-trigger"
              aria-label="Search portfolio"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={14} />
              <span>Search</span>
              <kbd>
                <Command size={10} />K
              </kbd>
            </button>
            <IconButton label={dark ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </IconButton>
            <span className="mobile-menu-button hidden max-navigation:inline">
              <IconButton
                label={menuOpen ? "Close navigation" : "Open navigation"}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </IconButton>
            </span>
          </div>
        </nav>
        {menuOpen && (
          <div className="mobile-nav ui-mobile-nav" aria-label="Section navigation">
            <p>Explore portfolio</p>
            {navItems.map(([label, id], index) => (
              <button
                type="button"
                key={id}
                className={active === id ? "is-active" : undefined}
                aria-current={active === id ? "location" : undefined}
                onClick={() => goTo(id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{label}</strong>
              </button>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
