"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";
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

type Squadron = { id: string; name: string; tag: string | null };

export default function NewPilotPage() {
  const router = useRouter();
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [name, setName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [pin, setPin] = useState("");
  const [squadronId, setSquadronId] = useState("");

  useEffect(() => {
    void apiFetch<Squadron[]>("/api/squadrons").then(setSquadrons);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pin && !/^\d{4}$/.test(pin)) {
      toast.error("PIN : 4 chiffres ou vide");
      return;
    }
    try {
      await apiFetch("/api/pilots", {
        method: "POST",
        body: JSON.stringify({
          name,
          callsign: callsign || null,
          squadronId,
          pin: pin || null,
        }),
      });
      toast.success("Pilote créé");
      router.push("/pilots");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  return (
    <form className="mx-auto max-w-md space-y-4 fade-in" onSubmit={(event) => void onSubmit(event)}>
      <Breadcrumbs
        items={[
          { label: "Pilotes", href: "/pilots" },
          { label: "Nouveau" },
        ]}
      />
      <p className="overline overline-amber">Ops / Pilots</p>
      <h1 className="mt-1 text-h1 text-ink-primary">Nouveau pilote</h1>
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="callsign">Callsign</Label>
        <Input
          id="callsign"
          value={callsign}
          onChange={(event) => setCallsign(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pin">PIN optionnel</Label>
        <Input
          id="pin"
          inputMode="numeric"
          maxLength={4}
          placeholder="4 chiffres"
          value={pin}
          onChange={(event) =>
            setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Escadrille</Label>
        <Select value={squadronId || undefined} onValueChange={setSquadronId}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une escadrille" />
          </SelectTrigger>
          <SelectContent>
            {squadrons.map((squadron) => (
              <SelectItem key={squadron.id} value={squadron.id}>
                {squadron.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={!squadronId}>
        Créer
      </Button>
    </form>
  );
}
