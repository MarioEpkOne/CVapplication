import { describe, it, expect } from "vitest";
import { runMockAgent, detectLocale, selectMockAnswer } from "@/components/play/MockAgent";
import type { AgentEvent } from "@/lib/agent-events";

const KNOWN_TYPES = new Set(["reasoning", "tool_call", "tool_result", "done", "error"]);

async function collect(opts: {
  mode: "chat" | "pitch";
  prompt?: string;
  locale?: "cs" | "en";
}): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const e of runMockAgent({ ...opts, delayMs: 0 })) {
    events.push(e);
  }
  return events;
}

describe("MockAgent", () => {
  it("detectLocale returns 'cs' for a Czech prompt", () => {
    // Czech diacritics trigger — "Proč" contains č
    expect(detectLocale("Proč bychom tě měli najmout?")).toBe("cs");
    // Token-only (no diacritics) — "jake" is in CZECH_TOKENS
    expect(detectLocale("jake mas zkusenosti")).toBe("cs");
  });

  it("detectLocale returns 'en' for an English prompt", () => {
    expect(detectLocale("Why should we hire you?")).toBe("en");
  });

  it("detectLocale ambiguous (no diacritics/tokens) defaults to 'en'", () => {
    expect(detectLocale("ok")).toBe("en");
  });

  it("chat mode routes 'hire' intent to a grounded answer", async () => {
    const events = await collect({ mode: "chat", prompt: "Why should we hire you?" });
    expect(events.at(-1)?.type).toBe("done");
    const done = events.at(-1) as { type: "done"; summary: string };
    expect(done.summary.length).toBeGreaterThan(0);
    expect(done.summary).toMatch(/AstraZeneca|Global Payments|AI tools|agent/i);
  });

  it("chat mode routes 'weakness' intent", async () => {
    const events = await collect({ mode: "chat", prompt: "What's your biggest weakness?" });
    expect(events.at(-1)?.type).toBe("done");
    const done = events.at(-1) as { type: "done"; summary: string };
    expect(done.summary.length).toBeGreaterThan(0);
  });

  it("pitch mode produces an answer without a prompt", async () => {
    const events = await collect({ mode: "pitch", locale: "en" });
    expect(events.map((e) => e.type)).toEqual(["reasoning", "done"]);
    expect(events.at(-1)?.type).toBe("done");
    const done = events.at(-1) as { type: "done"; summary: string };
    expect(done.summary.length).toBeGreaterThan(0);
  });

  it("pitch mode honors locale 'cs'", async () => {
    // Assert selectMockAnswer returns non-empty cs hire answer distinct from en
    const csAnswer = selectMockAnswer("Proč bychom tě měli najmout?", "cs");
    const enAnswer = selectMockAnswer("Why should we hire you?", "en");
    expect(csAnswer.length).toBeGreaterThan(0);
    expect(csAnswer).not.toBe(enAnswer);
    // Also verify pitch with locale:"cs" emits cs reasoning flavor
    const events = await collect({ mode: "pitch", locale: "cs" });
    const reasoning = events.find((e) => e.type === "reasoning") as
      | { type: "reasoning"; delta: string }
      | undefined;
    expect(reasoning?.delta).toBe("Radím se se svým nafouknutým egem…");
  });

  it("every emitted event across modes/intents conforms to the AgentEvent union and ends in done", async () => {
    const cases = [
      { mode: "chat" as const, prompt: "Why hire you?" },
      { mode: "chat" as const, prompt: "weakness" },
      { mode: "chat" as const, prompt: "hello" },
      { mode: "pitch" as const, locale: "en" as const },
      { mode: "pitch" as const, locale: "cs" as const },
    ];
    for (const c of cases) {
      const events = await collect(c);
      for (const e of events) {
        expect(KNOWN_TYPES.has(e.type)).toBe(true);
        if (e.type === "reasoning") {
          expect(typeof e.delta).toBe("string");
        } else if (e.type === "done") {
          expect(typeof e.summary).toBe("string");
        } else if (e.type === "error") {
          expect(typeof e.message).toBe("string");
        }
      }
      expect(events.at(-1)?.type).toBe("done");
    }
  });
});
