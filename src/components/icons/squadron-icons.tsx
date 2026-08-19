import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Shield(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function Wings(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 12L2 9l10 6 10-6-10 3z" />
      <circle cx="12" cy="10" r="2" />
      <path d="M12 14v4" />
    </svg>
  );
}

function Crosshair(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function Skull(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="10" r="8" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="15" cy="9" r="1.5" fill="currentColor" />
      <path d="M9 18v3M12 18v3M15 18v3" />
      <path d="M8 14c1.5 1 5.5 1 8 0" />
    </svg>
  );
}

function Eagle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 4c-4 0-8 3-9 7 2-1 4-1 6 0l3-3 3 3c2-1 4-1 6 0-1-4-5-7-9-7z" />
      <path d="M12 8v8" />
      <path d="M8 20l4-4 4 4" />
    </svg>
  );
}

function Bolt(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  );
}

function Chevrons(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7l8 5-8 5" />
      <path d="M12 7l8 5-8 5" />
    </svg>
  );
}

function Anchor(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v13" />
      <path d="M5 12H2a10 10 0 0020 0h-3" />
    </svg>
  );
}

function Sword(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2l2 10-2 2-2-2 2-10z" />
      <path d="M8 12h8" />
      <path d="M10 14l2 8 2-8" />
    </svg>
  );
}

function Flame(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c-4 0-7-3-7-7 0-3 2-5 4-8 1 2 2 3 3 3s2-1 3-3c2 3 4 5 4 8 0 4-3 7-7 7z" />
      <path d="M12 22c-1.5 0-3-1.5-3-3.5 0-1.5 1-3 3-5 2 2 3 3.5 3 5s-1.5 3.5-3 3.5z" />
    </svg>
  );
}

function Compass(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  );
}

function Propeller(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10C12 6 14 2 14 2s-4 2-4 6" />
      <path d="M14 12c4 0 8 2 8 2s-2-4-6-4" />
      <path d="M12 14c0 4-2 8-2 8s4-2 4-6" />
      <path d="M10 12c-4 0-8-2-8-2s2 4 6 4" />
    </svg>
  );
}

export const SQUADRON_ICONS = [
  { value: "shield", label: "Bouclier", Icon: Shield },
  { value: "wings", label: "Ailes", Icon: Wings },
  { value: "crosshair", label: "Viseur", Icon: Crosshair },
  { value: "skull", label: "Crâne", Icon: Skull },
  { value: "eagle", label: "Aigle", Icon: Eagle },
  { value: "bolt", label: "Éclair", Icon: Bolt },
  { value: "chevrons", label: "Chevrons", Icon: Chevrons },
  { value: "anchor", label: "Ancre", Icon: Anchor },
  { value: "sword", label: "Épée", Icon: Sword },
  { value: "flame", label: "Flamme", Icon: Flame },
  { value: "compass", label: "Boussole", Icon: Compass },
  { value: "propeller", label: "Hélice", Icon: Propeller },
] as const;

export type SquadronIconValue = (typeof SQUADRON_ICONS)[number]["value"];

export function SquadronIcon({
  icon,
  ...props
}: IconProps & { icon: string | null | undefined }) {
  const entry = SQUADRON_ICONS.find((i) => i.value === icon);
  if (!entry) return <Shield {...props} />;
  return <entry.Icon {...props} />;
}
