import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Outcome } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { OutcomeBadge } from "@/components/outcome-badge";
import { GameIcon } from "@/components/icons/game-icons";
import { gameLabel } from "@/lib/constants";
import { formatDate, formatDuration } from "@/lib/utils";

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
}: {
  flight: FlightCardData;
  href?: string;
}) {
  const content = (
    <article className="group flex items-start justify-between gap-3 rounded-md border border-line-subtle bg-bg-card p-4 transition-colors duration-200 hover:border-line-accent">
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
        <p className="font-mono text-xs text-ink-muted">
          {formatDate(flight.date)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3">
        <OutcomeBadge outcome={flight.outcome} />
        <ChevronRight className="h-4 w-4 text-ink-muted transition-colors group-hover:text-accent-green" />
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block fade-in">
      {content}
    </Link>
  );
}
