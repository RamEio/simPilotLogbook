import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flightInclude, handleError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalFlights, duration, recentFlights, grouped] = await Promise.all([
      prisma.flight.count(),
      prisma.flight.aggregate({ _sum: { duration: true } }),
      prisma.flight.findMany({
        include: flightInclude,
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.flight.groupBy({
        by: ["game"],
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      totalFlights,
      totalMinutes: duration._sum.duration ?? 0,
      recentFlights,
      byGame: grouped.map((item) => ({
        game: item.game,
        count: item._count._all,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
