import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconIL2(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3L4 10h3v7h10v-7h3L12 3z" />
      <path d="M3 17l9 4 9-4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconDCS(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12h4l2-3 3 6 2-4 2 3h7" />
      <path d="M12 4l-3 2h6l-3-2z" />
      <path d="M8 6l-4 6M16 6l4 6" />
      <path d="M5 18h14" />
      <path d="M7 18l1-2h8l1 2" />
    </svg>
  );
}

export function IconMSFS(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 14l10-8 10 8" />
      <path d="M6 12l6-5 6 5" />
      <path d="M12 7v0" />
      <circle cx="12" cy="14" r="4" />
      <path d="M8 14h8" />
      <path d="M12 10v8" />
    </svg>
  );
}

export function IconStarCitizen(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12,2 14.5,9 22,9 16,13.5 18,21 12,17 6,21 8,13.5 2,9 9.5,9" />
    </svg>
  );
}

const GAME_ICON_MAP: Record<string, React.FC<IconProps>> = {
  IL2_GB: IconIL2,
  IL2_KOREA: IconIL2,
  DCS: IconDCS,
  MSFS: IconMSFS,
  STAR_CITIZEN: IconStarCitizen,
};

export function GameIcon({ game, ...props }: IconProps & { game: string }) {
  const Icon = GAME_ICON_MAP[game];
  if (!Icon) return null;
  return <Icon {...props} />;
}
