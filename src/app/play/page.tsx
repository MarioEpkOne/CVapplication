import type { Metadata } from "next";
import { AgentWidget } from "@/components/play/AgentWidget";

export const metadata: Metadata = {
  title: "Ask the Agent — Serverless Forex Demo",
  description:
    "A live serverless AI agent: type a Forex instruction and watch a bounded Groq Llama tool-calling loop run on AWS Lambda, streaming its reasoning and tool calls.",
};

// Read the Lambda URL from the runtime environment on every request rather than
// inlining it into the client bundle at build time. A NEXT_PUBLIC_* name would be
// substituted by the bundler at build time (even here in a server component), so
// the URL uses a plain AGENT_URL var and the route is forced dynamic so the value
// is read at request time from the Fly runtime secret. Unset → widget runs mock mode.
export const dynamic = "force-dynamic";

export default function PlayPage() {
  const agentUrl = process.env.AGENT_URL ?? null;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-brand-900 dark:text-brand-100">Ask the Agent</h1>
      <p className="mb-6 text-sm text-brand-600 dark:text-brand-400">
        Type a Forex instruction. It runs a bounded tool-calling agent loop on AWS Lambda (Groq
        Llama 3.3 70B) over mock Forex tools — no real trading. Watch the live trace below.
      </p>
      <AgentWidget agentUrl={agentUrl} />
    </div>
  );
}
