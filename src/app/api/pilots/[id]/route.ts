import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PILOT_STATUS_VALUES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { handleError, jsonError, toPublicPilot } from "@/lib/http";

const updatePilotSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").optional(),
  callsign: z.string().trim().optional().nullable(),
  squadronId: z.string().min(1).optional(),
  status: z.enum(PILOT_STATUS_VALUES).optional(),
  pin: z
    .string()
    .regex(/^\d{4}$/, "PIN : 4 chiffres")
    .optional()
    .nullable(),
  clearPin: z.boolean().optional(),
});

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const pilot = await prisma.pilot.findUnique({
      where: { id: params.id },
      include: { squadron: true },
    });
    if (!pilot) {
      return jsonError("Pilote introuvable", 404);
    }
    return NextResponse.json(toPublicPilot(pilot));
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const existing = await prisma.pilot.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return jsonError("Pilote introuvable", 404);
    }

    const body = updatePilotSchema.parse(await request.json());

    if (body.squadronId) {
      const squadron = await prisma.squadron.findUnique({
        where: { id: body.squadronId },
      });
      if (!squadron) {
        return jsonError("Escadrille introuvable", 404);
      }
    }

    let pin: string | null | undefined = undefined;
    if (body.clearPin) {
      pin = null;
    } else if (body.pin !== undefined) {
      pin = body.pin || null;
    }

    const pilot = await prisma.pilot.update({
      where: { id: params.id },
      data: {
        name: body.name,
        callsign:
          body.callsign === undefined ? undefined : body.callsign || null,
        status: body.status,
        pin,
        ...(body.squadronId
          ? { squadron: { connect: { id: body.squadronId } } }
          : {}),
      },
      include: { squadron: true },
    });

    return NextResponse.json(toPublicPilot(pilot));
  } catch (error) {
    return handleError(error);
  }
}
