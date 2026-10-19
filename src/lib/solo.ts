import { SYSTEM_SQUADRON_NAME, isSystemSquadron } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/** Idempotent. Existing databases never re-run the aircraft seed. */
export async function ensureSystemSquadron() {
  return prisma.squadron.upsert({
    where: { name: SYSTEM_SQUADRON_NAME },
    update: {},
    create: {
      name: SYSTEM_SQUADRON_NAME,
      icon: "compass",
    },
  });
}

export function sortSquadronsForDisplay<T extends { name: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const aSystem = isSystemSquadron(a.name);
    const bSystem = isSystemSquadron(b.name);
    if (aSystem !== bSystem) return aSystem ? 1 : -1;
    return a.name.localeCompare(b.name, "fr");
  });
}
