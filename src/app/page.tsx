import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightCard } from "@/components/flight-card";
import { GAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalFlights, duration, recentFlights, grouped] = await Promise.all([
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
  ]);

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
          <h1 className="mt-1 font-display text-2xl tracking-wider">
            Sim Pilot Logbook
          </h1>
        </div>
        <Button asChild size="lg">
          <Link href="/log">Enregistrer un vol</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vols</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl text-ink-primary">{totalFlights}</p>
          </CardContent>
        </Card>
        <Card>
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
                <span className="text-ink-secondary">{game.short}</span>
                <span className="font-mono text-ink-muted">{game.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-sm bg-bg-elevated">
                <div
                  className="h-full bg-accent-green"
                  style={{ width: `${(game.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-sm tracking-wider text-ink-secondary">
          Derniers vols
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
