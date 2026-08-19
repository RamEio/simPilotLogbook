import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightCard } from "@/components/flight-card";
import { GAMES, gameLabel } from "@/lib/constants";
import { GameIcon } from "@/components/icons/game-icons";
import { prisma } from "@/lib/prisma";
import { formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalFlights, duration, recentFlights, grouped, byAircraftRaw] =
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
        _count: { _all: true },
      }),
      prisma.flight.groupBy({
        by: ["aircraftId"],
        _count: { _all: true },
        _sum: { duration: true },
      }),
    ]);

  byAircraftRaw.sort((a, b) => b._count._all - a._count._all);
  const topAircraft = byAircraftRaw.slice(0, 8);
  const aircraftIds = topAircraft.map((r) => r.aircraftId);
  const aircraftMap = Object.fromEntries(
    (
      await prisma.aircraft.findMany({
        where: { id: { in: aircraftIds } },
        select: { id: true, name: true, game: true },
      })
    ).map((a) => [a.id, a]),
  );

  const byAircraft = topAircraft.map((r) => ({
    id: r.aircraftId,
    name: aircraftMap[r.aircraftId]?.name ?? "Inconnu",
    game: aircraftMap[r.aircraftId]?.game ?? "",
    count: r._count._all,
    hours: r._sum.duration ?? 0,
  }));

  const maxAircraftCount = Math.max(1, ...byAircraft.map((a) => a.count));

  const totalMinutes = duration._sum.duration ?? 0;
  const maxCount = Math.max(1, ...grouped.map((item) => item._count._all));
  const byGame = GAMES.map((game) => ({
    ...game,
    count: grouped.find((item) => item.game === game.value)?._count._all ?? 0,
  }));

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Ops / Dashboard
          </p>
          <h1 className="mt-1 font-display text-2xl uppercase tracking-wider text-accent-primary">
            Tableau de bord
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href="/api/flights/export">Exporter CSV</a>
          </Button>
          <Button asChild size="lg">
            <Link href="/log">Enregistrer un vol</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-t-4 border-t-accent-primary">
          <CardHeader>
            <CardTitle>Vols</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl text-ink-primary">{totalFlights}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-accent-primary">
          <CardHeader>
            <CardTitle>Heures de vol</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl text-ink-primary">
              {formatHours(totalMinutes)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Répartition par simulateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byGame.map((game) => (
            <div key={game.value} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <GameIcon game={game.value} className="h-4 w-4" />
                  {game.short}
                </span>
                <span className="font-mono text-ink-muted">{game.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-sm bg-bg-elevated">
                <div
                  className="h-full bg-accent-primary"
                  style={{ width: `${(game.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition par appareil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byAircraft.length === 0 ? (
            <p className="text-sm text-ink-secondary">Aucun vol enregistré.</p>
          ) : (
            byAircraft.map((aircraft) => (
              <div key={aircraft.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-primary">{aircraft.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-muted">
                      {formatHours(aircraft.hours)}
                    </span>
                    <span className="font-mono text-ink-muted">
                      {aircraft.count}
                    </span>
                    <span className="flex items-center gap-1 rounded-sm bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                      <GameIcon game={aircraft.game} className="h-3 w-3" />
                      {gameLabel(aircraft.game)}
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-bg-elevated">
                  <div
                    className="h-full bg-accent-primary"
                    style={{
                      width: `${(aircraft.count / maxAircraftCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-sm tracking-wider text-ink-secondary">
          DERNIERS VOLS
        </h2>
        {recentFlights.length === 0 ? (
          <Card>
            <CardContent className="pt-4 text-sm text-ink-secondary">
              Aucun vol enregistré. Commence par créer une escadrille et un
              pilote, puis loggue ta première sortie.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {recentFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                href={`/flights/${flight.id}`}
                flight={flight}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
