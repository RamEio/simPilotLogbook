import Link from "next/link";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CollapsibleCard } from "@/components/collapsible-card";
import { FlightCard } from "@/components/flight-card";
import { Button } from "@/components/ui/button";
import { GAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { cn, formatCount, formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "n/a vs 30 j. préc.";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}% vs 30 j. préc.`;
}

export default async function DashboardPage() {
  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now);
  d60.setDate(d60.getDate() - 60);

  const [
    totalFlights,
    duration,
    recentFlights,
    groupedByGame,
    groupedByAircraft,
    squadronCount,
    pilotCount,
    flights30,
    minutes30,
    flightsPrev30,
    minutesPrev30,
  ] = await Promise.all([
    prisma.flight.count(),
    prisma.flight.aggregate({ _sum: { duration: true } }),
    prisma.flight.findMany({
      include: {
        aircraft: true,
        pilot: true,
        squadron: true,
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.flight.groupBy({
      by: ["game"],
      _sum: { duration: true },
    }),
    prisma.flight.groupBy({
      by: ["aircraftId"],
      _sum: { duration: true },
      _count: { _all: true },
      orderBy: { _sum: { duration: "desc" } },
      take: 12,
    }),
    prisma.squadron.count(),
    prisma.pilot.count(),
    prisma.flight.count({ where: { date: { gte: d30 } } }),
    prisma.flight.aggregate({
      where: { date: { gte: d30 } },
      _sum: { duration: true },
    }),
    prisma.flight.count({ where: { date: { gte: d60, lt: d30 } } }),
    prisma.flight.aggregate({
      where: { date: { gte: d60, lt: d30 } },
      _sum: { duration: true },
    }),
  ]);

  const totalMinutes = duration._sum.duration ?? 0;
  const currentMinutes30 = minutes30._sum.duration ?? 0;
  const previousMinutes30 = minutesPrev30._sum.duration ?? 0;
  const flightsDelta = deltaPct(flights30, flightsPrev30);
  const hoursDelta = deltaPct(currentMinutes30, previousMinutes30);

  const hasSquadron = squadronCount > 0;
  const hasPilot = pilotCount > 0;
  const hasFlight = totalFlights > 0;
  const showOnboarding = !hasSquadron || !hasPilot || !hasFlight;

  const onboardingSteps = [
    {
      id: "squadron",
      label: "Créer une escadrille",
      href: "/squadrons/new",
      done: hasSquadron,
      enabled: true,
    },
    {
      id: "pilot",
      label: "Ajouter un pilote",
      href: "/pilots/new",
      done: hasPilot,
      enabled: hasSquadron,
    },
    {
      id: "flight",
      label: "Enregistrer un premier vol",
      href: "/log",
      done: hasFlight,
      enabled: hasSquadron && hasPilot,
    },
  ] as const;

  const byGame = GAMES.map((game) => ({
    ...game,
    minutes: groupedByGame.find((item) => item.game === game.value)?._sum
      .duration ?? 0,
  }));
  const maxGameMinutes = Math.max(1, ...byGame.map((item) => item.minutes));

  const aircraftIds = groupedByAircraft.map((item) => item.aircraftId);
  const aircraftRows =
    aircraftIds.length === 0
      ? []
      : await prisma.aircraft.findMany({
          where: { id: { in: aircraftIds } },
        });

  const byAircraft = groupedByAircraft.map((item) => {
    const aircraft = aircraftRows.find((row) => row.id === item.aircraftId);
    return {
      id: item.aircraftId,
      name: aircraft?.name ?? "Appareil",
      game: aircraft?.game ?? "",
      minutes: item._sum.duration ?? 0,
      flights: item._count._all,
    };
  });
  const maxAircraftMinutes = Math.max(
    1,
    ...byAircraft.map((item) => item.minutes),
  );

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs items={[{ label: "Tableau de bord" }]} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="overline overline-amber">Opérations / Tableau de bord</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Sim Pilot Logbook</h1>
        </div>
        <Button asChild size="lg">
          <Link href="/log">Enregistrer un vol</Link>
        </Button>
      </div>

      {showOnboarding ? (
        <CollapsibleCard title="Premiers pas">
          <ol className="space-y-2">
            {onboardingSteps.map((step, index) => (
              <li key={step.id}>
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 rounded border px-3 py-2.5",
                    step.done
                      ? "border-line-subtle bg-bg-elevated text-ink-muted"
                      : "border-line-default bg-bg-card",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm",
                        step.done
                          ? "border-status-success/40 bg-status-success/15 text-status-success"
                          : "border-line-default text-ink-secondary",
                      )}
                      aria-hidden
                    >
                      {step.done ? (
                        <Check className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        step.done
                          ? "line-through text-ink-muted"
                          : "text-ink-primary",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!step.done && step.enabled ? (
                    <Button asChild variant="secondary">
                      <Link href={step.href}>Aller</Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </CollapsibleCard>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <CollapsibleCard title="Vols">
          <p className="text-display text-ink-primary">{totalFlights}</p>
          <p className="mt-1 text-caption text-ink-muted">
            30 j. : {flights30} · {formatDelta(flightsDelta)}
          </p>
        </CollapsibleCard>
        <CollapsibleCard title="Heures de vol">
          <p className="text-display text-ink-primary">
            {formatHours(totalMinutes)}
          </p>
          <p className="mt-1 text-caption text-ink-muted">
            30 j. : {formatHours(currentMinutes30)} · {formatDelta(hoursDelta)}
          </p>
        </CollapsibleCard>
      </div>

      <CollapsibleCard title="Répartition par simulateur">
        <div className="space-y-3">
          {byGame.map((game) => (
            <div key={game.value} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">{game.short}</span>
                <span className="text-caption text-ink-muted">
                  {formatHours(game.minutes)}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(game.minutes / maxGameMinutes) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Temps par avion">
        {byAircraft.length === 0 ? (
          <p className="text-sm text-ink-secondary">Aucun appareil encore.</p>
        ) : (
          <div className="space-y-3">
            {byAircraft.map((aircraft) => (
              <div key={aircraft.id} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink-secondary">
                    {aircraft.name}
                  </span>
                  <span className="shrink-0 text-caption text-ink-muted">
                    {formatHours(aircraft.minutes)} ·{" "}
                    {formatCount(aircraft.flights, "vol")}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(aircraft.minutes / maxAircraftMinutes) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleCard>

      <CollapsibleCard title="Derniers vols">
        {recentFlights.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Aucun vol enregistré pour l’instant.
          </p>
        ) : (
          <div className="grid gap-3">
            {recentFlights.map((flight, index) => (
              <div
                key={flight.id}
                className="motion-safe:animate-fade-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <FlightCard href={`/flights/${flight.id}`} flight={flight} />
              </div>
            ))}
          </div>
        )}
      </CollapsibleCard>
    </div>
  );
}
