import Groq from "groq-sdk";
import { BIO_FACTS } from "@shared/bio";
import type { AgentEvent } from "@shared/events";
import { checkRateLimit } from "./rate-limit";
import {
  type SessionStore,
  type SessionState,
  seedSessionState,
  getSessionStore,
} from "./session-store";

const MAX_OUTPUT_TOKENS = 512;
const PROMPT_MAX_CHARS = 500;
const MODEL = "llama-3.3-70b-versatile";

// System prompt: roast agent grounded in real bio facts. No tools.
const ROAST_SYSTEM_PROMPT = `You are Mario Alina's witty hype-agent on his
interactive CV. Answer questions about Mario in a SELF-DEPRECATING, funny way —
roast him affectionately — but every claim must be grounded in the facts below,
and the punchline should still make a hiring manager want to hire him. Keep it
to a few sentences. Detect the language of the user's question and answer in
that language (Czech or English). Never invent facts not present below; if asked
something you don't know, joke about not knowing rather than making it up.

FACTS:
${BIO_FACTS}`;

// Exported for test support — tests assert against PITCH_INSTRUCTION values.
export const PITCH_INSTRUCTION: Record<"cs" | "en", string> = {
  en: "In 2–3 funny, self-deprecating but ultimately convincing sentences, make the case for why we should hire you.",
  cs: "Ve 2–3 vtipných, sebeironických, ale nakonec přesvědčivých větách vysvětli, proč bychom tě měli najmout.",
};

// Exported for test support — tests assert against REASONING_FLAVOR values.
export const REASONING_FLAVOR: Record<"cs" | "en", string> = {
  en: "Consulting my inflated sense of self…",
  cs: "Radím se se svým nafouknutým egem…",
};

// awslambda is provided by the Lambda Node runtime at execution time.
declare const awslambda: {
  streamifyResponse: (
    handler: (
      event: LambdaUrlEvent,
      responseStream: NodeJS.WritableStream,
      context: unknown,
    ) => Promise<void>,
  ) => unknown;
};

interface LambdaUrlEvent {
  headers?: Record<string, string | undefined>;
  body?: string;
  isBase64Encoded?: boolean;
  requestContext?: { http?: { sourceIp?: string } };
}

// Minimal structural interface so the loop is testable without the real SDK.
export interface GroqLike {
  chat: {
    completions: {
      create(args: {
        model: string;
        messages: unknown[];
        tools?: unknown;
        max_tokens?: number;
        temperature?: number;
      }): Promise<GroqCompletion>;
    };
  };
}

// Keep GroqToolCall and tool_calls? field — harmless, unused, avoids churn.
interface GroqToolCall {
  id: string;
  function: { name: string; arguments: string };
}

interface GroqMessage {
  role: string;
  content?: string | null;
  tool_calls?: GroqToolCall[];
}

interface GroqCompletion {
  choices: Array<{ message: GroqMessage; finish_reason?: string }>;
}

export function isOriginAllowed(
  origin: string | undefined,
  allowed: string[],
  requireOrigin = false,
): boolean {
  // An absent origin (server-to-server, curl) is allowed only when not required.
  // A *present, non-matching* origin is always rejected.
  if (!origin) return !requireOrigin;
  return allowed.some((a) => a.toLowerCase() === origin.toLowerCase());
}

export function validatePrompt(
  prompt: unknown,
): { ok: true; prompt: string } | { ok: false; message: string } {
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return { ok: false, message: "Empty prompt" };
  }
  if (prompt.length > PROMPT_MAX_CHARS) {
    return { ok: false, message: "Prompt too long" };
  }
  return { ok: true, prompt };
}

const SESSION_ID_RE = /^[A-Za-z0-9-]{1,64}$/;
export function isValidSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === "string" && SESSION_ID_RE.test(sessionId);
}

export interface RunAgentOptions {
  mode: "chat" | "pitch";
  prompt?: string;
  locale?: "cs" | "en";
  origin?: string;
  groq: GroqLike;
  write: (e: AgentEvent) => void;
  allowedOrigins: string[];
  requireOrigin?: boolean;
  sessionId?: string;
  store: SessionStore;
}

// temperature: 0 makes structured responses overwhelmingly reliable.
// The defensive tool_use_failed retry is kept even with no tools passed —
// Groq may still emit a 400 with that code in rare stochastic cases (D13/E).
async function createCompletion(groq: GroqLike, messages: GroqMessage[]): Promise<GroqCompletion> {
  const args = {
    model: MODEL,
    messages,
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0,
  };
  try {
    return await groq.chat.completions.create(args);
  } catch (err) {
    const code = (err as { error?: { error?: { code?: string } } })?.error?.error?.code;
    if (code === "tool_use_failed") {
      return await groq.chat.completions.create(args);
    }
    throw err;
  }
}

