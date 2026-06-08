"use client";

import { useRef } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { useInteractiveMotion } from "./useInteractiveMotion";

interface TiltResult {
  ref: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  /** True only when tilt should be applied (fine pointer, hover, motion allowed). */
  enabled: boolean;
}

/**
 * Mouse-tilt / parallax for the hero portrait.
 * Returns spring-smoothed rotateX/rotateY motion values plus pointer handlers.
 * No-ops (zeroed values, ignores pointer) on touch / coarse-pointer devices and
 * under prefers-reduced-motion. The returned `enabled` flag tells the consumer
 * whether to apply the 3D tilt style.
 *
 * @param strength max tilt in degrees at the edges (e.g. 9)
 */
export function useTilt(strength = 9): TiltResult {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useInteractiveMotion();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 150, damping: 18, mass: 0.4 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 18, mass: 0.4 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current) return;
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

  return { ref, rotateX, rotateY, onPointerMove, onPointerLeave, enabled };
}
