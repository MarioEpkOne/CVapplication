"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { AgentEvent } from "@/lib/agent-events";

interface TraceTimelineProps {
  events: AgentEvent[];
  mockMode: boolean;
}

function pretty(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}

export function TraceTimeline({ events, mockMode }: TraceTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom as new events arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "relative max-h-[28rem] min-h-[12rem] overflow-y-auto rounded-lg bg-[#07141b] p-4 font-mono text-xs leading-relaxed text-brand-100 shadow-inner ring-1 ring-brand-800 sm:max-h-[36rem]",
        mockMode && "ring-amber-400/40",
      )}
      aria-live="polite"
    >
      {mockMode && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/40">
          mock mode
        </span>
      )}

      {events.length === 0 && <p className="text-brand-400">Awaiting instructions&hellip;</p>}

      <ol className="space-y-2">
        {events.map((event, i) => {
          switch (event.type) {
            case "reasoning":
              return (
                <li key={i} className="whitespace-pre-wrap text-brand-100">
                  <span aria-hidden>🧠</span> {event.delta}
                </li>
              );
            case "tool_call":
              return (
                <li key={i} className="border-l-2 border-brand-400 pl-2 text-brand-200">
                  <span aria-hidden>🔧</span>{" "}
                  <span className="font-semibold text-brand-300">{event.name}</span>
                  <pre className="mt-1 whitespace-pre-wrap text-brand-400">
                    {pretty(event.input)}
                  </pre>
                </li>
              );
            case "tool_result":
              return (
                <li key={i} className="pl-4 text-brand-200">
                  <span className="mb-1 inline-block rounded bg-brand-800 px-1.5 py-0.5 text-[10px] text-brand-300">
                    {event.name} · {event.durationMs}ms
                  </span>
                  <pre className="whitespace-pre-wrap text-brand-300">{pretty(event.output)}</pre>
                </li>
              );
            case "done":
              return (
                <li key={i} className="whitespace-pre-wrap font-semibold text-green-400">
                  <span aria-hidden>✅</span> {event.summary}
                </li>
              );
            case "error":
              return (
                <li key={i} className="whitespace-pre-wrap font-semibold text-red-400">
                  <span aria-hidden>❌</span> {event.message}
                </li>
              );
            default:
              return null;
          }
        })}
      </ol>
    </div>
  );
}
