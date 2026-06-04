import { describe, it, expect } from "vitest";
import {
  getPrice,
  riskCheck,
  openOrder,
  getPositions,
  closeAllPositions,
  closePosition,
} from "../src/tools";
import { seedSessionState, type SessionState } from "../src/session-store";
import { SUPPORTED_PAIRS } from "@shared/tool-defs";

describe("mock forex tools", () => {
  it("get_price returns valid bid/ask/spread for each supported pair", () => {
    for (const pair of SUPPORTED_PAIRS) {
      const out = getPrice({ pair });
      expect(out.error).toBeUndefined();
      expect(typeof out.bid).toBe("number");
      expect(typeof out.ask).toBe("number");
      expect(typeof out.spread).toBe("number");
      expect(typeof out.timestamp).toBe("string");
      expect(out.ask as number).toBeGreaterThan(out.bid as number);
      // spread ≈ ask - bid (allow tiny rounding tolerance)
      expect(
        Math.abs((out.spread as number) - ((out.ask as number) - (out.bid as number))),
      ).toBeLessThan(1e-6);
    }
  });

  it("get_price with unsupported pair returns an error object", () => {
    const out = getPrice({ pair: "XYZ/ABC" });
    expect(typeof out.error).toBe("string");
    expect(out.error as string).toContain("Unknown pair");
  });

  it("risk_check returns approved boolean with valid schema", () => {
    const out = riskCheck({ pair: "EUR/USD", direction: "long", lots: 0.1 });
    expect(typeof out.approved).toBe("boolean");
    expect(typeof out.reason).toBe("string");
    expect(typeof out.riskScore).toBe("number");
    expect(out.riskScore as number).toBeGreaterThanOrEqual(0);
    expect(out.riskScore as number).toBeLessThanOrEqual(1);
  });

  it("risk_check rejection rate is approximately 20% over a large sample", () => {
    const N = 1000;
    let rejected = 0;
    for (let i = 0; i < N; i++) {
      const out = riskCheck({ pair: "EUR/USD", direction: "long", lots: 0.1 });
      if (out.approved === false) rejected++;
    }
    const fraction = rejected / N;
    // Spec threshold is Math.random() < 0.2. Assert within ±8 percentage points.
    expect(fraction).toBeGreaterThanOrEqual(0.12);
    expect(fraction).toBeLessThanOrEqual(0.28);
  });

  it("open_order returns a valid filled order and persists the position", () => {
    const state: SessionState = { positions: [], history: [] };
    const out = openOrder({ pair: "GBP/USD", direction: "short", lots: 0.5 }, state);
    expect(out.status).toBe("filled");
    expect(typeof out.orderId).toBe("string");
    expect((out.orderId as string).length).toBeGreaterThan(0);
    expect(typeof out.entryPrice).toBe("number");
    expect(out.pair).toBe("GBP/USD");
    expect(out.direction).toBe("short");
    expect(out.lots).toBe(0.5);
    // Persisted to the passed state with the same orderId.
    expect(state.positions).toHaveLength(1);
    expect(state.positions[0].orderId).toBe(out.orderId);
  });

  it("get_positions returns persisted positions with orderId and computed currentPrice/pnl", () => {
    const state = seedSessionState();
    const out = getPositions(state);
    const positions = out.positions as Array<Record<string, unknown>>;
    expect(Array.isArray(positions)).toBe(true);
    expect(positions).toHaveLength(2);
    for (const pos of positions) {
      expect(typeof pos.orderId).toBe("string");
      expect(typeof pos.pair).toBe("string");
      expect(typeof pos.direction).toBe("string");
      expect(typeof pos.lots).toBe("number");
      expect(typeof pos.entryPrice).toBe("number");
      expect(typeof pos.currentPrice).toBe("number");
      expect(typeof pos.pnl).toBe("number");
    }
  });

  it("get_positions on an empty state returns an empty list", () => {
    const out = getPositions({ positions: [], history: [] });
    expect(out.positions).toEqual([]);
  });

  it("close_all_positions empties positions and returns the count closed", () => {
    const state = seedSessionState();
    const out = closeAllPositions(state);
    expect(out).toEqual({ closed: 2 });
    expect(state.positions).toEqual([]);
  });

  it("close_all_positions with no open positions returns { closed: 0 }", () => {
    const state: SessionState = { positions: [], history: [] };
    expect(closeAllPositions(state)).toEqual({ closed: 0 });
  });

  it("close_position removes the matching orderId", () => {
    const state = seedSessionState();
    const target = state.positions[0].orderId;
    const out = closePosition({ orderId: target }, state);
    expect(out).toEqual({ closed: 1, orderId: target });
    expect(state.positions.some((p) => p.orderId === target)).toBe(false);
    expect(state.positions).toHaveLength(1);
  });

  it("close_position with an unknown orderId returns an error", () => {
    const state = seedSessionState();
    const out = closePosition({ orderId: "ord_doesnotexist" }, state);
    expect(typeof out.error).toBe("string");
    expect(out.error as string).toContain("No open position with id ord_doesnotexist");
  });

  it("seedSessionState produces exactly 2 positions, each with an orderId", () => {
    const state = seedSessionState();
    expect(state.positions).toHaveLength(2);
    for (const p of state.positions) {
      expect(typeof p.orderId).toBe("string");
      expect(p.orderId.length).toBeGreaterThan(0);
    }
    expect(state.positions[0].pair).toBe("EUR/USD");
    expect(state.positions[1].pair).toBe("USD/JPY");
  });
});
