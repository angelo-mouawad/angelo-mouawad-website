"use client";

import { type MotionValue, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import type { RefObject } from "react";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Scroll progress of an element as a plain motion value.
 * Motion hands opacity driven straight from useScroll to the browser's scroll timeline,
 * which miscalculates inside sticky sections. Copying the number over keeps every
 * property on the same clock.
 */
export function useElementProgress(target: RefObject<HTMLElement | null>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target, offset });
  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => progress.set(value));
  return progress;
}

/**
 * Progress of a tall section as it scrolls past, 0 when its top meets the top of the
 * viewport and 1 when its bottom meets the bottom. Also mirrors the value onto the
 * shared scroll bus so the 3D layer can follow along.
 */
export function useSectionProgress(target: RefObject<HTMLElement | null>, bus: MotionValue<number>) {
  const progress = useElementProgress(target, ["start start", "end end"]);
  useMotionValueEvent(progress, "change", (value) => bus.set(value));
  return progress;
}

/** Stable pseudo random number in [-1, 1] for an index, so scattered layouts match on every render. */
export function scatter(index: number, salt = 1) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}
