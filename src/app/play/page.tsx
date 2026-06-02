import type { Metadata } from "next";
import { AgentWidget } from "@/components/play/AgentWidget";

export const metadata: Metadata = {
  title: "Ask the Agent — Serverless Forex Demo",
  description:
    "A live serverless AI agent: type a Forex instruction and watch a bounded Groq Llama tool-calling loop run on AWS Lambda, streaming its reasoning and tool calls.",
};

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-brand-900 dark:text-brand-100">Ask the Agent</h1>
      <p className="mb-6 text-sm text-brand-600 dark:text-brand-400">
        Type a Forex instruction. It runs a bounded tool-calling agent loop on AWS Lambda (Groq
        Llama 3.3 70B) over mock Forex tools — no real trading. Watch the live trace below.
      </p>
      <AgentWidget />
    </div>
  );
}
