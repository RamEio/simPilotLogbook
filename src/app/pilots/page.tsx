import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PilotRow } from "@/components/pilot-row";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PilotsPage() {
  const pilots = await prisma.pilot.findMany({
    include: {
      squadron: true,
      _count: { select: { flights: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs items={[{ label: "Pilotes" }]} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="overline overline-amber">Opérations / Pilotes</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Pilotes</h1>
        </div>
        <Button asChild>
          <Link href="/pilots/new">Créer</Link>
        </Button>
      </div>
      <div className="grid gap-3">
        {pilots.length === 0 ? (
          <p className="text-sm text-ink-secondary">Aucun pilote.</p>
        ) : (
          pilots.map((pilot) => (
            <PilotRow
              key={pilot.id}
              href={`/pilots/${pilot.id}`}
              pilot={{
                id: pilot.id,
                name: pilot.name,
                callsign: pilot.callsign,
                status: pilot.status,
                squadronName: pilot.squadron.tag ?? pilot.squadron.name,
                flightCount: pilot._count.flights,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
