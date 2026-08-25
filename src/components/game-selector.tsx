"use client";

import type { Game } from "@/lib/constants";
import { GAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function GameSelector({
  value,
  onChange,
}: {
  value: Game | "";
  onChange: (game: Game) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {GAMES.map((game) => {
        const selected = value === game.value;
        return (
          <button
            key={game.value}
            type="button"
            onClick={() => onChange(game.value)}
            className={cn(
              "rounded border px-3 py-3 text-left text-sm transition-colors duration-200",
              selected
                ? "border-crimson-600 bg-crimson-600/10 text-crimson-600"
                : "border-line-default bg-bg-elevated text-ink-secondary hover:border-line-strong hover:bg-bg-hover",
            )}
          >
            <span className="text-xs font-semibold tracking-overline">
              {game.short}
            </span>
          </button>
        );
      })}
    </div>
  );
}
