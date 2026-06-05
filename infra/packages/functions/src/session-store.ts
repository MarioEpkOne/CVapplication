// Session store for the Ask-the-Agent demo: persists a capped conversation
// history, keyed by a client-generated sessionId.
//
// Behind a small interface (SessionStore) so it is swappable (D8) and the agent
// loop can be unit-tested with an in-memory fake — no AWS needed in tests.
//
// Import-safety: the DynamoDB client is constructed lazily inside the factory,
// never at module top-level, so importing this module in a plain Node/test
// context (no AWS env) does not throw. Mirrors the awslambda guard in agent.ts.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const HISTORY_CAP = 8; // keep only the last N text turns (D3)
const TTL_SECONDS = 3600; // 1 hour auto-expiry (D1)

// History persisted as plain text turns only (no tool_calls / tool messages) so
// the Groq request stays valid after capping — no orphaned tool messages.
export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionState {
  history: HistoryMessage[];
}

export interface SessionStore {
  load(sessionId: string): Promise<SessionState>; // seeds a fresh state if absent
  save(sessionId: string, state: SessionState): Promise<void>;
}

// A brand-new session starts with empty conversation history.
export function seedSessionState(): SessionState {
  return { history: [] };
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
    this.map.set(sessionId, { history: capHistory(state.history) });
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
    if (!item || !Array.isArray(item.history)) {
      return seedSessionState();
    }
    return { history: item.history as HistoryMessage[] };
  }

  async save(sessionId: string, state: SessionState): Promise<void> {
    const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          sessionId,
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
