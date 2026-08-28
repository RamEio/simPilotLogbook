import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pilotStatusMeta } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusBadgeVariant(status: string) {
  if (status === "ACTIVE") return "success" as const;
  return "error" as const;
}

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
            <Link key={pilot.id} href={`/pilots/${pilot.id}`}>
              <Card className="transition-colors hover:border-line-default hover:bg-bg-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                  <CardTitle>{pilot.callsign ?? pilot.name}</CardTitle>
                  <Badge variant={statusBadgeVariant(pilot.status)}>
                    {pilotStatusMeta(pilot.status).label}
                  </Badge>
                </CardHeader>
                <CardContent className="text-sm text-ink-secondary">
                  {pilot.squadron.tag ?? pilot.squadron.name} ·{" "}
                  {formatCount(pilot._count.flights, "vol")}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
