"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Pull factor toward the cursor (0–1). Default 0.3. */
  strength?: number;
  "aria-label"?: string;
}

/**
 * A button/link with a subtle magnetic hover: the element eases toward the
 * cursor while hovered and springs back on leave. Renders an <a> when `href`
 * is provided, otherwise a <button>. Disabled under prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className,
  strength = 0.3,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  const handleMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const common = {
    ref: ref as never,
    className,
    onPointerMove: handleMove,
    onPointerLeave: handleLeave,
    style: { x: sx, y: sy },
    ...rest,
  };

  if (href) {
    return (
      <motion.a href={href} onClick={onClick} {...common}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type="button" onClick={onClick} {...common}>
      {children}
    </motion.button>
  );
}
