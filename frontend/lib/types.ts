export type Phase = "lobby" | "writing" | "correcting";
export type Verdict = 0 | 1 | 2;

export interface AnswerCell {
  word: string;
  verdict: Verdict | null;
  points: number;
}

export type AnswerGrid = Record<string, AnswerCell>;

export interface Player {
  clientId: string;
  name: string;
  score: number;
  connected: boolean;
  finished: boolean;
}

export interface PublicState {
  phase: Phase;
  roundNumber: number;
  letter: string | null;
  categories: string[];
  mjClientId: string | null;
  players: Player[];
}

export interface MJState extends PublicState {
  answers: Record<string, AnswerGrid>;
}

export interface PlayerState extends PublicState {
  ownAnswers: AnswerGrid | null;
  isMJ: boolean;
}

export interface RoundStartedPayload {
  letter: string;
  categories: string[];
  roundNumber: number;
}

export interface LiveCorrectionPayload {
  playerClientId: string;
  category: string;
  verdict: Verdict;
  word: string;
  points: number;
  newScore: number;
}

export interface PenaltyPayload {
  playerClientId: string;
  delta: number;
  newScore: number;
}

export type Role = "mj" | "player";
