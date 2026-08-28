"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

export default function NewSquadronPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const created = await apiFetch<{ id: string }>("/api/squadrons", {
        method: "POST",
        body: JSON.stringify({ name, tag: tag || null }),
      });
      toast.success("Escadrille créée");
      router.push(`/squadrons/${created.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  return (
    <form className="mx-auto max-w-md space-y-4 fade-in" onSubmit={(event) => void onSubmit(event)}>
      <Breadcrumbs
        items={[
          { label: "Escadrilles", href: "/squadrons" },
          { label: "Nouvelle" },
        ]}
      />
      <p className="overline overline-amber">Opérations / Escadrilles</p>
      <h1 className="mt-1 text-h1 text-ink-primary">Nouvelle escadrille</h1>
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
      <Button type="submit" className="w-full">
        Créer
      </Button>
    </form>
  );
}
