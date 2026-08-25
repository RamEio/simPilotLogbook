"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  aircraft: { name: string };
};

export default function EditFlightPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<FlightFormInitial | null>(null);
  const [aircraftName, setAircraftName] = useState("Vol");

  useEffect(() => {
    void apiFetch<FlightDetail>(`/api/flights/${params.id}`).then((flight) => {
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
      });
    });
  }, [params.id]);

  if (!initial) {
    return <p className="text-sm text-ink-secondary">Chargement...</p>;
  }

  return (
    <FlightForm
      mode="edit"
      initial={initial}
      breadcrumbs={[
        { label: "Vols", href: "/flights" },
        { label: aircraftName, href: `/flights/${initial.id}` },
        { label: "Modifier" },
      ]}
    />
  );
}
