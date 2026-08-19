"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/icon-picker";
import { apiFetch } from "@/lib/api";

export default function NewSquadronPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [icon, setIcon] = useState("shield");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const created = await apiFetch<{ id: string }>("/api/squadrons", {
        method: "POST",
        body: JSON.stringify({ name, tag: tag || null, icon }),
      });
      toast.success("Escadrille créée");
      router.push(`/squadrons/${created.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  return (
    <form className="mx-auto max-w-md space-y-4 fade-in" onSubmit={(event) => void onSubmit(event)}>
      <h1 className="font-display text-2xl uppercase tracking-wider text-accent-primary">
        Nouvelle escadrille
      </h1>
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tag">Tag</Label>
        <Input
          id="tag"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          placeholder="[501st]"
        />
      </div>
      <div className="space-y-2">
        <Label>Insigne</Label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>
      <Button type="submit" className="w-full">
        Créer
      </Button>
    </form>
  );
}
