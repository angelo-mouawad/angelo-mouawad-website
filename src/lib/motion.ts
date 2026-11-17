import type { Transition, Variants } from "motion/react";

/** Shared motion language for everything beyond the room. */
export const EASE = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  soft: [0.33, 1, 0.68, 1],
} as const;

export const DURATION = { fast: 0.18, base: 0.42, slow: 0.9, page: 1.1 } as const;

export const SPRING: Transition = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 };

/** Fires a little before the element is fully in view, and only once. */
export const IN_VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE.out } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base, ease: EASE.soft } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.slow, ease: EASE.out } },
};

/** A line of text rising out of a clipped box. */
export const lineUp: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: DURATION.slow, ease: EASE.out } },
};

export function stagger(gap = 0.08, delay = 0): Variants {
  return { hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } };
}
