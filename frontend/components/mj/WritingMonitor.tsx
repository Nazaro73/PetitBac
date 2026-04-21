"use client";

import type { Player } from "@/lib/types";

interface Props {
  players: Player[];
  mjClientId: string | null;
  onStop: () => void;
}

export function WritingMonitor({ players, mjClientId, onStop }: Props) {
  const active = players.filter((p) => p.clientId !== mjClientId);
  const finished = active.filter((p) => p.finished).length;
  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="h-display text-2xl">
            <span className="hl">Écriture</span> en cours
          </h2>
          <p className="text-sm font-semibold text-ink/70">
            {finished} / {active.length} joueur{active.length > 1 ? "s" : ""} ont terminé leur grille.
          </p>
        </div>
        <button
          className="btn-accent h-display text-2xl px-8 py-4 tracking-widest animate-wiggle"
          onClick={onStop}
        >
          STOP
        </button>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {active.map((p) => (
          <li
            key={p.clientId}
            className={`flex items-center justify-between rounded-xl border-[3px] border-ink px-3 py-2 font-bold shadow-pop-sm ${
              p.finished ? "bg-citron-500" : "bg-white"
            }`}
          >
            <span className={p.connected ? "" : "text-ink/40 line-through"}>
              {p.name}
            </span>
            <span className="text-xs font-black uppercase tracking-wide">
              {p.finished ? "Terminé ✓" : "En cours…"}
            </span>
          </li>
        ))}
        {active.length === 0 && (
          <li className="text-sm font-semibold text-ink/60">
            Aucun joueur connecté.
          </li>
        )}
      </ul>
    </div>
  );
}
