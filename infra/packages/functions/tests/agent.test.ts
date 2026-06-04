import { describe, it, expect, vi } from "vitest";
import { runAgent, isOriginAllowed, type GroqLike } from "../src/agent";
import type { AgentEvent } from "@shared/events";
import {
  InMemorySessionStore,
  seedSessionState,
  type SessionStore,
  type SessionState,
} from "../src/session-store";

const ALLOWED = ["https://mario-portfolio.fly.dev"];

class ThrowingStore implements SessionStore {
  async load(): Promise<SessionState> {
    throw new Error("dynamo down");
  }
  async save(): Promise<void> {
    /* no-op */
  }
}

function makeGroq(responses: unknown[]): { groq: GroqLike; calls: () => number } {
  let i = 0;
  let callCount = 0;
  const groq: GroqLike = {
    chat: {
      completions: {
        create: vi.fn(async () => {
          callCount++;
          const r = responses[Math.min(i, responses.length - 1)];
          i++;
          return r as never;
        }),
      },
    },
  };
  return { groq, calls: () => callCount };
}

function stopMessage(content: string) {
  return { choices: [{ message: { role: "assistant", content }, finish_reason: "stop" }] };
}

function toolCallMessage(name: string, args: Record<string, unknown>, id = "call_1") {
  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: "",
          tool_calls: [{ id, function: { name, arguments: JSON.stringify(args) } }],
        },
        finish_reason: "tool_calls",
      },
    ],
  };
}

