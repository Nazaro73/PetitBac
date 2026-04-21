import { logger } from "../utils/logger.js";
import { registerPlayerHandlers } from "./playerHandlers.js";
import { registerMJHandlers } from "./mjHandlers.js";

export function attachSocketHandlers({ io, room, mjSecret }) {
  /**
   * Diffuse l'état de la salle à tous les clients (vue publique).
   * Le MJ reçoit en plus sa vue enrichie en privé.
   */
  function broadcastState() {
    io.emit("players_update", room.publicSnapshot());
    const mjSocket = _mjSocket(io, room);
    if (mjSocket) {
      mjSocket.emit("mj_state", room.mjSnapshot());
    }
  }

  io.on("connection", (socket) => {
    logger.info(`socket connected: ${socket.id}`);

    // Le client s'annonce d'abord avec son clientId persistant.
    socket.on("hello", ({ clientId } = {}, ack) => {
      if (typeof clientId !== "string" || clientId.length === 0) {
        if (typeof ack === "function") ack({ ok: false, reason: "invalid_client_id" });
        return;
      }
      socket.data.clientId = clientId;
      const existing = room.getPlayer(clientId);
      if (existing) {
        existing.socketId = socket.id;
        existing.connected = true;
      }
      if (typeof ack === "function") {
        ack({
          ok: true,
          state: room.playerSnapshot(clientId),
          isMJ: room.isMJ(clientId),
        });
      }
      broadcastState();
    });

    registerPlayerHandlers({ io, socket, room, broadcastState });
    registerMJHandlers({ io, socket, room, mjSecret, broadcastState });

    socket.on("disconnect", (reason) => {
      logger.info(`socket disconnected: ${socket.id} (${reason})`);
      const player = room.markDisconnected(socket.id);
      if (player) broadcastState();
    });
  });
}

function _mjSocket(io, room) {
  if (!room.mjClientId) return null;
  const mj = room.getPlayer(room.mjClientId);
  // Le MJ peut ne pas être un "player" classique (il peut juste observer),
  // on cherche donc aussi par clientId attaché au socket.
  for (const s of io.sockets.sockets.values()) {
    if (s.data?.clientId === room.mjClientId) return s;
  }
  if (mj) return io.sockets.sockets.get(mj.socketId) ?? null;
  return null;
}
