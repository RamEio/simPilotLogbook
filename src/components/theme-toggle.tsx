"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded border border-line-default text-ink-secondary transition-colors hover:bg-bg-hover hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-info",
        className,
      )}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
    </button>
  );
}
