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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-300">Écriture en cours</h2>
          <p className="text-sm text-slate-400">
            {finished} / {active.length} joueur{active.length > 1 ? "s" : ""} ont terminé leur grille.
          </p>
        </div>
        <button className="btn-danger text-lg px-6 py-3" onClick={onStop}>
          STOP
        </button>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {active.map((p) => (
          <li
            key={p.clientId}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
              p.finished
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-slate-700 bg-slate-900/40"
            }`}
          >
            <span className={p.connected ? "" : "text-slate-500 line-through"}>{p.name}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">
              {p.finished ? "Terminé" : "En cours…"}
            </span>
          </li>
        ))}
        {active.length === 0 && (
          <li className="text-sm text-slate-500">Aucun joueur connecté.</li>
        )}
      </ul>
    </div>
  );
}
