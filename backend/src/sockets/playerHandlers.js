import { logger } from "../utils/logger.js";

export function registerPlayerHandlers({ io, socket, room, broadcastState }) {
  socket.on("join_game", (payload = {}, ack) => {
    const clientId = socket.data.clientId ?? payload.clientId;
    const name = (payload.name ?? "").toString();
    if (!clientId) {
      if (typeof ack === "function") ack({ ok: false, reason: "no_client_id" });
      return;
    }
    socket.data.clientId = clientId;
    const { player, reconnected } = room.upsertPlayer({
      clientId,
      name,
      socketId: socket.id,
    });
    logger.info(
      `${reconnected ? "rejoin" : "join"}: ${player.name} (${clientId})`,
    );
    if (typeof ack === "function") {
      ack({
        ok: true,
        reconnected,
        player: {
          clientId: player.clientId,
          name: player.name,
          score: player.score,
        },
        state: room.playerSnapshot(clientId),
      });
    }
    broadcastState();
  });

  socket.on("submit_words", (payload = {}, ack) => {
    const clientId = socket.data.clientId;
    if (!clientId) {
      if (typeof ack === "function") ack({ ok: false, reason: "not_joined" });
      return;
    }
    const result = room.submitWords({ clientId, words: payload.words ?? {} });
    if (!result.ok) {
      if (typeof ack === "function") ack(result);
      return;
    }
    if (typeof ack === "function") ack({ ok: true });
    broadcastState();
  });
}
