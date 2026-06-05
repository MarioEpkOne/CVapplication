"use client";

import { useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

interface TiltResult {
  ref: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
}

/**
 * Mouse-tilt / parallax for the hero portrait.
 * Returns spring-smoothed rotateX/rotateY motion values plus pointer handlers.
 * No-ops (returns zeroed values, ignores pointer) when the user prefers reduced motion.
 *
 * @param strength max tilt in degrees at the edges (e.g. 9)
 */
export function useTilt(strength = 9): TiltResult {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 150, damping: 18, mass: 0.4 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 18, mass: 0.4 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * strength);
    rx.set(-py * strength);
  };

  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return { ref, rotateX, rotateY, onPointerMove, onPointerLeave };
}
