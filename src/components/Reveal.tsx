"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}

export function Reveal({ children, delay = 0, as: Tag = "div", className }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    // When prefers-reduced-motion is set, render children fully visible with no animation
    // Content remains fully visible and usable — no transition needed
    const StaticTag = Tag as ElementType;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
