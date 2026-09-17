import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { GAME_VALUES, SYSTEM_SQUADRON_NAME, type Game } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/http";
import { toDateKey } from "@/lib/activity";
import {
  POINTS_RULES_LABEL,
  SUCCESS_BOARD_MIN_FLIGHTS,
  flightTotalPoints,
  killsFromRow,
  roundPoints,
} from "@/lib/scoring";

export const dynamic = "force-dynamic";

type Period = "all" | "30d" | "year";

function parsePeriod(value: string | null): Period {
  if (value === "30d" || value === "year") return value;
  return "all";
}

function periodWindows(period: Period): {
  currentStart: Date | null;
  previousStart: Date | null;
  previousEnd: Date | null;
} {
  const now = new Date();
  if (period === "30d") {
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 30);
    const previousStart = new Date(now);
    previousStart.setDate(previousStart.getDate() - 60);
    return { currentStart, previousStart, previousEnd: currentStart };
  }
  if (period === "year") {
    const currentStart = new Date(now.getFullYear(), 0, 1);
    const previousStart = new Date(now.getFullYear() - 1, 0, 1);
    return { currentStart, previousStart, previousEnd: currentStart };
  }
  return { currentStart: null, previousStart: null, previousEnd: null };
}

type Agg = {
  flights: number;
  minutes: number;
  successes: number;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  points: number;
};

function emptyAgg(): Agg {
  return {
    flights: 0,
    minutes: 0,
    successes: 0,
    killsAir: 0,
    killsNaval: 0,
    killsGround: 0,
    killsBuilding: 0,
    points: 0,
  };
}

type FlightRow = {
  id: string;
  date: Date;
  pilotId: string;
  squadronId: string;
  outcome: string;
  duration: number;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  aircraft: { name: string };
  pilot: { name: string; callsign: string | null };
};

function accumulate(flights: FlightRow[]) {
  const byPilot = new Map<string, Agg>();
  const bySquadron = new Map<string, Agg>();
  for (const flight of flights) {
    const points = flightTotalPoints(
      killsFromRow(flight),
      flight.duration,
      flight.outcome,
    );
    const add = (map: Map<string, Agg>, id: string) => {
      const agg = map.get(id) ?? emptyAgg();
      agg.flights += 1;
      agg.minutes += flight.duration;
      if (flight.outcome === "SUCCESS") agg.successes += 1;
      agg.killsAir += flight.killsAir;
      agg.killsNaval += flight.killsNaval;
      agg.killsGround += flight.killsGround;
      agg.killsBuilding += flight.killsBuilding;
      agg.points += points;
      map.set(id, agg);
    };
    add(byPilot, flight.pilotId);
    add(bySquadron, flight.squadronId);
  }
  return { byPilot, bySquadron };
}

type RankPayload = {
  id: string;
  name: string;
  callsign: string | null;
  squadronName: string;
  flights: number;
  minutes: number;
  successes: number;
  successRate: number;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  points: number;
};

function fromAgg(
  id: string,
  name: string,
  callsign: string | null,
  squadronName: string,
  agg: Agg,
): RankPayload {
  return {
    id,
    name,
    callsign,
    squadronName,
    flights: agg.flights,
    minutes: agg.minutes,
    successes: agg.successes,
    successRate:
      agg.flights === 0 ? 0 : Math.round((agg.successes / agg.flights) * 100),
    killsAir: agg.killsAir,
    killsNaval: agg.killsNaval,
    killsGround: agg.killsGround,
    killsBuilding: agg.killsBuilding,
    points: roundPoints(agg.points),
  };
}

type RecordItem = {
  key: string;
  label: string;
  display: string;
  href: string;
};

