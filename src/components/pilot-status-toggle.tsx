"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

export function PilotStatusToggle({
  pilotId,
  status,
}: {
  pilotId: string;
  status: string;
}) {
  const router = useRouter();
  const isAlive = status !== "OUT_OF_COMBAT";

  async function toggle() {
    try {
      await apiFetch(`/api/pilots/${pilotId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: isAlive ? "OUT_OF_COMBAT" : "ALIVE",
        }),
      });
      toast.success(isAlive ? "Pilote hors de combat" : "Pilote de retour");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      title={isAlive ? "Mettre hors de combat" : "Remettre en service"}
      className={cn(
        "rounded-sm px-2 py-1 font-display text-[10px] uppercase tracking-wider transition-colors",
        isAlive
          ? "border border-outcome-success text-outcome-success hover:bg-outcome-success/10"
          : "border border-accent-red text-accent-red hover:bg-accent-red/10",
      )}
    >
      {isAlive ? "Vivant" : "H.C."}
    </button>
  );
}
