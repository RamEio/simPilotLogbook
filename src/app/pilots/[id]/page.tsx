import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityCalendar } from "@/components/activity-calendar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FlightCard } from "@/components/flight-card";
import { PilotEditForm } from "@/components/pilot-edit-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/collapsible-card";
import { getActivityCalendar } from "@/lib/activity";
import { OUTCOMES, outcomeMeta, pilotStatusMeta } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  KILL_CATEGORIES,
  POINTS_RULES_LABEL,
  aggregatePoints,
  flightTotalPoints,
  killsFromRow,
  roundPoints,
} from "@/lib/scoring";
import { formatCount, formatDate, formatHours } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusBadgeVariant(status: string) {
  if (status === "ACTIVE") return "success" as const;
  return "error" as const;
}

const OUTCOME_BAR: Record<string, string> = {
  SUCCESS: "bg-status-success",
  PARTIAL_AIRCRAFT: "bg-status-warning",
  PARTIAL_PILOT: "bg-status-warning",
  FAILURE: "bg-status-error",
  TOTAL_FAILURE: "bg-crimson-900",
};

export default async function PilotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [pilot, allFlights, calendar] = await Promise.all([
    prisma.pilot.findUnique({
      where: { id: params.id },
      include: {
        squadron: true,
        flights: {
          include: { aircraft: true, pilot: true, squadron: true },
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    }),
    prisma.flight.findMany({
      where: { pilotId: params.id },
      include: { aircraft: true },
      orderBy: { date: "desc" },
    }),
    getActivityCalendar({ pilotId: params.id, days: 365 }),
  ]);

  if (!pilot) {
    notFound();
  }

  const totalFlights = allFlights.length;
  const totalMinutes = allFlights.reduce((sum, flight) => sum + flight.duration, 0);
  const successes = allFlights.filter((flight) => flight.outcome === "SUCCESS").length;
  const successRate =
    totalFlights === 0 ? 0 : Math.round((successes / totalFlights) * 100);
  const statusMeta = pilotStatusMeta(pilot.status);

  const kills = {
    killsAir: allFlights.reduce((sum, flight) => sum + flight.killsAir, 0),
    killsNaval: allFlights.reduce((sum, flight) => sum + flight.killsNaval, 0),
    killsGround: allFlights.reduce((sum, flight) => sum + flight.killsGround, 0),
    killsBuilding: allFlights.reduce((sum, flight) => sum + flight.killsBuilding, 0),
  };
  const totalPoints = roundPoints(
    aggregatePoints(kills, totalMinutes, successes),
  );

  const firstFlight = allFlights.at(-1);
  const lastFlight = allFlights[0];

  const outcomeCounts = OUTCOMES.map((outcome) => ({
    ...outcome,
    count: allFlights.filter((flight) => flight.outcome === outcome.value).length,
  }));

  const byAircraft = new Map<
    string,
    {
      name: string;
      flights: number;
      minutes: number;
      successes: number;
      points: number;
      killsAir: number;
      killsNaval: number;
      killsGround: number;
      killsBuilding: number;
    }
  >();
  for (const flight of allFlights) {
    const current = byAircraft.get(flight.aircraftId) ?? {
      name: flight.aircraft.name,
      flights: 0,
      minutes: 0,
      successes: 0,
      points: 0,
      killsAir: 0,
      killsNaval: 0,
      killsGround: 0,
      killsBuilding: 0,
    };
    current.flights += 1;
    current.minutes += flight.duration;
    if (flight.outcome === "SUCCESS") current.successes += 1;
    current.points += flightTotalPoints(
      killsFromRow(flight),
      flight.duration,
      flight.outcome,
    );
    current.killsAir += flight.killsAir;
    current.killsNaval += flight.killsNaval;
    current.killsGround += flight.killsGround;
    current.killsBuilding += flight.killsBuilding;
    byAircraft.set(flight.aircraftId, current);
  }
  const aircraftRows = Array.from(byAircraft.values()).sort(
    (a, b) => b.points - a.points,
  );

  const records: { label: string; display: string; href: string }[] = [];
  if (allFlights.length) {
    const scored = allFlights.map((flight) => ({
      flight,
      points: roundPoints(
        flightTotalPoints(
          killsFromRow(flight),
          flight.duration,
          flight.outcome,
        ),
      ),
    }));
    const pick = <T,>(
      rows: T[],
      value: (row: T) => number,
    ) => rows.reduce((best, row) => (value(row) > value(best) ? row : best));
    const bestPoints = pick(scored, (row) => row.points);
    const longest = pick(scored, (row) => row.flight.duration);
    records.push({
      label: "Plus de points en 1 vol",
      display: `${bestPoints.points} pts · ${formatDate(bestPoints.flight.date)}`,
      href: `/flights/${bestPoints.flight.id}`,
    });
    records.push({
      label: "Plus long vol",
      display: `${formatHours(longest.flight.duration)} · ${formatDate(longest.flight.date)}`,
      href: `/flights/${longest.flight.id}`,
    });
    for (const cat of KILL_CATEGORIES) {
      const best = pick(scored, (row) => row.flight[cat.key]);
      if (best.flight[cat.key] > 0) {
        records.push({
          label: `Plus de kills ${cat.label.toLowerCase()} en 1 vol`,
          display: `${best.flight[cat.key]} · ${formatDate(best.flight.date)}`,
          href: `/flights/${best.flight.id}`,
        });
      }
    }
  }

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
          {firstFlight && lastFlight ? (
            <p className="mt-1 text-caption text-ink-muted">
              Premier vol {formatDate(firstFlight.date)} · Dernier vol{" "}
              {formatDate(lastFlight.date)}
            </p>
          ) : (
            <p className="mt-1 text-caption text-ink-muted">
              Pas encore de vol —{" "}
              <Link href="/log" className="text-status-info hover:underline">
                Enregistrer un vol
              </Link>
            </p>
          )}
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
          <CardContent className="text-h2 text-ink-primary">
            {totalFlights}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Heures</CardTitle>
          </CardHeader>
          <CardContent className="text-h2 text-ink-primary">
            {formatHours(totalMinutes)}
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
              {totalPoints}
            </CardContent>
          </Card>
        </div>
      </div>

      {totalFlights > 0 ? (
        <section className="space-y-2">
          <h2 className="text-h3 text-ink-primary">Résultats</h2>
          <div className="flex h-3 overflow-hidden rounded border border-line-subtle">
            {outcomeCounts
              .filter((item) => item.count > 0)
              .map((item) => (
                <div
                  key={item.value}
                  className={cn(OUTCOME_BAR[item.value] ?? "bg-status-neutral")}
                  style={{ width: `${(item.count / totalFlights) * 100}%` }}
                  title={`${item.label} : ${item.count}`}
                />
              ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-muted">
            {outcomeCounts
              .filter((item) => item.count > 0)
              .map((item) => (
                <span key={item.value}>
                  {outcomeMeta(item.value).short} ({item.count})
                </span>
              ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-h3 text-ink-primary">Activité</h2>
        {calendar.cells.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Pas encore de vol —{" "}
            <Link href="/log" className="text-status-info hover:underline">
              Enregistrer un vol
            </Link>
          </p>
        ) : (
          <ActivityCalendar
            calendar={calendar}
            hrefForDate={(date) =>
              `/flights?pilotId=${encodeURIComponent(pilot.id)}&from=${date}&to=${date}`
            }
          />
        )}
      </section>

      {aircraftRows.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-h3 text-ink-primary">Appareils</h2>
          <div className="overflow-x-auto rounded border border-line-subtle">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-bg-elevated text-caption uppercase tracking-overline text-ink-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Avion</th>
                  <th className="px-3 py-2 font-medium">Vols</th>
                  <th className="px-3 py-2 font-medium">Heures</th>
                  <th className="px-3 py-2 font-medium">Pts</th>
                  <th className="px-3 py-2 font-medium">Réussite</th>
                </tr>
              </thead>
              <tbody>
                {aircraftRows.map((row) => (
                  <tr key={row.name} className="border-t border-line-subtle">
                    <td className="px-3 py-2 text-ink-primary">{row.name}</td>
                    <td className="px-3 py-2 text-ink-secondary">{row.flights}</td>
                    <td className="px-3 py-2 text-ink-secondary">
                      {formatHours(row.minutes)}
                    </td>
                    <td className="px-3 py-2 text-ink-secondary">
                      {roundPoints(row.points)}
                    </td>
                    <td className="px-3 py-2 text-ink-secondary">
                      {Math.round((row.successes / row.flights) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {records.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-h3 text-ink-primary">Records personnels</h2>
          <div className="grid gap-2">
            {records.map((record) => (
              <Link
                key={record.label}
                href={record.href}
                className="flex items-center justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-2 text-sm hover:bg-bg-hover"
              >
                <span className="text-ink-secondary">{record.label}</span>
                <span className="shrink-0 text-ink-primary">{record.display}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CollapsibleCard title="Modifier le statut" defaultOpen={false}>
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
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-h3 text-ink-primary">Historique de vols</h2>
          {totalFlights > 10 ? (
            <Link
              href={`/flights?pilotId=${encodeURIComponent(pilot.id)}`}
              className="text-sm text-status-info underline-offset-4 hover:underline"
            >
              Voir tous ({formatCount(totalFlights, "vol")})
            </Link>
          ) : null}
        </div>
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
