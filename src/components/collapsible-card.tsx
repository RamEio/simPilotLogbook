"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleCard({
  title,
  children,
  defaultOpen = true,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded border border-line-subtle bg-bg-card text-ink-primary transition-colors duration-200",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 p-sp-xl text-left transition-colors hover:bg-bg-hover/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-status-info"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold tracking-overline text-ink-primary">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-ink-muted transition-transform duration-300 ease-out",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-sp-xl pb-sp-xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
