"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DurationInput({
  hours,
  minutes,
  onChange,
}: {
  hours: number;
  minutes: number;
  onChange: (hours: number, minutes: number) => void;
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
            value={Number.isNaN(minutes) ? "" : minutes}
            onChange={(event) => onChange(hours, Number(event.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

export function durationToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}
