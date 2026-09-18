import { GAMES, GAME_VALUES, type Game } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type ActivityCell = {
  date: string;
  flights: number;
  minutes: number;
  game: Game | null;
};

export type ActivityCalendar = {
  from: string;
  to: string;
  cells: ActivityCell[];
  totals: { activeDays: number; flights: number };
  streak: { current: number; longest: number };
  usedGames: Game[];
};

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

function consecutiveStreaks(sortedKeys: string[]): {
  current: number;
  longest: number;
} {
  if (sortedKeys.length === 0) {
    return { current: 0, longest: 0 };
  }
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedKeys.length; i += 1) {
    const prev = sortedKeys[i - 1];
    const expected = addUtcDays(prev, 1);
    if (sortedKeys[i] === expected) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  let current = 1;
  for (let i = sortedKeys.length - 2; i >= 0; i -= 1) {
    if (addUtcDays(sortedKeys[i], 1) === sortedKeys[i + 1]) {
      current += 1;
    } else {
      break;
    }
  }
  return { current, longest };
}

function asGame(value: string): Game | null {
  return GAME_VALUES.includes(value as Game) ? (value as Game) : null;
}

function dominantGame(minutesByGame: Map<string, number>): Game | null {
  let best: Game | null = null;
  let bestMinutes = 0;
  for (const item of GAMES) {
    const minutes = minutesByGame.get(item.value) ?? 0;
    if (minutes > bestMinutes) {
      best = item.value;
      bestMinutes = minutes;
    }
  }
  return best;
}

export async function getActivityCalendar(options?: {
  pilotId?: string;
  days?: number;
}): Promise<ActivityCalendar> {
  const days = options?.days ?? 365;
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  from.setUTCHours(0, 0, 0, 0);

  const flights = await prisma.flight.findMany({
    where: {
      date: { gte: from },
      ...(options?.pilotId ? { pilotId: options.pilotId } : {}),
    },
    select: { date: true, duration: true, game: true },
  });

  const byDay = new Map<
    string,
    { flights: number; minutes: number; minutesByGame: Map<string, number> }
  >();
  for (const flight of flights) {
    const key = toDateKey(flight.date);
    const cell = byDay.get(key) ?? {
      flights: 0,
      minutes: 0,
      minutesByGame: new Map<string, number>(),
    };
    cell.flights += 1;
    cell.minutes += flight.duration;
    const game = asGame(flight.game);
    if (game) {
      cell.minutesByGame.set(
        game,
        (cell.minutesByGame.get(game) ?? 0) + flight.duration,
      );
    }
    byDay.set(key, cell);
  }

  const cells: ActivityCell[] = Array.from(byDay.entries())
    .map(([date, cell]) => ({
      date,
      flights: cell.flights,
      minutes: cell.minutes,
      game: dominantGame(cell.minutesByGame),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const used = new Set(cells.map((cell) => cell.game).filter(Boolean) as Game[]);
  const usedGames = GAMES.map((item) => item.value).filter((game) =>
    used.has(game),
  );

  const sortedKeys = cells.map((cell) => cell.date);
  return {
    from: toDateKey(from),
    to: toDateKey(to),
    cells,
    totals: {
      activeDays: byDay.size,
      flights: flights.length,
    },
    streak: consecutiveStreaks(sortedKeys),
    usedGames,
  };
}
