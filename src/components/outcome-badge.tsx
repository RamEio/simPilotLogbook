import type { Outcome } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { outcomeMeta } from "@/lib/constants";

const styles: Record<Outcome, string> = {
  SUCCESS:
    "border-status-success/30 bg-status-success/15 text-status-success",
  PARTIAL_AIRCRAFT:
    "border-status-warning/30 bg-status-warning/15 text-status-warning",
  PARTIAL_PILOT:
    "border-status-warning/30 bg-status-warning/15 text-status-warning",
  FAILURE: "border-status-error/30 bg-status-error/15 text-status-error",
  TOTAL_FAILURE:
    "border-crimson-900/40 bg-crimson-900/40 text-crimson-400",
};

export function OutcomeBadge({ outcome }: { outcome: string }) {
  const meta = outcomeMeta(outcome);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-overline font-medium uppercase tracking-overline",
        styles[outcome as Outcome] ?? styles.SUCCESS,
      )}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.short}
    </span>
  );
}
