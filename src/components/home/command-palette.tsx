"use client";
import { useHomeContext } from "./home-provider";
import { Search } from "lucide-react";
export function CommandPalette() {
  const { searchOpen, setSearchOpen, query, setQuery, cursor, setCursor, results, runCommand } =
    useHomeContext();
  return (
    <>
      {searchOpen && (
        <div
          className="search-backdrop ui-search-backdrop"
          role="presentation"
          onMouseDown={() => setSearchOpen(false)}
        >
          <div
            className="search-dialog ui-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="search-input ui-search-input">
              <Search size={17} />
              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCursor(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setCursor((c) => Math.min(c + 1, results.length - 1));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setCursor((c) => Math.max(c - 1, 0));
                  }
                  if (event.key === "Enter") {
                    event.preventDefault();
                    const r = results[cursor];
                    if (r) runCommand(r);
                  }
                }}
                placeholder="Type a command or search…"
                aria-activedescendant={`cmd-${cursor}`}
              />
              <kbd>ESC</kbd>
            </div>
            <div className="search-results ui-search-results" role="listbox">
              {results.map((result, index) => (
                <div key={`${result.group}-${result.title}-${index}`}>
                  {(index === 0 || results[index - 1]?.group !== result.group) && (
                    <p className="cmd-group ui-cmd-group">{result.group}</p>
                  )}
                  <button
                    type="button"
                    id={`cmd-${index}`}
                    role="option"
                    aria-selected={cursor === index}
                    className={cursor === index ? "is-cursor" : undefined}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => runCommand(result)}
                  >
                    <span>{result.title}</span>
                    <small>{result.meta}</small>
                  </button>
                </div>
              ))}
              {!results.length && <p>No matching work found.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
