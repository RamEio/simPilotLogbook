import { NextRequest, NextResponse } from "next/server";
import { GAME_VALUES, OUTCOME_VALUES, type Game, type Outcome } from "@/lib/constants";
import { parseCsv, rowsToFlightCsv } from "@/lib/csv";
import { handleError, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("Fichier CSV manquant", 400);
    }

    const text = await file.text();
    const rows = rowsToFlightCsv(parseCsv(text));
    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      if (!GAME_VALUES.includes(row.game as Game)) {
        return jsonError(`Simulateur inconnu: ${row.game}`, 400);
      }
      if (!OUTCOME_VALUES.includes(row.outcome as Outcome)) {
        return jsonError(`Résultat inconnu: ${row.outcome}`, 400);
      }

      const duration = Number.parseInt(row.duration_min, 10);
      if (!Number.isFinite(duration) || duration <= 0) {
        return jsonError(`Durée invalide pour le vol du ${row.date}`, 400);
      }

      const date = new Date(row.date);
      if (Number.isNaN(date.getTime())) {
        return jsonError(`Date invalide: ${row.date}`, 400);
      }

      if (row.id) {
        const existing = await prisma.flight.findUnique({ where: { id: row.id } });
        if (existing) {
          skipped += 1;
          continue;
        }
      }

      const squadron = await prisma.squadron.upsert({
        where: { name: row.squadron },
        update: { tag: row.squadron_tag || undefined },
        create: {
          name: row.squadron,
          tag: row.squadron_tag || undefined,
        },
      });

      const pilot =
        (await prisma.pilot.findFirst({
          where: {
            squadronId: squadron.id,
            name: row.pilot,
            callsign: row.callsign || null,
          },
        })) ??
        (await prisma.pilot.create({
          data: {
            name: row.pilot,
            callsign: row.callsign || undefined,
            squadronId: squadron.id,
          },
        }));

      const aircraft =
        (await prisma.aircraft.findUnique({
          where: { name_game: { name: row.aircraft, game: row.game } },
        })) ??
        (await prisma.aircraft.create({
          data: {
            name: row.aircraft,
            game: row.game,
            isCustom: true,
          },
        }));

      await prisma.flight.create({
        data: {
          id: row.id || undefined,
          date,
          duration,
          game: row.game,
          aircraftId: aircraft.id,
          squadronId: squadron.id,
          pilotId: pilot.id,
          missionType: row.mission_type || undefined,
          missionName: row.mission_name || undefined,
          outcome: row.outcome,
          notes: row.notes || undefined,
        },
      });
      created += 1;
    }

    return NextResponse.json({ created, skipped, total: rows.length });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Ligne ")) {
      return jsonError(error.message, 400);
    }
    return handleError(error);
  }
}
