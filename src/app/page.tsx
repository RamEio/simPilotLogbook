import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CollapsibleCard } from "@/components/collapsible-card";
import { FlightCard } from "@/components/flight-card";
import { Button } from "@/components/ui/button";
import { GAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalFlights, duration, recentFlights, groupedByGame, groupedByAircraft] =
    await Promise.all([
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
    ]);

  const totalMinutes = duration._sum.duration ?? 0;

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
          <p className="overline overline-amber">Ops / Dashboard</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Sim Pilot Logbook</h1>
        </div>
        <Button asChild size="lg">
          <Link href="/log">Enregistrer un vol</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CollapsibleCard title="Vols">
          <p className="text-display text-ink-primary">{totalFlights}</p>
        </CollapsibleCard>
        <CollapsibleCard title="Heures de vol">
          <p className="text-display text-ink-primary">
            {formatHours(totalMinutes)}
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
                    {formatHours(aircraft.minutes)} · {aircraft.flights} vol
                    {aircraft.flights > 1 ? "s" : ""}
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
            Aucun vol enregistré. Commence par créer une escadrille et un
            pilote, puis loggue ta première sortie.
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
