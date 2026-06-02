import { describe, it, expect, vi } from "vitest";
import { runAgent, isOriginAllowed, type GroqLike } from "../src/agent";
import type { AgentEvent } from "@shared/events";

const ALLOWED = ["https://mario-portfolio.fly.dev"];

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
    });
    expect(result.forbidden).toBe(true);
    expect(create).not.toHaveBeenCalled();
    expect(events).toHaveLength(0);
    // direct helper assertion
    expect(isOriginAllowed("https://evil.example", ALLOWED)).toBe(false);
    expect(isOriginAllowed(ALLOWED[0], ALLOWED)).toBe(true);
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
    });
    expect(create).not.toHaveBeenCalled();
    expect(events).toEqual([{ type: "error", message: "Prompt too long" }]);
  });
});
