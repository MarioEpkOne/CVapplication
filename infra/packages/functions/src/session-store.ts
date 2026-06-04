// Session store for the Ask-the-Agent demo: persists open Forex positions +
// a capped conversation history, keyed by a client-generated sessionId.
//
// Behind a small interface (SessionStore) so it is swappable (D8) and the agent
// loop can be unit-tested with an in-memory fake — no AWS needed in tests.
//
// Import-safety: the DynamoDB client is constructed lazily inside the factory,
// never at module top-level, so importing this module in a plain Node/test
// context (no AWS env) does not throw. Mirrors the awslambda guard in agent.ts.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { ForexPair } from "@shared/tool-defs";

const HISTORY_CAP = 8; // keep only the last N text turns (D3)
const TTL_SECONDS = 3600; // 1 hour auto-expiry (D1)

export interface Position {
  orderId: string;
  pair: ForexPair;
  direction: "long" | "short";
  lots: number;
  entryPrice: number;
  openedAt: string; // ISO
}

// History persisted as plain text turns only (no tool_calls / tool messages) so
// the Groq request stays valid after capping — no orphaned tool messages.
export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionState {
  positions: Position[];
  history: HistoryMessage[];
}

export interface SessionStore {
  load(sessionId: string): Promise<SessionState>; // seeds a fresh state if absent
  save(sessionId: string, state: SessionState): Promise<void>;
}

function randomOrderId(): string {
  let out = "ord_";
  for (let i = 0; i < 4; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

// A brand-new session gets two demo positions so the page looks alive and
// "close all" / "my positions" have something to act on out of the box (D5).
export function seedSessionState(): SessionState {
  const now = new Date().toISOString();
  return {
    positions: [
      {
        orderId: randomOrderId(),
        pair: "EUR/USD",
        direction: "long",
        lots: 0.1,
        entryPrice: 1.085,
        openedAt: now,
      },
      {
        orderId: randomOrderId(),
        pair: "USD/JPY",
        direction: "short",
        lots: 0.3,
        entryPrice: 149.5,
        openedAt: now,
      },
    ],
    history: [],
  };
}

function capHistory(history: HistoryMessage[]): HistoryMessage[] {
  return history.slice(-HISTORY_CAP);
}

// In-memory fake for unit tests (and a degraded fallback if needed).
export class InMemorySessionStore implements SessionStore {
  private map = new Map<string, SessionState>();
  async load(sessionId: string): Promise<SessionState> {
    return this.map.get(sessionId) ?? seedSessionState();
  }
  async save(sessionId: string, state: SessionState): Promise<void> {
    this.map.set(sessionId, { positions: state.positions, history: capHistory(state.history) });
  }
}

// Minimal structural type for the DynamoDB document client so the store can be
// unit-tested with an injected fake (mock GetCommand / PutCommand send()).
export interface DocClientLike {
  send(command: unknown): Promise<{ Item?: Record<string, unknown> }>;
}

export class DynamoSessionStore implements SessionStore {
  constructor(
    private client: DocClientLike,
    private tableName: string,
  ) {}

  async load(sessionId: string): Promise<SessionState> {
    const res = await this.client.send(
      new GetCommand({ TableName: this.tableName, Key: { sessionId } }),
    );
    const item = res.Item;
    if (!item || !Array.isArray(item.positions)) {
      return seedSessionState();
    }
    return {
      positions: item.positions as Position[],
      history: Array.isArray(item.history) ? (item.history as HistoryMessage[]) : [],
    };
  }

  async save(sessionId: string, state: SessionState): Promise<void> {
    const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          sessionId,
          positions: state.positions,
          history: capHistory(state.history),
          expiresAt,
        },
      }),
    );
  }
}

// Lazy factory: constructs the real DynamoDB document client on first use only.
// Never instantiated at module top-level, so the module is import-safe in tests.
export function getSessionStore(): SessionStore {
  const tableName = process.env.SESSIONS_TABLE ?? "";
  const base = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(base);
  return new DynamoSessionStore(doc as unknown as DocClientLike, tableName);
}
