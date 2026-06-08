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
  ipHash?: string;
}

export interface SessionStore {
  // D5: an optional ipHash binds the session to its creating IP. A load with a
  // non-matching ipHash returns a freshly seeded state (no cross-session leak).
  load(sessionId: string, ipHash?: string): Promise<SessionState>; // seeds a fresh state if absent
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
  async load(sessionId: string, ipHash?: string): Promise<SessionState> {
    const stored = this.map.get(sessionId);
    if (!stored) return seedSessionState();
    // D5/E5/E6: only reset when a stored ipHash is present AND differs from the
    // caller's. A stored row without ipHash (pre-binding) is returned as-is.
    if (typeof stored.ipHash === "string" && ipHash && stored.ipHash !== ipHash) {
      return seedSessionState();
    }
    return stored;
  }
  async save(sessionId: string, state: SessionState): Promise<void> {
    this.map.set(sessionId, {
      history: capHistory(state.history),
      ...(state.ipHash ? { ipHash: state.ipHash } : {}),
    });
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

  async load(sessionId: string, ipHash?: string): Promise<SessionState> {
    const res = await this.client.send(
      new GetCommand({ TableName: this.tableName, Key: { sessionId } }),
    );
    const item = res.Item;
    if (!item || !Array.isArray(item.history)) {
      return seedSessionState();
    }
    // D5: session is bound to its creating IP. A mismatched ticket gets a fresh
    // session (no leak). E5: a stored row WITHOUT ipHash (pre-binding) is
    // returned as-is — never mass-reset existing sessions on deploy. E6: when
    // the caller's ipHash is defined (even hash of "unknown"), binding applies.
    if (typeof item.ipHash === "string" && ipHash && item.ipHash !== ipHash) {
      return seedSessionState();
    }
    return {
      history: item.history as HistoryMessage[],
      ipHash: item.ipHash as string | undefined,
    };
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
          // D5: persist the creating IP's hash so load() can bind to it. Only
          // written when present (omitted for unbound/pitch paths).
          ...(state.ipHash ? { ipHash: state.ipHash } : {}),
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
