import type { Game } from "@/lib/constants";

export const LOG_DEFAULTS_KEY = "spl-log-defaults";

export type LogDefaults = {
  squadronId?: string;
  pilotId?: string;
  game?: Game;
};

export function readLogDefaults(): LogDefaults {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOG_DEFAULTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LogDefaults;
  } catch {
    return {};
  }
}
