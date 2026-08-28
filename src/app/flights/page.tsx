"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Game, Outcome } from "@/lib/constants";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function onImport(file: File) {
    setImporting(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/flights/import", {
        method: "POST",
        body: form,
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; created?: number; skipped?: number }
        | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? "Import impossible");
      }
      toast.success(
        `${payload?.created ?? 0} vol(s) importé(s)` +
          (payload?.skipped ? `, ${payload.skipped} déjà présent(s)` : ""),
      );
      setPage(1);
      const params = new URLSearchParams();
      params.set("sort", sort);
      params.set("page", "1");
      const refreshed = await apiFetch<FlightsResponse>(`/api/flights?${params.toString()}`);
      setData(refreshed);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import impossible");
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs items={[{ label: "Vols" }]} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="overline overline-amber">Opérations / Vols</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Vols</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-secondary">
            Exporte le carnet en CSV (à garder hors du serveur). Après un rebuild
            Apply.Build, réimporte ce fichier pour restaurer les vols.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href="/api/flights/export">Exporter CSV</a>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? "Import…" : "Importer CSV"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void onImport(file);
              }
            }}
          />
        </div>
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
          <p className="text-caption text-ink-muted">
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
