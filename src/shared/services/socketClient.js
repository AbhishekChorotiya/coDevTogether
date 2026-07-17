import { io } from "socket.io-client";

export function createSocket() {
  return io(import.meta.env.VITE_SOCKET_URL || undefined, {
    autoConnect: false,
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10_000,
    transports: ["websocket", "polling"],
  });
}
