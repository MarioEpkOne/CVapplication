import { describe, it, expect } from "vitest";
import { runMockAgent } from "@/components/play/MockAgent";
import type { AgentEvent } from "@/lib/agent-events";

const KNOWN_TYPES = new Set(["reasoning", "tool_call", "tool_result", "done", "error"]);

async function collect(): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const e of runMockAgent({ prompt: "test", delayMs: 0 })) {
    events.push(e);
  }
  return events;
}

describe("runMockAgent", () => {
  it("emits a reasoning → tool_call → tool_result → done sequence", async () => {
    const events = await collect();

    // At least one reasoning event.
    expect(events.some((e) => e.type === "reasoning")).toBe(true);

    // A tool_call immediately followed by a tool_result.
    let foundPair = false;
    for (let i = 0; i < events.length - 1; i++) {
      if (events[i].type === "tool_call" && events[i + 1].type === "tool_result") {
        foundPair = true;
        break;
      }
    }
    expect(foundPair).toBe(true);

    // Terminal event is done.
    expect(events.at(-1)?.type).toBe("done");
  });

  it("every emitted event conforms to the AgentEvent union", async () => {
    const events = await collect();
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
  });
});
