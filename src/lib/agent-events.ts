// Frontend mirror of the agent wire contract.
// CANONICAL SOURCE: infra/packages/shared/src/events.ts
// These types describe the NDJSON events the Lambda streams. The wire boundary
// is runtime (JSON over fetch), so the type is intentionally duplicated here to
// keep the Next.js build fully decoupled from infra/ (spec Constraint 5).
// If you change this union, change infra/packages/shared/src/events.ts to match.

export type AgentEvent =
  | { type: "reasoning"; delta: string }
  | { type: "tool_call"; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; name: string; output: Record<string, unknown>; durationMs: number }
  | { type: "done"; summary: string }
  | { type: "error"; message: string };

export interface AgentPreset {
  label: string;
  prompt: string;
}

export const PRESETS: AgentPreset[] = [
  { label: "Check EUR/USD price", prompt: "Check the current EUR/USD price" },
  { label: "Open a EUR/USD long", prompt: "Open a small EUR/USD long position for me" },
  { label: "My positions", prompt: "What are my current positions?" },
  { label: "Buy GBP/USD safely", prompt: "Buy GBP/USD but check risk first" },
  { label: "How do I open a position?", prompt: "How do I open a position?" },
];

export const PROMPT_MAX_CHARS = 500;
