"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { VISITOR_DISPLAY } from "@/constants/analytics";

export function VisitorCount() {
  const [visitors, setVisitors] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    async function load() {
      try {
        const response = await fetch("/api/visitors", { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (Number.isSafeInteger(data.visitors) && data.visitors >= 0) {
          setVisitors(data.visitors);
        }
      } catch {
        // Keep unavailable counts distinct from a real zero.
      } finally {
        window.clearTimeout(timeout);
        setLoading(false);
      }
    }

    void load();
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const description = loading
    ? VISITOR_DISPLAY.loading
    : visitors === null
      ? VISITOR_DISPLAY.unavailable
      : VISITOR_DISPLAY.description;

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      title={description}
      role="status"
      aria-label={visitors === null ? description : `${visitors} ${description.toLowerCase()}`}
    >
      <Eye size={14} strokeWidth={1.5} aria-hidden="true" />
      <span className="font-mono tabular-nums">
        {loading ? "…" : visitors === null ? "—" : visitors.toLocaleString("en-US")}
      </span>
      <span>{VISITOR_DISPLAY.label}</span>
    </span>
  );
}
