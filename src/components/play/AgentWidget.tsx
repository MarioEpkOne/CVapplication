"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentEvent } from "@/lib/agent-events";
import { PROMPT_MAX_CHARS } from "@/lib/agent-events";
import { streamAgent } from "@/lib/agent-stream";
import { runMockAgent } from "@/components/play/MockAgent";
import { PromptInput } from "@/components/play/PromptInput";
import { TraceTimeline } from "@/components/play/TraceTimeline";

type Status = "idle" | "streaming" | "done" | "error";

const COLD_START_TIMEOUT_MS = 10_000;

export function AgentWidget({ agentUrl }: { agentUrl: string | null }) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream on unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const consume = useCallback(async (gen: AsyncGenerator<AgentEvent>) => {
    for await (const event of gen) {
      setEvents((prev) => [...prev, event]);
      if (event.type === "done") setStatus("done");
      else if (event.type === "error") setStatus("error");
    }
  }, []);

  const run = useCallback(
    async (raw: string) => {
      // Single-flight: ignore while a run is in progress.
      if (abortRef.current) return;

      const p = raw.slice(0, PROMPT_MAX_CHARS).trim();
      if (!p) return;

      const controller = new AbortController();
      abortRef.current = controller;
      // The fallback path allocates its own controller; track it so the outer
      // finally can clear whichever controller is currently the active one.
      let fallbackController: AbortController | null = null;
      setEvents([]);
      setStatus("streaming");

      // NEXT_PUBLIC_AGENT_MODE is a dev-only build-time toggle (.env.local).
      // The Lambda URL arrives as a prop so it can be read from the server at
      // runtime (see play/page.tsx) rather than inlined into the client bundle.
      const mode = process.env.NEXT_PUBLIC_AGENT_MODE;
      const url = agentUrl;

      try {
        if (mode === "mock" || !url) {
          setMockMode(true);
          await consume(runMockAgent({ prompt: p, signal: controller.signal }));
          return;
        }

        setMockMode(false);

        // Cold-start guard: if no first byte within the timeout, abort and fall back.
        let firstEventSeen = false;
        const coldStart = setTimeout(() => {
          if (!firstEventSeen) controller.abort();
        }, COLD_START_TIMEOUT_MS);

        try {
          const gen = streamAgent({ url, prompt: p, signal: controller.signal });
          for await (const event of gen) {
            firstEventSeen = true;
            clearTimeout(coldStart);
            setEvents((prev) => [...prev, event]);
            if (event.type === "done") setStatus("done");
            else if (event.type === "error") setStatus("error");
          }
        } catch {
          clearTimeout(coldStart);
          if (controller.signal.aborted && firstEventSeen) {
            // Genuine user/unmount abort after streaming started — do not fall back.
            return;
          }
          // Network error, non-2xx, DNS, 403, or cold-start timeout → silent mock fallback.
          // Do not reuse the (possibly aborted) cold-start controller's signal: a cold-start
          // timeout aborts it, which would make runMockAgent return zero events. Use a fresh
          // controller and re-store it so unmount/new-run can still cancel the fallback.
          fallbackController = new AbortController();
          abortRef.current = fallbackController;
          setMockMode(true);
          setEvents([]);
          setStatus("streaming");
          await consume(runMockAgent({ prompt: p, signal: fallbackController.signal }));
        } finally {
          clearTimeout(coldStart);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setStatus("error");
        }
      } finally {
        if (abortRef.current === controller || abortRef.current === fallbackController) {
          abortRef.current = null;
        }
      }
    },
    [consume, agentUrl],
  );

  const streaming = status === "streaming";

  return (
    <div className="space-y-4">
      <PromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={() => run(prompt)}
        onPreset={(p) => {
          setPrompt(p);
          run(p);
        }}
        disabled={streaming}
      />

      {streaming && events.length === 0 && (
        <p className="text-xs text-brand-500 dark:text-brand-400">Connecting…</p>
      )}

      <TraceTimeline events={events} mockMode={mockMode} />
    </div>
  );
}
