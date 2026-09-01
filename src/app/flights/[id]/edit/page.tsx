"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  FlightForm,
  type FlightFormInitial,
} from "@/components/flight-form";
import { apiFetch } from "@/lib/api";
import type { Game, Outcome } from "@/lib/constants";

type FlightDetail = {
  id: string;
  duration: number;
  missionName: string | null;
  missionType: string | null;
  notes: string | null;
  outcome: Outcome;
  game: Game;
  pilotId: string;
  squadronId: string;
  aircraftId: string;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  aircraft: { name: string };
};

function EditFlightSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 fade-in" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 animate-pulse rounded bg-bg-elevated" />
      <div className="space-y-2">
        <div className="h-3 w-48 animate-pulse rounded bg-bg-elevated" />
        <div className="h-8 w-64 animate-pulse rounded bg-bg-elevated" />
      </div>
      <div className="space-y-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" />
            <div className="h-10 w-full animate-pulse rounded border border-line-subtle bg-bg-elevated" />
          </div>
        ))}
        <div className="h-11 w-full animate-pulse rounded bg-bg-elevated" />
      </div>
      <p className="sr-only">Chargement du formulaire…</p>
    </div>
  );
}

export default function EditFlightPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<FlightFormInitial | null>(null);
  const [aircraftName, setAircraftName] = useState("Vol");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<FlightDetail>(`/api/flights/${params.id}`)
      .then((flight) => {
        if (cancelled) return;
        setAircraftName(flight.aircraft.name);
        setInitial({
          id: flight.id,
          squadronId: flight.squadronId,
          pilotId: flight.pilotId,
          game: flight.game,
          aircraftId: flight.aircraftId,
          duration: flight.duration,
          missionName: flight.missionName,
          missionType: flight.missionType,
          outcome: flight.outcome,
          notes: flight.notes,
          killsAir: flight.killsAir ?? 0,
          killsNaval: flight.killsNaval ?? 0,
          killsGround: flight.killsGround ?? 0,
          killsBuilding: flight.killsBuilding ?? 0,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "Impossible de charger le vol",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loadError) {
    return (
      <div className="space-y-3">
        <Link
          href="/flights"
          className="inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink-primary"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Retour à l&apos;historique
        </Link>
        <p className="text-sm text-status-error">{loadError}</p>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-44 animate-pulse rounded bg-bg-elevated" />
        <EditFlightSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Link
        href={`/flights/${initial.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Retour au détail du vol
      </Link>
      <FlightForm
        mode="edit"
        initial={initial}
        breadcrumbs={[
          { label: "Vols", href: "/flights" },
          { label: aircraftName, href: `/flights/${initial.id}` },
          { label: "Modifier" },
        ]}
      />
    </div>
  );
}
