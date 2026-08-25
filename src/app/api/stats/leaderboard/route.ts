import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { GAME_VALUES, type Game } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/http";

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

    const [pilots, squadrons, pilotFlights, squadronFlights] = await Promise.all([
      prisma.pilot.findMany({
        include: { squadron: true },
        orderBy: { name: "asc" },
      }),
      prisma.squadron.findMany({ orderBy: { name: "asc" } }),
      prisma.flight.groupBy({
        by: ["pilotId", "outcome"],
        where,
        _count: { _all: true },
        _sum: { duration: true },
      }),
      prisma.flight.groupBy({
        by: ["squadronId", "outcome"],
        where,
        _count: { _all: true },
        _sum: { duration: true },
      }),
    ]);

    const pilotRanks = pilots
      .map((pilot) => {
        const rows = pilotFlights.filter((row) => row.pilotId === pilot.id);
        const flights = rows.reduce((sum, row) => sum + row._count._all, 0);
        const minutes = rows.reduce(
          (sum, row) => sum + (row._sum.duration ?? 0),
          0,
        );
        const successes =
          rows.find((row) => row.outcome === "SUCCESS")?._count._all ?? 0;
        return {
          id: pilot.id,
          name: pilot.name,
          callsign: pilot.callsign,
          squadronName: pilot.squadron.tag ?? pilot.squadron.name,
          flights,
          minutes,
          successRate:
            flights === 0 ? 0 : Math.round((successes / flights) * 100),
        };
      })
      .filter((pilot) => pilot.flights > 0)
      .sort((a, b) => b.minutes - a.minutes || b.flights - a.flights);

    const squadronRanks = squadrons
      .map((squadron) => {
        const rows = squadronFlights.filter(
          (row) => row.squadronId === squadron.id,
        );
        const flights = rows.reduce((sum, row) => sum + row._count._all, 0);
        const minutes = rows.reduce(
          (sum, row) => sum + (row._sum.duration ?? 0),
          0,
        );
        const successes =
          rows.find((row) => row.outcome === "SUCCESS")?._count._all ?? 0;
        return {
          id: squadron.id,
          name: squadron.name,
          tag: squadron.tag,
          flights,
          minutes,
          successRate:
            flights === 0 ? 0 : Math.round((successes / flights) * 100),
        };
      })
      .filter((squadron) => squadron.flights > 0)
      .sort((a, b) => b.minutes - a.minutes || b.flights - a.flights);

    return NextResponse.json({
      period,
      game: gameParam && GAME_VALUES.includes(gameParam as Game) ? gameParam : "all",
      pilots: pilotRanks,
      squadrons: squadronRanks,
    });
  } catch (error) {
    return handleError(error);
  }
}
