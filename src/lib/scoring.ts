/** Kill categories and scoring rules (club points). */

export const KILL_CATEGORIES = [
  {
    key: "killsAir",
    csv: "kills_air",
    label: "Aérien",
    short: "Air",
    points: 5,
  },
  {
    key: "killsNaval",
    csv: "kills_naval",
    label: "Naval",
    short: "Naval",
    points: 4,
  },
  {
    key: "killsGround",
    csv: "kills_ground",
    label: "Sol",
    short: "Sol",
    points: 3,
  },
  {
    key: "killsBuilding",
    csv: "kills_building",
    label: "Building",
    short: "Bldg",
    points: 2,
  },
] as const;

export type KillCategoryKey = (typeof KILL_CATEGORIES)[number]["key"];

export type KillCounts = Record<KillCategoryKey, number>;

export const EMPTY_KILLS: KillCounts = {
  killsAir: 0,
  killsNaval: 0,
  killsGround: 0,
  killsBuilding: 0,
};

/** 1 hour of flight = 1 point (duration stored in minutes). */
export const POINTS_PER_FLIGHT_HOUR = 1;

export function flightKillPoints(kills: KillCounts): number {
  return KILL_CATEGORIES.reduce(
    (sum, cat) => sum + (kills[cat.key] ?? 0) * cat.points,
    0,
  );
}

export function flightHourPoints(durationMinutes: number): number {
  return (durationMinutes / 60) * POINTS_PER_FLIGHT_HOUR;
}

export function flightTotalPoints(
  kills: KillCounts,
  durationMinutes: number,
): number {
  return flightKillPoints(kills) + flightHourPoints(durationMinutes);
}

export function sumKillCounts(rows: KillCounts[]): KillCounts {
  return rows.reduce(
    (acc, row) => ({
      killsAir: acc.killsAir + row.killsAir,
      killsNaval: acc.killsNaval + row.killsNaval,
      killsGround: acc.killsGround + row.killsGround,
      killsBuilding: acc.killsBuilding + row.killsBuilding,
    }),
    { ...EMPTY_KILLS },
  );
}

export const POINTS_RULES_LABEL =
  "Aérien 5 · Naval 4 · Sol 3 · Building 2 · 1 h de vol 1";
