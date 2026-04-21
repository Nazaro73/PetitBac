"use client";

import { create } from "zustand";
import type {
  AnswerGrid,
  LiveCorrectionPayload,
  MJState,
  PenaltyPayload,
  Phase,
  Player,
  PlayerState,
  PublicState,
  Role,
} from "@/lib/types";

interface GameStore {
  role: Role | null;
  connected: boolean;
  connectionError: string | null;
  publicState: PublicState | null;
  mjState: MJState | null;
  ownAnswers: AnswerGrid | null;
  draftWords: Record<string, string>;
  lastCorrection: LiveCorrectionPayload | null;

  setRole: (role: Role | null) => void;
  setConnected: (c: boolean) => void;
  setConnectionError: (e: string | null) => void;
  setPublicState: (s: PublicState | null) => void;
  setMJState: (s: MJState | null) => void;
  setOwnAnswers: (a: AnswerGrid | null) => void;
  setDraftWord: (category: string, value: string) => void;
  resetDraft: (categories: string[]) => void;
  applyLiveCorrection: (payload: LiveCorrectionPayload) => void;
  applyPenalty: (payload: PenaltyPayload) => void;
  resetRoundVisuals: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  role: null,
  connected: false,
  connectionError: null,
  publicState: null,
  mjState: null,
  ownAnswers: null,
  draftWords: {},
  lastCorrection: null,

  setRole: (role) => set({ role }),
  setConnected: (c) => set({ connected: c }),
  setConnectionError: (e) => set({ connectionError: e }),

  setPublicState: (s) => set({ publicState: s }),
  setMJState: (s) =>
    set((state) => ({
      mjState: s,
      publicState: s
        ? {
            phase: s.phase,
            roundNumber: s.roundNumber,
            letter: s.letter,
            categories: s.categories,
            mjClientId: s.mjClientId,
            players: s.players,
          }
        : state.publicState,
    })),

  setOwnAnswers: (a) => set({ ownAnswers: a }),
  setDraftWord: (category, value) =>
    set((state) => ({
      draftWords: { ...state.draftWords, [category]: value },
    })),
  resetDraft: (categories) =>
    set(() => {
      const fresh: Record<string, string> = {};
      for (const c of categories) fresh[c] = "";
      return { draftWords: fresh, lastCorrection: null };
    }),

  applyLiveCorrection: (payload) =>
    set((state) => {
      // Mise à jour des scores dans la vue publique
      const players = state.publicState?.players.map((p) =>
        p.clientId === payload.playerClientId
          ? { ...p, score: payload.newScore }
          : p,
      );
      const publicState = state.publicState
        ? { ...state.publicState, players: players ?? state.publicState.players }
        : null;

      // Mise à jour de la grille du MJ si présente
      let mjState = state.mjState;
      if (mjState) {
        const grid = { ...(mjState.answers[payload.playerClientId] ?? {}) };
        grid[payload.category] = {
          word: payload.word,
          verdict: payload.verdict,
          points: payload.points,
        };
        mjState = {
          ...mjState,
          players: players ?? mjState.players,
          answers: { ...mjState.answers, [payload.playerClientId]: grid },
        };
      }
      return { lastCorrection: payload, publicState, mjState };
    }),

  applyPenalty: (payload) =>
    set((state) => {
      const players = state.publicState?.players.map((p) =>
        p.clientId === payload.playerClientId
          ? { ...p, score: payload.newScore }
          : p,
      );
      return {
        publicState: state.publicState
          ? {
              ...state.publicState,
              players: players ?? state.publicState.players,
            }
          : null,
        mjState: state.mjState
          ? {
              ...state.mjState,
              players: players ?? state.mjState.players,
            }
          : null,
      };
    }),

  resetRoundVisuals: () => set({ lastCorrection: null }),
}));

export function phaseLabel(p: Phase | undefined): string {
  switch (p) {
    case "lobby":
      return "Lobby";
    case "writing":
      return "Écriture";
    case "correcting":
      return "Correction";
    default:
      return "…";
  }
}

export function sortPlayers(players: Player[] | undefined): Player[] {
  if (!players) return [];
  return [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );
}
