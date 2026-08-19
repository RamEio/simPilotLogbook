"use client";

import { SQUADRON_ICONS } from "@/components/icons/squadron-icons";
import { cn } from "@/lib/utils";

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {SQUADRON_ICONS.map((entry) => {
        const selected = value === entry.value;
        return (
          <button
            key={entry.value}
            type="button"
            onClick={() => onChange(entry.value)}
            title={entry.label}
            className={cn(
              "flex flex-col items-center gap-1 rounded-sm border-2 px-2 py-3 transition-colors duration-200",
              selected
                ? "border-accent-primary bg-accent-primary/10 text-accent-primary shadow-glow"
                : "border-line-muted bg-bg-elevated text-ink-secondary hover:border-accent-primary hover:text-ink-primary",
            )}
          >
            <entry.Icon className="h-6 w-6" />
            <span className="text-[10px] uppercase tracking-wider">
              {entry.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
