import { Phase, POINTS_BY_VERDICT, Verdict } from "./constants.js";

/**
 * GameRoom — Unique salle en mémoire gérant l'ensemble de la partie.
 *
 * Les identifiants "clientId" sont fournis par le client (stockés en
 * localStorage) pour survivre aux rafraîchissements de page. Les
 * "socketId" sont volatils et ré-associés à chaque reconnexion.
 */
export class GameRoom {
  constructor({ defaultCategories }) {
    this.phase = Phase.Lobby;
    this.players = new Map();
    this.mjClientId = null;

    this.categories = [...defaultCategories];
    this.letter = null;
    this.roundNumber = 0;

    // clientId -> { [category]: { word, verdict, points } }
    this.answers = new Map();
    // clientId qui ont déjà envoyé submit_words pendant la manche
    this.finished = new Set();
  }

  // ─────────────────────────────────────────── Helpers ───

  isMJ(clientId) {
    return this.mjClientId !== null && this.mjClientId === clientId;
  }

  getPlayer(clientId) {
    return this.players.get(clientId) ?? null;
  }

  findPlayerBySocket(socketId) {
    for (const p of this.players.values()) {
      if (p.socketId === socketId) return p;
    }
    return null;
  }

  // ─────────────────────────────────────────── Lifecycle ───

  /**
   * Ajoute ou reconnecte un joueur. Retourne { player, reconnected }.
   */
  upsertPlayer({ clientId, name, socketId }) {
    const existing = this.players.get(clientId);
    if (existing) {
      existing.socketId = socketId;
      existing.connected = true;
      if (name && name.trim()) existing.name = name.trim().slice(0, 24);
      return { player: existing, reconnected: true };
    }
    const player = {
      clientId,
      socketId,
      name: (name ?? "Joueur").trim().slice(0, 24) || "Joueur",
      score: 0,
      connected: true,
    };
    this.players.set(clientId, player);
    return { player, reconnected: false };
  }

  markDisconnected(socketId) {
    const p = this.findPlayerBySocket(socketId);
    if (!p) return null;
    p.connected = false;
    return p;
  }

  removePlayer(clientId) {
    const p = this.players.get(clientId);
    if (!p) return null;
    this.players.delete(clientId);
    this.answers.delete(clientId);
    this.finished.delete(clientId);
    if (this.mjClientId === clientId) {
      this.mjClientId = null;
    }
    return p;
  }

  // ─────────────────────────────────────────── MJ role ───

  /**
   * Revendique le rôle de MJ. Si un secret est configuré il doit correspondre.
   * Sinon, premier arrivé premier servi (tant que personne ne tient le rôle).
   */
  claimMJ({ clientId, secret, configuredSecret }) {
    if (configuredSecret) {
      if (secret !== configuredSecret) {
        return { ok: false, reason: "invalid_secret" };
      }
    } else if (this.mjClientId && this.mjClientId !== clientId) {
      return { ok: false, reason: "already_claimed" };
    }
    this.mjClientId = clientId;
    return { ok: true };
  }

  // ─────────────────────────────────────────── Rounds ───

  startRound({ letter, categories }) {
    if (this.phase === Phase.Writing) {
      return { ok: false, reason: "already_writing" };
    }
    const cleanLetter = (letter ?? "").toString().trim().toUpperCase().slice(0, 1);
    if (!/^[A-Z]$/.test(cleanLetter)) {
      return { ok: false, reason: "invalid_letter" };
    }
    const cleanCategories = Array.isArray(categories)
      ? categories.map((c) => String(c).trim()).filter(Boolean).slice(0, 12)
      : [];
    if (cleanCategories.length === 0) {
      return { ok: false, reason: "no_categories" };
    }

    this.letter = cleanLetter;
    this.categories = cleanCategories;
    this.roundNumber += 1;
    this.phase = Phase.Writing;
    this.answers = new Map();
    this.finished = new Set();

    return { ok: true };
  }

