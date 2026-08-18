"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Tableau de bord" },
  { href: "/log", label: "Enregistrer un vol" },
  { href: "/flights", label: "Vols" },
  { href: "/squadrons", label: "Escadrilles" },
  { href: "/pilots", label: "Pilotes" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="scanlines sticky top-0 z-40 border-b border-line-subtle bg-bg-secondary/90 backdrop-blur-[8px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="relative z-10">
          <p className="font-display text-sm tracking-[0.18em] text-accent-green">
            SIM PILOT LOGBOOK
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Hangar Ops
          </p>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors duration-200",
                  active
                    ? "bg-bg-elevated text-accent-green"
                    : "text-ink-secondary hover:text-ink-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="relative z-10 text-ink-secondary md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <nav className="relative z-10 grid gap-1 border-t border-line-subtle px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-ink-secondary hover:bg-bg-elevated hover:text-ink-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
