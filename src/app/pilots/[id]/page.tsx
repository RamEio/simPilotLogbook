import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FlightCard } from "@/components/flight-card";
import { PilotEditForm } from "@/components/pilot-edit-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/collapsible-card";
import { pilotStatusMeta } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  flightTotalPoints,
  KILL_CATEGORIES,
  POINTS_RULES_LABEL,
} from "@/lib/scoring";
import { formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusBadgeVariant(status: string) {
  if (status === "ACTIVE") return "success" as const;
  return "error" as const;
}

export default async function PilotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const pilot = await prisma.pilot.findUnique({
    where: { id: params.id },
    include: {
      squadron: true,
      flights: {
        include: { aircraft: true, pilot: true, squadron: true },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!pilot) {
    notFound();
  }

  const [aggregates, successes, killAgg] = await Promise.all([
    prisma.flight.aggregate({
      where: { pilotId: params.id },
      _count: { _all: true },
      _sum: { duration: true },
    }),
    prisma.flight.count({
      where: { pilotId: params.id, outcome: "SUCCESS" },
    }),
    prisma.flight.aggregate({
      where: { pilotId: params.id },
      _sum: {
        killsAir: true,
        killsNaval: true,
        killsGround: true,
        killsBuilding: true,
        duration: true,
      },
    }),
  ]);

  const totalFlights = aggregates._count._all;
  const successRate =
    totalFlights === 0 ? 0 : Math.round((successes / totalFlights) * 100);
  const statusMeta = pilotStatusMeta(pilot.status);

  const kills = {
    killsAir: killAgg._sum.killsAir ?? 0,
    killsNaval: killAgg._sum.killsNaval ?? 0,
    killsGround: killAgg._sum.killsGround ?? 0,
    killsBuilding: killAgg._sum.killsBuilding ?? 0,
  };
  const totalPoints = flightTotalPoints(kills, killAgg._sum.duration ?? 0);

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs
        items={[
          { label: "Pilotes", href: "/pilots" },
          { label: pilot.callsign ?? pilot.name },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="overline overline-amber">Opérations / Pilote</p>
          <h1 className="mt-1 text-h1 text-ink-primary">
            {pilot.callsign ?? pilot.name}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {pilot.name}
            {" · "}
            <Link
              href={`/squadrons/${pilot.squadron.id}`}
              className="text-status-info underline-offset-4 hover:underline"
            >
              {pilot.squadron.tag ?? pilot.squadron.name}
            </Link>
          </p>
        </div>
        <Badge variant={statusBadgeVariant(pilot.status)}>
          {statusMeta.label}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vols</CardTitle>
          </CardHeader>
          <CardContent className="text-h2 text-ink-primary">{totalFlights}</CardContent>
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
          <CardContent className="text-h2 text-ink-primary">{successRate}%</CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <p className="text-caption text-ink-muted">
          Compteurs kills (cumul des vols) · {POINTS_RULES_LABEL}
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          {KILL_CATEGORIES.map((cat) => (
            <Card key={cat.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{cat.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-h2 text-ink-primary">
                {kills[cat.key]}
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Points</CardTitle>
            </CardHeader>
            <CardContent className="text-h2 text-ink-primary">
              {Math.round(totalPoints * 10) / 10}
            </CardContent>
          </Card>
        </div>
      </div>

      <CollapsibleCard title="Modifier le statut" defaultOpen>
        <PilotEditForm
          pilot={{
            id: pilot.id,
            name: pilot.name,
            callsign: pilot.callsign,
            status: pilot.status,
            squadronId: pilot.squadronId,
            hasPin: Boolean(pilot.pin),
          }}
        />
      </CollapsibleCard>

      <section className="space-y-3">
        <h2 className="text-h3 text-ink-primary">Historique de vols</h2>
        {pilot.flights.length === 0 ? (
          <Card>
            <CardContent className="pt-sp-xl text-sm text-ink-secondary">
              Aucun vol pour ce pilote.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {pilot.flights.map((flight) => (
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
