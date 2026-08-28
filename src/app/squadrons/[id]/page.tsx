import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FlightCard } from "@/components/flight-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
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

  const [aggregates, successes] = await Promise.all([
    prisma.flight.aggregate({
      where: { squadronId: params.id },
      _count: { _all: true },
      _sum: { duration: true },
    }),
    prisma.flight.count({
      where: { squadronId: params.id, outcome: "SUCCESS" },
    }),
  ]);

  const totalFlights = aggregates._count._all;
  const successRate =
    totalFlights === 0 ? 0 : Math.round((successes / totalFlights) * 100);

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs
        items={[
          { label: "Escadrilles", href: "/squadrons" },
          { label: squadron.tag ? `${squadron.tag} ${squadron.name}` : squadron.name },
        ]}
      />
      <div>
        <p className="overline overline-amber">Opérations / Escadrille</p>
        <h1 className="mt-1 text-h1 text-ink-primary">
          {squadron.tag ? `${squadron.tag} ` : ""}
          {squadron.name}
        </h1>
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
      <section className="space-y-2">
        <h2 className="text-h3 text-ink-primary">Pilotes</h2>
        {squadron.pilots.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Aucun pilote.{" "}
            <Link className="text-status-info underline-offset-4 hover:underline" href="/pilots/new">
              En créer un
            </Link>
          </p>
        ) : (
          <ul className="grid gap-2">
            {squadron.pilots.map((pilot) => (
              <li key={pilot.id}>
                <Link
                  href={`/pilots/${pilot.id}`}
                  className="block rounded border border-line-subtle bg-bg-card px-3 py-2 shadow-level-1 transition-colors hover:bg-bg-hover"
                >
                  {pilot.callsign ?? pilot.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-h3 text-ink-primary">Derniers vols</h2>
        <div className="grid gap-3">
          {squadron.flights.map((flight) => (
            <FlightCard key={flight.id} href={`/flights/${flight.id}`} flight={flight} />
          ))}
        </div>
      </section>
    </div>
  );
}
