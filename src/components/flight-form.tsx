"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  GAME_VALUES,
  MISSION_TYPES,
  PILOT_STATUSES,
  type PilotStatus,
} from "@/lib/constants";
import { KILL_CATEGORIES, POINTS_RULES_LABEL, flightTotalPoints } from "@/lib/scoring";
import { cn } from "@/lib/utils";

const LOG_DEFAULTS_KEY = "spl-log-defaults";

type LogDefaults = {
  squadronId?: string;
  pilotId?: string;
  game?: Game;
};

type Squadron = { id: string; name: string; tag: string | null };
type Pilot = {
  id: string;
  name: string;
  callsign: string | null;
  squadronId: string;
  status?: string;
  hasPin?: boolean;
};

type FieldKey =
  | "squadronId"
  | "pilotId"
  | "game"
  | "aircraftId"
  | "duration"
  | "outcome";

type FieldErrors = Partial<Record<FieldKey, string>>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-caption text-status-error" role="alert">
      {message}
    </p>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-line-subtle pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-overline font-medium uppercase tracking-overline text-amber-400">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
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
  const [killsAir, setKillsAir] = useState(initial?.killsAir ?? 0);
  const [killsNaval, setKillsNaval] = useState(initial?.killsNaval ?? 0);
  const [killsGround, setKillsGround] = useState(initial?.killsGround ?? 0);
  const [killsBuilding, setKillsBuilding] = useState(
    initial?.killsBuilding ?? 0,
  );
  const [submitting, setSubmitting] = useState(false);
  const [verifiedPilotId, setVerifiedPilotId] = useState<string | null>(
    mode === "edit" ? initial?.pilotId ?? null : null,
  );
  const [pinOpen, setPinOpen] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pendingPilotId, setPendingPilotId] = useState<string | null>(null);
  const [pinPurpose, setPinPurpose] = useState<"select" | "status">("select");
  const [pendingStatus, setPendingStatus] = useState<PilotStatus | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const [squadronOpen, setSquadronOpen] = useState(false);
  const [pilotOpen, setPilotOpen] = useState(false);
  const [aircraftOpen, setAircraftOpen] = useState(false);
  const [newSquadronName, setNewSquadronName] = useState("");
  const [newSquadronTag, setNewSquadronTag] = useState("");
  const [newPilotName, setNewPilotName] = useState("");
  const [newPilotCallsign, setNewPilotCallsign] = useState("");
  const [newPilotPin, setNewPilotPin] = useState("");
  const [newAircraftName, setNewAircraftName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const defaultsApplied = useRef(false);
  const rememberedPilotId = useRef<string | null>(null);

  function clearFieldError(key: FieldKey) {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  useEffect(() => {
    void apiFetch<Squadron[]>("/api/squadrons").then(setSquadrons);
  }, []);

  useEffect(() => {
    if (mode !== "create" || defaultsApplied.current || squadrons.length === 0) {
      return;
    }
    defaultsApplied.current = true;
    try {
      const raw = window.localStorage.getItem(LOG_DEFAULTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LogDefaults;
      if (
        parsed.squadronId &&
        squadrons.some((squadron) => squadron.id === parsed.squadronId)
      ) {
        setSquadronId(parsed.squadronId);
        rememberedPilotId.current = parsed.pilotId ?? null;
      }
      if (parsed.game && GAME_VALUES.includes(parsed.game)) {
        setGame(parsed.game);
      }
    } catch {
      // ignore corrupt localStorage
    }
  }, [mode, squadrons]);

  useEffect(() => {
    if (!squadronId) {
      setPilots([]);
      return;
    }
    void apiFetch<Pilot[]>(`/api/pilots?squadronId=${squadronId}`).then(
      setPilots,
    );
  }, [squadronId]);

  useEffect(() => {
    if (mode !== "create" || !rememberedPilotId.current || pilots.length === 0) {
      return;
    }
    const remembered = rememberedPilotId.current;
    rememberedPilotId.current = null;
    if (pilots.some((pilot) => pilot.id === remembered)) {
      setPilotId(remembered);
    }
  }, [mode, pilots]);

  useEffect(() => {
    if (!game) {
      setAircraft([]);
      return;
    }
    void apiFetch<AircraftOption[]>(`/api/aircraft?game=${game}`).then(
      setAircraft,
    );
  }, [game]);

  function requestPilotChange(nextPilotId: string) {
    const pilot = pilots.find((item) => item.id === nextPilotId);
    if (pilot?.hasPin && verifiedPilotId !== nextPilotId) {
      setPinPurpose("select");
      setPendingStatus(null);
      setPendingPilotId(nextPilotId);
      setPinError(null);
      setPinOpen(true);
      return;
    }
    setPilotId(nextPilotId);
    setVerifiedPilotId(nextPilotId);
  }

  async function savePilotStatus(id: string, status: PilotStatus) {
    setStatusSaving(true);
    try {
      const updated = await apiFetch<Pilot>(`/api/pilots/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setPilots((current) =>
        current.map((pilot) =>
          pilot.id === id
            ? { ...pilot, status: updated.status ?? status }
            : pilot,
        ),
      );
      toast.success(
        status === "ACTIVE" ? "Pilote passé Actif" : "Pilote hors comb.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible de mettre à jour le statut",
      );
    } finally {
      setStatusSaving(false);
    }
  }

  function requestStatusChange(nextStatus: PilotStatus) {
    if (!pilotId) {
      return;
    }
    const pilot = pilots.find((item) => item.id === pilotId);
    if (!pilot || (pilot.status ?? "ACTIVE") === nextStatus) {
      return;
    }
    if (pilot.hasPin && verifiedPilotId !== pilotId) {
      setPinPurpose("status");
      setPendingStatus(nextStatus);
      setPendingPilotId(pilotId);
      setPinError(null);
      setPinOpen(true);
      return;
    }
    void savePilotStatus(pilotId, nextStatus);
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
      const unlockedId = pendingPilotId;
      setVerifiedPilotId(unlockedId);
      setPinOpen(false);
      setPinError(null);
      setPendingPilotId(null);
      clearFieldError("pilotId");
      toast.success("PIN validé");

      if (pinPurpose === "status" && pendingStatus) {
        const status = pendingStatus;
        setPendingStatus(null);
        setPinPurpose("select");
        await savePilotStatus(unlockedId, status);
      } else {
        setPilotId(unlockedId);
        setPinPurpose("select");
      }
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
      setPilotId("");
      setVerifiedPilotId(null);
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
    const nextErrors: FieldErrors = {};
    if (!squadronId) nextErrors.squadronId = "Sélectionnez une escadrille.";
    if (!pilotId) nextErrors.pilotId = "Sélectionnez un pilote.";
    if (!game) nextErrors.game = "Choisissez un simulateur.";
    if (!aircraftId) nextErrors.aircraftId = "Choisissez un avion.";
    if (duration <= 0) nextErrors.duration = "Indiquez une durée supérieure à 0.";
    if (!outcome) nextErrors.outcome = "Indiquez le résultat du vol.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      toast.error("Corrigez les champs indiqués");
      return;
    }

    const selected = pilots.find((item) => item.id === pilotId);
    if (selected?.hasPin && verifiedPilotId !== pilotId) {
      setPendingPilotId(pilotId);
      setPinError(null);
      setPinOpen(true);
      setFieldErrors({
        pilotId: "Validez le PIN du pilote pour continuer.",
      });
      toast.error("Validez le PIN du pilote");
      return;
    }

    setFieldErrors({});
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
        killsAir,
        killsNaval,
        killsGround,
        killsBuilding,
      };

      if (mode === "edit" && initial) {
        await apiFetch(`/api/flights/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Vol modifié");
        router.push(`/flights/${initial.id}?saved=1`);
      } else {
        await apiFetch("/api/flights", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        try {
          window.localStorage.setItem(
            LOG_DEFAULTS_KEY,
            JSON.stringify({
              squadronId,
              pilotId,
              game,
            } satisfies LogDefaults),
          );
        } catch {
          // ignore quota / private mode
        }
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
  const selectedPilot = pilots.find((item) => item.id === pilotId);
  const estimatedPoints = flightTotalPoints(
    {
      killsAir,
      killsNaval,
      killsGround,
      killsBuilding,
    },
    durationToMinutes(hours, minutes),
  );

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
          {mode === "edit"
            ? "Opérations / Modifier le vol"
            : "Opérations / Journal de vol"}
        </p>
        <h1 className="mt-1 text-h1 text-ink-primary">
          {mode === "edit" ? "Modifier un vol" : "Enregistrer un vol"}
        </h1>
      </div>

      <form className="space-y-6" onSubmit={(event) => void onSubmit(event)}>
        <FormSection title="Qui">
        <div className="space-y-2">
          <Label required>Escadrille</Label>
          <Select
            value={squadronId || undefined}
            onValueChange={(value) => {
              setSquadronId(value);
              setPilotId("");
              setVerifiedPilotId(null);
              clearFieldError("squadronId");
              clearFieldError("pilotId");
            }}
          >
            <SelectTrigger
              aria-invalid={Boolean(fieldErrors.squadronId)}
              aria-describedby={
                fieldErrors.squadronId ? "error-squadronId" : undefined
              }
              className={cn(
                fieldErrors.squadronId && "border-status-error focus:border-status-error",
              )}
            >
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
          <FieldError id="error-squadronId" message={fieldErrors.squadronId} />
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
          <Label required>Pilote</Label>
          <Select
            value={pilotId || undefined}
            onValueChange={(value) => {
              requestPilotChange(value);
              clearFieldError("pilotId");
            }}
            disabled={!squadronId}
          >
            <SelectTrigger
              aria-invalid={Boolean(fieldErrors.pilotId)}
              aria-describedby={
                fieldErrors.pilotId ? "error-pilotId" : undefined
              }
              className={cn(
                fieldErrors.pilotId && "border-status-error focus:border-status-error",
              )}
            >
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
          <FieldError id="error-pilotId" message={fieldErrors.pilotId} />
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

        {selectedPilot ? (
          <div className="space-y-2">
            <Label>Statut du pilote</Label>
            <Select
              value={
                PILOT_STATUSES.some((s) => s.value === selectedPilot.status)
                  ? selectedPilot.status
                  : "ACTIVE"
              }
              onValueChange={(value) =>
                requestStatusChange(value as PilotStatus)
              }
              disabled={statusSaving}
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
            <p className="text-caption text-ink-muted">
              Met à jour le statut du pilote (pas seulement ce vol).
            </p>
          </div>
        ) : null}
        </FormSection>

        <FormSection title="Quoi">
        <div className="space-y-2">
          <Label required>Simulateur</Label>
          <GameSelector
            value={game}
            invalid={Boolean(fieldErrors.game)}
            onChange={(value) => {
              setGame(value);
              setAircraftId("");
              clearFieldError("game");
              clearFieldError("aircraftId");
            }}
          />
          <FieldError id="error-game" message={fieldErrors.game} />
        </div>

        <div className="space-y-2">
          <Label required>Avion</Label>
          <AircraftCombobox
            key={`${game || "none"}-${aircraftId || "empty"}`}
            aircraft={aircraft}
            value={aircraftId}
            invalid={Boolean(fieldErrors.aircraftId)}
            onChange={(value) => {
              setAircraftId(value);
              if (value) clearFieldError("aircraftId");
            }}
            disabled={!game}
          />
          <FieldError id="error-aircraftId" message={fieldErrors.aircraftId} />
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
          error={fieldErrors.duration}
          onChange={(nextHours, nextMinutes) => {
            setHours(nextHours);
            setMinutes(nextMinutes);
            if (durationToMinutes(nextHours, nextMinutes) > 0) {
              clearFieldError("duration");
            }
          }}
        />

        <div className="space-y-2">
          <Label required>Résultat</Label>
          <OutcomeSelector
            value={outcome}
            invalid={Boolean(fieldErrors.outcome)}
            onChange={(value) => {
              setOutcome(value);
              clearFieldError("outcome");
            }}
          />
          <FieldError id="error-outcome" message={fieldErrors.outcome} />
        </div>
        </FormSection>

        <FormSection title="Mission">
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

        <div className="space-y-3">
          <div>
            <Label>Kills (optionnel)</Label>
            <p className="mt-1 text-caption text-ink-muted">{POINTS_RULES_LABEL}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                { key: "killsAir", value: killsAir, set: setKillsAir },
                { key: "killsNaval", value: killsNaval, set: setKillsNaval },
                { key: "killsGround", value: killsGround, set: setKillsGround },
                {
                  key: "killsBuilding",
                  value: killsBuilding,
                  set: setKillsBuilding,
                },
              ] as const
            ).map((field) => {
              const meta = KILL_CATEGORIES.find((c) => c.key === field.key)!;
              return (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-caption">
                    {meta.label}
                    <span className="ml-1 text-ink-muted">({meta.points} pts)</span>
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    min={0}
                    step={1}
                    value={field.value}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      field.set(Number.isFinite(next) && next >= 0 ? next : 0);
                    }}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-sm text-ink-secondary" aria-live="polite">
            Score estimé :{" "}
            <span className="font-medium text-ink-primary">
              {Math.round(estimatedPoints * 10) / 10} pts
            </span>
            <span className="ml-2 text-caption text-ink-muted">
              (kills + durée)
            </span>
          </p>
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
        </FormSection>

        <p className="text-caption text-ink-muted">
          <span className="text-status-error" aria-hidden>
            *
          </span>{" "}
          Champ obligatoire
        </p>

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
            setPendingStatus(null);
            setPinPurpose("select");
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
          {pinPurpose === "status" ? (
            <p className="mt-2 text-caption text-ink-muted">
              PIN requis pour modifier le statut du pilote.
            </p>
          ) : null}
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
              placeholder="Indicatif optionnel"
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
