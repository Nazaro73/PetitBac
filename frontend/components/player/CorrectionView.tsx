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
      <h2 className="text-xl font-bold">Correction en cours</h2>
      <p className="text-sm text-slate-400">
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
              className={`rounded-xl border p-3 transition ${verdictBg(verdict)} ${
                justCorrected ? "animate-pop" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {verdictLabel(verdict)}
                </span>
              </div>
              <div className="mt-1 font-semibold">
                {cell?.word ? cell.word : <span className="italic text-slate-500">(vide)</span>}
              </div>
              {cell && verdict !== null && (
                <div className="mt-1 text-xs font-bold tabular-nums text-slate-200">
                  +{cell.points}
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
      return "bg-red-500/10 border-red-500/40 text-red-100";
    case 1:
      return "bg-amber-500/10 border-amber-500/40 text-amber-100";
    case 2:
      return "bg-emerald-500/10 border-emerald-500/40 text-emerald-100";
    default:
      return "bg-slate-900/40 border-slate-700 text-slate-200";
  }
}

function verdictLabel(v: Verdict | null) {
  switch (v) {
    case 0:
      return "Refusé";
    case 1:
      return "+1";
    case 2:
      return "+2 bonus";
    default:
      return "En attente";
  }
}
