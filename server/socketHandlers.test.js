// @vitest-environment node
import { createServer } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Server } from "socket.io";
import { io as createClient } from "socket.io-client";
import { CODE_EVENTS, USER_EVENTS } from "../src/shared/protocol/events";
import { RoomStore } from "./roomStore";
import { registerSocketHandlers } from "./socketHandlers";

function once(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve));
}

describe("room socket protocol", () => {
  let httpServer;
  let io;
  let url;
  const clients = [];

  beforeEach(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    registerSocketHandlers(io, new RoomStore());
    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    url = `http://127.0.0.1:${httpServer.address().port}`;
  });

  afterEach(async () => {
    clients.forEach((client) => client.disconnect());
    clients.length = 0;
    await new Promise((resolve) => io.close(resolve));
  });

  async function connect() {
    const client = createClient(url, { forceNew: true, transports: ["websocket"] });
    clients.push(client);
    await once(client, "connect");
    return client;
  }

  async function join(client, roomId, username) {
    const snapshotPromise = once(client, CODE_EVENTS.SYNC);
    client.emit(USER_EVENTS.JOIN, { roomId, username });
    return snapshotPromise;
  }

  it("binds document changes to the sender's joined room", async () => {
    const first = await connect();
    const outsider = await connect();
    await join(first, "room-a", "Ada");
    await join(outsider, "room-b", "Mallory");

    const leakedChange = Promise.race([
      once(first, CODE_EVENTS.CHANGE).then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), 75)),
    ]);
    outsider.emit(CODE_EVENTS.CHANGE, {
      roomId: "room-a",
      code: "malicious change",
      language: "python",
    });
    expect(await leakedChange).toBe(false);

    const newcomer = await connect();
    const snapshot = await join(newcomer, "room-a", "Grace");
    expect(snapshot.code).not.toBe("malicious change");
    expect(snapshot.language).toBe("javascript");
  });
});
