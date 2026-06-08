"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * True only on fine-pointer, hover-capable devices that do not prefer reduced motion.
 *
 * SSR / first paint returns false → hero effects start disabled (the safe default),
 * so the server-rendered markup matches the client's first render (no hydration
 * mismatch). After mount, a fine pointer + hover capability re-enables effects, and a
 * matchMedia `change` listener keeps it live (e.g. a 2-in-1 with a mouse plugged in).
 */
export function useInteractiveMotion(): boolean {
  const reduce = useReducedMotion(); // boolean | null
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return fine && !reduce;
}
