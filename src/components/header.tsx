"use client";
import { useHomeContext } from "./home/home-provider";
import { navItems, primaryNavItems } from "@/constants/navigation";
import { Command, Search, Sun, Moon, Menu, X } from "lucide-react";
import { IconButton } from "./home/icon-button";
export function SiteHeader() {
  const { active, dark, menuOpen, goTo, setSearchOpen, setMenuOpen, toggleTheme } =
    useHomeContext();
  return (
    <>
      <header className="site-header sticky top-0 z-40 document-width my-0 print:hidden!">
        <nav className="topbar ui-topbar" aria-label="Primary navigation">
          <button className="wordmark ui-wordmark" type="button" onClick={() => goTo("about")}>
            SM<span>IR</span>
          </button>
          <div className="desktop-nav ui-desktop-nav">
            {primaryNavItems.map(([label, id]) => (
              <button
                type="button"
                key={id}
                className={active === id ? "is-active" : undefined}
                onClick={() => goTo(id)}
              >
                {label}
              </button>
            ))}
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
