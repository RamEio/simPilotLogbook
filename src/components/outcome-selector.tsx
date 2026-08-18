"use client";

import type { Outcome } from "@/lib/constants";
import { OUTCOMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OutcomeSelector({
  value,
  onChange,
}: {
  value: Outcome | "";
  onChange: (outcome: Outcome) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {OUTCOMES.map((outcome) => {
        const selected = value === outcome.value;
        return (
          <button
            key={outcome.value}
            type="button"
            onClick={() => onChange(outcome.value)}
            className={cn(
              "rounded-md border px-3 py-3 text-left transition-colors duration-200",
              selected
                ? "border-accent-green bg-accent-green/10"
                : "border-line-muted bg-bg-elevated hover:border-line-accent",
            )}
          >
            <p className="text-sm text-ink-primary">
              {outcome.icon} {outcome.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
