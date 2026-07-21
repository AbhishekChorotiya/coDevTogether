// @vitest-environment node
import { describe, expect, it } from "vitest";
import { RoomStore } from "./roomStore";

describe("RoomStore", () => {
  it("retains one authoritative document snapshot for a room", () => {
    const store = new RoomStore();
    store.join("room", "socket-1", "Ada");
    store.updateDocument("room", { code: "print('hello')", language: "python" });

    expect(store.join("room", "socket-2", "Grace")).toMatchObject({
      code: "print('hello')",
      language: "python",
    });
    expect(store.clients("room")).toHaveLength(2);
  });

  it("removes empty rooms", () => {
    const store = new RoomStore();
    store.join("room", "socket-1", "Ada");
    expect(store.leave("room", "socket-1")).toEqual([]);
    expect(store.clients("room")).toEqual([]);
  });
});
