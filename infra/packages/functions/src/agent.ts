import Groq from "groq-sdk";
import { FOREX_TOOLS } from "@shared/tool-defs";
import type { AgentEvent } from "@shared/events";
import { executeTool } from "./tools";
import { checkRateLimit } from "./rate-limit";
import {
  type SessionStore,
  type SessionState,
  seedSessionState,
  getSessionStore,
} from "./session-store";

const MAX_ITERATIONS = 4;
const MAX_OUTPUT_TOKENS = 512;
const PROMPT_MAX_CHARS = 500;
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a Forex trading agent with tools to check prices, assess risk, open orders, view positions, and close positions. Positions persist for the user across messages.

Distinguish informational questions from instructions. If the user asks how something works or how to do it (e.g. "how do I open a position?"), explain the steps in plain text and OFFER to do it ("Shall I open a 0.1-lot EUR/USD long for you?") — but do NOT call any trading tool yet. Only call open_order / close_position / close_all_positions when the user gives a direct instruction or confirms a pending offer ("yes", "do it").

Before opening: always get_price, then risk_check; if risk is rejected, explain why and suggest an alternative. To close, use close_position (by orderId) or close_all_positions. Be concise.`;

const KNOWN_TOOLS = new Set([
  "get_price",
  "risk_check",
  "open_order",
  "get_positions",
  "close_all_positions",
  "close_position",
]);

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
  prompt: string;
  origin?: string;
  groq: GroqLike;
  write: (e: AgentEvent) => void;
  allowedOrigins: string[];
  requireOrigin?: boolean;
  sessionId?: string;
  store: SessionStore;
}

// Groq's Llama 3.3 70B intermittently emits tool calls in a malformed text
// syntax (`<function=name{...}>`) instead of structured tool_calls; Groq rejects
// these server-side with a 400 `tool_use_failed`. `temperature: 0` makes correct,
// structured tool calls overwhelmingly likely (measured 0/10 failures vs ~4/10 at
// the default temperature), and a single retry covers the residual stochastic case.
async function createCompletion(groq: GroqLike, messages: GroqMessage[]): Promise<GroqCompletion> {
  const args = {
    model: MODEL,
    messages,
    tools: FOREX_TOOLS,
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

// Core agent loop, factored out so it is testable without the Lambda runtime global.
// Returns 403 sentinel (false) when the origin is disallowed; otherwise true.
export async function runAgent(opts: RunAgentOptions): Promise<{ forbidden: boolean }> {
  const {
    prompt,
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

  const valid = validatePrompt(prompt);
  if (!valid.ok) {
    write({ type: "error", message: valid.message });
    return { forbidden: false };
  }

  // Load persisted session state. On any load error, fall back to a fresh seeded
  // ephemeral state and continue — persistence must never break the user request.
  let state: SessionState;
  const canPersist = isValidSessionId(sessionId);
  try {
    state = canPersist ? await store.load(sessionId as string) : seedSessionState();
  } catch {
    state = seedSessionState();
  }

  const validPrompt = valid.prompt;

  const messages: GroqMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...state.history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: validPrompt },
  ];

  let finalText = "";

  async function persist(reply: string): Promise<void> {
    state.history.push({ role: "user", content: validPrompt });
    state.history.push({ role: "assistant", content: reply });
    if (canPersist) {
      try {
        await store.save(sessionId as string, state);
      } catch {
        // Best-effort: swallow write failures (Edge Cases "DynamoDB write fails").
      }
    }
  }

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
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

    const choice = res.choices[0];
    const content = choice?.message?.content ?? "";
    if (content && content.trim().length > 0) {
      write({ type: "reasoning", delta: content });
    }

    const toolCalls = choice?.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      // Append the assistant message (with tool_calls) to the conversation.
      messages.push({
        role: "assistant",
        content: content || "",
        tool_calls: toolCalls,
      });

      for (const call of toolCalls) {
        const name = call.function.name;
        let input: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse(call.function.arguments || "{}");
          if (parsed && typeof parsed === "object") input = parsed as Record<string, unknown>;
        } catch {
          input = {};
        }

        if (!KNOWN_TOOLS.has(name)) {
          console.warn("Unknown tool requested (name omitted from log)");
          write({ type: "reasoning", delta: "I tried to use an unavailable tool." });
          messages.push({
            role: "tool",
            content: JSON.stringify({ error: `Unavailable tool: ${name}` }),
            // tool_call_id is required by the API; include it via a cast below.
          } as GroqMessage & { tool_call_id: string });
          (messages[messages.length - 1] as GroqMessage & { tool_call_id: string }).tool_call_id =
            call.id;
          continue;
        }

        write({ type: "tool_call", name, input });
        const t0 = Date.now();
        const output = executeTool(name, input, state);
        const durationMs = Date.now() - t0;
        write({ type: "tool_result", name, output, durationMs });

        messages.push({
          role: "tool",
          content: JSON.stringify(output),
        } as GroqMessage & { tool_call_id: string });
        (messages[messages.length - 1] as GroqMessage & { tool_call_id: string }).tool_call_id =
          call.id;
      }
      continue;
    }

    // No tool calls -> implicit or explicit stop.
    finalText = content || "Done.";
    write({ type: "done", summary: finalText });
    await persist(finalText);
    return { forbidden: false };
  }

  // Exhausted the iteration budget without a stop.
  finalText = "Reached maximum steps";
  write({ type: "done", summary: finalText });
  await persist(finalText);
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
    const prompt = (parsed as { prompt?: unknown })?.prompt;
    const rawSessionId = (parsed as { sessionId?: unknown })?.sessionId;
    const sessionId = isValidSessionId(rawSessionId) ? rawSessionId : undefined;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }) as unknown as GroqLike;
    await runAgent({
      prompt: prompt as string,
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
