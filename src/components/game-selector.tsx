"use client";

import type { Game } from "@/lib/constants";
import { GAMES } from "@/lib/constants";
import { GameIcon } from "@/components/icons/game-icons";
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
              "rounded-md border px-3 py-3 text-left text-sm transition-colors duration-200",
              selected
                ? "border-accent-green bg-accent-green/10 text-accent-green shadow-glow"
                : "border-line-muted bg-bg-elevated text-ink-secondary hover:border-accent-green",
            )}
          >
            <GameIcon game={game.value} className="mx-auto h-5 w-5" />
            <span className="mt-1 font-display text-xs tracking-wider">
              {game.short}
            </span>
          </button>
        );
      })}
    </div>
  );
}
