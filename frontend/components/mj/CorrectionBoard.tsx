"use client";

import type {
  AnswerGrid,
  MJState,
  Player,
  Verdict,
} from "@/lib/types";

interface Props {
  state: MJState;
  onValidate: (playerClientId: string, category: string, verdict: Verdict) => void;
  onPenalty: (playerClientId: string, delta: number) => void;
  onKick: (playerClientId: string) => void;
  onReset: () => void;
}

export function CorrectionBoard({
  state,
  onValidate,
  onPenalty,
  onKick,
  onReset,
}: Props) {
  const players = state.players.filter((p) => p.clientId !== state.mjClientId);
  if (players.length === 0) {
    return (
      <div className="card">
        <p className="text-slate-400">Aucun joueur à corriger.</p>
        <button className="btn-secondary mt-4" onClick={onReset}>
          Retour au lobby
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-300">Correction — mot par mot</h2>
        <button className="btn-secondary" onClick={onReset}>
          Terminer la manche
        </button>
      </div>

      {state.categories.map((category) => (
        <div key={category} className="card space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
            {category}
          </h3>
          <ul className="divide-y divide-slate-800">
            {players.map((p) => (
              <PlayerRow
                key={p.clientId}
                player={p}
                grid={state.answers[p.clientId] ?? {}}
                category={category}
                onValidate={onValidate}
              />
            ))}
          </ul>
        </div>
      ))}

      <PenaltyPanel players={players} onPenalty={onPenalty} onKick={onKick} />
    </div>
  );
}

function PlayerRow({
  player,
  grid,
  category,
  onValidate,
}: {
  player: Player;
  grid: AnswerGrid;
  category: string;
  onValidate: (playerClientId: string, category: string, verdict: Verdict) => void;
}) {
  const cell = grid[category];
  const word = cell?.word ?? "";
  const verdict = cell?.verdict ?? null;

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-[8rem] shrink-0 font-medium">{player.name}</div>
      <div
        className={`flex-1 min-w-0 rounded-md px-3 py-2 border ${cellBg(verdict)}`}
      >
        {word ? (
          <span className="font-semibold">{word}</span>
        ) : (
          <span className="italic text-slate-500">(vide)</span>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          className={verdictButton(verdict, 0)}
          onClick={() => onValidate(player.clientId, category, 0)}
          title="Refusé"
        >
          +0
        </button>
        <button
          className={verdictButton(verdict, 1)}
          onClick={() => onValidate(player.clientId, category, 1)}
          title="Accepté"
        >
          +1
        </button>
        <button
          className={verdictButton(verdict, 2)}
          onClick={() => onValidate(player.clientId, category, 2)}
          title="Bonus (mot unique)"
        >
          +2
        </button>
      </div>
    </li>
  );
}

function PenaltyPanel({
  players,
  onPenalty,
  onKick,
}: {
  players: Player[];
  onPenalty: (playerClientId: string, delta: number) => void;
  onKick: (playerClientId: string) => void;
}) {
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
        Modération
      </h3>
      <ul className="divide-y divide-slate-800">
        {players.map((p) => (
          <li
            key={p.clientId}
            className="flex flex-wrap items-center gap-3 py-3"
          >
            <div className="min-w-[8rem] flex-1 font-medium">
              {p.name}
              <span className="ml-2 font-mono text-xs text-slate-400">
                {p.score} pts
              </span>
            </div>
            <div className="flex gap-1">
              <button
                className="btn-secondary text-xs"
                onClick={() => onPenalty(p.clientId, -1)}
              >
                −1
              </button>
              <button
                className="btn-secondary text-xs"
                onClick={() => onPenalty(p.clientId, -5)}
              >
                −5
              </button>
              <button
                className="btn-secondary text-xs"
                onClick={() => onPenalty(p.clientId, +1)}
              >
                +1
              </button>
              <button
                className="btn-danger text-xs"
                onClick={() => {
                  if (confirm(`Expulser ${p.name} ?`)) onKick(p.clientId);
                }}
              >
                Expulser
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function cellBg(v: Verdict | null) {
  switch (v) {
    case 0:
      return "bg-red-500/10 border-red-500/40";
    case 1:
      return "bg-amber-500/10 border-amber-500/40";
    case 2:
      return "bg-emerald-500/10 border-emerald-500/40";
    default:
      return "bg-slate-900/40 border-slate-700";
  }
}

function verdictButton(current: Verdict | null, target: Verdict) {
  const active = current === target;
  const base = "rounded-md px-3 py-1 text-sm font-bold transition";
  if (target === 0) {
    return `${base} ${
      active
        ? "bg-red-500 text-white"
        : "bg-slate-800 hover:bg-red-500/70 text-slate-200"
    }`;
  }
  if (target === 1) {
    return `${base} ${
      active
        ? "bg-amber-500 text-slate-900"
        : "bg-slate-800 hover:bg-amber-500/70 text-slate-200"
    }`;
  }
  return `${base} ${
    active
      ? "bg-emerald-500 text-white"
      : "bg-slate-800 hover:bg-emerald-500/70 text-slate-200"
  }`;
}
