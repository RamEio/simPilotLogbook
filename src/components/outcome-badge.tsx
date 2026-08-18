import type { Game, Outcome } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { outcomeMeta } from "@/lib/constants";

const styles: Record<Outcome, string> = {
  SUCCESS: "border-outcome-success/50 bg-outcome-success/10 text-outcome-success",
  PARTIAL_AIRCRAFT:
    "border-outcome-partial/50 bg-outcome-partial/10 text-outcome-partial",
  PARTIAL_PILOT:
    "border-outcome-partial/50 bg-outcome-partial/10 text-outcome-partial",
  FAILURE: "border-outcome-failure/50 bg-outcome-failure/10 text-outcome-failure",
  TOTAL_FAILURE:
    "border-outcome-total-failure bg-outcome-total-failure/40 text-red-200",
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
