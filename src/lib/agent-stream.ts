import type { AgentEvent } from "@/lib/agent-events";

export interface StreamAgentOptions {
  url: string;
  mode: "chat" | "pitch";
  prompt?: string;
  sessionId?: string;
  locale?: "cs" | "en";
  signal?: AbortSignal;
}

// Pure helper: given an accumulated buffer + a new chunk, return the complete
// parsed events and the leftover partial line. Malformed JSON lines are skipped
// (no throw) per the spec's "handles malformed JSON gracefully" edge case.
export function parseNdjsonChunk(
  buffer: string,
  chunk: string,
): { events: AgentEvent[]; rest: string } {
  const combined = buffer + chunk;
  const parts = combined.split("\n");
  const rest = parts.pop() ?? "";
  const events: AgentEvent[] = [];
  for (const line of parts) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed) as AgentEvent);
    } catch {
      // Skip malformed line.
    }
  }
  return { events, rest };
}

export async function* streamAgent(opts: StreamAgentOptions): AsyncGenerator<AgentEvent> {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: opts.mode,
      prompt: opts.prompt,
      sessionId: opts.sessionId,
      locale: opts.locale,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Agent request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const { events, rest } = parseNdjsonChunk(buffer, chunk);
    buffer = rest;
    for (const e of events) {
      yield e;
    }
  }

  // Flush any complete trailing line left in the buffer.
  const trimmed = buffer.trim();
  if (trimmed) {
    try {
      yield JSON.parse(trimmed) as AgentEvent;
    } catch {
      // Ignore a malformed trailing fragment.
    }
  }
}
