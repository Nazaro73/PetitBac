import http from "node:http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

import { buildAllowedOrigins, config } from "./config.js";
import { GameRoom } from "./game/GameRoom.js";
import { attachSocketHandlers } from "./sockets/index.js";
import { logger } from "./utils/logger.js";

export function createServer() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        // Autorise aussi les sous-domaines Ngrok (tunnels générés
        // dynamiquement) et les preview deployments Vercel.
        if (/\.ngrok-free\.app$/.test(origin)) return cb(null, true);
        if (/\.vercel\.app$/.test(origin)) return cb(null, true);
        return cb(new Error(`Origin not allowed: ${origin}`));
      },
      credentials: true,
    }),
  );

  app.get("/", (_req, res) => {
    res.json({
      name: "petit-bac-backend",
      status: "ok",
      version: "1.0.0",
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get("/status", (_req, res) => {
    res.json({
      mjClaimed: room.mjClientId !== null,
      phase: room.phase,
      playerCount: room.players.size,
    });
  });

  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        if (/\.ngrok-free\.app$/.test(origin)) return cb(null, true);
        if (/\.vercel\.app$/.test(origin)) return cb(null, true);
        return cb(new Error(`Origin not allowed: ${origin}`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const room = new GameRoom({ defaultCategories: config.defaultCategories });

  attachSocketHandlers({ io, room, mjSecret: config.mjSecret });

  logger.info(`Allowed origins: ${allowedOrigins.join(", ") || "(none explicit)"}`);

  return { app, httpServer, io, room };
}
