"use client";
import { useHomeContext } from "./home-provider";
import { FOOTER } from "@/constants/site";

export function SiteFooter() {
  const { time } = useHomeContext();
  return (
    <footer className="portfolio-footer border-t-dotted document-width border-t border-border px-3 py-5 max-document:px-4">
      <div className="ui-footer-summary">
        <span>{FOOTER.copyright}</span>
        <button
          type="button"
          className="ui-footer-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {FOOTER.backToTop}
        </button>
      </div>
      <div className="ui-footer-details">
        <span>{FOOTER.credit}</span>
        <div className="ui-footer-tools">
          <span>
            {time} {FOOTER.timezone}
          </span>
          <span>
            <kbd>⌘K</kbd> {FOOTER.search} · <kbd>T</kbd> {FOOTER.theme}
          </span>
        </div>
      </div>
    </footer>
  );
}
