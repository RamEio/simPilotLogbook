"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { GAMES, type Game } from "@/lib/constants";
import { readLogDefaults } from "@/lib/log-defaults";
import {
  POINTS_RULES_LABEL,
  SUCCESS_BOARD_MIN_FLIGHTS,
} from "@/lib/scoring";
import { cn, formatCount, formatDate, formatHours } from "@/lib/utils";

type RankRow = {
  id: string;
  name: string;
  callsign: string | null;
  squadronName?: string;
  tag?: string | null;
  flights: number;
  minutes: number;
  successes: number;
  successRate: number;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  points: number;
};

type RecordItem = {
  key: string;
  label: string;
  display: string;
  href: string;
};

type Spotlight = {
  date: string;
  flightCount: number;
  flightId: string;
  pilotId: string;
  pilotLabel: string;
  aircraftName: string;
  duration: number;
  points: number;
};

type LeaderboardResponse = {
  period: string;
  game: string;
  squadronId: string;
  status: string;
  rules: string;
  successMinFlights: number;
  asOf: string | null;
  pilots: RankRow[];
  previousPilots: RankRow[];
  squadrons: RankRow[];
  previousSquadrons: RankRow[];
  spotlight: Spotlight | null;
  records: { flight: RecordItem[]; career: RecordItem[] };
};

type SquadronOption = {
  id: string;
  name: string;
  tag: string | null;
};

type Board =
  | "hours"
  | "points"
  | "air"
  | "naval"
  | "ground"
  | "building"
  | "success";

const BOARDS: { value: Board; label: string }[] = [
  { value: "hours", label: "Heures de vol" },
  { value: "points", label: "Points" },
  { value: "success", label: "Réussite" },
  { value: "air", label: "Kills aériens" },
  { value: "naval", label: "Kills navals" },
  { value: "ground", label: "Kills sol" },
  { value: "building", label: "Kills building" },
];

const BOARD_VALUES = new Set(BOARDS.map((item) => item.value));

function parseBoard(value: string | null): Board {
  if (value && BOARD_VALUES.has(value as Board)) return value as Board;
  return "points";
}

function parsePeriod(value: string | null): string {
  if (value === "30d" || value === "year") return value;
  return "all";
}

function parseStatus(value: string | null): "ACTIVE" | "all" {
  return value === "all" ? "all" : "ACTIVE";
}

function parseGame(value: string | null): Game | "all" {
  if (value && GAMES.some((item) => item.value === value)) {
    return value as Game;
  }
  return "all";
}

function metric(row: RankRow, board: Board): number {
  switch (board) {
    case "points":
      return row.points;
    case "air":
      return row.killsAir;
    case "naval":
      return row.killsNaval;
    case "ground":
      return row.killsGround;
    case "building":
      return row.killsBuilding;
    case "success":
      return row.successRate;
    default:
      return row.minutes;
  }
}

function formatMetric(
  row: RankRow,
  board: Board,
): { primary: string; secondary: string } {
  if (board === "hours") {
    return {
      primary: formatHours(row.minutes),
      secondary: `${formatCount(row.flights, "vol")} · ${row.successRate}%`,
    };
  }
  if (board === "points") {
    return {
      primary: `${row.points} pts`,
      secondary: `${formatCount(row.flights, "vol")} · ${formatHours(row.minutes)}`,
    };
  }
  if (board === "success") {
    return {
      primary: `${row.successRate}%`,
      secondary: `${row.successes}/${row.flights} réussites`,
    };
  }
  return {
    primary: String(metric(row, board)),
    secondary: `${row.points} pts · ${formatHours(row.minutes)}`,
  };
}

