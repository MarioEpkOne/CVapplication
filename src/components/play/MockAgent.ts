import type { AgentEvent } from "@/lib/agent-events";

export interface MockAgentOptions {
  prompt: string;
  signal?: AbortSignal;
  delayMs?: number; // default ~250ms; tests pass 0 for instant iteration
}

// Stateless, prompt-aware offline fallback. No DynamoDB offline, so no real
// persistence — branches must not contradict the live agent's behavior (D7).
// No Math.random: each branch is a fixed ordered sequence the tests assert.

const SEEDED_POSITIONS = [
  {
    orderId: "ord_seed0001",
    pair: "EUR/USD",
    direction: "long",
    lots: 0.1,
    entryPrice: 1.085,
    currentPrice: 1.0861,
    pnl: 11,
  },
  {
    orderId: "ord_seed0002",
    pair: "USD/JPY",
    direction: "short",
    lots: 0.3,
    entryPrice: 149.5,
    currentPrice: 149.32,
    pnl: 54,
  },
];

const HOW_TO_SCRIPT: AgentEvent[] = [
  {
    type: "reasoning",
    delta:
      "To open a position you choose a currency pair, a direction (long or short) and a size in lots. I'd check the price, run a risk check, then place the order.",
  },
  {
    type: "done",
    summary: 'Shall I open a 0.1-lot EUR/USD long for you? Say "yes" and I\'ll do it.',
  },
];

const OPEN_SCRIPT: AgentEvent[] = [
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

const POSITIONS_SCRIPT: AgentEvent[] = [
  { type: "reasoning", delta: "Fetching your open positions." },
  { type: "tool_call", name: "get_positions", input: {} },
  {
    type: "tool_result",
    name: "get_positions",
    output: { positions: SEEDED_POSITIONS },
    durationMs: 1,
  },
  { type: "done", summary: "You have 2 open positions: a EUR/USD long and a USD/JPY short." },
];

const CLOSE_SCRIPT: AgentEvent[] = [
  { type: "reasoning", delta: "Closing your open positions." },
  { type: "tool_call", name: "close_all_positions", input: {} },
  { type: "tool_result", name: "close_all_positions", output: { closed: 2 }, durationMs: 1 },
  { type: "done", summary: "Closed all 2 open positions." },
];

const DEFAULT_SCRIPT: AgentEvent[] = [
  {
    type: "reasoning",
    delta:
      "I can check prices, open or close positions, and show your open positions. For example, ask me to open a small EUR/USD long.",
  },
  { type: "done", summary: "What would you like to do? I can open, close, or list positions." },
];

export function selectMockScript(prompt: string): AgentEvent[] {
  const p = prompt.toLowerCase();
  if (p.includes("how do i") || p.includes("how to")) return HOW_TO_SCRIPT;
  if (p.includes("close")) return CLOSE_SCRIPT;
  if (p.includes("open") || p.includes("buy") || p.includes("long") || p.includes("short")) {
    return OPEN_SCRIPT;
  }
  if (p.includes("position")) return POSITIONS_SCRIPT;
  return DEFAULT_SCRIPT;
}

export async function* runMockAgent(opts: MockAgentOptions): AsyncGenerator<AgentEvent> {
  const delayMs = opts.delayMs ?? 250;
  const script = selectMockScript(opts.prompt);
  for (const event of script) {
    if (opts.signal?.aborted) return;
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    if (opts.signal?.aborted) return;
    yield event;
  }
}
