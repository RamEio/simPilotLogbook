import { prisma } from "@/lib/prisma";
import { flightTotalPoints, roundPoints, type KillCounts } from "@/lib/scoring";

/** No flight for this long resets progress toward the next grade. */
export const GRADE_INACTIVITY_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const INACTIVITY_MS = GRADE_INACTIVITY_DAYS * DAY_MS;

/**
 * v1 ladder. A rank, once reached, is kept.
 * `pointsToNext` is progress since the current rank, not career points.
 */
export const GRADES = [
  { key: "ASPIRANT", label: "Aspirant", pointsToNext: 10 },
  { key: "SOUS_LIEUTENANT", label: "Sous-lieutenant", pointsToNext: 20 },
  { key: "LIEUTENANT", label: "Lieutenant", pointsToNext: 30 },
  { key: "CAPITAINE", label: "Capitaine", pointsToNext: 40 },
  { key: "COMMANDANT", label: "Commandant", pointsToNext: 60 },
  { key: "MAJOR", label: "Major", pointsToNext: null },
] as const;

export type GradeKey = (typeof GRADES)[number]["key"];

export type GradeFlight = KillCounts & {
  date: Date;
  duration: number;
  outcome: string;
};

export type GradeView = {
  key: GradeKey;
  label: string;
  progress: number;
  nextLabel: string | null;
  nextPoints: number | null;
  /** Whole days before the progress reset. Null when no window is open. */
  daysRemaining: number | null;
  paused: boolean;
};

type Evaluated = {
  view: GradeView;
  pausedAt: Date | null;
};

function gradeIndex(key: string): number {
  const index = GRADES.findIndex((grade) => grade.key === key);
  return index < 0 ? 0 : index;
}

export function gradeLabel(key: string): string {
  return GRADES[gradeIndex(key)].label;
}

function asGradeKey(index: number): GradeKey {
  return GRADES[Math.min(index, GRADES.length - 1)].key;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function wholeDaysUntil(deadline: Date, from: Date): number {
  const ms = deadline.getTime() - from.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / DAY_MS);
}

/** Replay flights in order. A gap longer than the inactivity window clears progress only. */
export function walkFlights(flights: GradeFlight[]): {
  gradeIndex: number;
  progress: number;
  deadline: Date | null;
} {
  const ordered = [...flights].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  let index = 0;
  let progress = 0;
  let deadline: Date | null = null;

  for (const flight of ordered) {
    if (deadline && flight.date.getTime() > deadline.getTime()) {
      progress = 0;
    }
    progress = roundPoints(
      progress +
        flightTotalPoints(
          {
            killsAir: flight.killsAir,
            killsNaval: flight.killsNaval,
            killsGround: flight.killsGround,
            killsBuilding: flight.killsBuilding,
          },
          flight.duration,
          flight.outcome,
        ),
    );
    deadline = addDays(flight.date, GRADE_INACTIVITY_DAYS);
    while (index < GRADES.length - 1) {
      const need = GRADES[index].pointsToNext;
      if (need == null || progress < need) break;
      progress = roundPoints(progress - need);
      index += 1;
    }
  }

  return { gradeIndex: index, progress, deadline };
}

function lastFlightDate(flights: GradeFlight[]): Date | null {
  return flights.reduce<Date | null>((latest, flight) => {
    if (!latest || flight.date.getTime() > latest.getTime()) return flight.date;
    return latest;
  }, null);
}

