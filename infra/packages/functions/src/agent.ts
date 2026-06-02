import Groq from "groq-sdk";
import { FOREX_TOOLS } from "@shared/tool-defs";
import type { AgentEvent } from "@shared/events";
import { executeTool } from "./tools";

const MAX_ITERATIONS = 4;
const MAX_OUTPUT_TOKENS = 512;
const PROMPT_MAX_CHARS = 500;
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a Forex trading agent. You have access to tools for checking prices, assessing risk, opening orders, and viewing positions. Use the tools to fulfill the user's request. Always check the price before trading. Always run a risk check before opening an order. If risk is rejected, explain why and suggest an alternative. Be concise.`;

const KNOWN_TOOLS = new Set(["get_price", "risk_check", "open_order", "get_positions"]);

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

export function isOriginAllowed(origin: string | undefined, allowed: string[]): boolean {
  // No origin header (e.g. server-to-server, curl) is allowed; only a *present,
  // non-matching* origin is rejected.
  if (!origin) return true;
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

export interface RunAgentOptions {
  prompt: string;
  origin?: string;
  groq: GroqLike;
  write: (e: AgentEvent) => void;
  allowedOrigins: string[];
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
  const { prompt, origin, groq, write, allowedOrigins } = opts;

  if (!isOriginAllowed(origin, allowedOrigins)) {
    return { forbidden: true };
  }

  const valid = validatePrompt(prompt);
  if (!valid.ok) {
    write({ type: "error", message: valid.message });
    return { forbidden: false };
  }

  const messages: GroqMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: valid.prompt },
  ];

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
          console.warn(`Unknown tool requested: ${name}`);
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
        const output = executeTool(name, input);
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
    write({ type: "done", summary: content || "Done." });
    return { forbidden: false };
  }

  // Exhausted the iteration budget without a stop.
  write({ type: "done", summary: "Reached maximum steps" });
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
  const origin =
    event.headers?.origin ??
    event.headers?.Origin ??
    (event.headers as Record<string, string>)?.ORIGIN;

  if (!isOriginAllowed(origin, allowedOrigins)) {
    // 403 with no body; Function URL CORS handles preflight separately.
    responseStream.end();
    return;
  }

  try {
    const parsed = parseBody(event);
    const prompt = (parsed as { prompt?: unknown })?.prompt;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }) as unknown as GroqLike;
    await runAgent({
      prompt: prompt as string,
      origin,
      groq,
      write: (e) => send(responseStream, e),
      allowedOrigins,
    });
  } catch {
    send(responseStream, { type: "error", message: "Agent failed" });
  } finally {
    responseStream.end();
  }
}

// `awslambda` is only defined inside the Lambda Node runtime. Guard the wrap so
// importing this module in a plain Node/test context does not throw.
export const handler =
  typeof awslambda !== "undefined" ? awslambda.streamifyResponse(streamHandler) : streamHandler;
