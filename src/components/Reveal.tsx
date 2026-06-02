"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import type { ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}

export function Reveal({ children, delay = 0, as: Tag = "div", className }: RevealProps) {
  const reducedMotion = useReducedMotion();

  // Build a motion-wrapped version of the requested tag so `as` is honored while
  // animating. Memoized so the component identity is stable across renders for a
  // given Tag (avoids remounts). Hooks run before the early return below to keep
  // hook order stable.
  const MotionTag = useMemo(() => motion.create(Tag), [Tag]);

  if (reducedMotion) {
    // When prefers-reduced-motion is set, render children fully visible with no animation.
    // Content remains fully visible and usable — no transition needed.
    const StaticTag = Tag as ElementType;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </MotionTag>
  );
}
