import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GAME_VALUES, OUTCOME_VALUES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { flightInclude, handleError, jsonError } from "@/lib/http";

const killCountSchema = z.number().int().min(0).optional();

const updateFlightSchema = z.object({
  date: z.string().optional(),
  pilotId: z.string().min(1).optional(),
  squadronId: z.string().min(1).optional(),
  aircraftId: z.string().min(1).optional(),
  game: z.enum(GAME_VALUES).optional(),
  duration: z.number().int().positive().optional(),
  missionType: z.string().optional().nullable(),
  missionName: z.string().optional().nullable(),
  outcome: z.enum(OUTCOME_VALUES).optional(),
  notes: z.string().optional().nullable(),
  killsAir: killCountSchema,
  killsNaval: killCountSchema,
  killsGround: killCountSchema,
  killsBuilding: killCountSchema,
});

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: params.id },
      include: flightInclude,
    });
    if (!flight) {
      return jsonError("Vol introuvable", 404);
    }
    return NextResponse.json(flight);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const existing = await prisma.flight.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return jsonError("Vol introuvable", 404);
    }

    const body = updateFlightSchema.parse(await request.json());
    const flight = await prisma.flight.update({
      where: { id: params.id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
      },
      include: flightInclude,
    });
    return NextResponse.json(flight);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await prisma.flight.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
