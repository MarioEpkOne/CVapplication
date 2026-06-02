// MOCK DATA ONLY — no real trading, no external APIs (spec Constraint 1).
import { SUPPORTED_PAIRS, type ForexPair } from "@shared/tool-defs";

const BASE_PRICES: Record<ForexPair, number> = {
  "EUR/USD": 1.085,
  "GBP/USD": 1.272,
  "USD/JPY": 149.5,
  "EUR/GBP": 0.853,
};

// Pair-appropriate decimal precision: JPY pairs quote to 3 decimals, others to 5.
function decimalsFor(pair: ForexPair): number {
  return pair.includes("JPY") ? 3 : 5;
}

// Typical spread per pair (in price units).
const SPREADS: Record<ForexPair, number> = {
  "EUR/USD": 0.0001,
  "GBP/USD": 0.0002,
  "USD/JPY": 0.02,
  "EUR/GBP": 0.0002,
};

function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function isSupported(pair: unknown): pair is ForexPair {
  return typeof pair === "string" && (SUPPORTED_PAIRS as readonly string[]).includes(pair);
}

function randomHex(bytes: number): string {
  let out = "";
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

// get_price({ pair }) ->
//   ok:    { pair, bid, ask, spread, timestamp }
//   error: { error: "Unknown pair: <pair>" }
export function getPrice(input: { pair?: unknown }): Record<string, unknown> {
  const pair = input.pair;
  if (!isSupported(pair)) {
    return { error: `Unknown pair: ${String(pair)}` };
  }
  const base = BASE_PRICES[pair];
  const decimals = decimalsFor(pair);
  // Jitter in ±0.05%.
  const jitter = (Math.random() - 0.5) * 2 * 0.0005;
  const bid = round(base * (1 + jitter), decimals);
  const spread = SPREADS[pair];
  const ask = round(bid + spread, decimals);
  return {
    pair,
    bid,
    ask,
    spread: round(ask - bid, decimals),
    timestamp: new Date().toISOString(),
  };
}

// risk_check({ pair, direction, lots }) ->
//   { approved, reason, riskScore } | { error }
export function riskCheck(input: {
  pair?: unknown;
  direction?: unknown;
  lots?: unknown;
}): Record<string, unknown> {
  const pair = input.pair;
  if (!isSupported(pair)) {
    return { error: `Unknown pair: ${String(pair)}` };
  }
  const rejected = Math.random() < 0.2;
  if (rejected) {
    return {
      approved: false,
      reason: "Risk too high: position size exceeds prudent exposure for current volatility.",
      riskScore: round(0.7 + Math.random() * 0.3, 2),
    };
  }
  return {
    approved: true,
    reason: "Risk within acceptable bounds.",
    riskScore: round(Math.random() * 0.5, 2),
  };
}

// open_order({ pair, direction, lots }) ->
//   { orderId, status: "filled", pair, direction, lots, entryPrice, timestamp } | { error }
export function openOrder(input: {
  pair?: unknown;
  direction?: unknown;
  lots?: unknown;
}): Record<string, unknown> {
  const pair = input.pair;
  if (!isSupported(pair)) {
    return { error: `Unknown pair: ${String(pair)}` };
  }
  const decimals = decimalsFor(pair);
  const base = BASE_PRICES[pair];
  const jitter = (Math.random() - 0.5) * 2 * 0.0005;
  const entryPrice = round(base * (1 + jitter), decimals);
  return {
    orderId: "ord_" + randomHex(4),
    status: "filled",
    pair,
    direction: typeof input.direction === "string" ? input.direction : "long",
    lots: typeof input.lots === "number" ? input.lots : 0.1,
    entryPrice,
    timestamp: new Date().toISOString(),
  };
}

// get_positions({}) ->
//   { positions: Array<{ pair, direction, lots, entryPrice, currentPrice, pnl }> }
export function getPositions(): Record<string, unknown> {
  const count = 1 + Math.floor(Math.random() * 3); // 1..3
  const directions = ["long", "short"] as const;
  const positions = Array.from({ length: count }, () => {
    const pair = SUPPORTED_PAIRS[Math.floor(Math.random() * SUPPORTED_PAIRS.length)];
    const decimals = decimalsFor(pair);
    const base = BASE_PRICES[pair];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const lots = round(0.1 + Math.random() * 0.9, 2);
    const entryPrice = round(base * (1 + (Math.random() - 0.5) * 2 * 0.002), decimals);
    const currentPrice = round(base * (1 + (Math.random() - 0.5) * 2 * 0.002), decimals);
    const sign = direction === "long" ? 1 : -1;
    const pnl = round(sign * (currentPrice - entryPrice) * lots * 100000, 2);
    return { pair, direction, lots, entryPrice, currentPrice, pnl };
  });
  return { positions };
}

// Dispatcher. Unknown tool name -> { error: "Unknown tool: <name>" }.
export function executeTool(name: string, input: Record<string, unknown>): Record<string, unknown> {
  switch (name) {
    case "get_price":
      return getPrice(input);
    case "risk_check":
      return riskCheck(input);
    case "open_order":
      return openOrder(input);
    case "get_positions":
      return getPositions();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
