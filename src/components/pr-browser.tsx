"use client";

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, GitMerge, GitPullRequest, GitPullRequestClosed } from "lucide-react";
import { GITHUB_PROFILE_URL, samplePullRequests } from "@/constants/github";
import type { OssPr, PrStatus } from "@/lib/github";
import { useGithub } from "@/hooks/use-github";

type SortKey = "newest" | "oldest" | "changes";

const PR_STATUS_STYLES = {
  open: { icon: GitPullRequest, color: "text-green-700 dark:text-green-400" },
  merged: { icon: GitMerge, color: "text-purple-600 dark:text-purple-400" },
  closed: { icon: GitPullRequestClosed, color: "text-red-600 dark:text-red-400" },
} satisfies Record<PrStatus, { icon: typeof GitPullRequest; color: string }>;

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "changes", label: "Most changes" },
];

function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const current = SORTS.find((s) => s.value === value)!;

  return (
    <div ref={ref} className="oss-sort ui-oss-sort">
      <span>Sort</span>
      <button
        type="button"
        className="oss-sort-trigger ui-oss-sort-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {current.label}
        <ChevronDown
          size={13}
          className={`transition-transform duration-250 ease-(--ease-spring,ease) ${open ? "rotate-180" : ""}`}
        />
      </button>

      <ul
        className={`oss-sort-menu ui-oss-sort-menu ${open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : ""}`}
        role="listbox"
      >
        {SORTS.map((s) => {
          const selected = s.value === value;

          return (
            <li key={s.value}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={`ui-sort-option ${selected ? "ui-sort-option-selected" : ""}`}
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
              >
                {s.label} {selected && <Check size={12} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PrBrowser({
  limit,
  footer,
}: {
  limit?: number;
  footer?: (total: number, hidden: number) => ReactNode;
}) {
  const data = useGithub();
  const live = data?.ok && data.prs.length > 0 ? data.prs : null;

  const allPrs: OssPr[] = useMemo(
    () => live ?? samplePullRequests.map((pr) => ({ ...pr, url: GITHUB_PROFILE_URL })),
    [live],
  );

  const [filter, setFilter] = useState<PrStatus>("merged");
  const [sort, setSort] = useState<SortKey>("newest");

  const counts = useMemo(() => {
    const tally: Record<PrStatus, number> = { merged: 0, open: 0, closed: 0 };
    for (const pr of allPrs) tally[pr.status] += 1;
    return tally;
  }, [allPrs]);

  const visible = useMemo(() => {
    const rows = allPrs
      .filter((pr) => pr.status === filter)
      .sort((a, b) => {
        if (sort === "newest") return b.ts.localeCompare(a.ts);
        if (sort === "oldest") return a.ts.localeCompare(b.ts);
        return (b.adds ?? 0) + (b.dels ?? 0) - ((a.adds ?? 0) + (a.dels ?? 0));
      });

    return limit ? rows.slice(0, limit) : rows;
  }, [allPrs, filter, sort, limit]);

  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="oss-toolbar mb-2 flex flex-wrap items-center justify-between gap-4 print:hidden!">
        <div className="oss-tabs ui-oss-tabs" role="tablist" aria-label="Filter pull requests">
          {/* Switch the text and selected gradient together to avoid a contrast flash. */}
          {(["merged", "open", "closed"] as const).map((status) => {
            const selected = filter === status;

            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`oss-tab ui-oss-tab ${selected ? "ui-pr-tab-inactive" : "bg-transparent text-muted-foreground hover:text-foreground active:text-foreground"}`}
                onClick={() => setFilter(status)}
              >
                {status}{" "}
                <span className={`ui-pr-tab-count ${selected ? "opacity-80" : "opacity-75"}`}>
                  {counts[status]}
                </span>
              </button>
            );
          })}
        </div>

        <SortMenu value={sort} onChange={setSort} />
      </div>

      <div className="oss-list-wrap ui-oss-list-wrap" style={{ height }}>
        <div ref={innerRef}>
          <ul key={`${filter}-${sort}`} className="oss-list m-0 list-none p-0">
            {visible.length === 0 && (
              <li className="oss-empty ui-oss-empty">No {filter} pull requests yet.</li>
            )}

            {visible.map((pr, i) => {
              const { icon: StatusIcon, color } = PR_STATUS_STYLES[pr.status];

              return (
                <li
                  key={`${pr.url}-${pr.title}`}
                  className="ui-pr-list-item"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <a
                    className="oss-row group ui-oss-row"
                    href={pr.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StatusIcon size={15} className={`oss-icon ${color}`} aria-hidden="true" />
                    <span className="sr-only">{pr.status} pull request: </span>
                    <span className="oss-title ui-oss-title">{pr.title}</span>
                    <span className="oss-repo ui-oss-repo">{pr.repo}</span>
                    <span className="oss-stats ui-oss-stats">
                      {pr.adds == null && pr.dels == null ? (
                        "—"
                      ) : (
                        <>
                          <em className="text-(--green) not-italic">+{pr.adds ?? 0}</em>{" "}
                          <b className="font-normal text-(--red)">-{pr.dels ?? 0}</b>
                        </>
                      )}
                    </span>
                    <span className="oss-date ui-oss-date">{pr.date}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {footer?.(allPrs.length, counts[filter] - visible.length)}
    </>
  );
}
