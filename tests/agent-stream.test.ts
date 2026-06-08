import { describe, it, expect, vi, afterEach } from "vitest";
import { parseNdjsonChunk, streamAgent } from "@/lib/agent-stream";
import type { AgentEvent } from "@/lib/agent-events";

// Fake Response builder for streamAgent body-shape tests.
function fakeResponse(lines: string[]) {
  let i = 0;
  const enc = new TextEncoder();
  return {
    ok: true,
    status: 200,
    body: {
      getReader() {
        return {
          read: async () =>
            i < lines.length
              ? { done: false, value: enc.encode(lines[i++]) }
              : { done: true, value: undefined },
        };
      },
    },
  } as unknown as Response;
}

describe("streamAgent body", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("streamAgent chat body includes mode and prompt", async () => {
    let capturedBody: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        capturedBody = init.body as string;
        return Promise.resolve(fakeResponse(['{"type":"done","summary":"ok"}\n']));
      }),
    );
    const events: AgentEvent[] = [];
    for await (const e of streamAgent({
      url: "http://x",
      mode: "chat",
      prompt: "hi",
      sessionId: "s",
    })) {
      events.push(e);
    }
    const body = JSON.parse(capturedBody!);
    expect(body.mode).toBe("chat");
    expect(body.prompt).toBe("hi");
    expect(body.sessionId).toBe("s");
    expect(body.token).toBeUndefined();
  });

  it("streamAgent pitch body includes mode and locale, no prompt", async () => {
    let capturedBody: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        capturedBody = init.body as string;
        return Promise.resolve(fakeResponse(['{"type":"done","summary":"ok"}\n']));
      }),
    );
    const events: AgentEvent[] = [];
    for await (const e of streamAgent({
      url: "http://x",
      mode: "pitch",
      locale: "cs",
    })) {
      events.push(e);
    }
    const body = JSON.parse(capturedBody!);
    expect(body.mode).toBe("pitch");
    expect(body.locale).toBe("cs");
    expect(body.prompt).toBeUndefined();
  });

  it("streamAgent includes token in the body when provided", async () => {
    let capturedBody: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        capturedBody = init.body as string;
        return Promise.resolve(fakeResponse(['{"type":"done","summary":"ok"}\n']));
      }),
    );
    const events: AgentEvent[] = [];
    for await (const e of streamAgent({
      url: "http://x",
      mode: "chat",
      prompt: "hi",
      sessionId: "s",
      token: "sig.tok",
    })) {
      events.push(e);
    }
    const body = JSON.parse(capturedBody!);
    expect(body.token).toBe("sig.tok");
  });
});

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
