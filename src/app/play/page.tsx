import type { Metadata } from "next";
import Image from "next/image";
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

      {/* Off-duty: the original "campaign" portrait lives here as a wink. */}
      <figure className="no-print mt-16 flex flex-col items-center gap-3 border-t border-brand-200 pt-10 dark:border-brand-800">
        <Image
          src="/ai-photo.jpg"
          alt="Make AI Great Again — campaign portrait, very serious"
          width={260}
          height={198}
          className="rounded-2xl border border-brand-200 shadow-lg grayscale transition duration-500 hover:grayscale-0 dark:border-slate-700"
        />
        <figcaption className="text-center text-xs text-slate-500 dark:text-slate-400">
          Off the clock, running on a single-issue platform: making AI great again.
        </figcaption>
      </figure>
    </div>
  );
}
