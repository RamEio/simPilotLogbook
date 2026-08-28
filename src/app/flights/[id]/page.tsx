"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OutcomeBadge } from "@/components/outcome-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { gameLabel } from "@/lib/constants";
import { flightTotalPoints, KILL_CATEGORIES } from "@/lib/scoring";
import { formatDate, formatDuration } from "@/lib/utils";
import type { Game, Outcome } from "@/lib/constants";

type FlightDetail = {
  id: string;
  date: string;
  duration: number;
  missionName: string | null;
  missionType: string | null;
  notes: string | null;
  outcome: Outcome;
  game: Game;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  aircraft: { name: string };
  pilot: { name: string; callsign: string | null };
  squadron: { id: string; name: string; tag: string | null };
};

export default function FlightDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [flight, setFlight] = useState<FlightDetail | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    void apiFetch<FlightDetail>(`/api/flights/${params.id}`).then(setFlight);
  }, [params.id]);

  async function remove() {
    await apiFetch(`/api/flights/${params.id}`, { method: "DELETE" });
    toast.success("Vol supprimé");
    router.push("/flights");
  }

  if (!flight) {
    return <p className="text-sm text-ink-secondary">Chargement...</p>;
  }

  const kills = {
    killsAir: flight.killsAir ?? 0,
    killsNaval: flight.killsNaval ?? 0,
    killsGround: flight.killsGround ?? 0,
    killsBuilding: flight.killsBuilding ?? 0,
  };
  const points = flightTotalPoints(kills, flight.duration);
  const hasKills = KILL_CATEGORIES.some((cat) => kills[cat.key] > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-4 fade-in">
      <Breadcrumbs
        items={[
          { label: "Vols", href: "/flights" },
          { label: flight.aircraft.name },
        ]}
      />
      <Link
        href="/flights"
        className="inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Retour à l&apos;historique
      </Link>
      <p className="overline overline-amber">Opérations / Vol</p>
      <h1 className="sr-only">Détail du vol</h1>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{flight.aircraft.name}</CardTitle>
            <p className="mt-1 text-sm text-ink-secondary">
              {flight.pilot.callsign ?? flight.pilot.name} ·{" "}
              {flight.squadron.tag ?? flight.squadron.name}
            </p>
          </div>
          <OutcomeBadge outcome={flight.outcome} />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Badge variant="game">{gameLabel(flight.game)}</Badge>
          <p>Date : {formatDate(flight.date)}</p>
          <p>Durée : {formatDuration(flight.duration)}</p>
          {flight.missionType ? <p>Type : {flight.missionType}</p> : null}
          {flight.missionName ? <p>Mission : {flight.missionName}</p> : null}
          {hasKills ? (
            <p>
              Kills :{" "}
              {KILL_CATEGORIES.filter((cat) => kills[cat.key] > 0)
                .map((cat) => `${cat.label} ${kills[cat.key]}`)
                .join(" · ")}
            </p>
          ) : null}
          <p>Points : {Math.round(points * 10) / 10}</p>
          {flight.notes ? <p>Notes : {flight.notes}</p> : null}
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/flights/${flight.id}/edit`}>Modifier</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/log">Nouveau vol</Link>
        </Button>
        <Button
          variant="destructive"
          className="ml-auto gap-2"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          Supprimer ce vol
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce vol ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-secondary">
            Cette action est irréversible. Le vol sera définitivement effacé du
            carnet.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => void remove()}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Confirmer la suppression
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
