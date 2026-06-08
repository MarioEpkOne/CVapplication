import { describe, it, expect, vi } from "vitest";
import { reserveRequest, recordTokens } from "../src/budget";
import type { DocClientLike } from "../src/session-store";

const TABLE = "TestTable";
const NOW = 1_700_000_000_000; // fixed timestamp for deterministic day-key

// Helper: build a fake DocClientLike whose send returns a custom value.
// budget.ts casts the send result with `as { Attributes?: ... }` because
// DocClientLike is typed for GetCommand (Item), not UpdateCommand (Attributes).
// Using `as unknown as DocClientLike` here mirrors that decoupling.
function fakeClient(sendImpl: (cmd: unknown) => Promise<unknown>): DocClientLike {
  return { send: vi.fn(sendImpl) } as unknown as DocClientLike;
}

describe("reserveRequest", () => {
  it("under both caps → allowed", async () => {
    const client = fakeClient(async () => ({ Attributes: { requests: 5, tokens: 100 } }));
    const result = await reserveRequest({
      client,
      tableName: TABLE,
      now: NOW,
      requestsPerDay: 800,
      tokensPerDay: 85000,
    });
    expect(result).toEqual({ allowed: true });
  });

  it("over request cap → reason 'requests'", async () => {
    const client = fakeClient(async () => ({ Attributes: { requests: 801, tokens: 0 } }));
    const result = await reserveRequest({
      client,
      tableName: TABLE,
      now: NOW,
      requestsPerDay: 800,
      tokensPerDay: 85000,
    });
    expect(result).toEqual({ allowed: false, reason: "requests" });
  });

  it("tokens counter >= cap → reason 'tokens'", async () => {
    // At exactly TOKENS_PER_DAY it is rejected (>=).
    const client = fakeClient(async () => ({ Attributes: { requests: 10, tokens: 85000 } }));
    const result = await reserveRequest({
      client,
      tableName: TABLE,
      now: NOW,
      requestsPerDay: 800,
      tokensPerDay: 85000,
    });
    expect(result).toEqual({ allowed: false, reason: "tokens" });
  });

  it("DynamoDB throw → fail open (allowed)", async () => {
    const client = fakeClient(async () => {
      throw new Error("DynamoDB unavailable");
    });
    const result = await reserveRequest({
      client,
      tableName: TABLE,
      now: NOW,
      requestsPerDay: 800,
      tokensPerDay: 85000,
    });
    expect(result).toEqual({ allowed: true });
  });
});

describe("recordTokens", () => {
  it("issues an ADD tokens update with correct key and value", async () => {
    const commands: unknown[] = [];
    const client = fakeClient(async (cmd: unknown) => {
      commands.push(cmd);
      return {};
    });
    await recordTokens({ client, tableName: TABLE, now: NOW }, 1234);

    expect(commands).toHaveLength(1);
    const cmd = commands[0] as {
      input: {
        Key: { sessionId: string };
        ExpressionAttributeValues: Record<string, unknown>;
      };
    };
    // The day key must start with __budget__ and match the fixed now date.
    const expectedKey = "__budget__" + new Date(NOW).toISOString().slice(0, 10);
    expect(cmd.input.Key.sessionId).toBe(expectedKey);
    expect(cmd.input.ExpressionAttributeValues[":used"]).toBe(1234);
  });

  it("recordTokens swallows write errors", async () => {
    const client = fakeClient(async () => {
      throw new Error("write failed");
    });
    // Must resolve without throwing.
    await expect(
      recordTokens({ client, tableName: TABLE, now: NOW }, 100),
    ).resolves.toBeUndefined();
  });
});
