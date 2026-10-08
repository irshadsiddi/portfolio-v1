import type { HeatCell } from "./types";

export function parseContributions(html: string): { weeks: HeatCell[][]; total: number } {
  const grid = new Map<string, HeatCell>();
  const tdRe =
    /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="contribution-day-component-(\d+)-(\d+)"[^>]*data-level="(\d)"/g;

  for (const match of html.matchAll(tdRe)) {
    grid.set(`${match[2]}-${match[3]}`, {
      date: match[1]!,
      level: Number(match[4]),
      count: null,
    });
  }

  const tipRe = /for="contribution-day-component-(\d+)-(\d+)"[^>]*>(\d+) contributions? on /g;
  for (const match of html.matchAll(tipRe)) {
    const cell = grid.get(`${match[1]}-${match[2]}`);
    if (cell) cell.count = Number(match[3]);
  }

  const columns = new Set<number>();
  const rows = new Set<number>();
  for (const key of grid.keys()) {
    const [row, column] = key.split("-").map(Number);
    rows.add(row ?? 0);
    columns.add(column ?? 0);
  }

  const maxColumn = Math.max(...columns, -1);
  const maxRow = Math.max(...rows, 6);
  const weeks: HeatCell[][] = [];

  for (let column = 0; column <= maxColumn; column++) {
    const week: HeatCell[] = [];
    for (let row = 0; row <= maxRow; row++) {
      week.push(
        grid.get(`${row}-${column}`) ?? {
          date: null,
          level: -1,
          count: null,
        },
      );
    }
    weeks.push(week);
  }

  const headerMatch = html.match(/(\d+)\s*contributions\s*in the last year/);
  const total = headerMatch
    ? Number(headerMatch[1])
    : weeks.flat().reduce((sum, cell) => sum + (cell.count ?? 0), 0);

  return { weeks, total };
}
