import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isReservedSquadronName } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { handleError, jsonError } from "@/lib/http";
import { ensureSystemSquadron, sortSquadronsForDisplay } from "@/lib/solo";

const createSquadronSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  tag: z.string().trim().optional().nullable(),
  icon: z.string().trim().optional().default("shield"),
});

export async function GET() {
  try {
    await ensureSystemSquadron();
    const squadrons = await prisma.squadron.findMany({
      include: {
        _count: { select: { pilots: true, flights: true } },
      },
    });
    return NextResponse.json(sortSquadronsForDisplay(squadrons));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createSquadronSchema.parse(await request.json());
    if (isReservedSquadronName(body.name)) {
      return jsonError("Solo est réservé à l'escadrille système", 409);
    }
    const squadron = await prisma.squadron.create({
      data: {
        name: body.name,
        tag: body.tag || undefined,
        icon: body.icon,
      },
    });
    return NextResponse.json(squadron, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return jsonError("Une escadrille porte déjà ce nom", 409);
    }
    return handleError(error);
  }
}
