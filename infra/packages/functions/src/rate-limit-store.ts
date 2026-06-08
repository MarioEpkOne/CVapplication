// Layer-2 authoritative per-IP rate limiter for the Ask-the-Agent Lambda (D2/D3).
//
// Complements the in-memory Layer-1 limiter (./rate-limit.ts): the in-memory
// layer cheaply rejects an obvious hot loop within a warm container; this layer
// makes "10/min/IP" actually hold across cold starts and containers by using an
// atomic DynamoDB counter in the existing AgentSessions table.
//
// Import-safety: the DynamoDB client is constructed lazily inside the factory,
// never at module top-level (mirrors getSessionStore()).
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const RL_WINDOW_MS = 60_000; // D2: 60s fixed window
const RL_MAX = 10; // D2: 10 requests / window / IP
const RL_TTL_SECONDS = 120; // > one window, so old rows self-clean via TTL

export interface RateLimitStore {
  // Returns true if allowed (and records the hit); false if over the limit.
  check(ipHash: string, now: number): Promise<boolean>;
}

// Minimal structural type for the document client so the store is unit-testable
// with an injected fake. UpdateItem returns Attributes (UPDATED_NEW).
export interface DocClientLike {
  send(command: unknown): Promise<{ Attributes?: Record<string, unknown> }>;
}

// Fixed-window bucket: window id = floor(now / RL_WINDOW_MS). Atomic ADD avoids
// read-modify-write races (D3). expiresAt gives TTL auto-cleanup (E4).
export class DynamoRateLimitStore implements RateLimitStore {
  constructor(
    private client: DocClientLike,
    private tableName: string,
  ) {}

  async check(ipHash: string, now: number): Promise<boolean> {
    const windowId = Math.floor(now / RL_WINDOW_MS);
    const key = `rl#${ipHash}#${windowId}`;
    const expiresAt = Math.floor(now / 1000) + RL_TTL_SECONDS;
    const res = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { sessionId: key },
        UpdateExpression: "ADD #c :one SET expiresAt = if_not_exists(expiresAt, :exp)",
        ExpressionAttributeNames: { "#c": "count" },
        ExpressionAttributeValues: { ":one": 1, ":exp": expiresAt },
        ReturnValues: "UPDATED_NEW",
      }),
    );
    const count = Number((res.Attributes as { count?: number })?.count ?? 0);
    return count <= RL_MAX;
  }
}

// Lazy factory: constructs the real DynamoDB document client on first use only.
// Never instantiated at module top-level, so the module is import-safe in tests.
export function getRateLimitStore(): RateLimitStore {
  const tableName = process.env.SESSIONS_TABLE ?? "";
  const base = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(base);
  return new DynamoRateLimitStore(doc as unknown as DocClientLike, tableName);
}
