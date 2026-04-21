"use client";

import type { Player } from "@/lib/types";

interface Props {
  players: Player[];
  highlightClientId?: string | null;
  mjClientId?: string | null;
  compact?: boolean;
}

export function ScoreboardPanel({
  players,
  highlightClientId,
  mjClientId,
  compact,
}: Props) {
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );
  if (sorted.length === 0) {
    return (
      <div className="card">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Classement
        </h3>
        <p className="text-slate-500 text-sm">Aucun joueur connecté.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Classement
      </h3>
      <ol className={`space-y-${compact ? "1" : "2"}`}>
        {sorted.map((p, idx) => {
          const isMe = highlightClientId && p.clientId === highlightClientId;
          const isMJ = mjClientId && p.clientId === mjClientId;
          return (
            <li
              key={p.clientId}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition ${
                isMe ? "bg-brand-500/10 border border-brand-500/30" : "bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  {idx + 1}.
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`truncate font-medium ${
                        p.connected ? "text-slate-100" : "text-slate-500 line-through"
                      }`}
                    >
                      {p.name}
                    </span>
                    {isMJ && (
                      <span className="badge bg-brand-500/20 text-brand-200 border border-brand-500/30">
                        MJ
                      </span>
                    )}
                    {isMe && (
                      <span className="badge bg-emerald-500/20 text-emerald-300">
                        vous
                      </span>
                    )}
                  </div>
                  {p.finished && (
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400">
                      Grille remplie
                    </div>
                  )}
                </div>
              </div>
              <div className="font-mono text-lg font-bold tabular-nums text-brand-200">
                {p.score}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
