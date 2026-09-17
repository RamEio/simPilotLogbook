import Link from "next/link";
import type { ActivityCalendar } from "@/lib/activity";
import { addUtcDays } from "@/lib/activity";
import { cn, formatCount } from "@/lib/utils";

function mondayOnOrBefore(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const weekday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - weekday);
  return date.toISOString().slice(0, 10);
}

function heatLevel(flights: number, peak: number): 0 | 1 | 2 | 3 | 4 {
  if (!flights) return 0;
  if (peak <= 1) return 2;
  const ratio = flights / peak;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

export function ActivityCalendar({
  calendar,
  hrefForDate,
}: {
  calendar: ActivityCalendar;
  hrefForDate: (date: string) => string;
}) {
  const byDay = new Map(calendar.cells.map((cell) => [cell.date, cell]));
  const peak = Math.max(1, ...calendar.cells.map((cell) => cell.flights));
  const start = mondayOnOrBefore(calendar.from);
  const end = calendar.to;
  const startMs = Date.parse(`${start}T00:00:00.000Z`);
  const endMs = Date.parse(`${end}T00:00:00.000Z`);
  const nDays = Math.round((endMs - startMs) / 86400000) + 1;
  const weeks = Math.ceil(nDays / 7);

  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = "";
  for (let week = 0; week < weeks; week += 1) {
    const key = addUtcDays(start, week * 7);
    const month = new Date(`${key}T00:00:00.000Z`).toLocaleDateString("fr-FR", {
      month: "short",
      timeZone: "UTC",
    });
    if (month !== lastMonth) {
      monthLabels.push({ week, label: month });
      lastMonth = month;
    }
  }

  return (
    <div className="space-y-2">
      <div className="heatcal-scroll">
        <div
          className="heatcal-months text-caption text-ink-muted"
          style={{ gridTemplateColumns: `repeat(${weeks}, 0.7rem)` }}
        >
          {monthLabels.map((item) => (
            <span
              key={`${item.week}-${item.label}`}
              style={{ gridColumn: item.week + 1 }}
            >
              {item.label}
            </span>
          ))}
        </div>
        <div
          className="heatcal-grid"
          style={{ gridTemplateColumns: `repeat(${weeks}, 0.7rem)` }}
        >
          {Array.from({ length: weeks * 7 }, (_, index) => {
            const key = addUtcDays(start, index);
            const inRange = key >= calendar.from && key <= calendar.to;
            const cell = byDay.get(key);
            const level = inRange ? heatLevel(cell?.flights ?? 0, peak) : 0;
            const title = inRange
              ? `${key} · ${formatCount(cell?.flights ?? 0, "vol")}`
              : "";
            if (!inRange) {
              return <span key={key} className="heatcal-cell heatcal-out" />;
            }
            return (
              <Link
                key={key}
                href={hrefForDate(key)}
                title={title}
                aria-label={title}
                className={cn("heatcal-cell", `heatcal-l${level}`)}
              />
            );
          })}
        </div>
      </div>
      <p className="text-caption text-ink-muted">
        {formatCount(calendar.totals.activeDays, "jour actif", "jours actifs")}{" "}
        · série actuelle {calendar.streak.current} · plus longue{" "}
        {calendar.streak.longest}
      </p>
    </div>
  );
}
