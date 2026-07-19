import { CODE_EVENTS, ROOM_EVENTS, USER_EVENTS } from "../src/shared/protocol/events.js";
import { isLanguage } from "../src/features/editor/languages.js";

const LIMITS = Object.freeze({
  roomId: 64,
  username: 40,
  code: 200_000,
  question: 20_000,
  message: 2_000,
});

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function emitError(socket, message) {
  socket.emit(ROOM_EVENTS.ERROR, { message });
}

function inJoinedRoom(socket) {
  const roomId = socket.data.roomId;
  return roomId && socket.rooms.has(roomId) ? roomId : null;
}

function withinRateLimit(socket, bucket, limit, windowMs = 10_000) {
  const now = Date.now();
  const current = socket.data.rateLimits?.[bucket];
  if (!socket.data.rateLimits) socket.data.rateLimits = {};
  if (!current || now - current.startedAt >= windowMs) {
    socket.data.rateLimits[bucket] = { startedAt: now, count: 1 };
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

export function registerSocketHandlers(io, store) {
  io.on("connection", (socket) => {
    socket.on(USER_EVENTS.JOIN, (payload = {}) => {
      if (!payload || typeof payload !== "object") return emitError(socket, "Invalid join request.");
      const username = cleanString(payload.username, LIMITS.username);
      const roomId = cleanString(payload.roomId, LIMITS.roomId);
      if (!username || !/^[a-zA-Z0-9_-]+$/.test(roomId)) {
        return emitError(socket, "Enter a valid name and room ID.");
      }

      if (socket.data.roomId && socket.data.roomId !== roomId) {
        socket.leave(socket.data.roomId);
        store.leave(socket.data.roomId, socket.id);
      }

      socket.data.username = username;
      socket.data.roomId = roomId;
      socket.join(roomId);
      const snapshot = store.join(roomId, socket.id, username);
      socket.emit(CODE_EVENTS.SYNC, snapshot);
      io.to(roomId).emit(USER_EVENTS.JOINED, {
        username,
        socketId: socket.id,
        clients: store.clients(roomId),
      });
    });

    socket.on(CODE_EVENTS.CHANGE, (payload = {}) => {
      const roomId = inJoinedRoom(socket);
      if (!roomId || !withinRateLimit(socket, "document", 300)) return;
      if (!payload || typeof payload !== "object" || typeof payload.code !== "string") return;
      if (payload.code.length > LIMITS.code) return emitError(socket, "Code exceeds the 200 KB room limit.");
      if (payload.language !== undefined && !isLanguage(payload.language)) return;

      const patch = { code: payload.code };
      if (payload.language) patch.language = payload.language;
      const document = store.updateDocument(roomId, patch);
      socket.to(roomId).emit(CODE_EVENTS.CHANGE, {
        code: document.code,
        language: document.language,
      });
    });

    socket.on(USER_EVENTS.QUESTION, (payload = {}) => {
      const roomId = inJoinedRoom(socket);
      if (!roomId || !withinRateLimit(socket, "document", 300)) return;
      if (!payload || typeof payload.question !== "string") return;
      if (payload.question.length > LIMITS.question) {
        return emitError(socket, "The problem statement is too long.");
      }
      store.updateDocument(roomId, { question: payload.question });
      socket.to(roomId).emit(USER_EVENTS.QUESTION, { question: payload.question });
    });

    socket.on(USER_EVENTS.MESSAGE, (payload = {}) => {
      const roomId = inJoinedRoom(socket);
      if (!roomId || !withinRateLimit(socket, "chat", 30)) return;
      const message = cleanString(payload?.message, LIMITS.message);
      if (!message) return;
      socket.to(roomId).emit(USER_EVENTS.MESSAGE, {
        id: `message-${socket.id}-${Date.now()}`,
        message,
        username: socket.data.username,
        type: "message",
        time: Date.now(),
      });
    });

    socket.on(USER_EVENTS.ACTIVITY, (payload = {}) => {
      const roomId = inJoinedRoom(socket);
      if (!roomId || payload?.action !== "run" || !withinRateLimit(socket, "activity", 10)) return;
      socket.to(roomId).emit(USER_EVENTS.MESSAGE, {
        id: `activity-${socket.id}-${Date.now()}`,
        message: `${socket.data.username} ran the code`,
        type: "system",
        time: Date.now(),
      });
    });

    const setFocus = (focus) => {
      const roomId = inJoinedRoom(socket);
      if (!roomId || !store.updateFocus(roomId, socket.id, focus)) return;
      io.to(roomId).emit(USER_EVENTS.PRESENCE, { clients: store.clients(roomId) });
    };
    socket.on(USER_EVENTS.FOCUS_ON, () => setFocus(true));
    socket.on(USER_EVENTS.FOCUS_OFF, () => setFocus(false));

    socket.on("disconnecting", () => {
      const { roomId, username } = socket.data;
      if (!roomId) return;
      const clients = store.leave(roomId, socket.id);
      socket.to(roomId).emit(USER_EVENTS.LEAVE, {
        socketId: socket.id,
        username,
        clients,
      });
    });
  });
}
