"use client";

import Link from "next/link";
import { clearSession } from "@/lib/clientId";
import { getCurrentSocket } from "@/lib/socket";
import { useGameConnection } from "@/lib/useGameConnection";
import { useGameStore } from "@/store/gameStore";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { PhaseBanner } from "@/components/ui/PhaseBanner";
import { ScoreboardPanel } from "@/components/ui/ScoreboardPanel";
import { LobbyConfig } from "@/components/mj/LobbyConfig";
import { WritingMonitor } from "@/components/mj/WritingMonitor";
import { CorrectionBoard } from "@/components/mj/CorrectionBoard";
import type { Verdict } from "@/lib/types";

export default function MJPage() {
  useGameConnection({ requiredRole: "mj" });

  const connected = useGameStore((s) => s.connected);
  const connectionError = useGameStore((s) => s.connectionError);
  const mjState = useGameStore((s) => s.mjState);
  const publicState = useGameStore((s) => s.publicState);

  function emit(name: string, payload: unknown) {
    const socket = getCurrentSocket();
    if (!socket) return;
    socket.emit(name, payload ?? {});
  }

  function handleStart({ letter, categories }: { letter: string; categories: string[] }) {
    emit("start_round", { letter, categories });
  }

  function handleStop() {
    emit("stop_round", {});
  }

  function handleValidate(playerClientId: string, category: string, verdict: Verdict) {
    emit("mj_validate_word", { playerClientId, category, verdict });
  }

  function handlePenalty(playerClientId: string, delta: number) {
    emit("mj_apply_penalty", { playerClientId, delta });
  }

  function handleKick(playerClientId: string) {
    emit("mj_kick_player", { playerClientId });
  }

  function handleResetLobby() {
    emit("mj_reset_lobby", {});
  }

  function handleUpdateCategories(categories: string[]) {
    emit("mj_update_config", { categories });
  }

  function handleLeave() {
    clearSession();
    window.location.href = "/";
  }

  function handleFullReset() {
    const ok = window.confirm(
      "Réinitialiser la partie ? Les scores seront remis à zéro et le numéro de manche repartira de 0. Les joueurs connectés seront conservés.",
    );
    if (!ok) return;
    emit("mj_full_reset", {});
  }

  const phase = publicState?.phase ?? mjState?.phase;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="h-display text-xl hover:-rotate-1 transition">
            <span className="pop-text">PETIT BAC</span>
          </Link>
          <span className="text-ink/40">•</span>
          <span className="badge bg-accent-500 text-white">
            Maître du Jeu
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus connected={connected} error={connectionError} />
          <button onClick={handleFullReset} className="btn-secondary text-xs">
            Nouvelle partie
          </button>
          <button onClick={handleLeave} className="btn-secondary text-xs">
            Quitter
          </button>
        </div>
      </header>

      <div className="mb-4">
        <PhaseBanner
          phase={publicState?.phase}
          letter={publicState?.letter}
          roundNumber={publicState?.roundNumber}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <section className="space-y-6">
          {phase === "lobby" && (
            <LobbyConfig
              initialCategories={
                publicState?.categories ?? ["Pays", "Prénom", "Animal", "Métier", "Objet"]
              }
              onStart={handleStart}
              onUpdateCategories={handleUpdateCategories}
            />
          )}

          {phase === "writing" && (
            <WritingMonitor
              players={publicState?.players ?? []}
              mjClientId={publicState?.mjClientId ?? null}
              onStop={handleStop}
            />
          )}

          {phase === "correcting" && mjState && (
            <CorrectionBoard
              state={mjState}
              onValidate={handleValidate}
              onPenalty={handlePenalty}
              onKick={handleKick}
              onReset={handleResetLobby}
            />
          )}
        </section>

        <aside>
          <ScoreboardPanel
            players={publicState?.players ?? []}
            mjClientId={publicState?.mjClientId ?? null}
          />
        </aside>
      </div>
    </main>
  );
}
