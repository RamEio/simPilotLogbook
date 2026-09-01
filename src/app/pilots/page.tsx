"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PilotRow } from "@/components/pilot-row";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { PILOT_STATUSES, type PilotStatus } from "@/lib/constants";

type PilotListItem = {
  id: string;
  name: string;
  callsign: string | null;
  status: string;
  squadron: { name: string; tag: string | null };
  _count?: { flights: number };
};

type SortValue = "name" | "createdAt" | "status";

export default function PilotsPage() {
  const [pilots, setPilots] = useState<PilotListItem[]>([]);
  const [status, setStatus] = useState<PilotStatus | "all">("all");
  const [sort, setSort] = useState<SortValue>("name");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    params.set("sort", sort);
    setLoading(true);
    void apiFetch<PilotListItem[]>(`/api/pilots?${params.toString()}`)
      .then(setPilots)
      .finally(() => setLoading(false));
  }, [status, sort]);

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs items={[{ label: "Pilotes" }]} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="overline overline-amber">Opérations / Pilotes</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Pilotes</h1>
        </div>
        <Button asChild>
          <Link href="/pilots/new">Créer</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:max-w-md">
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as PilotStatus | "all")}
        >
          <SelectTrigger className="min-h-11">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {PILOT_STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(value) => setSort(value as SortValue)}
        >
          <SelectTrigger className="min-h-11">
            <SelectValue placeholder="Tri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="createdAt">Date de création</SelectItem>
            <SelectItem value="status">Statut</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <p className="text-sm text-ink-secondary">Chargement…</p>
        ) : pilots.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Aucun pilote pour ces filtres.
          </p>
        ) : (
          pilots.map((pilot) => (
            <PilotRow
              key={pilot.id}
              href={`/pilots/${pilot.id}`}
              pilot={{
                id: pilot.id,
                name: pilot.name,
                callsign: pilot.callsign,
                status: pilot.status,
                squadronName: pilot.squadron.tag ?? pilot.squadron.name,
                flightCount: pilot._count?.flights,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
