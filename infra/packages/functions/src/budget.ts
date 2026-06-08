import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { DocClientLike } from "./session-store";

const BUDGET_TTL_SECONDS = 48 * 3600;

export interface BudgetDeps {
  client: DocClientLike;
  tableName: string;
  now?: number;
  requestsPerDay?: number; // default from REQUESTS_PER_DAY env or 800
  tokensPerDay?: number; // default from TOKENS_PER_DAY env or 85000
}

export interface BudgetCheck {
  allowed: boolean;
  reason?: "requests" | "tokens";
}

// Parses an env variable as a finite integer, falling back to the default on
// NaN, empty string, or unset. Guards against Number("") === 0 (falsy but valid).
function envNum(v: string | undefined, d: number): number {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v !== "" ? n : d;
}

/**
 * Reserves a request slot in the daily budget counter.
 * Issues an atomic ADD on the per-UTC-day item; reads back the updated counts
 * and rejects if either cap is exceeded. Fail-open: any DynamoDB error returns
 * { allowed: true } so a table outage never blocks the agent.
 */
export async function reserveRequest(deps: BudgetDeps): Promise<BudgetCheck> {
  const now = deps.now ?? Date.now();
  const reqCap = deps.requestsPerDay ?? envNum(process.env.REQUESTS_PER_DAY, 800);
  const tokCap = deps.tokensPerDay ?? envNum(process.env.TOKENS_PER_DAY, 85000);

  const dayKey = "__budget__" + new Date(now).toISOString().slice(0, 10);
  const expiresAt = Math.floor(now / 1000) + BUDGET_TTL_SECONDS;

  try {
    const cmd = new UpdateCommand({
      TableName: deps.tableName,
      Key: { sessionId: dayKey },
      UpdateExpression: "ADD requests :one SET expiresAt = if_not_exists(expiresAt, :ttl)",
      ExpressionAttributeValues: {
        ":one": 1,
        ":ttl": expiresAt,
      },
      ReturnValues: "ALL_NEW",
    });

    const res = (await deps.client.send(cmd)) as { Attributes?: Record<string, unknown> };
    const attrs = res.Attributes ?? {};
    const requests = (attrs.requests as number) ?? 0;
    const tokens = (attrs.tokens as number) ?? 0;

    if (requests > reqCap) {
      return { allowed: false, reason: "requests" };
    }
    if (tokens >= tokCap) {
      return { allowed: false, reason: "tokens" };
    }
    return { allowed: true };
  } catch {
    // Fail open: DynamoDB error never blocks the agent.
    return { allowed: true };
  }
}

/**
 * Records actual token usage after a successful Groq completion.
 * Best-effort: swallows all errors.
 */
export async function recordTokens(deps: BudgetDeps, used: number): Promise<void> {
  const now = deps.now ?? Date.now();
  const dayKey = "__budget__" + new Date(now).toISOString().slice(0, 10);
  const expiresAt = Math.floor(now / 1000) + BUDGET_TTL_SECONDS;

  try {
    const cmd = new UpdateCommand({
      TableName: deps.tableName,
      Key: { sessionId: dayKey },
      UpdateExpression: "ADD tokens :used SET expiresAt = if_not_exists(expiresAt, :ttl)",
      ExpressionAttributeValues: {
        ":used": used,
        ":ttl": expiresAt,
      },
    });
    await deps.client.send(cmd);
  } catch {
    // Best-effort: swallow write failures.
  }
}

/**
 * Lazy factory: builds the real DynamoDB document client on demand.
 * Never called at module top-level so the module is import-safe in tests.
 */
export function getBudgetDeps(now?: number): BudgetDeps {
  const tableName = process.env.SESSIONS_TABLE ?? "";
  const base = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(base);
  return {
    client: doc as unknown as DocClientLike,
    tableName,
    now,
  };
}
