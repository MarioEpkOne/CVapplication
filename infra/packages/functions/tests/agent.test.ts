import { describe, it, expect, vi } from "vitest";
import {
  runAgent,
  isOriginAllowed,
  PITCH_INSTRUCTION,
  type GroqLike,
} from "../src/agent";
import type { AgentEvent } from "@shared/events";
import {
  InMemorySessionStore,
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

function makeGroq(responses: unknown[]): {
  groq: GroqLike;
  calls: () => number;
  lastMessages: () => unknown[];
} {
  let i = 0;
  let callCount = 0;
  let capturedMessages: unknown[] = [];
  const groq: GroqLike = {
    chat: {
      completions: {
        create: vi.fn(async (args: { messages: unknown[] }) => {
          callCount++;
          capturedMessages = args.messages;
          const r = responses[Math.min(i, responses.length - 1)];
          i++;
          return r as never;
        }),
      },
    },
  };
  return { groq, calls: () => callCount, lastMessages: () => capturedMessages };
}

function stopMessage(content: string) {
  return { choices: [{ message: { role: "assistant", content }, finish_reason: "stop" }] };
}

describe("runAgent", () => {
  it("chat mode terminates in one Groq call and emits done", async () => {
    const events: AgentEvent[] = [];
    const { groq, calls } = makeGroq([stopMessage("Roasted.")]);
    await runAgent({
      mode: "chat",
      prompt: "Why should we hire you?",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    expect(calls()).toBe(1);
    expect(events.at(-1)).toEqual({ type: "done", summary: "Roasted." });
  });

  it("chat mode persists {user, assistant} to history", async () => {
    const events: AgentEvent[] = [];
    const store = new InMemorySessionStore();
    const { groq } = makeGroq([stopMessage("Roasted.")]);
    await runAgent({
      mode: "chat",
      prompt: "Why should we hire you?",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "sess-1",
      store,
    });
    const state = await store.load("sess-1");
    expect(state.history).toEqual([
      { role: "user", content: "Why should we hire you?" },
      { role: "assistant", content: "Roasted." },
    ]);
  });

  it("pitch mode ignores sessionId and does NOT call store.save or store.load", async () => {
    const events: AgentEvent[] = [];
    const store = new InMemorySessionStore();
    const saveSpy = vi.spyOn(store, "save");
    const loadSpy = vi.spyOn(store, "load");
    const { groq } = makeGroq([stopMessage("Here is my pitch.")]);
    await runAgent({
      mode: "pitch",
      locale: "en",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "sess-pitch",
      store,
    });
    expect(saveSpy).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
    expect(events.at(-1)).toMatchObject({ type: "done" });
  });

  it("pitch mode builds a fixed-instruction user message (EN default)", async () => {
    const events: AgentEvent[] = [];
    const { groq, lastMessages } = makeGroq([stopMessage("Pitch answer.")]);
    await runAgent({
      mode: "pitch",
      locale: "en",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      store: new InMemorySessionStore(),
    });
    const msgs = lastMessages() as Array<{ role: string; content: string }>;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === "user");
    expect(lastUserMsg?.content).toBe(PITCH_INSTRUCTION.en);
  });

  it("pitch mode with locale 'cs' uses the Czech instruction", async () => {
    const events: AgentEvent[] = [];
    const { groq, lastMessages } = makeGroq([stopMessage("Czech pitch.")]);
    await runAgent({
      mode: "pitch",
      locale: "cs",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      store: new InMemorySessionStore(),
    });
    const msgs = lastMessages() as Array<{ role: string; content: string }>;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === "user");
    expect(lastUserMsg?.content).toBe(PITCH_INSTRUCTION.cs);
  });

  it("origin gate rejects evil origins", async () => {
    const events: AgentEvent[] = [];
    const create = vi.fn();
    const groq = { chat: { completions: { create } } } as unknown as GroqLike;
    const result = await runAgent({
      mode: "chat",
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
    // direct helper assertions
    expect(isOriginAllowed("https://evil.example", ALLOWED)).toBe(false);
    expect(isOriginAllowed(ALLOWED[0], ALLOWED)).toBe(true);
  });

  it("requireOrigin gates a missing Origin", () => {
    expect(isOriginAllowed(undefined, ALLOWED, true)).toBe(false); // E1 prod
    expect(isOriginAllowed(undefined, ALLOWED, false)).toBe(true); // E2 dev
    expect(isOriginAllowed(undefined, ALLOWED)).toBe(true); // E4 default
    expect(isOriginAllowed("https://evil.example", ALLOWED, true)).toBe(false);
  });

  it("oversized chat prompt → error, no Groq call", async () => {
    const events: AgentEvent[] = [];
    const create = vi.fn();
    const groq = { chat: { completions: { create } } } as unknown as GroqLike;
    await runAgent({
      mode: "chat",
      prompt: "x".repeat(501),
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      store: new InMemorySessionStore(),
    });
    expect(create).not.toHaveBeenCalled();
    expect(events).toEqual([{ type: "error", message: "Prompt too long" }]);
  });

  it("empty chat prompt → error, no Groq call", async () => {
    const events: AgentEvent[] = [];
    const create = vi.fn();
    const groq = { chat: { completions: { create } } } as unknown as GroqLike;
    await runAgent({
      mode: "chat",
      prompt: "   ",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      store: new InMemorySessionStore(),
    });
    expect(create).not.toHaveBeenCalled();
    expect(events).toEqual([{ type: "error", message: "Empty prompt" }]);
  });

  it("chat completes even when store.load throws", async () => {
    const events: AgentEvent[] = [];
    const { groq } = makeGroq([stopMessage("Handled despite store failure.")]);
    await runAgent({
      mode: "chat",
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

  it("Groq 429 → busy error", async () => {
    const events: AgentEvent[] = [];
    const groq: GroqLike = {
      chat: {
        completions: {
          create: vi.fn(async () => Promise.reject({ status: 429 })),
        },
      },
    };
    await runAgent({
      mode: "chat",
      prompt: "hi",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      store: new InMemorySessionStore(),
    });
    expect(events).toContainEqual({
      type: "error",
      message: "Agent is busy, try again shortly",
    });
  });

  it("Groq generic failure → model error", async () => {
    const events: AgentEvent[] = [];
    const groq: GroqLike = {
      chat: {
        completions: {
          create: vi.fn(async () => Promise.reject(new Error("boom"))),
        },
      },
    };
    await runAgent({
      mode: "chat",
      prompt: "hi",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      store: new InMemorySessionStore(),
    });
    expect(events).toHaveLength(2); // reasoning + error
    const errEvt = events.find((e) => e.type === "error");
    expect(errEvt).toEqual({
      type: "error",
      message: "The agent could not reach its model. Please try again.",
    });
  });

  it("retries once on tool_use_failed then succeeds", async () => {
    const events: AgentEvent[] = [];
    let n = 0;
    const groq: GroqLike = {
      chat: {
        completions: {
          create: vi.fn(async () => {
            n++;
            if (n === 1) {
              return Promise.reject({
                status: 400,
                error: { error: { code: "tool_use_failed" } },
              });
            }
            return stopMessage("Recovered.") as never;
          }),
        },
      },
    };
    await runAgent({
      mode: "chat",
      prompt: "hi",
      origin: ALLOWED[0],
      groq,
      write: (e) => events.push(e),
      allowedOrigins: ALLOWED,
      sessionId: "test-session",
      store: new InMemorySessionStore(),
    });
    expect(n).toBe(2);
    expect(events.at(-1)).toEqual({ type: "done", summary: "Recovered." });
  });
});