// Core agent — single Groq completion, no tool-calling loop.
// chat mode: stateful (history in DynamoDB), requires a prompt.
// pitch mode: stateless one-shot "Why hire me?", ignores sessionId/history.
// Returns { forbidden: true } when origin gate fires; otherwise { forbidden: false }.
export async function runAgent(opts: RunAgentOptions): Promise<{ forbidden: boolean }> {
  const {
    mode,
    prompt,
    locale = "en",
    origin,
    groq,
    write,
    allowedOrigins,
    requireOrigin = false,
    sessionId,
    store,
  } = opts;

  if (!isOriginAllowed(origin, allowedOrigins, requireOrigin)) {
    return { forbidden: true };
  }

  // Build the model messages for the requested mode.
  let messages: GroqMessage[];
  let validPrompt = ""; // only set for chat (used for persistence)
  let canPersist = false;
  let persist: ((reply: string) => Promise<void>) | undefined;

  if (mode === "pitch") {
    // Stateless one-shot: ignore sessionId/history entirely (Edge Case).
    write({ type: "reasoning", delta: REASONING_FLAVOR[locale] });
    messages = [
      { role: "system", content: ROAST_SYSTEM_PROMPT },
      { role: "user", content: PITCH_INSTRUCTION[locale] },
    ];
  } else {
    // chat mode
    const valid = validatePrompt(prompt);
    if (!valid.ok) {
      write({ type: "error", message: valid.message });
      return { forbidden: false };
    }
    validPrompt = valid.prompt;

    // Load persisted history; on any load error fall back to empty (seeded) state.
    let state: SessionState;
    canPersist = isValidSessionId(sessionId);
    try {
      state = canPersist ? await store.load(sessionId as string) : seedSessionState();
    } catch {
      state = seedSessionState();
    }

    write({ type: "reasoning", delta: REASONING_FLAVOR.en });
    messages = [
      { role: "system", content: ROAST_SYSTEM_PROMPT },
      ...state.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: validPrompt },
    ];

    // Persist {user, assistant} turns after a successful completion.
    persist = async (reply: string) => {
      state.history.push({ role: "user", content: validPrompt });
      state.history.push({ role: "assistant", content: reply });
      if (canPersist) {
        try {
          await store.save(sessionId as string, state);
        } catch {
          // Best-effort: swallow write failures.
        }
      }
    };
  }

  let res: GroqCompletion;
  try {
    res = await createCompletion(groq, messages);
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      write({ type: "error", message: "Agent is busy, try again shortly" });
    } else {
      write({ type: "error", message: "The agent could not reach its model. Please try again." });
    }
    return { forbidden: false };
  }

  const answer =
    res.choices[0]?.message?.content?.trim() || "…I appear to be speechless. That's rare.";
  write({ type: "done", summary: answer });
  if (mode === "chat" && persist) await persist(answer);
  return { forbidden: false };
}

function send(stream: NodeJS.WritableStream, e: AgentEvent): void {
  stream.write(JSON.stringify(e) + "\n");
}

function parseBody(event: LambdaUrlEvent): unknown {
  if (!event.body) return undefined;
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf-8")
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// The Lambda invocation entrypoint, kept as a plain async function so the module
// can be imported by unit tests without the `awslambda` runtime global present.
async function streamHandler(
  event: LambdaUrlEvent,
  responseStream: NodeJS.WritableStream,
): Promise<void> {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const requireOrigin = process.env.REQUIRE_ORIGIN === "true";
  const origin =
    event.headers?.origin ??
    event.headers?.Origin ??
    (event.headers as Record<string, string>)?.ORIGIN;

  // Gate 1: origin. In prod (REQUIRE_ORIGIN=true) a missing origin is rejected.
  if (!isOriginAllowed(origin, allowedOrigins, requireOrigin)) {
    // 403 with no body; Function URL CORS handles preflight separately.
    responseStream.end();
    return;
  }

  // Gate 2: per-IP rate limit (best-effort, in-memory). Runs after the origin
  // gate and before any Groq construction/call so abuse never reaches the model.
  const ip = event.requestContext?.http?.sourceIp ?? "unknown";
  if (!checkRateLimit(ip)) {
    send(responseStream, { type: "error", message: "Rate limit exceeded — please wait a moment." });
    responseStream.end();
    return;
  }

  try {
    const parsed = parseBody(event);
    const rawMode = (parsed as { mode?: unknown })?.mode;
    const mode: "chat" | "pitch" = rawMode === "pitch" ? "pitch" : "chat";
    const prompt = (parsed as { prompt?: unknown })?.prompt;
    const rawLocale = (parsed as { locale?: unknown })?.locale;
    const locale: "cs" | "en" = rawLocale === "cs" ? "cs" : "en";
    const rawSessionId = (parsed as { sessionId?: unknown })?.sessionId;
    const sessionId = isValidSessionId(rawSessionId) ? rawSessionId : undefined;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }) as unknown as GroqLike;
    await runAgent({
      mode,
      prompt: prompt as string | undefined,
      locale,
      origin,
      groq,
      write: (e) => send(responseStream, e),
      allowedOrigins,
      requireOrigin,
      sessionId,
      store: getSessionStore(),
    });
  } catch {
    send(responseStream, { type: "error", message: "Agent failed" });
  } finally {
    responseStream.end();
  }
}

// `awslambda` is only defined inside the Lambda Node runtime. Guard the wrap so
// importing this module in a plain Node/test context does not throw.
// Note: @aws-sdk packages set globalThis.awslambda to an object stub at import time,
// so we must check specifically for the streamifyResponse function, not just existence.
export const handler =
  typeof awslambda !== "undefined" && typeof awslambda.streamifyResponse === "function"
    ? awslambda.streamifyResponse(streamHandler)
    : streamHandler;
