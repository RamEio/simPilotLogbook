import Link from "next/link";
import type { ActivityCalendar } from "@/lib/activity";
import { addUtcDays } from "@/lib/activity";
import { gameLabel } from "@/lib/constants";
import { cn, formatCount, formatHours } from "@/lib/utils";

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

function HeatSwatch({
  level,
  game,
}: {
  level: 0 | 1 | 2 | 3 | 4;
  game?: string | null;
}) {
  return (
    <span
      className={cn("heatcal-swatch", `heatcal-l${level}`)}
      data-game={game || undefined}
      aria-hidden
    />
  );
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
  const columns = `repeat(${weeks}, minmax(0, 1fr))`;

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

  const intensityGame = calendar.usedGames[0] ?? null;

  return (
    <div className="space-y-3">
      <div className="heatcal-scroll">
        <div
          className="heatcal-months text-caption text-ink-muted"
          style={{ gridTemplateColumns: columns }}
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
        <div className="heatcal-grid" style={{ gridTemplateColumns: columns }}>
          {Array.from({ length: weeks * 7 }, (_, index) => {
            const key = addUtcDays(start, index);
            const inRange = key >= calendar.from && key <= calendar.to;
            const cell = byDay.get(key);
            const level = inRange ? heatLevel(cell?.flights ?? 0, peak) : 0;
            const sim = cell?.game ? gameLabel(cell.game) : null;
            const title = inRange
              ? [
                  key,
                  formatCount(cell?.flights ?? 0, "vol"),
                  cell?.minutes ? formatHours(cell.minutes) : null,
                  sim,
                ]
                  .filter(Boolean)
                  .join(" · ")
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
                data-game={cell?.game ?? undefined}
                className={cn("heatcal-cell", `heatcal-l${level}`)}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-caption text-ink-muted">
          {formatCount(calendar.totals.activeDays, "jour actif", "jours actifs")}{" "}
          · série actuelle {calendar.streak.current} · plus longue{" "}
          {calendar.streak.longest}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-ink-muted">
          <div className="flex items-center gap-1" aria-label="Échelle d'intensité">
            <span>Moins</span>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <HeatSwatch key={level} level={level} game={intensityGame} />
            ))}
            <span>Plus</span>
          </div>
          {calendar.usedGames.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {calendar.usedGames.map((game) => (
                <li key={game} className="flex items-center gap-1">
                  <HeatSwatch level={4} game={game} />
                  <span>{gameLabel(game)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
