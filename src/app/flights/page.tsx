"use client";

import { useEffect, useState } from "react";
import type { Game, Outcome } from "@/lib/constants";
import { FlightCard, type FlightCardData } from "@/components/flight-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { GAMES, OUTCOMES } from "@/lib/constants";

type Squadron = { id: string; name: string; tag: string | null };
type Pilot = { id: string; name: string; callsign: string | null };
type FlightsResponse = {
  items: FlightCardData[];
  total: number;
  page: number;
  pageCount: number;
};

export default function FlightsPage() {
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [game, setGame] = useState<Game | "all">("all");
  const [squadronId, setSquadronId] = useState("all");
  const [pilotId, setPilotId] = useState("all");
  const [outcome, setOutcome] = useState<Outcome | "all">("all");
  const [sort, setSort] = useState("date");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FlightsResponse | null>(null);

  useEffect(() => {
    void apiFetch<Squadron[]>("/api/squadrons").then(setSquadrons);
  }, []);

  useEffect(() => {
    const query = squadronId === "all" ? "" : `?squadronId=${squadronId}`;
    void apiFetch<Pilot[]>(`/api/pilots${query}`).then((items) => {
      setPilots(items);
      setPilotId("all");
    });
  }, [squadronId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (game !== "all") params.set("game", game);
    if (squadronId !== "all") params.set("squadronId", squadronId);
    if (pilotId !== "all") params.set("pilotId", pilotId);
    if (outcome !== "all") params.set("outcome", outcome);
    params.set("sort", sort);
    params.set("page", String(page));
    void apiFetch<FlightsResponse>(`/api/flights?${params.toString()}`).then(setData);
  }, [game, squadronId, pilotId, outcome, sort, page]);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Ops / Flights
        </p>
        <h1 className="mt-1 font-display text-2xl tracking-wider">Vols</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          value={game}
          onValueChange={(value) => {
            setGame(value as Game | "all");
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Simulateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les simulateurs</SelectItem>
            {GAMES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.short}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={squadronId}
          onValueChange={(value) => {
            setSquadronId(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Escadrille" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les escadrilles</SelectItem>
            {squadrons.map((squadron) => (
              <SelectItem key={squadron.id} value={squadron.id}>
                {squadron.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={pilotId}
          onValueChange={(value) => {
            setPilotId(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilote" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les pilotes</SelectItem>
            {pilots.map((pilot) => (
              <SelectItem key={pilot.id} value={pilot.id}>
                {pilot.callsign ?? pilot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={outcome}
          onValueChange={(value) => {
            setOutcome(value as Outcome | "all");
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Résultat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les résultats</SelectItem>
            {OUTCOMES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.short}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(value) => setSort(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Tri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="duration">Durée</SelectItem>
            <SelectItem value="game">Simulateur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {data?.items.length ? (
          data.items.map((flight) => (
            <FlightCard key={flight.id} href={`/flights/${flight.id}`} flight={flight} />
          ))
        ) : (
          <p className="text-sm text-ink-secondary">Aucun vol pour ces filtres.</p>
        )}
      </div>

      {data && data.pageCount > 1 ? (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Précédent
          </Button>
          <p className="font-mono text-xs text-ink-muted">
            {data.page} / {data.pageCount}
          </p>
          <Button
            variant="secondary"
            disabled={page >= data.pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Suivant
          </Button>
        </div>
      ) : null}
    </div>
  );
}
