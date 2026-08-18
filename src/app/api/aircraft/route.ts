import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GAME_VALUES, type Game } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { handleError, jsonError } from "@/lib/http";

const createAircraftSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  game: z.enum(GAME_VALUES),
});

export async function GET(request: NextRequest) {
  try {
    const game = request.nextUrl.searchParams.get("game");
    const aircraft = await prisma.aircraft.findMany({
      where:
        game && GAME_VALUES.includes(game as Game)
          ? { game }
          : undefined,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(aircraft);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createAircraftSchema.parse(await request.json());
    const aircraft = await prisma.aircraft.create({
      data: {
        name: body.name,
        game: body.game,
        isCustom: true,
      },
    });
    return NextResponse.json(aircraft, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return jsonError("Cet appareil existe déjà pour ce simulateur", 409);
    }
    return handleError(error);
  }
}
