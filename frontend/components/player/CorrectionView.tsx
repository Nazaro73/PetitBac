"use client";

import type { AnswerGrid, LiveCorrectionPayload, Verdict } from "@/lib/types";

interface Props {
  categories: string[];
  ownAnswers: AnswerGrid | null;
  lastCorrection: LiveCorrectionPayload | null;
  myClientId: string;
}

export function CorrectionView({
  categories,
  ownAnswers,
  lastCorrection,
  myClientId,
}: Props) {
  return (
    <div className="card space-y-4">
      <h2 className="h-display text-2xl">
        <span className="hl">Correction en cours</span>
      </h2>
      <p className="text-sm text-ink/70">
        Le MJ valide chaque mot. Les points s'ajoutent en direct.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => {
          const cell = ownAnswers?.[category];
          const verdict = cell?.verdict ?? null;
          const justCorrected =
            lastCorrection &&
            lastCorrection.playerClientId === myClientId &&
            lastCorrection.category === category;

          return (
            <div
              key={category}
              className={`rounded-xl border-[3px] border-ink p-3 shadow-pop-sm transition ${verdictBg(verdict)} ${
                justCorrected ? "animate-pop" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="h-display text-sm">
                  {category}
                </span>
                <span className="text-xs font-black font-mono">
                  {verdictLabel(verdict)}
                </span>
              </div>
              <div className="mt-1 font-bold text-lg">
                {cell?.word ? cell.word : <span className="italic text-ink/40 font-medium">(vide)</span>}
              </div>
              {cell && verdict !== null && (
                <div className="mt-1 text-xs font-black tabular-nums">
                  +{cell.points} pt{cell.points > 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function verdictBg(v: Verdict | null) {
  switch (v) {
    case 0:
      return "bg-accent-500 text-white";
    case 1:
      return "bg-citron-500 text-ink";
    case 2:
      return "bg-brand-500 text-ink";
    default:
      return "bg-white text-ink";
  }
}

function verdictLabel(v: Verdict | null) {
  switch (v) {
    case 0:
      return "REFUSÉ";
    case 1:
      return "+1";
    case 2:
      return "+2 BONUS";
    default:
      return "EN ATTENTE";
  }
}
