import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SquadronsPage() {
  const squadrons = await prisma.squadron.findMany({
    include: { _count: { select: { pilots: true, flights: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Ops / Squadrons
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-wider">
            Escadrilles
          </h1>
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
              <Card className="transition-colors hover:border-line-accent">
                <CardHeader>
                  <CardTitle>
                    {squadron.tag ? `${squadron.tag} ` : ""}
                    {squadron.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-mono text-xs text-ink-muted">
                  {squadron._count.pilots} pilotes · {squadron._count.flights} vols
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