export function evaluateGrade(input: {
  flights: GradeFlight[];
  status: string;
  pausedAt: Date | null;
  pauseMs: number;
  windowFrom: Date | null;
  storedGradeKey: string;
  now: Date;
}): Evaluated & { pauseMs: number; windowFrom: Date | null } {
  const walked = walkFlights(input.flights);
  const windowFrom = lastFlightDate(input.flights);
  const sameWindow =
    input.windowFrom != null &&
    windowFrom != null &&
    input.windowFrom.getTime() === windowFrom.getTime();
  let pauseMs = sameWindow ? input.pauseMs : 0;
  let progress = walked.progress;
  let deadline = walked.deadline;
  let pausedAt = sameWindow ? input.pausedAt : null;
  const paused = input.status === "OUT_OF_ACTION";

  const effectiveDeadline = () =>
    deadline ? deadline.getTime() + pauseMs : null;

  if (paused) {
    const frozenAt = pausedAt ?? input.now;
    pausedAt = frozenAt;
    const end = effectiveDeadline();
    if (end != null && frozenAt.getTime() > end) {
      progress = 0;
      deadline = null;
      pauseMs = 0;
    }
  } else {
    if (pausedAt) {
      pauseMs += input.now.getTime() - pausedAt.getTime();
      pausedAt = null;
    }
    const end = effectiveDeadline();
    if (end != null && input.now.getTime() > end) {
      progress = 0;
      deadline = null;
      pauseMs = 0;
    }
  }

  const gradeAt = Math.max(gradeIndex(input.storedGradeKey), walked.gradeIndex);
  const keptAboveWalk = gradeAt > walked.gradeIndex;
  const shownProgress = keptAboveWalk ? 0 : progress;
  const current = GRADES[gradeAt];
  const next = gradeAt + 1 < GRADES.length ? GRADES[gradeAt + 1] : null;
  const clockFrom = paused ? (pausedAt ?? input.now) : input.now;
  const end = deadline ? deadline.getTime() + pauseMs : null;

  return {
    pausedAt,
    pauseMs,
    windowFrom: deadline ? windowFrom : null,
    view: {
      key: asGradeKey(gradeAt),
      label: current.label,
      progress: current.pointsToNext == null ? 0 : shownProgress,
      nextLabel: next?.label ?? null,
      nextPoints: current.pointsToNext,
      daysRemaining:
        current.pointsToNext == null || end == null || keptAboveWalk
          ? null
          : wholeDaysUntil(new Date(end), clockFrom),
      paused,
    },
  };
}

export function gradeCaption(view: GradeView): string {
  if (view.nextLabel == null || view.nextPoints == null) {
    return "Grade le plus haut. Il reste acquis.";
  }
  const head = `${view.progress}/${view.nextPoints} vers ${view.nextLabel}`;
  if (view.paused) {
    if (view.daysRemaining == null) {
      return `${head} · délai en pause (hors combat)`;
    }
    return `${head} · délai en pause (hors combat), encore ${formatRemaining(view.daysRemaining)} au retour`;
  }
  if (view.daysRemaining == null) {
    return `${head} · la progression repart au prochain vol`;
  }
  return `${head} · remise à zéro dans ${formatRemaining(view.daysRemaining)} sans vol`;
}

function formatRemaining(days: number): string {
  if (days <= 1) return "moins d'un jour";
  return `${days} jours`;
}

export async function syncPilotGrade(pilotId: string, now = new Date()) {
  const pilot = await prisma.pilot.findUnique({
    where: { id: pilotId },
    include: {
      flights: {
        select: {
          date: true,
          duration: true,
          outcome: true,
          killsAir: true,
          killsNaval: true,
          killsGround: true,
          killsBuilding: true,
        },
      },
    },
  });
  if (!pilot) return null;

  const evaluated = evaluateGrade({
    flights: pilot.flights,
    status: pilot.status,
    pausedAt: pilot.gradePausedAt,
    pauseMs: pilot.gradePauseMs,
    windowFrom: pilot.gradeWindowFrom,
    storedGradeKey: pilot.gradeKey,
    now,
  });

  const pausedTime = evaluated.pausedAt?.getTime() ?? null;
  const storedPaused = pilot.gradePausedAt?.getTime() ?? null;
  const windowTime = evaluated.windowFrom?.getTime() ?? null;
  const storedWindow = pilot.gradeWindowFrom?.getTime() ?? null;
  if (
    evaluated.view.key !== pilot.gradeKey ||
    pausedTime !== storedPaused ||
    evaluated.pauseMs !== pilot.gradePauseMs ||
    windowTime !== storedWindow
  ) {
    await prisma.pilot.update({
      where: { id: pilotId },
      data: {
        gradeKey: evaluated.view.key,
        gradePausedAt: evaluated.pausedAt,
        gradePauseMs: evaluated.pauseMs,
        gradeWindowFrom: evaluated.windowFrom,
      },
    });
  }

  return evaluated.view;
}

export async function syncPilotGrades(pilotIds: string[], now = new Date()) {
  const unique = Array.from(new Set(pilotIds));
  const views = new Map<string, GradeView>();
  for (const id of unique) {
    const view = await syncPilotGrade(id, now);
    if (view) views.set(id, view);
  }
  return views;
}
