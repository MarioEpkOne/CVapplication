import { describe, it, expect, vi } from "vitest";
import {
  DynamoSessionStore,
  InMemorySessionStore,
  seedSessionState,
  type DocClientLike,
  type HistoryMessage,
} from "../src/session-store";

describe("seedSessionState", () => {
  it("produces an empty conversation history", () => {
    const s = seedSessionState();
    expect(s.history).toEqual([]);
  });
});

describe("DynamoSessionStore", () => {
  it("load returns a freshly seeded state when the item is absent", async () => {
    const client: DocClientLike = { send: vi.fn(async () => ({})) };
    const store = new DynamoSessionStore(client, "T");
    const state = await store.load("missing");
    expect(state.history).toEqual([]); // seeded = empty history
  });

  it("load returns the stored history when present", async () => {
    const client: DocClientLike = {
      send: vi.fn(async () => ({
        Item: { sessionId: "x", history: [{ role: "user", content: "hi" }] },
      })),
    };
    const store = new DynamoSessionStore(client, "T");
    const state = await store.load("x");
    expect(state.history).toEqual([{ role: "user", content: "hi" }]);
  });

  it("save caps history to the last 8 turns and writes an expiresAt TTL", async () => {
    const sends: unknown[] = [];
    const client: DocClientLike = {
      send: vi.fn(async (cmd: unknown) => {
        sends.push(cmd);
        return {};
      }),
    };
    const store = new DynamoSessionStore(client, "T");
    const history: HistoryMessage[] = Array.from({ length: 12 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : ("assistant" as "user" | "assistant"),
      content: `m${i}`,
    }));
    await store.save("x", { history });
    // Inspect the PutCommand input the store sent.
    const put = sends[0] as { input: { Item: { history: HistoryMessage[]; expiresAt: number } } };
    expect(put.input.Item.history).toHaveLength(8);
    expect(put.input.Item.history[0].content).toBe("m4"); // last 8 of m0..m11
    expect(typeof put.input.Item.expiresAt).toBe("number");
    expect(put.input.Item.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});

describe("InMemorySessionStore", () => {
  it("round-trips state and caps history to 8 on save", async () => {
    const store = new InMemorySessionStore();
    const history: HistoryMessage[] = Array.from({ length: 10 }, (_, i) => ({
      role: "user" as const,
      content: `h${i}`,
    }));
    await store.save("s", { history });
    const loaded = await store.load("s");
    expect(loaded.history).toHaveLength(8);
  });
});
