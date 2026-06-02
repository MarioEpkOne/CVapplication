import { describe, it, expect } from "vitest";
import { getPrice, riskCheck, openOrder, getPositions } from "../src/tools";
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

  it("open_order returns a valid filled order object", () => {
    const out = openOrder({ pair: "GBP/USD", direction: "short", lots: 0.5 });
    expect(out.status).toBe("filled");
    expect(typeof out.orderId).toBe("string");
    expect((out.orderId as string).length).toBeGreaterThan(0);
    expect(typeof out.entryPrice).toBe("number");
    expect(out.pair).toBe("GBP/USD");
    expect(out.direction).toBe("short");
    expect(out.lots).toBe(0.5);
  });

  it("get_positions returns 1-3 positions with valid schema", () => {
    for (let i = 0; i < 20; i++) {
      const out = getPositions();
      const positions = out.positions as Array<Record<string, unknown>>;
      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBeGreaterThanOrEqual(1);
      expect(positions.length).toBeLessThanOrEqual(3);
      for (const pos of positions) {
        expect(typeof pos.pair).toBe("string");
        expect(typeof pos.direction).toBe("string");
        expect(typeof pos.lots).toBe("number");
        expect(typeof pos.entryPrice).toBe("number");
        expect(typeof pos.currentPrice).toBe("number");
        expect(typeof pos.pnl).toBe("number");
      }
    }
  });
});
