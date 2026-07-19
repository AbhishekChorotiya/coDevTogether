import { LANGUAGES } from "../src/features/editor/languages.js";

export class RoomStore {
  #rooms = new Map();

  join(roomId, socketId, username) {
    const room = this.#rooms.get(roomId) || {
      clients: new Map(),
      document: {
        code: LANGUAGES.javascript.starter,
        language: "javascript",
        question: "",
      },
    };
    room.clients.set(socketId, { socketId, username, focus: true });
    this.#rooms.set(roomId, room);
    return room.document;
  }

  leave(roomId, socketId) {
    const room = this.#rooms.get(roomId);
    if (!room) return [];
    room.clients.delete(socketId);
    const clients = Array.from(room.clients.values());
    if (room.clients.size === 0) this.#rooms.delete(roomId);
    return clients;
  }

  clients(roomId) {
    return Array.from(this.#rooms.get(roomId)?.clients.values() || []);
  }

  updateDocument(roomId, patch) {
    const room = this.#rooms.get(roomId);
    if (!room) return null;
    room.document = { ...room.document, ...patch };
    return room.document;
  }

  updateFocus(roomId, socketId, focus) {
    const client = this.#rooms.get(roomId)?.clients.get(socketId);
    if (!client) return false;
    client.focus = focus;
    return true;
  }
}
