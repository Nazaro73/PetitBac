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
}: Props) {
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );
  if (sorted.length === 0) {
    return (
      <div className="card-cyan">
        <h3 className="h-display mb-2 text-lg">
          <span className="hl">Classement</span>
        </h3>
        <p className="text-ink/60 text-sm">Aucun joueur connecté.</p>
      </div>
    );
  }
  return (
    <div className="card-cyan">
      <h3 className="h-display mb-4 text-lg">
        <span className="hl">Classement</span>
      </h3>
      <ol className="space-y-2">
        {sorted.map((p, idx) => {
          const isMe = highlightClientId && p.clientId === highlightClientId;
          const isMJ = mjClientId && p.clientId === mjClientId;
          const podiumColor =
            idx === 0
              ? "bg-citron-500"
              : idx === 1
                ? "bg-brand-500"
                : idx === 2
                  ? "bg-accent-500 text-white"
                  : "bg-white";
          return (
            <li
              key={p.clientId}
              className={`flex items-center justify-between gap-3 rounded-xl border-[3px] border-ink px-3 py-2 shadow-pop-sm ${
                isMe ? "bg-brand-100" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-ink text-xs font-black ${podiumColor}`}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`truncate font-bold ${
                        p.connected ? "text-ink" : "text-ink/40 line-through"
                      }`}
                    >
                      {p.name}
                    </span>
                    {isMJ && (
                      <span className="badge bg-accent-500 text-white">MJ</span>
                    )}
                    {isMe && (
                      <span className="badge bg-citron-500">vous</span>
                    )}
                  </div>
                  {p.finished && (
                    <div className="text-[10px] uppercase tracking-wider font-bold text-accent-600">
                      Grille remplie ✓
                    </div>
                  )}
                </div>
              </div>
              <div className="font-display text-2xl font-black tabular-nums text-ink">
                {p.score}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
