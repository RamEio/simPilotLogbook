"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Game, Outcome } from "@/lib/constants";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { AircraftCombobox, type AircraftOption } from "@/components/aircraft-combobox";
import { AuthPinPanel } from "@/components/auth-pin-panel";
import { DurationInput, durationToMinutes } from "@/components/duration-input";
import { GameSelector } from "@/components/game-selector";
import { OutcomeSelector } from "@/components/outcome-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { MISSION_TYPES } from "@/lib/constants";

type Squadron = { id: string; name: string; tag: string | null };
type Pilot = {
  id: string;
  name: string;
  callsign: string | null;
  squadronId: string;
  hasPin?: boolean;
};

export type FlightFormInitial = {
  id: string;
  squadronId: string;
  pilotId: string;
  game: Game;
  aircraftId: string;
  duration: number;
  missionName: string | null;
  missionType: string | null;
  outcome: Outcome;
  notes: string | null;
};

export function FlightForm({
  mode,
  initial,
  breadcrumbs,
}: {
  mode: "create" | "edit";
  initial?: FlightFormInitial;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const router = useRouter();
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [aircraft, setAircraft] = useState<AircraftOption[]>([]);
  const [squadronId, setSquadronId] = useState(initial?.squadronId ?? "");
  const [pilotId, setPilotId] = useState(initial?.pilotId ?? "");
  const [game, setGame] = useState<Game | "">(initial?.game ?? "");
  const [aircraftId, setAircraftId] = useState(initial?.aircraftId ?? "");
  const [hours, setHours] = useState(
    initial ? Math.floor(initial.duration / 60) : 1,
  );
  const [minutes, setMinutes] = useState(initial ? initial.duration % 60 : 0);
  const [missionName, setMissionName] = useState(initial?.missionName ?? "");
  const [missionType, setMissionType] = useState(initial?.missionType ?? "");
  const [outcome, setOutcome] = useState<Outcome | "">(initial?.outcome ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(mode === "create");
  const [verifiedPilotId, setVerifiedPilotId] = useState<string | null>(
    mode === "edit" ? initial?.pilotId ?? null : null,
  );
  const [pinOpen, setPinOpen] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pendingPilotId, setPendingPilotId] = useState<string | null>(null);

  const [squadronOpen, setSquadronOpen] = useState(false);
  const [pilotOpen, setPilotOpen] = useState(false);
  const [aircraftOpen, setAircraftOpen] = useState(false);
  const [newSquadronName, setNewSquadronName] = useState("");
  const [newSquadronTag, setNewSquadronTag] = useState("");
  const [newPilotName, setNewPilotName] = useState("");
  const [newPilotCallsign, setNewPilotCallsign] = useState("");
  const [newPilotPin, setNewPilotPin] = useState("");
  const [newAircraftName, setNewAircraftName] = useState("");

  useEffect(() => {
    void apiFetch<Squadron[]>("/api/squadrons").then(setSquadrons);
  }, []);

  useEffect(() => {
    if (!squadronId) {
      setPilots([]);
      if (hydrated) {
        setPilotId("");
      }
      return;
    }
    void apiFetch<Pilot[]>(`/api/pilots?squadronId=${squadronId}`).then(
      (items) => {
        setPilots(items);
        if (hydrated) {
          setPilotId("");
          setVerifiedPilotId(null);
        }
      },
    );
  }, [squadronId, hydrated]);

  useEffect(() => {
    if (!game) {
      setAircraft([]);
      if (hydrated) {
        setAircraftId("");
      }
      return;
    }
    void apiFetch<AircraftOption[]>(`/api/aircraft?game=${game}`).then(
      (items) => {
        setAircraft(items);
        if (hydrated) {
          setAircraftId("");
        }
      },
    );
  }, [game, hydrated]);

  useEffect(() => {
    if (mode === "edit" && initial) {
      const timer = window.setTimeout(() => setHydrated(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [mode, initial]);

  function requestPilotChange(nextPilotId: string) {
    const pilot = pilots.find((item) => item.id === nextPilotId);
    if (pilot?.hasPin && verifiedPilotId !== nextPilotId) {
      setPendingPilotId(nextPilotId);
      setPinError(null);
      setPinOpen(true);
      return;
    }
    setPilotId(nextPilotId);
    setVerifiedPilotId(pilot?.hasPin ? nextPilotId : nextPilotId);
  }

  async function verifyPin(pin: string) {
    if (!pendingPilotId) {
      return;
    }
    try {
      await apiFetch("/api/pilots/verify-pin", {
        method: "POST",
        body: JSON.stringify({ pilotId: pendingPilotId, pin }),
      });
      setPilotId(pendingPilotId);
      setVerifiedPilotId(pendingPilotId);
      setPendingPilotId(null);
      setPinOpen(false);
      setPinError(null);
      toast.success("PIN validé");
    } catch (error) {
      setPinError(error instanceof Error ? error.message : "PIN incorrect");
    }
  }

  async function createSquadron() {
    try {
      const created = await apiFetch<Squadron>("/api/squadrons", {
        method: "POST",
        body: JSON.stringify({
          name: newSquadronName,
          tag: newSquadronTag || null,
        }),
      });
      setSquadrons((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSquadronId(created.id);
      setSquadronOpen(false);
      setNewSquadronName("");
      setNewSquadronTag("");
      toast.success("Escadrille créée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  async function createPilot() {
    if (!squadronId) {
      toast.error("Choisis une escadrille d'abord");
      return;
    }
    if (newPilotPin && !/^\d{4}$/.test(newPilotPin)) {
      toast.error("PIN : 4 chiffres ou vide");
      return;
    }
    try {
      const created = await apiFetch<Pilot>("/api/pilots", {
        method: "POST",
        body: JSON.stringify({
          name: newPilotName,
          callsign: newPilotCallsign || null,
          squadronId,
          pin: newPilotPin || null,
        }),
      });
      setPilots((current) => [...current, created]);
      setPilotId(created.id);
      setVerifiedPilotId(created.id);
      setPilotOpen(false);
      setNewPilotName("");
      setNewPilotCallsign("");
      setNewPilotPin("");
      toast.success("Pilote créé");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  async function createAircraft() {
    if (!game) {
      toast.error("Choisis un simulateur d'abord");
      return;
    }
    try {
      const created = await apiFetch<AircraftOption>("/api/aircraft", {
        method: "POST",
        body: JSON.stringify({ name: newAircraftName, game }),
      });
      setAircraft((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setAircraftId(created.id);
      setAircraftOpen(false);
      setNewAircraftName("");
      toast.success("Appareil ajouté");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const duration = durationToMinutes(hours, minutes);
    if (!squadronId || !pilotId || !game || !aircraftId || !outcome || duration <= 0) {
      toast.error("Complète les champs obligatoires");
      return;
    }

    const selected = pilots.find((item) => item.id === pilotId);
    if (selected?.hasPin && verifiedPilotId !== pilotId) {
      setPendingPilotId(pilotId);
      setPinError(null);
      setPinOpen(true);
      toast.error("Valide le PIN du pilote");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        squadronId,
        pilotId,
        game,
        aircraftId,
        duration,
        missionName: missionName || null,
        missionType: missionType || null,
        outcome,
        notes: notes || null,
      };

      if (mode === "edit" && initial) {
        await apiFetch(`/api/flights/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Vol modifié");
        router.push(`/flights/${initial.id}`);
      } else {
        await apiFetch("/api/flights", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Vol enregistré");
        router.push("/flights");
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible d'enregistrer",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const pendingPilot = pilots.find((item) => item.id === pendingPilotId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 fade-in">
      <Breadcrumbs
        items={
          breadcrumbs ??
          (mode === "edit"
            ? [
                { label: "Vols", href: "/flights" },
                { label: "Modifier" },
              ]
            : [{ label: "Enregistrer un vol" }])
        }
      />
      <div>
        <p className="overline overline-amber">
          {mode === "edit" ? "Ops / Edit Flight" : "Ops / Log"}
        </p>
        <h1 className="mt-1 text-h1 text-ink-primary">
          {mode === "edit" ? "Modifier un vol" : "Enregistrer un vol"}
        </h1>
      </div>

      <form className="space-y-6" onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-2">
          <Label>Escadrille</Label>
          <Select value={squadronId || undefined} onValueChange={setSquadronId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une escadrille" />
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
          {mode === "create" ? (
            <Button
              type="button"
              variant="link"
              className="h-auto px-0"
              onClick={() => setSquadronOpen(true)}
            >
              Créer une escadrille
            </Button>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Pilote</Label>
          <Select
            value={pilotId || undefined}
            onValueChange={requestPilotChange}
            disabled={!squadronId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un pilote" />
            </SelectTrigger>
            <SelectContent>
              {pilots.map((pilot) => (
                <SelectItem key={pilot.id} value={pilot.id}>
                  {pilot.callsign ?? pilot.name}
                  {pilot.hasPin ? " · PIN" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mode === "create" ? (
            <Button
              type="button"
              variant="link"
              className="h-auto px-0"
              onClick={() => setPilotOpen(true)}
            >
              Créer un pilote
            </Button>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Simulateur</Label>
          <GameSelector value={game} onChange={setGame} />
        </div>

        <div className="space-y-2">
          <Label>Avion</Label>
          <AircraftCombobox
            key={`${game || "none"}-${aircraftId || "empty"}`}
            aircraft={aircraft}
            value={aircraftId}
            onChange={setAircraftId}
            disabled={!game}
          />
          <Button
            type="button"
            variant="link"
            className="h-auto px-0"
            onClick={() => setAircraftOpen(true)}
          >
            Avion manquant ?
          </Button>
        </div>

        <DurationInput
          hours={hours}
          minutes={minutes}
          onChange={(nextHours, nextMinutes) => {
            setHours(nextHours);
            setMinutes(nextMinutes);
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="missionName">Nom de mission</Label>
            <Input
              id="missionName"
              value={missionName}
              onChange={(event) => setMissionName(event.target.value)}
              placeholder="CAP Golfe"
            />
          </div>
          <div className="space-y-2">
            <Label>Type de mission</Label>
            <Select
              value={missionType || undefined}
              onValueChange={setMissionType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {MISSION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Résultat</Label>
          <OutcomeSelector value={outcome} onChange={setOutcome} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optionnel"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting
            ? "Enregistrement..."
            : mode === "edit"
              ? "Enregistrer les modifications"
              : "Enregistrer le vol"}
        </Button>
      </form>

      <Dialog
        open={pinOpen}
        onOpenChange={(open) => {
          setPinOpen(open);
          if (!open) {
            setPendingPilotId(null);
            setPinError(null);
          }
        }}
      >
        <DialogContent>
          <AuthPinPanel
            callsign={pendingPilot?.callsign ?? pendingPilot?.name ?? "PILOTE"}
            errorMessage={pinError}
            onSubmit={(pin) => void verifyPin(pin)}
            className="max-w-none border-0 bg-transparent p-0 shadow-none"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={squadronOpen} onOpenChange={setSquadronOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle escadrille</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nom"
              value={newSquadronName}
              onChange={(event) => setNewSquadronName(event.target.value)}
            />
            <Input
              placeholder="Tag optionnel, ex. [501st]"
              value={newSquadronTag}
              onChange={(event) => setNewSquadronTag(event.target.value)}
            />
            <Button className="w-full" onClick={() => void createSquadron()}>
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pilotOpen} onOpenChange={setPilotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau pilote</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nom"
              value={newPilotName}
              onChange={(event) => setNewPilotName(event.target.value)}
            />
            <Input
              placeholder="Callsign optionnel"
              value={newPilotCallsign}
              onChange={(event) => setNewPilotCallsign(event.target.value)}
            />
            <Input
              placeholder="PIN optionnel (4 chiffres)"
              inputMode="numeric"
              maxLength={4}
              value={newPilotPin}
              onChange={(event) =>
                setNewPilotPin(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
            />
            <Button className="w-full" onClick={() => void createPilot()}>
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={aircraftOpen} onOpenChange={setAircraftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un appareil</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nom de l'appareil"
              value={newAircraftName}
              onChange={(event) => setNewAircraftName(event.target.value)}
            />
            <Button className="w-full" onClick={() => void createAircraft()}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
