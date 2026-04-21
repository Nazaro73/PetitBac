"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUrl: string | null = null;

export function getSocket(serverUrl: string): Socket {
  const normalized = serverUrl.replace(/\/+$/, "");
  if (socket && currentUrl === normalized && socket.connected) return socket;
  if (socket && currentUrl !== normalized) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch {
      // ignore
    }
    socket = null;
  }
  if (!socket) {
    socket = io(normalized, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4_000,
      // Permet à Ngrok de relayer WS même derrière la page d'avertissement.
      extraHeaders: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    currentUrl = normalized;
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentUrl = null;
  }
}

export function getCurrentSocket(): Socket | null {
  return socket;
}
