"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import {
  PILOT_STATUSES,
  type PilotStatus,
} from "@/lib/constants";

type Squadron = { id: string; name: string; tag: string | null };

export function PilotEditForm({
  pilot,
}: {
  pilot: {
    id: string;
    name: string;
    callsign: string | null;
    status: string;
    squadronId: string;
    hasPin: boolean;
  };
}) {
  const router = useRouter();
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [name, setName] = useState(pilot.name);
  const [callsign, setCallsign] = useState(pilot.callsign ?? "");
  const [status, setStatus] = useState<PilotStatus>(
    (PILOT_STATUSES.find((item) => item.value === pilot.status)?.value ??
      "ACTIVE") as PilotStatus,
  );
  const [squadronId, setSquadronId] = useState(pilot.squadronId);
  const [pin, setPin] = useState("");
  const [clearPin, setClearPin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void apiFetch<Squadron[]>("/api/squadrons").then(setSquadrons);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pin && !/^\d{4}$/.test(pin)) {
      toast.error("PIN : 4 chiffres ou vide");
      return;
    }

    setSaving(true);
    try {
      await apiFetch(`/api/pilots/${pilot.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          callsign: callsign || null,
          status,
          squadronId,
          pin: pin || undefined,
          clearPin: clearPin || undefined,
        }),
      });
      toast.success("Pilote mis à jour");
      setPin("");
      setClearPin(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as PilotStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {PILOT_STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pilot-name">Nom</Label>
          <Input
            id="pilot-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pilot-callsign">Indicatif</Label>
          <Input
            id="pilot-callsign"
            value={callsign}
            onChange={(event) => setCallsign(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label required>Escadrille</Label>
        <Select value={squadronId} onValueChange={setSquadronId}>
          <SelectTrigger>
            <SelectValue placeholder="Escadrille" />
          </SelectTrigger>
          <SelectContent>
            {squadrons.map((squadron) => (
              <SelectItem key={squadron.id} value={squadron.id}>
                {squadron.tag ? `${squadron.tag} ` : ""}
                {squadron.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pilot-pin">
          PIN {pilot.hasPin ? "(laisser vide pour conserver)" : "(optionnel)"}
        </Label>
        <Input
          id="pilot-pin"
          inputMode="numeric"
          maxLength={4}
          placeholder="4 chiffres"
          value={pin}
          disabled={clearPin}
          onChange={(event) =>
            setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
          }
        />
        <p className="text-caption text-ink-muted">
          Ce code PIN protège les changements de statut. Laissez vide si
          inutile.
        </p>
        {pilot.hasPin ? (
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={clearPin}
              onChange={(event) => {
                setClearPin(event.target.checked);
                if (event.target.checked) {
                  setPin("");
                }
              }}
            />
            Supprimer le PIN
          </label>
        ) : null}
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer le statut"}
      </Button>
    </form>
  );
}
