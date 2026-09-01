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

/** Native asset size — avoid upscaling past source on ultra-wide */
const HEADER_NATIVE_W = 1672;
const HEADER_NATIVE_H = 941;

export function Nav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const headerSrc =
    theme === "light" ? "/header-light.png" : "/header-dark.png";
  const isHome = pathname === "/";

  return (
    <header className="relative z-20 w-full">
      <div className="sticky top-0 z-30 border-b border-line-subtle bg-bg-elevated/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-3.5 lg:px-16">
          <nav
            className="hidden min-w-0 flex-1 items-center gap-1 md:flex"
            aria-label="Navigation principale"
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
                  className={cn(
                    "rounded px-3 py-2 text-sm transition-colors duration-200",
                    active
                      ? "nav-active bg-bg-card font-medium"
                      : "text-ink-secondary hover:bg-bg-hover hover:text-ink-primary",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded text-ink-primary md:hidden"
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

        {open ? (
          <nav
            className="grid gap-1 border-t border-line-subtle px-4 py-3 md:hidden"
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
                    "flex min-h-11 items-center rounded px-3 py-3 text-sm",
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
      </div>

      {/* Image plein cadre, object-cover (zoom) */}
      <div
        className={cn(
          "relative w-full overflow-hidden border-b border-line-subtle bg-bg-deep",
          isHome ? "min-h-[300px] h-[50vh] max-h-[50vh]" : "h-24 md:h-[6.5rem]",
        )}
      >
        <Image
          key={headerSrc}
          src={headerSrc}
          alt=""
          width={HEADER_NATIVE_W}
          height={HEADER_NATIVE_H}
          priority
          className="absolute inset-0 h-full w-full object-cover object-center"
          sizes="100vw"
        />

        <div className="header-scrim absolute inset-0 z-[1]" aria-hidden />

        <div className="absolute inset-0 z-[2] flex items-center">
          <div
            className={cn(
              "mx-auto w-full max-w-content px-4 md:px-8 lg:px-16",
              isHome ? "py-8 md:py-12 lg:py-14" : "py-2.5 md:py-3",
            )}
          >
            <div className="header-hero-copy max-w-xl motion-safe:animate-fade-up">
              <p className="text-overline font-medium uppercase tracking-overline text-amber-400 drop-shadow-sm">
                Carnet multi-simulateurs
              </p>
              <h1
                className={cn(
                  "mt-1 font-bold tracking-tight text-white drop-shadow-md",
                  isHome
                    ? "text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-tight"
                    : "text-lg sm:text-xl md:text-2xl",
                )}
              >
                <Link
                  href="/"
                  className="rounded outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  Sim Pilot Logbook
                </Link>
              </h1>
              {isHome ? (
                <>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-white/95 drop-shadow-sm sm:text-lg">
                    Le carnet de vol partagé pour escadrilles virtuelles — IL-2,
                    DCS, Star Citizen, MSFS et plus.
                  </p>
                  <Link
                    href="/log"
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded bg-crimson-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-crimson-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    Enregistrer un vol
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
