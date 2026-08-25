"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { GAMES, type Game } from "@/lib/constants";
import { POINTS_RULES_LABEL } from "@/lib/scoring";
import { formatHours } from "@/lib/utils";

type PilotRank = {
  id: string;
  name: string;
  callsign: string | null;
  squadronName: string;
  flights: number;
  minutes: number;
  successRate: number;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  points: number;
};

type SquadronRank = {
  id: string;
  name: string;
  tag: string | null;
  flights: number;
  minutes: number;
  successRate: number;
  killsAir: number;
  killsNaval: number;
  killsGround: number;
  killsBuilding: number;
  points: number;
};

type LeaderboardResponse = {
  period: string;
  game: string;
  rules: string;
  pilots: PilotRank[];
  squadrons: SquadronRank[];
};

type Board =
  | "hours"
  | "points"
  | "air"
  | "naval"
  | "ground"
  | "building";

const BOARDS: { value: Board; label: string }[] = [
  { value: "hours", label: "Heures de vol" },
  { value: "points", label: "Points" },
  { value: "air", label: "Kills aériens" },
  { value: "naval", label: "Kills navals" },
  { value: "ground", label: "Kills sol" },
  { value: "building", label: "Kills building" },
];

function metric(
  row: {
    minutes: number;
    points: number;
    killsAir: number;
    killsNaval: number;
    killsGround: number;
    killsBuilding: number;
  },
  board: Board,
): number {
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
    default:
      return row.minutes;
  }
}

function formatMetric(
  row: {
    minutes: number;
    points: number;
    flights: number;
    successRate: number;
    killsAir: number;
    killsNaval: number;
    killsGround: number;
    killsBuilding: number;
  },
  board: Board,
): { primary: string; secondary: string } {
  if (board === "hours") {
    return {
      primary: formatHours(row.minutes),
      secondary: `${row.flights} vols · ${row.successRate}%`,
    };
  }
  if (board === "points") {
    return {
      primary: `${row.points} pts`,
      secondary: `${row.flights} vols · ${formatHours(row.minutes)}`,
    };
  }
  const value = metric(row, board);
  return {
    primary: String(value),
    secondary: `${row.points} pts · ${formatHours(row.minutes)}`,
  };
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all");
  const [game, setGame] = useState<Game | "all">("all");
  const [board, setBoard] = useState<Board>("points");
  const [data, setData] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("period", period);
    if (game !== "all") {
      params.set("game", game);
    }
    void apiFetch<LeaderboardResponse>(
      `/api/stats/leaderboard?${params.toString()}`,
    ).then(setData);
  }, [period, game]);

  const pilots = useMemo(() => {
    if (!data) return [];
    return [...data.pilots].sort(
      (a, b) =>
        metric(b, board) - metric(a, board) ||
        b.points - a.points ||
        b.minutes - a.minutes,
    );
  }, [data, board]);

  const squadrons = useMemo(() => {
    if (!data) return [];
    return [...data.squadrons].sort(
      (a, b) =>
        metric(b, board) - metric(a, board) ||
        b.points - a.points ||
        b.minutes - a.minutes,
    );
  }, [data, board]);

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs items={[{ label: "Classements" }]} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="overline overline-amber">Ops / Leaderboard</p>
          <h1 className="mt-1 text-h1 text-ink-primary">Classements</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-secondary">
            Heures, kills et points — pilotes et escadrilles.
          </p>
          <p className="mt-2 text-caption text-ink-muted">
            Règle points : {POINTS_RULES_LABEL}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={board}
            onValueChange={(value) => setBoard(value as Board)}
          >
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All-time</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={game}
            onValueChange={(value) => setGame(value as Game | "all")}
          >
            <SelectTrigger className="w-[160px]">
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pilotes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!pilots.length ? (
              <p className="text-sm text-ink-secondary">
                Aucun vol pour ces filtres.
              </p>
            ) : (
              pilots.map((pilot, index) => {
                const display = formatMetric(pilot, board);
                return (
                  <Link
                    key={pilot.id}
                    href={`/pilots/${pilot.id}`}
                    className="flex items-center justify-between gap-3 rounded border border-line-subtle bg-bg-elevated px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-default hover:bg-bg-hover"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Badge variant={index < 3 ? "warning" : "neutral"}>
                        #{index + 1}
                      </Badge>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-primary">
                          {pilot.callsign ?? pilot.name}
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
            {!squadrons.length ? (
              <p className="text-sm text-ink-secondary">
                Aucun vol pour ces filtres.
              </p>
            ) : (
              squadrons.map((squadron, index) => {
                const display = formatMetric(squadron, board);
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
    </div>
  );
}
