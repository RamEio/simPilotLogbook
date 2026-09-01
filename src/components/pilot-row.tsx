import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { pilotStatusMeta } from "@/lib/constants";
import { formatCount } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type PilotRowData = {
  id: string;
  name: string;
  callsign: string | null;
  status: string;
  squadronName: string;
  flightCount?: number;
};

function statusBadgeVariant(status: string) {
  if (status === "ACTIVE") return "success" as const;
  return "error" as const;
}

export function PilotRow({
  pilot,
  href,
  className,
  trailing,
}: {
  pilot: PilotRowData;
  href?: string;
  className?: string;
  trailing?: ReactNode;
}) {
  const label = pilot.callsign ?? pilot.name;
  const status = pilotStatusMeta(pilot.status);

  const content = (
    <article
      className={cn(
        "group flex items-center justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-3 transition-all duration-200",
        href &&
          "hover:-translate-y-0.5 hover:border-line-default hover:bg-bg-hover",
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-ink-primary">{label}</p>
          <Badge variant={statusBadgeVariant(pilot.status)}>
            {status.label}
          </Badge>
        </div>
        <p className="truncate text-sm text-ink-secondary">
          {pilot.squadronName}
          {typeof pilot.flightCount === "number"
            ? ` · ${formatCount(pilot.flightCount, "vol")}`
            : null}
        </p>
        {pilot.callsign && pilot.callsign !== pilot.name ? (
          <p className="text-caption text-ink-muted">{pilot.name}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {href ? (
          <ChevronRight
            className="h-4 w-4 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-crimson-600"
            strokeWidth={1.5}
          />
        ) : null}
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

/** Alias DS — même composant que PilotRow (listes / liens). */
export const PilotCard = PilotRow;
