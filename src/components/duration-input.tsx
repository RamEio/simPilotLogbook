"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DurationInput({
  hours,
  minutes,
  onChange,
  error,
}: {
  hours: number;
  minutes: number;
  onChange: (hours: number, minutes: number) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label required>Durée</Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="hours" className="normal-case tracking-normal">
            Heures
          </Label>
          <Input
            id="hours"
            type="number"
            min={0}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "error-duration" : undefined}
            className={error ? "border-status-error focus-visible:border-status-error" : undefined}
            value={Number.isNaN(hours) ? "" : hours}
            onChange={(event) =>
              onChange(Number(event.target.value), minutes)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minutes" className="normal-case tracking-normal">
            Minutes
          </Label>
          <Input
            id="minutes"
            type="number"
            min={0}
            max={59}
            aria-invalid={Boolean(error)}
            className={error ? "border-status-error focus-visible:border-status-error" : undefined}
            value={Number.isNaN(minutes) ? "" : minutes}
            onChange={(event) => onChange(hours, Number(event.target.value))}
          />
        </div>
      </div>
      {error ? (
        <p id="error-duration" className="text-caption text-status-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function durationToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}
