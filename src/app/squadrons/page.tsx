import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquadronIcon } from "@/components/icons/squadron-icons";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SquadronsPage() {
  const squadrons = await prisma.squadron.findMany({
    include: { _count: { select: { pilots: true, flights: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs items={[{ label: "Escadrilles" }]} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="overline overline-amber">Opérations / Escadrilles</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Escadrilles</h1>
        </div>
        <Button asChild>
          <Link href="/squadrons/new">Créer</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {squadrons.length === 0 ? (
          <p className="text-sm text-ink-secondary">Aucune escadrille.</p>
        ) : (
          squadrons.map((squadron) => (
            <Link key={squadron.id} href={`/squadrons/${squadron.id}`}>
              <Card className="transition-colors hover:border-line-default hover:bg-bg-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SquadronIcon icon={squadron.icon} className="h-5 w-5 shrink-0" />
                    <span>
                      {squadron.tag ? `${squadron.tag} ` : ""}
                      {squadron.name}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-caption text-ink-muted">
                  {formatCount(squadron._count.pilots, "pilote")} ·{" "}
                  {formatCount(squadron._count.flights, "vol")}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
