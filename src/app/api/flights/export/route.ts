import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FLIGHT_CSV_HEADERS, toCsv } from "@/lib/csv";
import { handleError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        aircraft: true,
        pilot: true,
        squadron: true,
      },
      orderBy: { date: "asc" },
    });

    const stamp = new Date().toISOString().slice(0, 10);
    const csv = `\uFEFF${toCsv([
      [...FLIGHT_CSV_HEADERS],
      ...flights.map((flight) => [
        flight.id,
        flight.date.toISOString(),
        flight.duration,
        flight.game,
        flight.aircraft.name,
        flight.squadron.name,
        flight.squadron.tag,
        flight.pilot.name,
        flight.pilot.callsign,
        flight.pilot.status,
        flight.missionType,
        flight.missionName,
        flight.outcome,
        flight.notes,
        flight.killsAir,
        flight.killsNaval,
        flight.killsGround,
        flight.killsBuilding,
      ]),
    ])}`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sim-pilot-logbook-${stamp}.csv"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
