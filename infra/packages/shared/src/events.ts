// CANONICAL agent wire contract — imported by the Lambda handler.
// Frontend mirror lives at src/lib/agent-events.ts (must stay in sync).
export type AgentEvent =
  | { type: "reasoning"; delta: string }
  | { type: "tool_call"; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; name: string; output: Record<string, unknown>; durationMs: number }
  | { type: "done"; summary: string }
  | { type: "error"; message: string };
