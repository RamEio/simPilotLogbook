import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleError, jsonError } from "@/lib/http";

const patchPilotSchema = z.object({
  status: z.enum(["ALIVE", "OUT_OF_COMBAT"]).optional(),
  callsign: z.string().trim().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const existing = await prisma.pilot.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return jsonError("Pilote introuvable", 404);
    }

    const body = patchPilotSchema.parse(await request.json());
    const pilot = await prisma.pilot.update({
      where: { id: params.id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.callsign !== undefined && { callsign: body.callsign }),
      },
      include: { squadron: true },
    });
    return NextResponse.json(pilot);
  } catch (error) {
    return handleError(error);
  }
}
