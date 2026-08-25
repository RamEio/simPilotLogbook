import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleError, jsonError } from "@/lib/http";

const verifySchema = z.object({
  pilotId: z.string().min(1),
  pin: z.string().regex(/^\d{4}$/, "PIN : 4 chiffres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = verifySchema.parse(await request.json());
    const pilot = await prisma.pilot.findUnique({
      where: { id: body.pilotId },
      select: { id: true, pin: true },
    });
    if (!pilot) {
      return jsonError("Pilote introuvable", 404);
    }
    if (!pilot.pin) {
      return NextResponse.json({ ok: true, required: false });
    }
    if (pilot.pin !== body.pin) {
      return jsonError("PIN incorrect", 401);
    }
    return NextResponse.json({ ok: true, required: true });
  } catch (error) {
    return handleError(error);
  }
}
