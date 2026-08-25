"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Tableau de bord" },
  { href: "/log", label: "Enregistrer un vol" },
  { href: "/flights", label: "Vols" },
  { href: "/squadrons", label: "Escadrilles" },
  { href: "/pilots", label: "Pilotes" },
  { href: "/leaderboard", label: "Classements" },
];

export function Nav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const headerSrc =
    theme === "light" ? "/header-light.png" : "/header-dark.png";

  return (
    <header className="relative z-10 w-full border-b border-line-subtle">
      <div className="relative w-full">
        <Image
          key={headerSrc}
          src={headerSrc}
          alt=""
          width={1672}
          height={941}
          priority
          className="block h-auto w-full"
          sizes="100vw"
        />

        <div className="header-scrim absolute inset-0" aria-hidden />

        <div className="absolute inset-0 flex flex-col">
          {/* Chrome : navigation seule — le branding vit dans le hero */}
          <div className="mx-auto flex w-full max-w-content items-center justify-end gap-3 px-4 py-3 md:justify-between md:px-8 md:py-4 lg:px-16">
            <Link
              href="/"
              className="mr-auto text-overline font-medium uppercase tracking-overline text-white/80 transition-colors hover:text-white md:mr-0"
            >
              Accueil
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
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
                      "rounded px-3 py-2 text-sm transition-colors duration-200",
                      active
                        ? "bg-white/20 font-medium text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle className="border-white/40 bg-black/25 text-white hover:bg-black/40 hover:text-white" />
              <button
                type="button"
                className="text-white md:hidden"
                onClick={() => setOpen((current) => !current)}
                aria-label="Menu"
                aria-expanded={open}
              >
                {open ? (
                  <X className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Hero : marque + promesse — hiérarchie explicite */}
          <div className="mx-auto flex w-full max-w-content flex-1 items-center px-4 pb-8 pt-2 md:px-8 md:pb-12 lg:px-16 lg:pb-16">
            <div className="header-hero-copy max-w-xl motion-safe:animate-fade-up">
              <p className="text-overline font-medium uppercase tracking-overline text-amber-400 drop-shadow-sm">
                Multi-sim flight log
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-tight">
                <Link
                  href="/"
                  className="rounded outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  Sim Pilot Logbook
                </Link>
              </h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-white/90 drop-shadow-sm sm:text-lg">
                Enregistrez toutes vos sessions de vol — IL-2, DCS, Star Citizen,
                MSFS et plus encore.
              </p>
            </div>
          </div>
        </div>
      </div>

      {open ? (
        <nav
          className="grid gap-1 border-t border-line-subtle bg-bg-elevated px-4 py-3 md:hidden"
          aria-label="Navigation mobile"
        >
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded px-2 py-2 text-sm",
                  active
                    ? "nav-active bg-bg-card"
                    : "text-ink-secondary hover:bg-bg-hover hover:text-ink-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
