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

type Squadron = { id: string; name: string; tag: string | null };

export default function NewPilotPage() {
  const router = useRouter();
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [name, setName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [squadronId, setSquadronId] = useState("");

  useEffect(() => {
    void apiFetch<Squadron[]>("/api/squadrons").then(setSquadrons);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await apiFetch("/api/pilots", {
        method: "POST",
        body: JSON.stringify({
          name,
          callsign: callsign || null,
          squadronId,
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
      <h1 className="font-display text-2xl tracking-wider">Nouveau pilote</h1>
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
