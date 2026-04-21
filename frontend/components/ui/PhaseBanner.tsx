"use client";

import type { Phase } from "@/lib/types";

interface Props {
  phase: Phase | undefined;
  letter: string | null | undefined;
  roundNumber: number | undefined;
}

export function PhaseBanner({ phase, letter, roundNumber }: Props) {
  const styles = ((): { label: string; bg: string } => {
    switch (phase) {
      case "writing":
        return { label: "Écriture en cours", bg: "bg-citron-500" };
      case "correcting":
        return { label: "Correction", bg: "bg-accent-500 text-white" };
      default:
        return { label: "Lobby", bg: "bg-brand-500" };
    }
  })();

  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-[3px] border-ink bg-white text-4xl font-black text-ink shadow-pop-sm">
          {letter ?? "—"}
        </div>
        <div>
          <div
            className={`inline-block rounded-full border-[3px] border-ink px-3 py-0.5 text-xs font-bold uppercase tracking-wider shadow-pop-sm ${styles.bg}`}
          >
            {styles.label}
          </div>
          <div className="mt-1 text-xs font-semibold text-ink/60">
            Manche #{roundNumber ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
