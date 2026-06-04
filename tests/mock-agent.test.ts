import { describe, it, expect } from "vitest";
import { runMockAgent } from "@/components/play/MockAgent";
import type { AgentEvent } from "@/lib/agent-events";

const KNOWN_TYPES = new Set(["reasoning", "tool_call", "tool_result", "done", "error"]);

async function collect(prompt: string): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const e of runMockAgent({ prompt, delayMs: 0 })) {
    events.push(e);
  }
  return events;
}

function toolNames(events: AgentEvent[]): string[] {
  return events.filter((e) => e.type === "tool_call").map((e) => (e as { name: string }).name);
}

describe("runMockAgent (prompt-aware)", () => {
  it("how-to prompt explains + offers and calls NO trading tool", async () => {
    const events = await collect("How do I open a position?");
    expect(events.some((e) => e.type === "reasoning")).toBe(true);
    expect(toolNames(events)).not.toContain("open_order");
    expect(toolNames(events)).toHaveLength(0);
    expect(events.at(-1)?.type).toBe("done");
  });

  it("'close all' prompt produces a close trace", async () => {
    const events = await collect("Close all my positions");
    expect(toolNames(events)).toContain("close_all_positions");
    expect(events.at(-1)?.type).toBe("done");
  });

  it("'my positions' prompt returns the seeded positions list", async () => {
    const events = await collect("What are my current positions?");
    expect(toolNames(events)).toContain("get_positions");
    const result = events.find((e) => e.type === "tool_result" && e.name === "get_positions") as
      | { output: { positions: unknown[] } }
      | undefined;
    expect(result?.output.positions).toHaveLength(2);
  });

  it("'open' prompt produces an open trace ending in done", async () => {
    const events = await collect("Open a small EUR/USD long position for me");
    expect(toolNames(events)).toContain("open_order");
    expect(events.at(-1)?.type).toBe("done");
  });

  it("every emitted event (across branches) conforms to the AgentEvent union", async () => {
    for (const prompt of [
      "How do I open a position?",
      "Close all my positions",
      "What are my current positions?",
      "Open a EUR/USD long",
      "hello",
    ]) {
      const events = await collect(prompt);
      for (const e of events) {
        expect(KNOWN_TYPES.has(e.type)).toBe(true);
        switch (e.type) {
          case "reasoning":
            expect(typeof e.delta).toBe("string");
            break;
          case "tool_call":
            expect(typeof e.name).toBe("string");
            expect(typeof e.input).toBe("object");
            break;
          case "tool_result":
            expect(typeof e.name).toBe("string");
            expect(typeof e.output).toBe("object");
            expect(typeof e.durationMs).toBe("number");
            break;
          case "done":
            expect(typeof e.summary).toBe("string");
            break;
          case "error":
            expect(typeof e.message).toBe("string");
            break;
        }
      }
    }
  });
});
