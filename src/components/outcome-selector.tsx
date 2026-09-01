"use client";

import type { Outcome } from "@/lib/constants";
import { OUTCOMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OutcomeSelector({
  value,
  onChange,
  invalid,
}: {
  value: Outcome | "";
  onChange: (outcome: Outcome) => void;
  invalid?: boolean;
}) {
  return (
    <div
      className="grid gap-2 sm:grid-cols-2"
      aria-invalid={invalid || undefined}
    >
      {OUTCOMES.map((outcome) => {
        const selected = value === outcome.value;
        return (
          <button
            key={outcome.value}
            type="button"
            onClick={() => onChange(outcome.value)}
            className={cn(
              "rounded border px-3 py-3 text-left transition-colors duration-200",
              selected
                ? "border-crimson-600 bg-crimson-600/10"
                : invalid
                  ? "border-status-error bg-bg-elevated hover:border-status-error hover:bg-bg-hover"
                  : "border-line-default bg-bg-elevated hover:border-line-strong hover:bg-bg-hover",
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
