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
        <p className="text-ink/70">Aucun joueur à corriger.</p>
        <button className="btn-secondary mt-4" onClick={onReset}>
          Retour au lobby
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="h-display text-2xl">
          <span className="hl">Correction</span> — mot par mot
        </h2>
        <button className="btn-secondary" onClick={onReset}>
          Terminer la manche
        </button>
      </div>

      {state.categories.map((category) => (
        <div key={category} className="card space-y-3">
          <h3 className="h-display text-lg">
            <span className="hl">{category}</span>
          </h3>
          <ul className="divide-y-[3px] divide-ink/10">
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
      <div className="min-w-[8rem] shrink-0 font-bold">{player.name}</div>
      <div
        className={`flex-1 min-w-0 rounded-lg border-[3px] border-ink px-3 py-2 font-bold shadow-pop-sm ${cellBg(verdict)}`}
      >
        {word ? (
          <span>{word}</span>
        ) : (
          <span className="italic text-ink/40 font-medium">(vide)</span>
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
      <h3 className="h-display mb-4 text-lg">
        <span className="hl">Modération</span>
      </h3>
      <ul className="divide-y-[3px] divide-ink/10">
        {players.map((p) => (
          <li
            key={p.clientId}
            className="flex flex-wrap items-center gap-3 py-3"
          >
            <div className="min-w-[8rem] flex-1 font-bold">
              {p.name}
              <span className="ml-2 font-mono text-xs font-semibold text-ink/60">
                {p.score} pts
              </span>
            </div>
            <div className="flex gap-1">
              <button
                className="btn-secondary text-xs px-2 py-1"
                onClick={() => onPenalty(p.clientId, -1)}
              >
                −1
              </button>
              <button
                className="btn-secondary text-xs px-2 py-1"
                onClick={() => onPenalty(p.clientId, -5)}
              >
                −5
              </button>
              <button
                className="btn-secondary text-xs px-2 py-1"
                onClick={() => onPenalty(p.clientId, +1)}
              >
                +1
              </button>
              <button
                className="btn-accent text-xs px-2 py-1"
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
      return "bg-accent-500 text-white";
    case 1:
      return "bg-citron-500 text-ink";
    case 2:
      return "bg-brand-500 text-ink";
    default:
      return "bg-white text-ink";
  }
}

function verdictButton(current: Verdict | null, target: Verdict) {
  const active = current === target;
  const base =
    "rounded-lg px-3 py-1 text-sm font-black border-[3px] border-ink transition shadow-pop-sm";
  const activeTransform = active
    ? "translate-x-[2px] translate-y-[2px] shadow-none"
    : "hover:translate-x-[1px] hover:translate-y-[1px]";
  if (target === 0) {
    return `${base} ${activeTransform} ${
      active ? "bg-accent-500 text-white" : "bg-white hover:bg-accent-500/80 hover:text-white"
    }`;
  }
  if (target === 1) {
    return `${base} ${activeTransform} ${
      active ? "bg-citron-500" : "bg-white hover:bg-citron-500"
    }`;
  }
  return `${base} ${activeTransform} ${
    active ? "bg-brand-500" : "bg-white hover:bg-brand-500"
  }`;
}
