"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { clearSession, getOrCreateClientId } from "@/lib/clientId";
import { getCurrentSocket } from "@/lib/socket";
import { useGameConnection } from "@/lib/useGameConnection";
import { useGameStore } from "@/store/gameStore";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { PhaseBanner } from "@/components/ui/PhaseBanner";
import { ScoreboardPanel } from "@/components/ui/ScoreboardPanel";
import { WritingGrid } from "@/components/player/WritingGrid";
import { CorrectionView } from "@/components/player/CorrectionView";

export default function PlayerPage() {
  useGameConnection({ requiredRole: "player" });

  const connected = useGameStore((s) => s.connected);
  const connectionError = useGameStore((s) => s.connectionError);
  const publicState = useGameStore((s) => s.publicState);
  const ownAnswers = useGameStore((s) => s.ownAnswers);
  const draftWords = useGameStore((s) => s.draftWords);
  const lastCorrection = useGameStore((s) => s.lastCorrection);
  const resetDraft = useGameStore((s) => s.resetDraft);

  const myClientId = useMemo(
    () => (typeof window !== "undefined" ? getOrCreateClientId() : ""),
    [],
  );
  const me = publicState?.players.find((p) => p.clientId === myClientId) ?? null;

  useEffect(() => {
    if (publicState?.phase === "writing" && publicState.categories) {
      // Initialise la grille locale à l'entrée en phase écriture si vide.
      const hasDraft = Object.values(draftWords).some((v) => v);
      if (!hasDraft) resetDraft(publicState.categories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicState?.phase]);

  function handleEarlySubmit() {
    const socket = getCurrentSocket();
    if (!socket) return;
    socket.emit("submit_words", { words: draftWords });
  }

  function handleLeave() {
    clearSession();
    window.location.href = "/";
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="h-display text-xl hover:-rotate-1 transition">
            <span className="pop-text">PETIT BAC</span>
          </Link>
          <span className="text-ink/40">•</span>
          <span className="badge bg-brand-500">Joueur</span>
          {me && (
            <span className="badge bg-white">
              {me.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus connected={connected} error={connectionError} />
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
          {publicState?.phase === "lobby" && (
            <div className="card text-center py-12">
              <h2 className="h-display text-3xl">
                <span className="hl">En attente du MJ</span>
              </h2>
              <p className="mt-4 text-ink/70 font-medium">
                Le MJ prépare la prochaine manche. Vos scores sont conservés même en cas
                de refresh.
              </p>
              {publicState.categories.length > 0 && (
                <div className="mt-6 text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink/70">
                    Catégories prévues
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {publicState.categories.map((c) => (
                      <li
                        key={c}
                        className="badge bg-citron-500"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {publicState?.phase === "writing" && (
            <WritingGrid
              categories={publicState.categories}
              letter={publicState.letter}
              onSubmit={handleEarlySubmit}
              finished={Boolean(me?.finished)}
            />
          )}

          {publicState?.phase === "correcting" && (
            <CorrectionView
              categories={publicState.categories}
              ownAnswers={ownAnswers}
              lastCorrection={lastCorrection}
              myClientId={myClientId}
            />
          )}
        </section>

        <aside>
          <ScoreboardPanel
            players={publicState?.players ?? []}
            highlightClientId={myClientId}
            mjClientId={publicState?.mjClientId ?? null}
          />
        </aside>
      </div>
    </main>
  );
}
