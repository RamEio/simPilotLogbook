import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

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
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Ops / Pilots
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-wider">Pilotes</h1>
        </div>
        <Button asChild>
          <Link href="/pilots/new">Créer</Link>
        </Button>
      </div>
      <div className="grid gap-3">
        {pilots.length === 0 ? (
          <p className="text-sm text-ink-secondary">Aucun pilote.</p>
        ) : (
          pilots.map((pilot) => {
            const outOfCombat = pilot.status === "OUT_OF_COMBAT";
            return (
              <Card
                key={pilot.id}
                className={cn(outOfCombat && "opacity-50 grayscale")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{pilot.callsign ?? pilot.name}</span>
                    {outOfCombat ? (
                      <Badge variant="destructive" className="text-[10px]">
                        H.C.
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-outcome-success border-outcome-success">
                        Vivant
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ink-secondary">
                  {pilot.squadron.tag ?? pilot.squadron.name} · {pilot._count.flights} vols
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
