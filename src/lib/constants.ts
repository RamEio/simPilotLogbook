export const GAME_VALUES = [
  "IL2_GB",
  "IL2_KOREA",
  "DCS",
  "STAR_CITIZEN",
  "MSFS",
] as const;

export type Game = (typeof GAME_VALUES)[number];

export const OUTCOME_VALUES = [
  "SUCCESS",
  "PARTIAL_AIRCRAFT",
  "PARTIAL_PILOT",
  "FAILURE",
  "TOTAL_FAILURE",
] as const;

export type Outcome = (typeof OUTCOME_VALUES)[number];

export const GAMES: { value: Game; label: string; short: string }[] = [
  { value: "IL2_GB", label: "IL-2 Great Battles", short: "IL-2 GB" },
  { value: "IL2_KOREA", label: "IL-2 Korea", short: "IL-2 Korea" },
  { value: "DCS", label: "DCS World", short: "DCS" },
  { value: "STAR_CITIZEN", label: "Star Citizen", short: "Star Citizen" },
  { value: "MSFS", label: "Microsoft Flight Simulator", short: "MSFS" },
];

export const OUTCOMES: {
  value: Outcome;
  label: string;
  short: string;
  icon: string;
}[] = [
  { value: "SUCCESS", label: "Réussite totale", short: "Succès", icon: "✅" },
  {
    value: "PARTIAL_AIRCRAFT",
    label: "Réussite partielle — avion détruit",
    short: "Partiel",
    icon: "⚠️",
  },
  {
    value: "PARTIAL_PILOT",
    label: "Réussite partielle — pilote abattu",
    short: "Partiel",
    icon: "⚠️",
  },
  { value: "FAILURE", label: "Échec", short: "Échec", icon: "❌" },
  {
    value: "TOTAL_FAILURE",
    label: "Échec total",
    short: "Échec tot.",
    icon: "💀",
  },
];

export const PILOT_STATUSES = [
  { value: "ALIVE", label: "Vivant", short: "Vivant" },
  { value: "OUT_OF_COMBAT", label: "Hors de combat", short: "H.C." },
] as const;

export type PilotStatus = (typeof PILOT_STATUSES)[number]["value"];

export function pilotStatusMeta(status: string) {
  return PILOT_STATUSES.find((s) => s.value === status) ?? PILOT_STATUSES[0];
}

export const MISSION_TYPES = [
  "CAP",
  "CAS",
  "Escorte",
  "Interception",
  "Transport",
  "Bombardement",
  "Patrouille",
  "Autre",
] as const;

export type MissionType = (typeof MISSION_TYPES)[number];

export function gameLabel(game: string): string {
  return GAMES.find((item) => item.value === game)?.short ?? game;
}

export function outcomeMeta(outcome: string) {
  return OUTCOMES.find((item) => item.value === outcome) ?? OUTCOMES[0];
}