function buildRecords(
  flights: FlightRow[],
  pilotRanks: RankPayload[],
): { flight: RecordItem[]; career: RecordItem[] } {
  if (flights.length === 0) {
    return { flight: [], career: [] };
  }

  const scored = flights.map((flight) => ({
    flight,
    points: roundPoints(
      flightTotalPoints(killsFromRow(flight), flight.duration, flight.outcome),
    ),
    label: flight.pilot.callsign ?? flight.pilot.name,
  }));

  const best = <T,>(
    rows: T[],
    value: (row: T) => number,
  ): T | undefined =>
    rows.reduce((winner, row) =>
      value(row) > value(winner) ? row : winner,
    );

  const bestPoints = best(scored, (row) => row.points);
  const longest = best(scored, (row) => row.flight.duration);
  const bestAir = best(scored, (row) => row.flight.killsAir);
  const bestNaval = best(scored, (row) => row.flight.killsNaval);
  const bestGround = best(scored, (row) => row.flight.killsGround);
  const bestBuilding = best(scored, (row) => row.flight.killsBuilding);

  const flightHref = (id: string) => `/flights/${id}`;
  const flightRecords: RecordItem[] = [];

  const pushFlight = (
    item: (typeof scored)[number] | undefined,
    key: string,
    label: string,
    display: string,
    skipIfZero?: number,
  ) => {
    if (!item) return;
    if (skipIfZero !== undefined && skipIfZero <= 0) return;
    flightRecords.push({
      key,
      label,
      display: `${item.label} · ${display}`,
      href: flightHref(item.flight.id),
    });
  };

  pushFlight(
    bestPoints,
    "points",
    "Plus de points en 1 vol",
    `${bestPoints?.points ?? 0} pts`,
  );
  pushFlight(
    longest,
    "duration",
    "Plus long vol",
    `${((longest?.flight.duration ?? 0) / 60).toFixed(1)} h`,
  );
  pushFlight(
    bestAir,
    "air",
    "Plus de kills aériens en 1 vol",
    String(bestAir?.flight.killsAir ?? 0),
    bestAir?.flight.killsAir,
  );
  pushFlight(
    bestNaval,
    "naval",
    "Plus de kills navals en 1 vol",
    String(bestNaval?.flight.killsNaval ?? 0),
    bestNaval?.flight.killsNaval,
  );
  pushFlight(
    bestGround,
    "ground",
    "Plus de kills sol en 1 vol",
    String(bestGround?.flight.killsGround ?? 0),
    bestGround?.flight.killsGround,
  );
  pushFlight(
    bestBuilding,
    "building",
    "Plus de kills building en 1 vol",
    String(bestBuilding?.flight.killsBuilding ?? 0),
    bestBuilding?.flight.killsBuilding,
  );

  const career: RecordItem[] = [];
  const withFlights = pilotRanks.filter((row) => row.flights > 0);
  if (withFlights.length) {
    const mostPoints = best(withFlights, (row) => row.points);
    const mostHours = best(withFlights, (row) => row.minutes);
    const mostFlights = best(withFlights, (row) => row.flights);
    if (mostPoints) {
      career.push({
        key: "career-points",
        label: "Plus de points",
        display: `${mostPoints.callsign ?? mostPoints.name} · ${mostPoints.points} pts`,
        href: `/pilots/${mostPoints.id}`,
      });
    }
    if (mostHours) {
      career.push({
        key: "career-hours",
        label: "Plus d'heures",
        display: `${mostHours.callsign ?? mostHours.name} · ${(mostHours.minutes / 60).toFixed(1)} h`,
        href: `/pilots/${mostHours.id}`,
      });
    }
    if (mostFlights) {
      career.push({
        key: "career-flights",
        label: "Plus de vols",
        display: `${mostFlights.callsign ?? mostFlights.name} · ${mostFlights.flights}`,
        href: `/pilots/${mostFlights.id}`,
      });
    }
  }

  return { flight: flightRecords, career };
}

