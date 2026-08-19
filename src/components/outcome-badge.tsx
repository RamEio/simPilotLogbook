import type { Game, Outcome } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { outcomeMeta } from "@/lib/constants";

const styles: Record<Outcome, string> = {
  SUCCESS: "border-outcome-success bg-outcome-success text-white",
  PARTIAL_AIRCRAFT:
    "border-outcome-partial bg-outcome-partial text-white",
  PARTIAL_PILOT:
    "border-outcome-partial bg-outcome-partial text-white",
  FAILURE: "border-outcome-failure bg-outcome-failure text-white",
  TOTAL_FAILURE:
    "border-outcome-total-failure bg-outcome-total-failure text-white",
};

export function OutcomeBadge({ outcome }: { outcome: string }) {
  const meta = outcomeMeta(outcome);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        styles[outcome as Outcome] ?? styles.SUCCESS,
      )}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.short}
    </span>
  );
}