  stopRound() {
    if (this.phase !== Phase.Writing) {
      return { ok: false, reason: "not_writing" };
    }
    this.phase = Phase.Correcting;
    // Remplir les slots manquants pour chaque joueur connecté.
    for (const player of this.players.values()) {
      if (!this.answers.has(player.clientId)) {
        this.answers.set(player.clientId, this._emptyAnswerGrid());
      }
    }
    return { ok: true };
  }

  submitWords({ clientId, words }) {
    if (this.phase !== Phase.Writing && this.phase !== Phase.Correcting) {
      return { ok: false, reason: "not_submittable" };
    }
    const player = this.players.get(clientId);
    if (!player) return { ok: false, reason: "unknown_player" };

    const grid = this._emptyAnswerGrid();
    const input = words && typeof words === "object" ? words : {};
    for (const category of this.categories) {
      const raw = input[category];
      const word = (raw ?? "").toString().trim().slice(0, 40);
      grid[category] = { word, verdict: null, points: 0 };
    }
    this.answers.set(clientId, grid);
    this.finished.add(clientId);
    return { ok: true };
  }

  validateWord({ playerClientId, category, verdict }) {
    if (this.phase !== Phase.Correcting) {
      return { ok: false, reason: "not_correcting" };
    }
    if (!this.categories.includes(category)) {
      return { ok: false, reason: "unknown_category" };
    }
    if (![Verdict.Rejected, Verdict.Accepted, Verdict.Bonus].includes(verdict)) {
      return { ok: false, reason: "invalid_verdict" };
    }
    const player = this.players.get(playerClientId);
    if (!player) return { ok: false, reason: "unknown_player" };

    const grid = this.answers.get(playerClientId) ?? this._emptyAnswerGrid();
    const cell = grid[category] ?? { word: "", verdict: null, points: 0 };

    const previousPoints = cell.points ?? 0;
    const newPoints = POINTS_BY_VERDICT[verdict];

    cell.verdict = verdict;
    cell.points = newPoints;
    grid[category] = cell;
    this.answers.set(playerClientId, grid);

    player.score = player.score - previousPoints + newPoints;
    return {
      ok: true,
      playerClientId,
      category,
      verdict,
      word: cell.word,
      points: newPoints,
      newScore: player.score,
    };
  }

  applyPenalty({ playerClientId, delta }) {
    const player = this.players.get(playerClientId);
    if (!player) return { ok: false, reason: "unknown_player" };
    const value = Number(delta);
    if (!Number.isFinite(value) || value === 0) {
      return { ok: false, reason: "invalid_delta" };
    }
    player.score += value;
    return { ok: true, playerClientId, delta: value, newScore: player.score };
  }

  resetToLobby() {
    this.phase = Phase.Lobby;
    this.letter = null;
    this.answers = new Map();
    this.finished = new Set();
    return { ok: true };
  }

  // ─────────────────────────────────────────── Snapshots ───

  /**
   * Vue publique envoyée à tous les clients.
   */
  publicSnapshot() {
    return {
      phase: this.phase,
      roundNumber: this.roundNumber,
      letter: this.phase === Phase.Lobby ? null : this.letter,
      categories: this.categories,
      mjClientId: this.mjClientId,
      players: [...this.players.values()]
        .map((p) => ({
          clientId: p.clientId,
          name: p.name,
          score: p.score,
          connected: p.connected,
          finished: this.finished.has(p.clientId),
        }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    };
  }

  /**
   * Vue complète pour le MJ (inclut la grille de correction).
   */
  mjSnapshot() {
    const answers = {};
    for (const [clientId, grid] of this.answers.entries()) {
      answers[clientId] = grid;
    }
    return {
      ...this.publicSnapshot(),
      answers,
    };
  }

  /**
   * Vue privée pour un joueur donné : ses propres réponses si la manche
   * est en cours ou terminée.
   */
  playerSnapshot(clientId) {
    const ownAnswers = this.answers.get(clientId) ?? null;
    return {
      ...this.publicSnapshot(),
      ownAnswers,
      isMJ: this.isMJ(clientId),
    };
  }

  _emptyAnswerGrid() {
    const grid = {};
    for (const c of this.categories) {
      grid[c] = { word: "", verdict: null, points: 0 };
    }
    return grid;
  }
}