function buildSpotlight(flights: FlightRow[]) {
  if (flights.length === 0) return null;
  const lastKey = flights.reduce((max, flight) => {
    const key = toDateKey(flight.date);
    return key > max ? key : max;
  }, toDateKey(flights[0].date));
  const thatDay = flights.filter((flight) => toDateKey(flight.date) === lastKey);
  const winner = thatDay.reduce((best, flight) => {
    const points = flightTotalPoints(
      killsFromRow(flight),
      flight.duration,
      flight.outcome,
    );
    const bestPoints = flightTotalPoints(
      killsFromRow(best),
      best.duration,
      best.outcome,
    );
    return points > bestPoints ? flight : best;
  });
  return {
    date: lastKey,
    flightCount: thatDay.length,
    flightId: winner.id,
    pilotId: winner.pilotId,
    pilotLabel: winner.pilot.callsign ?? winner.pilot.name,
    aircraftName: winner.aircraft.name,
    duration: winner.duration,
    outcome: winner.outcome,
    points: roundPoints(
      flightTotalPoints(
        killsFromRow(winner),
        winner.duration,
        winner.outcome,
      ),
    ),
    killsAir: winner.killsAir,
    killsNaval: winner.killsNaval,
    killsGround: winner.killsGround,
    killsBuilding: winner.killsBuilding,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = parsePeriod(searchParams.get("period"));
    const gameParam = searchParams.get("game");
    const squadronId = searchParams.get("squadronId");
    const statusParam = searchParams.get("status");
    const { currentStart, previousStart, previousEnd } = periodWindows(period);
    const statusActiveOnly = statusParam === "ACTIVE";

    const notSolo: Prisma.SquadronWhereInput = {
      name: { not: SYSTEM_SQUADRON_NAME },
    };
    const pilotWhere: Prisma.PilotWhereInput = {
      squadron: notSolo,
    };
    if (squadronId) {
      pilotWhere.squadronId = squadronId;
    }
    if (statusActiveOnly) {
      pilotWhere.status = "ACTIVE";
    }

    const pilots = await prisma.pilot.findMany({
      where: pilotWhere,
      include: { squadron: true },
      orderBy: { name: "asc" },
    });

    const baseWhere: Prisma.FlightWhereInput = {
      squadron: notSolo,
    };
    if (gameParam && GAME_VALUES.includes(gameParam as Game)) {
      baseWhere.game = gameParam;
    }
    if (squadronId) {
      baseWhere.squadronId = squadronId;
    }
    if (statusActiveOnly) {
      baseWhere.pilotId = { in: pilots.map((pilot) => pilot.id) };
    }

    const emptyResponse = {
      period,
      game:
        gameParam && GAME_VALUES.includes(gameParam as Game)
          ? gameParam
          : "all",
      squadronId: squadronId ?? "all",
      status: statusActiveOnly ? "ACTIVE" : "all",
      rules: POINTS_RULES_LABEL,
      successMinFlights: SUCCESS_BOARD_MIN_FLIGHTS,
      asOf: null as string | null,
      pilots: [] as RankPayload[],
      previousPilots: [] as RankPayload[],
      squadrons: [] as never[],
      previousSquadrons: [] as never[],
      spotlight: null,
      records: { flight: [] as never[], career: [] as never[] },
    };

    if (statusActiveOnly && pilots.length === 0) {
      return NextResponse.json(emptyResponse);
    }

    const flightSelect = {
      id: true,
      date: true,
      pilotId: true,
      squadronId: true,
      outcome: true,
      duration: true,
      killsAir: true,
      killsNaval: true,
      killsGround: true,
      killsBuilding: true,
      aircraft: { select: { name: true } },
      pilot: { select: { name: true, callsign: true } },
    } satisfies Prisma.FlightSelect;

    const currentWhere: Prisma.FlightWhereInput = { ...baseWhere };
    if (currentStart) {
      currentWhere.date = { gte: currentStart };
    }

    const [squadrons, currentFlights, previousFlights, latestForSpotlight] =
      await Promise.all([
        prisma.squadron.findMany({
          where: squadronId ? { id: squadronId, ...notSolo } : notSolo,
          orderBy: { name: "asc" },
        }),
        prisma.flight.findMany({
          where: currentWhere,
          select: flightSelect,
        }),
        previousStart && previousEnd
          ? prisma.flight.findMany({
              where: {
                ...baseWhere,
                date: { gte: previousStart, lt: previousEnd },
              },
              select: flightSelect,
            })
          : Promise.resolve([] as FlightRow[]),
        prisma.flight.findFirst({
          where: baseWhere,
          orderBy: { date: "desc" },
          select: { date: true },
        }),
      ]);

    const current = accumulate(currentFlights);
    const previous = accumulate(previousFlights);

    const pilotRanks = pilots
      .map((pilot) => {
        const agg = current.byPilot.get(pilot.id) ?? emptyAgg();
        return fromAgg(
          pilot.id,
          pilot.name,
          pilot.callsign,
          pilot.squadron.tag ?? pilot.squadron.name,
          agg,
        );
      })
      .filter((pilot) => pilot.flights > 0);

    const previousPilotRanks = pilots
      .map((pilot) => {
        const agg = previous.byPilot.get(pilot.id) ?? emptyAgg();
        return fromAgg(
          pilot.id,
          pilot.name,
          pilot.callsign,
          pilot.squadron.tag ?? pilot.squadron.name,
          agg,
        );
      })
      .filter((pilot) => pilot.flights > 0);

    const squadronRanks = squadrons
      .map((squadron) => {
        const agg = current.bySquadron.get(squadron.id) ?? emptyAgg();
        return fromAgg(
          squadron.id,
          squadron.name,
          null,
          squadron.tag ?? squadron.name,
          agg,
        );
      })
      .filter((squadron) => squadron.flights > 0)
      .map((row) => ({
        id: row.id,
        name: row.name,
        tag: squadrons.find((item) => item.id === row.id)?.tag ?? null,
        flights: row.flights,
        minutes: row.minutes,
        successes: row.successes,
        successRate: row.successRate,
        killsAir: row.killsAir,
        killsNaval: row.killsNaval,
        killsGround: row.killsGround,
        killsBuilding: row.killsBuilding,
        points: row.points,
      }));

    const previousSquadronRanks = squadrons
      .map((squadron) => {
        const agg = previous.bySquadron.get(squadron.id) ?? emptyAgg();
        return {
          id: squadron.id,
          name: squadron.name,
          tag: squadron.tag,
          flights: agg.flights,
          minutes: agg.minutes,
          successes: agg.successes,
          successRate:
            agg.flights === 0
              ? 0
              : Math.round((agg.successes / agg.flights) * 100),
          killsAir: agg.killsAir,
          killsNaval: agg.killsNaval,
          killsGround: agg.killsGround,
          killsBuilding: agg.killsBuilding,
          points: roundPoints(agg.points),
        };
      })
      .filter((squadron) => squadron.flights > 0);

    const asOf =
      currentFlights.length === 0
        ? null
        : currentFlights.reduce(
            (max, flight) => (flight.date > max ? flight.date : max),
            currentFlights[0].date,
          );

    let spotlight = null;
    if (latestForSpotlight) {
      const dayKey = toDateKey(latestForSpotlight.date);
      const dayStart = new Date(`${dayKey}T00:00:00.000Z`);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      const eveningFlights = await prisma.flight.findMany({
        where: {
          ...baseWhere,
          date: { gte: dayStart, lt: dayEnd },
        },
        select: flightSelect,
      });
      spotlight = buildSpotlight(eveningFlights);
    }

    return NextResponse.json({
      period,
      game:
        gameParam && GAME_VALUES.includes(gameParam as Game)
          ? gameParam
          : "all",
      squadronId: squadronId ?? "all",
      status: statusActiveOnly ? "ACTIVE" : "all",
      rules: POINTS_RULES_LABEL,
      successMinFlights: SUCCESS_BOARD_MIN_FLIGHTS,
      asOf: asOf ? asOf.toISOString() : null,
      pilots: pilotRanks,
      previousPilots: previousPilotRanks,
      squadrons: squadronRanks,
      previousSquadrons: previousSquadronRanks,
      spotlight,
      records: buildRecords(currentFlights, pilotRanks),
    });
  } catch (error) {
    return handleError(error);
  }
}
