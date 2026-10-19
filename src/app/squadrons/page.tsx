import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SoloBadge } from "@/components/solo-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquadronIcon } from "@/components/icons/squadron-icons";
import { isSystemSquadron } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ensureSystemSquadron, sortSquadronsForDisplay } from "@/lib/solo";
import { cn, formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SquadronsPage() {
  await ensureSystemSquadron();
  const squadrons = sortSquadronsForDisplay(
    await prisma.squadron.findMany({
      include: { _count: { select: { pilots: true, flights: true } } },
    }),
  );

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
          squadrons.map((squadron) => {
            const solo = isSystemSquadron(squadron.name);
            return (
              <Link key={squadron.id} href={`/squadrons/${squadron.id}`}>
                <Card
                  className={cn(
                    "transition-colors hover:border-line-default hover:bg-bg-hover",
                    solo && "bg-bg-canvas",
                  )}
                >
                  <CardHeader className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <SquadronIcon icon={squadron.icon} className="h-5 w-5 shrink-0" />
                      <span className={solo ? "text-ink-secondary" : undefined}>
                        {squadron.tag ? `${squadron.tag} ` : ""}
                        {squadron.name}
                      </span>
                    </CardTitle>
                    {solo ? <SoloBadge /> : null}
                  </CardHeader>
                  <CardContent className="text-caption text-ink-muted">
                    {solo
                      ? "Pilotes sans club · hors classements"
                      : `${formatCount(squadron._count.pilots, "pilote")} · ${formatCount(squadron._count.flights, "vol")}`}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
