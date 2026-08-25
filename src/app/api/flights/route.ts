import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { GAME_VALUES, OUTCOME_VALUES, type Game, type Outcome } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { flightInclude, handleError, jsonError } from "@/lib/http";

const killCountSchema = z.number().int().min(0).optional().default(0);

const createFlightSchema = z.object({
  date: z.string().optional(),
  pilotId: z.string().min(1),
  squadronId: z.string().min(1),
  aircraftId: z.string().min(1),
  game: z.enum(GAME_VALUES),
  duration: z.number().int().positive(),
  missionType: z.string().optional().nullable(),
  missionName: z.string().optional().nullable(),
  outcome: z.enum(OUTCOME_VALUES),
  notes: z.string().optional().nullable(),
  killsAir: killCountSchema,
  killsNaval: killCountSchema,
  killsGround: killCountSchema,
  killsBuilding: killCountSchema,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const take = 20;
    const skip = (page - 1) * take;
    const sort = searchParams.get("sort") ?? "date";

    const where: Prisma.FlightWhereInput = {};
    const game = searchParams.get("game");
    const squadronId = searchParams.get("squadronId");
    const pilotId = searchParams.get("pilotId");
    const outcome = searchParams.get("outcome");

    if (game && GAME_VALUES.includes(game as Game)) {
      where.game = game;
    }
    if (squadronId) {
      where.squadronId = squadronId;
    }
    if (pilotId) {
      where.pilotId = pilotId;
    }
    if (outcome && OUTCOME_VALUES.includes(outcome as Outcome)) {
      where.outcome = outcome;
    }

    const orderBy: Prisma.FlightOrderByWithRelationInput =
      sort === "duration"
        ? { duration: "desc" }
        : sort === "game"
          ? { game: "asc" }
          : { date: "desc" };

    const [items, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        include: flightInclude,
        orderBy,
        skip,
        take,
      }),
      prisma.flight.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / take)),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createFlightSchema.parse(await request.json());
    const [pilot, aircraft] = await Promise.all([
      prisma.pilot.findUnique({ where: { id: body.pilotId } }),
      prisma.aircraft.findUnique({ where: { id: body.aircraftId } }),
    ]);

    if (!pilot) {
      return jsonError("Pilote introuvable", 404);
    }
    if (pilot.squadronId !== body.squadronId) {
      return jsonError("Le pilote n'appartient pas à cette escadrille", 400);
    }
    if (!aircraft) {
      return jsonError("Appareil introuvable", 404);
    }
    if (aircraft.game !== body.game) {
      return jsonError("L'appareil ne correspond pas au simulateur", 400);
    }

    const flight = await prisma.flight.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        pilotId: body.pilotId,
        squadronId: body.squadronId,
        aircraftId: body.aircraftId,
        game: body.game,
        duration: body.duration,
        missionType: body.missionType ?? undefined,
        missionName: body.missionName ?? undefined,
        outcome: body.outcome,
        notes: body.notes ?? undefined,
        killsAir: body.killsAir,
        killsNaval: body.killsNaval,
        killsGround: body.killsGround,
        killsBuilding: body.killsBuilding,
      },
      include: flightInclude,
    });

    return NextResponse.json(flight, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
