"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthPinPanel({
  callsign = "PILOTE",
  onSubmit,
  onSkip,
  errorMessage,
  className,
}: {
  callsign?: string;
  onSubmit?: (pin: string) => void;
  onSkip?: () => void;
  errorMessage?: string | null;
  className?: string;
}) {
  const [pin, setPin] = useState("");
  const [localError, setLocalError] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setLocalError(true);
      return;
    }
    setLocalError(false);
    onSubmit?.(pin);
  }

  const showError = localError || Boolean(errorMessage);

  return (
    <Card className={cn("mx-auto max-w-sm shadow-level-2", className)}>
      <CardHeader>
        <p className="overline overline-amber">Auth / PIN</p>
        <CardTitle className="text-h3">Identification pilote</CardTitle>
        <p className="text-sm text-ink-secondary">
          Entre le code PIN à 4 chiffres pour{" "}
          <span className="font-medium text-ink-primary">{callsign}</span>.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="pin">Code PIN</Label>
            <Input
              id="pin"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
                setLocalError(false);
              }}
              className={cn(
                "text-center text-h3 tracking-[0.4em]",
                showError && "border-status-error",
              )}
              aria-invalid={showError}
            />
            {showError ? (
              <p className="text-caption text-status-error">
                {errorMessage ?? "PIN invalide — 4 chiffres requis."}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full">
            Continuer
          </Button>
          {onSkip ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onSkip}
            >
              Sans PIN (club trust)
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