describe("runAgent", () => {
  it("terminates when the model returns finish_reason stop", async () => {
    const events: AgentEvent[] = [];
    const { groq, calls } = makeGroq([stopMessage("All done here.")]);
    await runAgent({
      prompt: "hi",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    expect(calls()).toBe(1);
    expect(events.at(-1)).toEqual({ type: "done", summary: "All done here." });
  });

  it("terminates at MAX_ITERATIONS and emits a done event", async () => {
    const events: AgentEvent[] = [];
    // Always returns a tool call → never stops.
    const { groq, calls } = makeGroq([toolCallMessage("get_price", { pair: "EUR/USD" })]);
    await runAgent({
      prompt: "loop",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    expect(calls()).toBe(4);
    expect(events.at(-1)).toEqual({ type: "done", summary: "Reached maximum steps" });
  });

  it("dispatches tool calls and emits tool_call + tool_result pairs", async () => {
    const events: AgentEvent[] = [];
    const { groq } = makeGroq([
      toolCallMessage("get_price", { pair: "EUR/USD" }),
      stopMessage("Here is the price."),
    ]);
    await runAgent({
      prompt: "price?",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    const call = events.find((e) => e.type === "tool_call");
    const result = events.find((e) => e.type === "tool_result");
    expect(call).toMatchObject({ type: "tool_call", name: "get_price" });
    expect(result).toMatchObject({ type: "tool_result", name: "get_price" });
    expect(typeof (result as { durationMs: number }).durationMs).toBe("number");
    expect(events.at(-1)).toMatchObject({ type: "done" });
  });

  it("emits an error event on Groq API failure", async () => {
    const events: AgentEvent[] = [];
    const groq: GroqLike = {
      chat: { completions: { create: vi.fn(async () => Promise.reject(new Error("boom"))) } },
    };
    await runAgent({
      prompt: "hi",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    const errors = events.filter((e) => e.type === "error");
    expect(errors).toHaveLength(1);
  });

  it("retries once on Groq tool_use_failed, then succeeds", async () => {
    const events: AgentEvent[] = [];
    let n = 0;
    const groq: GroqLike = {
      chat: {
        completions: {
          create: vi.fn(async () => {
            n++;
            if (n === 1) {
              // Shape of groq-sdk's APIError for a 400 tool_use_failed.
              return Promise.reject({
                status: 400,
                error: { error: { code: "tool_use_failed" } },
              });
            }
            return stopMessage("Recovered after retry.") as never;
          }),
        },
      },
    };
    await runAgent({
      prompt: "hi",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    expect(n).toBe(2);
    expect(events.at(-1)).toEqual({ type: "done", summary: "Recovered after retry." });
  });

  it("rejects unauthorized origins", async () => {
    const events: AgentEvent[] = [];
    const create = vi.fn();
    const groq = { chat: { completions: { create } } } as unknown as GroqLike;
    const result = await runAgent({
      prompt: "hi",
      origin: "https://evil.example",
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    expect(result.forbidden).toBe(true);
    expect(create).not.toHaveBeenCalled();
    expect(events).toHaveLength(0);
    // direct helper assertion
    expect(isOriginAllowed("https://evil.example", ALLOWED)).toBe(false);
    expect(isOriginAllowed(ALLOWED[0], ALLOWED)).toBe(true);
  });

  it("requireOrigin gates a missing Origin", () => {
    expect(isOriginAllowed(undefined, ALLOWED, true)).toBe(false); // E1 prod
    expect(isOriginAllowed(undefined, ALLOWED, false)).toBe(true); // E2 dev
    expect(isOriginAllowed(undefined, ALLOWED)).toBe(true); // E4 default
    expect(isOriginAllowed("https://evil.example", ALLOWED, true)).toBe(false);
  });

  it("rejects oversized prompts", async () => {
    const events: AgentEvent[] = [];
    const create = vi.fn();
    const groq = { chat: { completions: { create } } } as unknown as GroqLike;
    await runAgent({
      prompt: "x".repeat(501),
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    expect(create).not.toHaveBeenCalled();
    expect(events).toEqual([{ type: "error", message: "Prompt too long" }]);
  });

  it("a how-to prompt that the model answers in text calls no trading tool", async () => {
    const events: AgentEvent[] = [];
    // Model replies in plain text (explain + offer) — no tool_calls.
    const { groq } = makeGroq([
      stopMessage(
        "To open a position you pick a pair and size. Shall I open a 0.1-lot EUR/USD long?",
      ),
    ]);
    await runAgent({
      prompt: "How do I open a position?",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    const toolCalls = events.filter((e) => e.type === "tool_call");
    expect(toolCalls).toHaveLength(0);
    expect(
      events.some(
        (e) =>
          e.type === "tool_call" &&
          ["open_order", "close_position", "close_all_positions"].includes(e.name),
      ),
    ).toBe(false);
    expect(events.at(-1)).toMatchObject({ type: "done" });
  });

  it("a direct open instruction persists the opened position via the store", async () => {
    const events: AgentEvent[] = [];
    const store = new InMemorySessionStore();
    const { groq } = makeGroq([
      toolCallMessage("open_order", { pair: "EUR/USD", direction: "long", lots: 0.1 }),
      stopMessage("Opened your EUR/USD long."),
    ]);
    await runAgent({
      prompt: "Open a EUR/USD long",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "sess-open",
      store,
    });
    const reloaded = await store.load("sess-open");
    // Seeded 2 + 1 newly opened = 3 persisted positions.
    expect(reloaded.positions.length).toBe(3);
    expect(reloaded.positions.some((p) => p.pair === "EUR/USD" && p.direction === "long")).toBe(
      true,
    );
  });

  it("confirmation 'yes' after a prior offer in history opens the offered trade", async () => {
    const events: AgentEvent[] = [];
    const store = new InMemorySessionStore();
    // Pre-seed history with a prior offer so the model has context.
    await store.save("sess-confirm", {
      positions: [],
      history: [
        { role: "user", content: "How do I open a position?" },
        { role: "assistant", content: "Shall I open a 0.1-lot EUR/USD long for you?" },
      ],
    });
    const { groq } = makeGroq([
      toolCallMessage("open_order", { pair: "EUR/USD", direction: "long", lots: 0.1 }),
      stopMessage("Done — opened your EUR/USD long."),
    ]);
    await runAgent({
      prompt: "yes",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "sess-confirm",
      store,
    });
    const opened = events.find((e) => e.type === "tool_call" && e.name === "open_order");
    expect(opened).toBeTruthy();
  });

  it("a missing sessionId runs with ephemeral seeded state and does not call save", async () => {
    const events: AgentEvent[] = [];
    const store = new InMemorySessionStore();
    const saveSpy = vi.spyOn(store, "save");
    const { groq } = makeGroq([stopMessage("You have positions.")]);
    await runAgent({
      prompt: "What are my positions?",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      // no sessionId
      store,
    });
    expect(saveSpy).not.toHaveBeenCalled();
    expect(events.at(-1)).toMatchObject({ type: "done" });
  });

  it("completes the run even when the store's load throws", async () => {
    const events: AgentEvent[] = [];
    const { groq } = makeGroq([stopMessage("Handled despite store failure.")]);
    await runAgent({
      prompt: "hi",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "sess-throw",
      store: new ThrowingStore(),
    });
    expect(events.at(-1)).toMatchObject({ type: "done" });
    const errors = events.filter((e) => e.type === "error");
    expect(errors).toHaveLength(0);
  });
});
