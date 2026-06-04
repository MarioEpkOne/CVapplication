import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSessionId } from "@/lib/session-id";

function makeLocalStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } as Storage;
}

describe("getSessionId", () => {
  beforeEach(() => {
    // Provide a window + localStorage + crypto for the node test env.
    let n = 0;
    vi.stubGlobal("window", { localStorage: makeLocalStorage() });
    vi.stubGlobal("crypto", { randomUUID: () => `uuid-${++n}` });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("generates and persists an id on first call", () => {
    const id = getSessionId();
    expect(id).toBe("uuid-1");
    expect(
      (globalThis as unknown as { window: Window }).window.localStorage.getItem("agent-session-id"),
    ).toBe("uuid-1");
  });

  it("returns the same id on subsequent calls (does not regenerate)", () => {
    const first = getSessionId();
    const second = getSessionId();
    expect(second).toBe(first);
    expect(second).toBe("uuid-1");
  });
});
