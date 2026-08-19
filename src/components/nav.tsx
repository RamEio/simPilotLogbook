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
    <header
      className="sticky top-0 z-40 border-b-2 border-line-muted bg-bg-secondary bg-cover bg-center"
      style={{ backgroundImage: "url('/images/Header-base.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-bg-secondary/70 backdrop-blur-[2px]" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="relative z-10">
          <p className="font-display text-lg uppercase tracking-[0.18em] text-white drop-shadow-md">
            Sim Pilot Logbook
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/60">
            Multi-Sim Flight Log
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
                  "rounded-sm px-3 py-2 font-display text-sm uppercase tracking-wider transition-colors duration-200",
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="relative z-10 text-white/80 md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <nav className="relative z-10 grid gap-1 border-t border-white/20 bg-bg-secondary/95 px-4 py-3 backdrop-blur-md md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-sm px-2 py-2 font-display text-sm uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
