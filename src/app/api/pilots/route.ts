import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PILOT_STATUS_VALUES, type PilotStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { handleError, jsonError, toPublicPilot } from "@/lib/http";

const createPilotSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  callsign: z.string().trim().optional().nullable(),
  squadronId: z.string().min(1, "Escadrille requise"),
  pin: z
    .string()
    .regex(/^\d{4}$/, "PIN : 4 chiffres")
    .optional()
    .nullable(),
});

const SORT_VALUES = ["name", "createdAt", "status"] as const;
type PilotSort = (typeof SORT_VALUES)[number];

function pilotOrderBy(
  sort: PilotSort,
): Prisma.PilotOrderByWithRelationInput | Prisma.PilotOrderByWithRelationInput[] {
  switch (sort) {
    case "createdAt":
      return { createdAt: "desc" };
    case "status":
      return [{ status: "asc" }, { name: "asc" }];
    default:
      return { name: "asc" };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const squadronId = searchParams.get("squadronId");
    const statusParam = searchParams.get("status");
    const sortParam = searchParams.get("sort") ?? "name";
    const sort = SORT_VALUES.includes(sortParam as PilotSort)
      ? (sortParam as PilotSort)
      : "name";

    const where: Prisma.PilotWhereInput = {};
    if (squadronId) {
      where.squadronId = squadronId;
    }
    if (
      statusParam &&
      PILOT_STATUS_VALUES.includes(statusParam as PilotStatus)
    ) {
      where.status = statusParam;
    }

    const pilots = await prisma.pilot.findMany({
      where,
      include: {
        squadron: true,
        _count: { select: { flights: true } },
      },
      orderBy: pilotOrderBy(sort),
    });
    return NextResponse.json(pilots.map(toPublicPilot));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createPilotSchema.parse(await request.json());
    const squadron = await prisma.squadron.findUnique({
      where: { id: body.squadronId },
    });
    if (!squadron) {
      return jsonError("Escadrille introuvable", 404);
    }

    const pilot = await prisma.pilot.create({
      data: {
        name: body.name,
        callsign: body.callsign || undefined,
        pin: body.pin || undefined,
        squadronId: body.squadronId,
      },
      include: { squadron: true },
    });
    return NextResponse.json(toPublicPilot(pilot), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
