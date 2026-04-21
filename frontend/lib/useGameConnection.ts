"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateClientId, loadSession } from "@/lib/clientId";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import type {
  LiveCorrectionPayload,
  MJState,
  PenaltyPayload,
  PlayerState,
  PublicState,
  Role,
  RoundStartedPayload,
} from "@/lib/types";

interface Options {
  requiredRole: Role;
}

/**
 * Connecte le socket, identifie le client et câble tous les événements
 * vers le store global. Redirige vers / si aucune session n'est
 * enregistrée pour le rôle demandé.
 */
export function useGameConnection({ requiredRole }: Options) {
  const router = useRouter();
  const store = useGameStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const loaded = loadSession();
    if (!loaded || loaded.role !== requiredRole) {
      router.replace("/");
      return;
    }
    const session = loaded;
    store.setRole(session.role);

    const clientId = getOrCreateClientId();
    const socket = getSocket(session.serverUrl);

    function onConnect() {
      store.setConnected(true);
      store.setConnectionError(null);
      socket.emit(
        "hello",
        { clientId },
        (
          ack: {
            ok: boolean;
            state?: PlayerState;
            isMJ?: boolean;
            reason?: string;
          } | undefined,
        ) => {
          if (!ack?.ok) return;
          if (ack.state) {
            const { ownAnswers, isMJ, ...publicState } = ack.state;
            store.setPublicState(publicState as PublicState);
            store.setOwnAnswers(ownAnswers ?? null);
          }
        },
      );

      if (session.role === "mj") {
        socket.emit(
          "mj_claim",
          { clientId, secret: session.mjSecret ?? "" },
          (ack: { ok: boolean; state?: MJState; reason?: string } | undefined) => {
            if (ack?.ok && ack.state) {
              store.setMJState(ack.state);
            } else if (ack?.reason) {
              store.setConnectionError(
                ack.reason === "invalid_secret"
                  ? "Jeton MJ invalide."
                  : ack.reason === "already_claimed"
                    ? "Un autre MJ tient déjà le rôle."
                    : ack.reason,
              );
            }
          },
        );
      } else {
        socket.emit(
          "join_game",
          { clientId, name: session.name },
          (ack: { ok: boolean; reason?: string } | undefined) => {
            if (!ack?.ok && ack?.reason) {
              store.setConnectionError(ack.reason);
            }
          },
        );
      }
    }

    function onDisconnect() {
      store.setConnected(false);
    }

    function onConnectError(err: Error) {
      store.setConnectionError(err.message);
      store.setConnected(false);
    }

    function onPlayersUpdate(state: PublicState) {
      store.setPublicState(state);
    }

    function onMJState(state: MJState) {
      store.setMJState(state);
    }

    function onRoundStarted(payload: RoundStartedPayload) {
      store.resetDraft(payload.categories);
      store.setOwnAnswers(null);
    }

    function onRoundStopped() {
      // Les joueurs envoient leur grille courante dès réception.
      if (session.role === "player") {
        const words = useGameStore.getState().draftWords;
        socket.emit("submit_words", { words });
      }
    }

    function onLiveCorrection(payload: LiveCorrectionPayload) {
      store.applyLiveCorrection(payload);
    }

    function onPenaltyApplied(payload: PenaltyPayload) {
      store.applyPenalty(payload);
    }

    function onLobbyReset() {
      store.setOwnAnswers(null);
      store.resetRoundVisuals();
    }

    function onKicked() {
      store.setConnectionError("Vous avez été expulsé par le MJ.");
      store.setConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("players_update", onPlayersUpdate);
    socket.on("mj_state", onMJState);
    socket.on("round_started", onRoundStarted);
    socket.on("round_stopped", onRoundStopped);
    socket.on("live_correction", onLiveCorrection);
    socket.on("penalty_applied", onPenaltyApplied);
    socket.on("lobby_reset", onLobbyReset);
    socket.on("kicked", onKicked);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("players_update", onPlayersUpdate);
      socket.off("mj_state", onMJState);
      socket.off("round_started", onRoundStarted);
      socket.off("round_stopped", onRoundStopped);
      socket.off("live_correction", onLiveCorrection);
      socket.off("penalty_applied", onPenaltyApplied);
      socket.off("lobby_reset", onLobbyReset);
      socket.off("kicked", onKicked);
    };
    // Les fonctions du store sont stables, on désactive l'eslint pour
    // éviter une boucle de reconnexion lors des mises à jour d'état.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
