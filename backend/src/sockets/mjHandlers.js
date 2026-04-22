import { logger } from "../utils/logger.js";

export function registerMJHandlers({ io, socket, room, mjSecret, broadcastState }) {
  function requireMJ(ack) {
    const clientId = socket.data.clientId;
    if (!clientId || !room.isMJ(clientId)) {
      if (typeof ack === "function") ack({ ok: false, reason: "not_mj" });
      return null;
    }
    return clientId;
  }

  socket.on("mj_claim", (payload = {}, ack) => {
    const clientId = socket.data.clientId ?? payload.clientId;
    if (!clientId) {
      if (typeof ack === "function") ack({ ok: false, reason: "no_client_id" });
      return;
    }
    socket.data.clientId = clientId;
    const result = room.claimMJ({
      clientId,
      secret: payload.secret ?? "",
      configuredSecret: mjSecret,
    });
    if (!result.ok) {
      logger.warn(
        `mj_claim rejected (${result.reason}) for client ${clientId} — secret length: ${(payload.secret ?? "").length}, configured length: ${mjSecret.length}`,
      );
      if (typeof ack === "function") ack(result);
      return;
    }
    logger.info(`MJ claimed by ${clientId}`);
    if (typeof ack === "function") {
      ack({ ok: true, state: room.mjSnapshot() });
    }
    socket.emit("mj_state", room.mjSnapshot());
    broadcastState();
  });

  socket.on("start_round", (payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    const result = room.startRound({
      letter: payload.letter,
      categories: payload.categories ?? [],
    });
    if (!result.ok) {
      if (typeof ack === "function") ack(result);
      return;
    }
    logger.info(`round ${room.roundNumber} started with letter ${room.letter}`);
    io.emit("round_started", {
      letter: room.letter,
      categories: room.categories,
      roundNumber: room.roundNumber,
    });
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });

  socket.on("stop_round", (_payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    const result = room.stopRound();
    if (!result.ok) {
      if (typeof ack === "function") ack(result);
      return;
    }
    logger.info(`round ${room.roundNumber} stopped`);
    io.emit("round_stopped", { roundNumber: room.roundNumber });
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });

  socket.on("mj_validate_word", (payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    const { playerClientId, category, verdict } = payload;
    const result = room.validateWord({
      playerClientId,
      category,
      verdict: Number(verdict),
    });
    if (!result.ok) {
      if (typeof ack === "function") ack(result);
      return;
    }
    io.emit("live_correction", {
      playerClientId: result.playerClientId,
      category: result.category,
      verdict: result.verdict,
      word: result.word,
      points: result.points,
      newScore: result.newScore,
    });
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });

  socket.on("mj_apply_penalty", (payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    const result = room.applyPenalty({
      playerClientId: payload.playerClientId,
      delta: payload.delta,
    });
    if (!result.ok) {
      if (typeof ack === "function") ack(result);
      return;
    }
    logger.info(
      `penalty ${result.delta} → player ${result.playerClientId} (new score ${result.newScore})`,
    );
    io.emit("penalty_applied", {
      playerClientId: result.playerClientId,
      delta: result.delta,
      newScore: result.newScore,
    });
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });

  socket.on("mj_kick_player", (payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    const { playerClientId } = payload;
    const kicked = room.removePlayer(playerClientId);
    if (!kicked) {
      if (typeof ack === "function") ack({ ok: false, reason: "unknown_player" });
      return;
    }
    logger.info(`kicked player ${kicked.name} (${kicked.clientId})`);
    for (const s of io.sockets.sockets.values()) {
      if (s.data?.clientId === kicked.clientId) {
        s.emit("kicked", { reason: "Kicked by MJ" });
        s.disconnect(true);
      }
    }
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });

  socket.on("mj_reset_lobby", (_payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    room.resetToLobby();
    logger.info("room reset to lobby");
    io.emit("lobby_reset", {});
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });

  socket.on("mj_full_reset", (_payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    room.fullReset();
    logger.info("room full reset (scores cleared)");
    io.emit("lobby_reset", {});
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });

  socket.on("mj_update_config", (payload = {}, ack) => {
    if (!requireMJ(ack)) return;
    // Permet au MJ d'ajuster les catégories depuis le lobby
    // sans démarrer de manche (affichage côté joueurs).
    if (Array.isArray(payload.categories)) {
      const clean = payload.categories
        .map((c) => String(c).trim())
        .filter(Boolean)
        .slice(0, 12);
      if (clean.length > 0) {
        room.categories = clean;
      }
    }
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });
}
