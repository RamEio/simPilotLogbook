"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CsvImportResult = {
  created: number;
  skipped: number;
  total: number;
};

type ImportPhase = "idle" | "dragging" | "uploading" | "success" | "error";

export function CsvDropZone({
  onImport,
  disabled,
}: {
  onImport: (file: File) => Promise<CsvImportResult>;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const runImport = useCallback(
    async (file: File) => {
      if (disabled) return;
      if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
        setPhase("error");
        setMessage("Choisissez un fichier .csv");
        return;
      }
      setPhase("uploading");
      setMessage(null);
      try {
        const result = await onImport(file);
        setPhase("success");
        setMessage(
          `${result.created} vol(s) importé(s)` +
            (result.skipped ? `, ${result.skipped} déjà présent(s)` : "") +
            ` — ${result.total} ligne(s) lue(s)`,
        );
      } catch (error) {
        setPhase("error");
        setMessage(
          error instanceof Error ? error.message : "Import impossible",
        );
      } finally {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [disabled, onImport],
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled || phase === "uploading" ? -1 : 0}
        aria-disabled={disabled || phase === "uploading"}
        aria-busy={phase === "uploading"}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!disabled && phase !== "uploading") {
              inputRef.current?.click();
            }
          }
        }}
        onClick={() => {
          if (!disabled && phase !== "uploading") {
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) setPhase("dragging");
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (phase === "dragging") setPhase("idle");
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const file = event.dataTransfer.files?.[0];
          if (file) {
            void runImport(file);
          } else {
            setPhase("idle");
          }
        }}
        className={cn(
          "flex min-h-[7.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed px-4 py-6 text-center transition-colors",
          phase === "dragging" &&
            "border-crimson-600 bg-crimson-600/10 text-ink-primary",
          phase === "uploading" &&
            "cursor-wait border-status-info bg-status-info/10 text-ink-secondary",
          phase === "success" &&
            "border-status-success/50 bg-status-success/10 text-ink-secondary",
          phase === "error" &&
            "border-status-error/50 bg-status-error/10 text-ink-secondary",
          (phase === "idle" || !phase) &&
            "border-line-default bg-bg-elevated text-ink-secondary hover:border-line-strong hover:bg-bg-hover",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {phase === "uploading" ? (
          <Loader2
            className="h-6 w-6 animate-spin text-status-info"
            strokeWidth={1.5}
          />
        ) : (
          <FileUp className="h-6 w-6 text-ink-muted" strokeWidth={1.5} />
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium text-ink-primary">
            {phase === "uploading"
              ? "Import en cours…"
              : phase === "dragging"
                ? "Déposez le fichier CSV"
                : "Glissez un CSV ici, ou cliquez pour parcourir"}
          </p>
          <p className="text-caption text-ink-muted">
            Format export Sim Pilot Logbook (.csv)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={disabled || phase === "uploading"}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void runImport(file);
          }}
        />
      </div>
      {message ? (
        <p
          role="status"
          className={cn(
            "text-caption",
            phase === "error" ? "text-status-error" : "text-ink-secondary",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
