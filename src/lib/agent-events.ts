// Frontend mirror of the agent wire contract.
// CANONICAL SOURCE: infra/packages/shared/src/events.ts
// These types describe the NDJSON events the Lambda streams. The wire boundary
// is runtime (JSON over fetch), so the type is intentionally duplicated here to
// keep the Next.js build fully decoupled from infra/ (spec Constraint 5).
// If you change this union, change infra/packages/shared/src/events.ts to match.

import type { Locale } from "@/lib/locale";

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

export const PRESETS: Record<Locale, AgentPreset[]> = {
  en: [
    { label: "Why hire you?", prompt: "Why should we hire you?" },
    { label: "Biggest weakness?", prompt: "What's your biggest weakness?" },
    { label: "Roast yourself", prompt: "Roast yourself in one paragraph." },
    { label: "AI agents?", prompt: "What's your experience with AI agents?" },
    { label: "Backend?", prompt: "Tell me about your backend experience." },
  ],
  cs: [
    { label: "Proč tě najmout?", prompt: "Proč bychom tě měli najmout?" },
    { label: "Největší slabina?", prompt: "Jaká je tvoje největší slabina?" },
    { label: "Zesměšni se", prompt: "Zesměšni sám sebe v jednom odstavci." },
    { label: "AI agenti?", prompt: "Jaké máš zkušenosti s AI agenty?" },
    { label: "Backend?", prompt: "Řekni mi o svých backendových zkušenostech." },
  ],
};

export const PROMPT_MAX_CHARS = 500;
