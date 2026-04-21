"use client";

import type { Phase } from "@/lib/types";

interface Props {
  phase: Phase | undefined;
  letter: string | null | undefined;
  roundNumber: number | undefined;
}

export function PhaseBanner({ phase, letter, roundNumber }: Props) {
  const styles = ((): { label: string; color: string } => {
    switch (phase) {
      case "writing":
        return { label: "Écriture en cours", color: "text-amber-300" };
      case "correcting":
        return { label: "Correction", color: "text-brand-300" };
      default:
        return { label: "Lobby", color: "text-slate-300" };
    }
  })();

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-600/20 border border-brand-500/30 text-4xl font-black text-brand-200">
          {letter ?? "—"}
        </div>
        <div>
          <div className={`text-sm font-semibold uppercase tracking-wider ${styles.color}`}>
            {styles.label}
          </div>
          <div className="text-xs text-slate-500">
            Manche #{roundNumber ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
