import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, jsonError } from "@/lib/http";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const squadron = await prisma.squadron.findUnique({
      where: { id: params.id },
      include: {
        pilots: { orderBy: { name: "asc" } },
        flights: {
          include: {
            aircraft: true,
            pilot: true,
            squadron: true,
          },
          orderBy: { date: "desc" },
          take: 20,
        },
      },
    });

    if (!squadron) {
      return jsonError("Escadrille introuvable", 404);
    }

    const aggregates = await prisma.flight.aggregate({
      where: { squadronId: params.id },
      _count: { _all: true },
      _sum: { duration: true },
    });
    const successes = await prisma.flight.count({
      where: { squadronId: params.id, outcome: "SUCCESS" },
    });

    const totalFlights = aggregates._count._all;
    return NextResponse.json({
      ...squadron,
      stats: {
        totalFlights,
        totalMinutes: aggregates._sum.duration ?? 0,
        successRate: totalFlights === 0 ? 0 : successes / totalFlights,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
