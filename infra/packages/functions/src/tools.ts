// MOCK DATA ONLY — no real trading, no external APIs (spec Constraint 1).
import { SUPPORTED_PAIRS, type ForexPair } from "@shared/tool-defs";
import type { SessionState, Position } from "./session-store";

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

// Named constants for the mock RNG (readability only — values unchanged, D12/E17).
const PRICE_JITTER = 0.0005; // ±0.05% bid jitter (get_price, open_order)
const RISK_REJECTION_RATE = 0.2; // P(risk_check rejects)
const REJECTED_RISK_MIN = 0.7; // rejected riskScore floor
const REJECTED_RISK_SPAN = 0.3; // rejected riskScore span (0.7..1.0)
const APPROVED_RISK_SPAN = 0.5; // approved riskScore span (0..0.5)
const DEFAULT_LOT = 0.1; // open_order default lots
const POSITION_PRICE_JITTER = 0.002; // ±0.2% entry/current jitter (get_positions)

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
  const jitter = (Math.random() - 0.5) * 2 * PRICE_JITTER;
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
  const rejected = Math.random() < RISK_REJECTION_RATE;
  if (rejected) {
    return {
      approved: false,
      reason: "Risk too high: position size exceeds prudent exposure for current volatility.",
      riskScore: round(REJECTED_RISK_MIN + Math.random() * REJECTED_RISK_SPAN, 2),
    };
  }
  return {
    approved: true,
    reason: "Risk within acceptable bounds.",
    riskScore: round(Math.random() * APPROVED_RISK_SPAN, 2),
  };
}

// open_order({ pair, direction, lots }, state) ->
//   { orderId, status: "filled", pair, direction, lots, entryPrice, timestamp } | { error }
export function openOrder(
  input: { pair?: unknown; direction?: unknown; lots?: unknown },
  state: SessionState,
): Record<string, unknown> {
  const pair = input.pair;
  if (!isSupported(pair)) {
    return { error: `Unknown pair: ${String(pair)}` };
  }
  const decimals = decimalsFor(pair);
  const base = BASE_PRICES[pair];
  const jitter = (Math.random() - 0.5) * 2 * PRICE_JITTER;
  const entryPrice = round(base * (1 + jitter), decimals);
  const direction: "long" | "short" = input.direction === "short" ? "short" : "long";
  const lots = typeof input.lots === "number" ? input.lots : DEFAULT_LOT;
  const openedAt = new Date().toISOString();
  const position: Position = {
    orderId: "ord_" + randomHex(4),
    pair,
    direction,
    lots,
    entryPrice,
    openedAt,
  };
  state.positions.push(position);
  return {
    orderId: position.orderId,
    status: "filled",
    pair,
    direction,
    lots,
    entryPrice,
    timestamp: openedAt,
  };
}

// get_positions({}, state) -> { positions: Array<{ orderId, pair, direction, lots, entryPrice, currentPrice, pnl }> }
export function getPositions(state: SessionState): Record<string, unknown> {
  const positions = state.positions.map((p) => {
    const decimals = decimalsFor(p.pair);
    const base = BASE_PRICES[p.pair];
    const currentPrice = round(
      base * (1 + (Math.random() - 0.5) * 2 * POSITION_PRICE_JITTER),
      decimals,
    );
    const sign = p.direction === "long" ? 1 : -1;
    const pnl = round(sign * (currentPrice - p.entryPrice) * p.lots * 100000, 2);
    return {
      orderId: p.orderId,
      pair: p.pair,
      direction: p.direction,
      lots: p.lots,
      entryPrice: p.entryPrice,
      currentPrice,
      pnl,
    };
  });
  return { positions };
}

// close_all_positions({}, state) -> { closed: <count> }
export function closeAllPositions(state: SessionState): Record<string, unknown> {
  const closed = state.positions.length;
  state.positions = [];
  return { closed };
}

// close_position({ orderId }, state) ->
//   { closed: 1, orderId } | { error: "No open position with id <orderId>" }
export function closePosition(
  input: { orderId?: unknown },
  state: SessionState,
): Record<string, unknown> {
  const orderId = typeof input.orderId === "string" ? input.orderId : "";
  const idx = state.positions.findIndex((p) => p.orderId === orderId);
  if (idx === -1) {
    return { error: `No open position with id ${orderId}` };
  }
  state.positions.splice(idx, 1);
  return { closed: 1, orderId };
}

// Dispatcher. Unknown tool name -> { error: "Unknown tool: <name>" }.
export function executeTool(
  name: string,
  input: Record<string, unknown>,
  state: SessionState,
): Record<string, unknown> {
  switch (name) {
    case "get_price":
      return getPrice(input);
    case "risk_check":
      return riskCheck(input);
    case "open_order":
      return openOrder(input, state);
    case "get_positions":
      return getPositions(state);
    case "close_all_positions":
      return closeAllPositions(state);
    case "close_position":
      return closePosition(input, state);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
