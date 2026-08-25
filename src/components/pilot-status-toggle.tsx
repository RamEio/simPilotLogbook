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
  const isActive = status !== "OUT_OF_ACTION";

  async function toggle() {
    try {
      await apiFetch(`/api/pilots/${pilotId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: isActive ? "OUT_OF_ACTION" : "ACTIVE",
        }),
      });
      toast.success(isActive ? "Pilote hors comb." : "Pilote de retour");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      title={isActive ? "Mettre hors de combat" : "Remettre en service"}
      className={cn(
        "rounded px-2 py-1 text-overline font-medium uppercase tracking-overline transition-colors",
        isActive
          ? "border border-status-success/40 text-status-success hover:bg-status-success/10"
          : "border border-status-error/40 text-status-error hover:bg-status-error/10",
      )}
    >
      {isActive ? "Actif" : "Hors comb."}
    </button>
  );
}
