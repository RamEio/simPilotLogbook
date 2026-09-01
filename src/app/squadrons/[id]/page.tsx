import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FlightCard } from "@/components/flight-card";
import { PilotRow } from "@/components/pilot-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { flightTotalPoints } from "@/lib/scoring";
import { formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SquadronDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const squadron = await prisma.squadron.findUnique({
    where: { id: params.id },
    include: {
      pilots: { orderBy: { name: "asc" } },
      flights: {
        include: { aircraft: true, pilot: true, squadron: true },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!squadron) {
    notFound();
  }

  const [aggregates, successes, rankingFlights] = await Promise.all([
    prisma.flight.aggregate({
      where: { squadronId: params.id },
      _count: { _all: true },
      _sum: { duration: true },
    }),
    prisma.flight.count({
      where: { squadronId: params.id, outcome: "SUCCESS" },
    }),
    prisma.flight.findMany({
      where: { squadronId: params.id },
      select: {
        pilotId: true,
        duration: true,
        killsAir: true,
        killsNaval: true,
        killsGround: true,
        killsBuilding: true,
      },
    }),
  ]);

  const totalFlights = aggregates._count._all;
  const successRate =
    totalFlights === 0 ? 0 : Math.round((successes / totalFlights) * 100);

  const pointsByPilot = new Map<string, number>();
  for (const flight of rankingFlights) {
    const points = flightTotalPoints(
      {
        killsAir: flight.killsAir,
        killsNaval: flight.killsNaval,
        killsGround: flight.killsGround,
        killsBuilding: flight.killsBuilding,
      },
      flight.duration,
    );
    pointsByPilot.set(
      flight.pilotId,
      (pointsByPilot.get(flight.pilotId) ?? 0) + points,
    );
  }

  const topPilots = squadron.pilots
    .map((pilot) => ({
      id: pilot.id,
      label: pilot.callsign ?? pilot.name,
      points: Math.round((pointsByPilot.get(pilot.id) ?? 0) * 10) / 10,
    }))
    .filter((pilot) => pilot.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs
        items={[
          { label: "Escadrilles", href: "/squadrons" },
          {
            label: squadron.tag
              ? `${squadron.tag} ${squadron.name}`
              : squadron.name,
          },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="overline overline-amber">Opérations / Escadrille</p>
          <h1 className="mt-1 text-h1 text-ink-primary">
            {squadron.tag ? `${squadron.tag} ` : ""}
            {squadron.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href={`/pilots/new?squadronId=${squadron.id}`}>
              Ajouter un pilote
            </Link>
          </Button>
          <Button asChild>
            <Link href="/log">Enregistrer un vol</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vols</CardTitle>
          </CardHeader>
          <CardContent className="text-h2 text-ink-primary">
            {totalFlights}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Heures</CardTitle>
          </CardHeader>
          <CardContent className="text-h2 text-ink-primary">
            {formatHours(aggregates._sum.duration ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Réussite</CardTitle>
          </CardHeader>
          <CardContent className="text-h2 text-ink-primary">
            {successRate}%
          </CardContent>
        </Card>
      </div>
      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-h3 text-ink-primary">Top 3 — points</h2>
          <Link
            href="/leaderboard"
            className="text-sm text-status-info underline-offset-4 hover:underline"
          >
            Voir les classements
          </Link>
        </div>
        {topPilots.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Pas encore de points pour cette escadrille.
          </p>
        ) : (
          <ul className="grid gap-2">
            {topPilots.map((pilot, index) => (
              <li key={pilot.id}>
                <Link
                  href={`/pilots/${pilot.id}`}
                  className="flex items-center justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-3 transition-colors hover:bg-bg-hover"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge variant={index < 3 ? "warning" : "neutral"}>
                      #{index + 1}
                    </Badge>
                    <span className="truncate font-medium text-ink-primary">
                      {pilot.label}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm text-ink-secondary">
                    {pilot.points} pts
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-h3 text-ink-primary">Pilotes</h2>
        {squadron.pilots.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Aucun pilote.{" "}
            <Link
              className="text-status-info underline-offset-4 hover:underline"
              href={`/pilots/new?squadronId=${squadron.id}`}
            >
              En créer un
            </Link>
          </p>
        ) : (
          <ul className="grid gap-2">
            {squadron.pilots.map((pilot) => (
              <li key={pilot.id}>
                <PilotRow
                  href={`/pilots/${pilot.id}`}
                  pilot={{
                    id: pilot.id,
                    name: pilot.name,
                    callsign: pilot.callsign,
                    status: pilot.status,
                    squadronName: squadron.tag ?? squadron.name,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-h3 text-ink-primary">Derniers vols</h2>
        {squadron.flights.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Aucun vol.{" "}
            <Link
              className="text-status-info underline-offset-4 hover:underline"
              href="/log"
            >
              Enregistrer une sortie
            </Link>
          </p>
        ) : (
          <div className="grid gap-3">
            {squadron.flights.map((flight) => (
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