function formatGap(board: Board, diff: number): string {
  if (board === "hours") return `${formatHours(diff)} pour le rang au-dessus`;
  if (board === "points") return `${round1(diff)} pts pour le rang au-dessus`;
  if (board === "success") return `${Math.round(diff)} % pour le rang au-dessus`;
  return `${round1(diff)} pour le rang au-dessus`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function compareRows(a: RankRow, b: RankRow, board: Board): number {
  if (board === "success") {
    return (
      b.successRate - a.successRate ||
      b.flights - a.flights ||
      b.points - a.points ||
      b.minutes - a.minutes
    );
  }
  return (
    metric(b, board) - metric(a, board) ||
    b.points - a.points ||
    b.minutes - a.minutes
  );
}

function rankList(rows: RankRow[], board: Board, minFlights: number): RankRow[] {
  const source =
    board === "success"
      ? rows.filter((row) => row.flights >= minFlights)
      : rows;
  return [...source].sort((a, b) => compareRows(a, b, board));
}

function rankMap(rows: RankRow[]): Map<string, number> {
  return new Map(rows.map((row, index) => [row.id, index + 1]));
}

function deltaLabel(
  currentRank: number,
  previous: Map<string, number>,
  id: string,
): string | null {
  const prev = previous.get(id);
  if (!prev) return null;
  const delta = prev - currentRank;
  if (delta === 0) return "–";
  if (delta > 0) return `▲${delta}`;
  return `▼${Math.abs(delta)}`;
}

function displayName(row: RankRow): string {
  return row.callsign ?? row.name;
}

function LeaderboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [board, setBoard] = useState<Board>(() =>
    parseBoard(searchParams.get("board")),
  );
  const [period, setPeriod] = useState(() =>
    parsePeriod(searchParams.get("period")),
  );
  const [game, setGame] = useState<Game | "all">(() =>
    parseGame(searchParams.get("game")),
  );
  const [squadronId, setSquadronId] = useState(
    () => searchParams.get("squadronId") ?? "all",
  );
  const [status, setStatus] = useState<"ACTIVE" | "all">(() =>
    parseStatus(searchParams.get("status")),
  );
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [squadronOptions, setSquadronOptions] = useState<SquadronOption[]>(
    [],
  );
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [logPilotId, setLogPilotId] = useState<string | null>(null);

  useEffect(() => {
    setLogPilotId(readLogDefaults().pilotId ?? null);
  }, []);

  useEffect(() => {
    void apiFetch<SquadronOption[]>("/api/squadrons").then(setSquadronOptions);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("board", board);
    params.set("period", period);
    params.set("status", status);
    if (game !== "all") params.set("game", game);
    if (squadronId !== "all") params.set("squadronId", squadronId);
    if (query.trim()) params.set("q", query.trim());
    const highlight = searchParams.get("highlight");
    if (highlight) params.set("highlight", highlight);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`/leaderboard?${next}`, { scroll: false });
    }
  }, [board, period, game, squadronId, status, query, router, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("period", period);
    if (game !== "all") params.set("game", game);
    if (squadronId !== "all") params.set("squadronId", squadronId);
    if (status !== "all") params.set("status", status);
    void apiFetch<LeaderboardResponse>(
      `/api/stats/leaderboard?${params.toString()}`,
    ).then(setData);
  }, [period, game, squadronId, status]);

  const minFlights = data?.successMinFlights ?? SUCCESS_BOARD_MIN_FLIGHTS;
  const pilots = useMemo(
    () => (data ? rankList(data.pilots, board, minFlights) : []),
    [data, board, minFlights],
  );
  const previousPilotRanks = useMemo(
    () =>
      rankMap(
        data ? rankList(data.previousPilots, board, minFlights) : [],
      ),
    [data, board, minFlights],
  );
  const squadrons = useMemo(
    () => (data ? rankList(data.squadrons, board, minFlights) : []),
    [data, board, minFlights],
  );
  const previousSquadronRanks = useMemo(
    () =>
      rankMap(
        data ? rankList(data.previousSquadrons, board, minFlights) : [],
      ),
    [data, board, minFlights],
  );

  const q = query.trim().toLowerCase();
  const focusedId = useMemo(() => {
    const fromUrl = searchParams.get("highlight");
    if (fromUrl) return fromUrl;
    if (q) {
      const matches = pilots.filter((pilot) => {
        const hay = `${pilot.name} ${pilot.callsign ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
      if (matches.length === 1) return matches[0].id;
    }
    return logPilotId;
  }, [searchParams, q, pilots, logPilotId]);

  const focusedPilot = pilots.find((pilot) => pilot.id === focusedId);
  const focusedIndex = focusedPilot
    ? pilots.findIndex((pilot) => pilot.id === focusedId)
    : -1;
  const gapText =
    focusedPilot && focusedIndex > 0
      ? formatGap(
          board,
          metric(pilots[focusedIndex - 1], board) - metric(focusedPilot, board),
        )
      : null;
  const unrankedFocus =
    focusedId && data && !focusedPilot
      ? data.pilots.find((pilot) => pilot.id === focusedId)
      : undefined;

  const filteredPilots = q
    ? pilots.filter((pilot) =>
        `${pilot.name} ${pilot.callsign ?? ""}`.toLowerCase().includes(q),
      )
    : pilots;

  const tieBreak =
    board === "success"
      ? `Réussite = vols « Réussite totale » / vols. Classé à partir de ${minFlights} vols. Égalité : plus de vols, puis plus de points.`
      : "Égalité : plus de points, puis plus d’heures.";

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs items={[{ label: "Classements" }]} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="overline overline-amber">Opérations / Classements</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Classements</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-secondary">
            Heures, kills et points — pilotes et escadrilles.
          </p>
          <p className="mt-2 text-caption text-ink-muted">
            Règle points : {data?.rules ?? POINTS_RULES_LABEL}
          </p>
          {data?.asOf ? (
            <p className="mt-1 text-caption text-ink-muted">
              Dernier vol : {formatDate(data.asOf)}
              {data.spotlight
                ? ` · dernière soirée ${formatDate(data.spotlight.date)} (${formatCount(data.spotlight.flightCount, "vol")})`
                : ""}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={board}
            onValueChange={(value) => setBoard(value as Board)}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-[180px]">
              <SelectValue placeholder="Classement" />
            </SelectTrigger>
            <SelectContent>
              {BOARDS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="min-h-11 w-full sm:w-[160px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes périodes</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={game}
            onValueChange={(value) => setGame(value as Game | "all")}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-[160px]">
              <SelectValue placeholder="Simulateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous simulateurs</SelectItem>
              {GAMES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.short}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={squadronId} onValueChange={setSquadronId}>
            <SelectTrigger className="min-h-11 w-full sm:w-[180px]">
              <SelectValue placeholder="Escadrille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les escadrilles</SelectItem>
              {squadronOptions.map((squadron) => (
                <SelectItem key={squadron.id} value={squadron.id}>
                  {squadron.tag
                    ? `${squadron.tag} — ${squadron.name}`
                    : squadron.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "ACTIVE" | "all")}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Actifs</SelectItem>
              <SelectItem value="all">Tous les pilotes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Trouver un pilote (nom ou indicatif)"
        className="min-h-11 max-w-md"
        aria-label="Trouver un pilote"
      />

      {data?.spotlight ? (
        <Card>
          <CardHeader>
            <CardTitle>Meilleur vol — dernière soirée</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/flights/${data.spotlight.flightId}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-3 transition-colors hover:bg-bg-hover"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink-primary">
                  {data.spotlight.pilotLabel}
                  {" · "}
                  {data.spotlight.aircraftName}
                </p>
                <p className="text-caption text-ink-muted">
                  {formatDate(data.spotlight.date)} ·{" "}
                  {formatHours(data.spotlight.duration)} ·{" "}
                  {formatCount(data.spotlight.flightCount, "vol")} ce soir-là
                </p>
              </div>
              <p className="shrink-0 font-medium text-ink-primary">
                {data.spotlight.points} pts
              </p>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {focusedPilot && gapText ? (
        <p className="text-sm text-ink-secondary">
          {displayName(focusedPilot)} : {gapText}
        </p>
      ) : null}
      {unrankedFocus && board === "success" ? (
        <p className="text-sm text-ink-secondary">
          {displayName(unrankedFocus)} : plus que{" "}
          {minFlights - unrankedFocus.flights}{" "}
          {minFlights - unrankedFocus.flights === 1 ? "vol" : "vols"} pour être
          classé en réussite.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pilotes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!data ? (
              <p className="text-sm text-ink-secondary">Chargement…</p>
            ) : !filteredPilots.length ? (
              <p className="text-sm text-ink-secondary">
                {board === "success"
                  ? `Personne n’a encore ${minFlights} vols pour ces filtres.`
                  : "Aucun vol pour ces filtres."}
              </p>
            ) : (
              filteredPilots.map((pilot) => {
                const index = pilots.findIndex((row) => row.id === pilot.id);
                const display = formatMetric(pilot, board);
                const delta = deltaLabel(
                  index + 1,
                  previousPilotRanks,
                  pilot.id,
                );
                const focused = pilot.id === focusedId;
                return (
                  <Link
                    key={pilot.id}
                    href={`/pilots/${pilot.id}`}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded border bg-bg-elevated px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-default hover:bg-bg-hover",
                      focused
                        ? "border-status-info"
                        : "border-line-subtle",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Badge variant={index < 3 ? "warning" : "neutral"}>
                        #{index + 1}
                      </Badge>
                      {delta && period !== "all" ? (
                        <span
                          className={cn(
                            "text-caption",
                            delta.startsWith("▲")
                              ? "text-status-success"
                              : delta.startsWith("▼")
                                ? "text-status-error"
                                : "text-ink-muted",
                          )}
                        >
                          {delta}
                        </span>
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-primary">
                          {displayName(pilot)}
                        </p>
                        <p className="text-caption text-ink-muted">
                          {pilot.squadronName}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-caption text-ink-secondary">
                      <p className="font-medium text-ink-primary">
                        {display.primary}
                      </p>
                      <p>{display.secondary}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escadrilles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!data ? (
              <p className="text-sm text-ink-secondary">Chargement…</p>
            ) : !squadrons.length ? (
              <p className="text-sm text-ink-secondary">
                Aucun vol pour ces filtres.
              </p>
            ) : (
              squadrons.map((squadron, index) => {
                const display = formatMetric(squadron, board);
                const delta = deltaLabel(
                  index + 1,
                  previousSquadronRanks,
                  squadron.id,
                );
                return (
                  <Link
                    key={squadron.id}
                    href={`/squadrons/${squadron.id}`}
                    className="flex items-center justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-default hover:bg-bg-hover"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Badge variant={index < 3 ? "warning" : "neutral"}>
                        #{index + 1}
                      </Badge>
                      {delta && period !== "all" ? (
                        <span
                          className={cn(
                            "text-caption",
                            delta.startsWith("▲")
                              ? "text-status-success"
                              : delta.startsWith("▼")
                                ? "text-status-error"
                                : "text-ink-muted",
                          )}
                        >
                          {delta}
                        </span>
                      ) : null}
                      <p className="truncate font-medium text-ink-primary">
                        {squadron.tag ? `${squadron.tag} ` : ""}
                        {squadron.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-caption text-ink-secondary">
                      <p className="font-medium text-ink-primary">
                        {display.primary}
                      </p>
                      <p>{display.secondary}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-caption text-ink-muted">{tieBreak}</p>

      {data &&
      (data.records.flight.length || data.records.career.length) ? (
        <section className="space-y-3">
          <h2 className="text-h3 text-ink-primary">Records</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Un vol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.records.flight.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-2 text-sm hover:bg-bg-hover"
                  >
                    <span className="text-ink-secondary">{item.label}</span>
                    <span className="shrink-0 text-right text-ink-primary">
                      {item.display}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Carrière (période)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.records.career.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-2 text-sm hover:bg-bg-hover"
                  >
                    <span className="text-ink-secondary">{item.label}</span>
                    <span className="shrink-0 text-right text-ink-primary">
                      {item.display}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-ink-secondary">Chargement des classements…</p>
      }
    >
      <LeaderboardInner />
    </Suspense>
  );
}
