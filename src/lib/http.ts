import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Données invalides", 400);
  }
  console.error(error);
  return jsonError("Erreur serveur", 500);
}

export const flightInclude = {
  aircraft: { select: { id: true, name: true, isCustom: true } },
  pilot: { select: { id: true, name: true, callsign: true } },
  squadron: { select: { id: true, name: true, tag: true } },
} as const;
