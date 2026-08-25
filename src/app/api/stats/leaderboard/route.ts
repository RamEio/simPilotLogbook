import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { GAME_VALUES, type Game } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/http";
import { flightTotalPoints } from "@/lib/scoring";

export const dynamic = "force-dynamic";

function periodStart(period: string | null): Date | null {
  const now = new Date();
  if (period === "30d") {
    const date = new Date(now);
    date.setDate(date.getDate() - 30);
    return date;
  }
  if (period === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }
  return null;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") ?? "all";
    const gameParam = searchParams.get("game");
    const start = periodStart(period);

    const where: Prisma.FlightWhereInput = {};
    if (start) {
      where.date = { gte: start };
    }
    if (gameParam && GAME_VALUES.includes(gameParam as Game)) {
      where.game = gameParam;
    }

    const [pilots, squadrons, flights] = await Promise.all([
      prisma.pilot.findMany({
        include: { squadron: true },
        orderBy: { name: "asc" },
      }),
      prisma.squadron.findMany({ orderBy: { name: "asc" } }),
      prisma.flight.findMany({
        where,
        select: {
          pilotId: true,
          squadronId: true,
          outcome: true,
          duration: true,
          killsAir: true,
          killsNaval: true,
          killsGround: true,
          killsBuilding: true,
        },
      }),
    ]);

    const byPilot = new Map<string, Agg>();
    const bySquadron = new Map<string, Agg>();

    for (const flight of flights) {
      const kills = {
        killsAir: flight.killsAir,
        killsNaval: flight.killsNaval,
        killsGround: flight.killsGround,
        killsBuilding: flight.killsBuilding,
      };
      const points = flightTotalPoints(kills, flight.duration);

      const pilotAgg = byPilot.get(flight.pilotId) ?? emptyAgg();
      pilotAgg.flights += 1;
      pilotAgg.minutes += flight.duration;
      if (flight.outcome === "SUCCESS") pilotAgg.successes += 1;
      pilotAgg.killsAir += flight.killsAir;
      pilotAgg.killsNaval += flight.killsNaval;
      pilotAgg.killsGround += flight.killsGround;
      pilotAgg.killsBuilding += flight.killsBuilding;
      pilotAgg.points += points;
      byPilot.set(flight.pilotId, pilotAgg);

      const sqAgg = bySquadron.get(flight.squadronId) ?? emptyAgg();
      sqAgg.flights += 1;
      sqAgg.minutes += flight.duration;
      if (flight.outcome === "SUCCESS") sqAgg.successes += 1;
      sqAgg.killsAir += flight.killsAir;
      sqAgg.killsNaval += flight.killsNaval;
      sqAgg.killsGround += flight.killsGround;
      sqAgg.killsBuilding += flight.killsBuilding;
      sqAgg.points += points;
      bySquadron.set(flight.squadronId, sqAgg);
    }

    const pilotRanks = pilots
      .map((pilot) => {
        const agg = byPilot.get(pilot.id) ?? emptyAgg();
        return {
          id: pilot.id,
          name: pilot.name,
          callsign: pilot.callsign,
          squadronName: pilot.squadron.tag ?? pilot.squadron.name,
          flights: agg.flights,
          minutes: agg.minutes,
          successRate:
            agg.flights === 0
              ? 0
              : Math.round((agg.successes / agg.flights) * 100),
          killsAir: agg.killsAir,
          killsNaval: agg.killsNaval,
          killsGround: agg.killsGround,
          killsBuilding: agg.killsBuilding,
          points: Math.round(agg.points * 10) / 10,
        };
      })
      .filter((pilot) => pilot.flights > 0);

    const squadronRanks = squadrons
      .map((squadron) => {
        const agg = bySquadron.get(squadron.id) ?? emptyAgg();
        return {
          id: squadron.id,
          name: squadron.name,
          tag: squadron.tag,
          flights: agg.flights,
          minutes: agg.minutes,
          successRate:
            agg.flights === 0
              ? 0
              : Math.round((agg.successes / agg.flights) * 100),
          killsAir: agg.killsAir,
          killsNaval: agg.killsNaval,
          killsGround: agg.killsGround,
          killsBuilding: agg.killsBuilding,
          points: Math.round(agg.points * 10) / 10,
        };
      })
      .filter((squadron) => squadron.flights > 0);

    return NextResponse.json({
      period,
      game:
        gameParam && GAME_VALUES.includes(gameParam as Game)
          ? gameParam
          : "all",
      rules:
        "Aérien 5 · Naval 4 · Sol 3 · Building 2 · 1 h de vol 1",
      pilots: pilotRanks,
      squadrons: squadronRanks,
    });
  } catch (error) {
    return handleError(error);
  }
}
