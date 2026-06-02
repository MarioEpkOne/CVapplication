import type { AgentEvent } from "@/lib/agent-events";

export interface MockAgentOptions {
  prompt: string;
  signal?: AbortSignal;
  delayMs?: number; // default ~250ms; tests pass 0 for instant iteration
}

// Deterministic scripted sequence mirroring the real Lambda event shapes.
// No Math.random — the unit test asserts the exact ordered sequence.
const SCRIPT: AgentEvent[] = [
  { type: "reasoning", delta: "Let me check the current EUR/USD price first." },
  { type: "tool_call", name: "get_price", input: { pair: "EUR/USD" } },
  {
    type: "tool_result",
    name: "get_price",
    output: { pair: "EUR/USD", bid: 1.085, ask: 1.0851, spread: 0.0001, timestamp: "mock" },
    durationMs: 2,
  },
  { type: "reasoning", delta: "Price looks reasonable. Running a risk check before opening." },
  {
    type: "tool_call",
    name: "risk_check",
    input: { pair: "EUR/USD", direction: "long", lots: 0.1 },
  },
  {
    type: "tool_result",
    name: "risk_check",
    output: { approved: true, reason: "Risk within acceptable bounds.", riskScore: 0.18 },
    durationMs: 1,
  },
  {
    type: "tool_call",
    name: "open_order",
    input: { pair: "EUR/USD", direction: "long", lots: 0.1 },
  },
  {
    type: "tool_result",
    name: "open_order",
    output: {
      orderId: "ord_mock1234",
      status: "filled",
      pair: "EUR/USD",
      direction: "long",
      lots: 0.1,
      entryPrice: 1.0851,
      timestamp: "mock",
    },
    durationMs: 1,
  },
  { type: "done", summary: "Opened a 0.1-lot EUR/USD long at 1.0851 after a passing risk check." },
];

export async function* runMockAgent(opts: MockAgentOptions): AsyncGenerator<AgentEvent> {
  const delayMs = opts.delayMs ?? 250;
  for (const event of SCRIPT) {
    if (opts.signal?.aborted) return;
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    if (opts.signal?.aborted) return;
    yield event;
  }
}
