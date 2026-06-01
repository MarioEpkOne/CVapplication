"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";

export function AnalyticsPing() {
  const pathname = usePathname();
  const trackMutation = trpc.analytics.track.useMutation();
  // Ref to track which paths have already been tracked in this session
  // Prevents React 19 StrictMode double-mount from double-counting in dev
  const trackedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (trackedPaths.current.has(pathname)) return;
    trackedPaths.current.add(pathname);

    // Fire-and-forget — errors are swallowed in the mutation and router
    trackMutation.mutate({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
  }, [pathname]); // trackMutation is stable (useMutation); intentional dep list

  // Renders nothing — defensive no-print wrapper
  return <span className="no-print" aria-hidden />;
}
