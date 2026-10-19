import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

const GRADE_VAR: Record<string, string> = {
  ASPIRANT: "--grade-aspirant",
  SOUS_LIEUTENANT: "--grade-sous-lieutenant",
  LIEUTENANT: "--grade-lieutenant",
  CAPITAINE: "--grade-capitaine",
  COMMANDANT: "--grade-commandant",
  MAJOR: "--grade-major",
};

export function gradeColor(key: string | null | undefined): string {
  const variable = GRADE_VAR[key ?? ""] ?? GRADE_VAR.ASPIRANT;
  return `var(${variable})`;
}

export function GradeBadge({
  gradeKey,
  children,
}: {
  gradeKey?: string | null;
  children: ReactNode;
}) {
  const color = gradeColor(gradeKey);
  return (
    <Badge
      variant="neutral"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      {children}
    </Badge>
  );
}
