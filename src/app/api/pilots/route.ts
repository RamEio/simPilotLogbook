import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

export async function GET(request: NextRequest) {
  try {
    const squadronId = request.nextUrl.searchParams.get("squadronId");
    const pilots = await prisma.pilot.findMany({
      where: squadronId ? { squadronId } : undefined,
      include: { squadron: true },
      orderBy: { name: "asc" },
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
