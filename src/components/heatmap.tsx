"use client";

import { useMemo, useState } from "react";

import { GITHUB_PROFILE_URL } from "@/constants/github";
import { MONTH_NAMES } from "@/constants/site";
import type { HeatCell } from "@/lib/github";
import { useGithub } from "@/hooks/use-github";

function placeholderWeeks(): HeatCell[][] {
  let seed = 7;

  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return Array.from({ length: 53 }, () =>
    Array.from({ length: 7 }, () => {
      const r = rand();
      const level = r < 0.55 ? 0 : r < 0.72 ? 1 : r < 0.86 ? 2 : r < 0.96 ? 3 : 4;

      return {
        date: null,
        level,
        count: null,
      };
    }),
  );
}

export function Heatmap() {
  const data = useGithub();
  const live = data?.ok && data.weeks.length > 0 ? data : null;

  const [tooltip, setTooltip] = useState<{
    label: string;
    x: number;
    y: number;
  } | null>(null);

  const weeks = useMemo(() => (live ? live.weeks : placeholderWeeks()), [live]);

  const monthLabels = useMemo(() => {
    if (!live) {
      return MONTH_NAMES.map((name, i) => ({
        left: (i / MONTH_NAMES.length) * 100,
        name,
      }));
    }

    const labels: { left: number; name: string }[] = [];
    let prev = -1;

    weeks.forEach((week, w) => {
      const first = week.find((cell) => cell.date)?.date;

      if (!first) return;

      const month = Number(first.slice(5, 7));

      if (month !== prev) {
        labels.push({
          left: (w / weeks.length) * 100,
          name: MONTH_NAMES[month - 1] ?? "",
        });

        prev = month;
      }
    });

    return labels;
  }, [live, weeks]);

  const showTooltip = (el: HTMLElement, label: string) => {
    const rect = el.getBoundingClientRect();
    const panel = el.closest(".contribution-panel")?.getBoundingClientRect();

    const half = Math.min((label.length * 7.2 + 24) / 2, (window.innerWidth - 24) / 2);

    const x = rect.left + rect.width / 2;
    const left = (panel?.left ?? 0) + half + 12;
    const right = (panel?.right ?? window.innerWidth) - half - 12;

    setTooltip({
      label,
      x: Math.min(right, Math.max(left, x)),
      y: rect.top - 10,
    });
  };

  const heatCellClass = "ui-heat-cell";

  const heatCellLevelClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-(--activity-cell-1)";
      case 2:
        return "bg-(--activity-cell-2)";
      case 3:
        return "bg-(--activity-cell-3)";
      case 4:
        return "bg-(--activity-cell-4)";
      default:
        return "ui-heat-cell-empty";
    }
  };

  const activeHeatCellClass = "ui-heat-cell-active";

  return (
    <section
      id="activity"
      data-reveal
      className="activity-section page-width document-width scroll-mt-16 border-t border-dotted border-(--document-rule) px-3 py-section-padding max-document:px-4"
    >
      <div className="contribution-panel ui-contribution-panel">
        <div className="contribution-head mb-5 flex items-end justify-between gap-8">
          <div className="contribution-title flex flex-col gap-2">
            <div className="contribution-kicker flex min-w-0 items-center gap-3">
              <span className="eyebrow ui-activity-eyebrow">Activity</span>

              <span className="contribution-live ui-contribution-live">
                <i className="ui-contribution-live-dot" />
                {live ? "Live activity" : "Syncing"}
              </span>
            </div>

            <h2 className="ui-contribution-heading">GitHub Heatmap</h2>
          </div>

          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="contribution-handle ui-contribution-handle"
          >
            @irshadsiddi
            <span
              aria-hidden="true"
              className="text-(--activity-muted) transition-transform duration-200 ease-spring-snappy can-hover:group-hover:translate-x-px can-hover:group-hover:-translate-y-px"
            >
              ↗
            </span>
          </a>
        </div>

        <div className="heatmap ui-heatmap">
          <div className="heatmap-months ui-heatmap-months" aria-hidden="true">
            {monthLabels.map((month, i) => (
              <span
                key={i}
                style={{ left: `${month.left}%` }}
                className={`absolute top-0 whitespace-nowrap ${
                  i % 2 === 1 ? "max-compact:hidden" : ""
                }`}
              >
                {month.name}
              </span>
            ))}
          </div>

          <div className="heatmap-body relative">
            <div className="heatmap-days ui-heatmap-days" aria-hidden="true">
              <span className="row-start-2">Mon</span>
              <span className="row-start-4">Wed</span>
              <span className="row-start-6">Fri</span>
            </div>

            <div className="heatmap-grid flex gap-1 max-compact:gap-px">
              {weeks.map((week, w) => (
                <div
                  key={w}
                  className="heatmap-week relative grid flex-1 gap-1 hover:z-80 max-compact:gap-px"
                >
                  {week.map((cell, d) => {
                    if (!cell.date) {
                      return <i key={d} className="invisible aspect-square" />;
                    }

                    const n = cell.count ?? 0;
                    const [y, mo, da] = cell.date.split("-");

                    const label = `${
                      n > 0 ? `${n} contribution${n === 1 ? "" : "s"} on` : "No contributions on"
                    } ${MONTH_NAMES[Number(mo) - 1] ?? ""} ${Number(da)}, ${y}`;

                    const isActive = cell.level > 0;

                    return (
                      <i
                        key={d}
                        data-l={cell.level}
                        tabIndex={0}
                        aria-label={label}
                        className={`${heatCellClass} ${heatCellLevelClass(cell.level)} ${
                          isActive ? activeHeatCellClass : ""
                        } ${cell.level === 4 ? "ui-heat-cell-peak" : ""}`}
                        style={{
                          animationDelay: `${Math.min(w * 12, 620)}ms`,
                        }}
                        onMouseEnter={(e) => showTooltip(e.currentTarget, label)}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) => showTooltip(e.currentTarget, label)}
                        onBlur={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {tooltip ? (
          <div
            className="heatmap-tooltip ui-heatmap-tooltip"
            role="tooltip"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            {tooltip.label}
          </div>
        ) : null}

        <div className="contribution-foot ui-contribution-foot">
          <p className="ui-contribution-summary">
            {live
              ? `${live.total.toLocaleString()} contributions in the last year`
              : "Pulling live activity…"}
          </p>

          <div className="heatmap-legend ui-heatmap-legend" aria-hidden="true">
            <span className="mr-1">Less</span>

            {[0, 1, 2, 3, 4].map((level) => (
              <i
                key={level}
                data-l={level}
                className={`aspect-square w-3 rounded-tr-xs ${
                  level === 0
                    ? "ui-heatmap-legend-cell"
                    : `${heatCellLevelClass(level)} ${activeHeatCellClass}`
                }`}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </section>
  );
}
