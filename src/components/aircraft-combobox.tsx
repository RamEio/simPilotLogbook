"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AircraftOption = {
  id: string;
  name: string;
  isCustom: boolean;
};

export function AircraftCombobox({
  aircraft,
  value,
  onChange,
  disabled,
}: {
  aircraft: AircraftOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const selected = aircraft.find((item) => item.id === value);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return aircraft.slice(0, 12);
    }
    return aircraft
      .filter((item) => item.name.toLowerCase().includes(needle))
      .slice(0, 12);
  }, [aircraft, query]);

  return (
    <div className="relative">
      <Input
        value={query}
        disabled={disabled}
        placeholder={disabled ? "Choisir un simulateur d'abord" : "Rechercher un appareil"}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          onChange("");
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && !disabled && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-line-default bg-bg-card shadow-level-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-muted">Aucun appareil</li>
          ) : (
            filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg-hover",
                    item.id === value && "text-crimson-600",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(item.id);
                    setQuery(item.name);
                    setOpen(false);
                  }}
                >
                  <span>{item.name}</span>
                  {item.isCustom ? (
                    <span className="text-[10px] uppercase tracking-overline text-ink-muted">
                      custom
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
