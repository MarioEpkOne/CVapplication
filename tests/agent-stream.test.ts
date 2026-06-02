import { describe, it, expect } from "vitest";
import { parseNdjsonChunk } from "@/lib/agent-stream";
import type { AgentEvent } from "@/lib/agent-events";

describe("parseNdjsonChunk", () => {
  it("parses complete NDJSON lines into AgentEvent objects", () => {
    const input = '{"type":"reasoning","delta":"hi"}\n{"type":"done","summary":"ok"}\n';
    const { events, rest } = parseNdjsonChunk("", input);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: "reasoning", delta: "hi" });
    expect(events[1]).toEqual({ type: "done", summary: "ok" });
    expect(rest).toBe("");
  });

  it("buffers a partial trailing line across chunks", () => {
    const first = parseNdjsonChunk("", '{"type":"reasoning","delta":"par');
    expect(first.events).toHaveLength(0);
    expect(first.rest).toBe('{"type":"reasoning","delta":"par');

    const second = parseNdjsonChunk(first.rest, 'tial"}\n');
    expect(second.events).toEqual([{ type: "reasoning", delta: "partial" }]);
    expect(second.rest).toBe("");
  });

  it("skips malformed JSON lines without throwing", () => {
    const input = '{"type":"reasoning","delta":"a"}\nNOT JSON {{{\n{"type":"done","summary":"b"}\n';
    let result: { events: AgentEvent[]; rest: string } | undefined;
    expect(() => {
      result = parseNdjsonChunk("", input);
    }).not.toThrow();
    expect(result!.events).toEqual([
      { type: "reasoning", delta: "a" },
      { type: "done", summary: "b" },
    ]);
  });

  it("each AgentEvent variant shape is constructible/assignable", () => {
    const variants: AgentEvent[] = [
      { type: "reasoning", delta: "x" },
      { type: "tool_call", name: "get_price", input: { pair: "EUR/USD" } },
      { type: "tool_result", name: "get_price", output: { bid: 1 }, durationMs: 3 },
      { type: "done", summary: "done" },
      { type: "error", message: "boom" },
    ];
    const roundTripped = variants.map((v) => JSON.parse(JSON.stringify(v)) as AgentEvent);
    expect(roundTripped.map((v) => v.type)).toEqual([
      "reasoning",
      "tool_call",
      "tool_result",
      "done",
      "error",
    ]);
  });
});
