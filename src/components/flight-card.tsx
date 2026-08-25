import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Outcome } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { OutcomeBadge } from "@/components/outcome-badge";
import { GameIcon } from "@/components/icons/game-icons";
import { gameLabel } from "@/lib/constants";
import { formatDate, formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type FlightCardData = {
  id: string;
  date: string | Date;
  duration: number;
  missionName: string | null;
  outcome: Outcome | string;
  game: string;
  aircraft: { name: string };
  pilot: { name: string; callsign: string | null };
  squadron: { name: string; tag: string | null };
};

export function FlightCard({
  flight,
  href,
  className,
}: {
  flight: FlightCardData;
  href?: string;
  className?: string;
}) {
  const content = (
    <article
      className={cn(
        "group flex items-start justify-between gap-3 rounded border border-line-subtle bg-bg-elevated p-sp-xl transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-line-default hover:bg-bg-hover",
        "focus-within:border-status-info",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="game" className="flex items-center gap-1">
            <GameIcon game={flight.game} className="h-3.5 w-3.5" />
            {gameLabel(flight.game)}
          </Badge>
          <p className="truncate font-medium text-ink-primary">
            {flight.aircraft.name}
          </p>
        </div>
        <p className="text-sm text-ink-secondary">
          {flight.pilot.callsign ?? flight.pilot.name}
          {" · "}
          {flight.squadron.tag ?? flight.squadron.name}
        </p>
        <p className="text-sm text-ink-secondary">
          {flight.missionName ? `Mission : ${flight.missionName} — ` : ""}
          {formatDuration(flight.duration)}
        </p>
        <p className="text-caption text-ink-muted">{formatDate(flight.date)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3">
        <OutcomeBadge outcome={flight.outcome} />
        <ChevronRight
          className="h-4 w-4 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-crimson-600"
          strokeWidth={1.5}
        />
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block rounded outline-none focus-visible:ring-2 focus-visible:ring-status-info"
    >
      {content}
    </Link>
  );
}
