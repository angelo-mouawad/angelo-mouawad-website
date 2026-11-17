import type Lenis from "lenis";
import { motionValue } from "motion/react";

/**
 * Scroll state shared between the DOM and the two canvases on the home page.
 * These live outside React so a scroll never triggers a render.
 */
export const scroll = {
  /** 0 to 1 while the room's screen turns into light and the world rises into view. */
  dive: motionValue(0),
  /** 0 to 1 as the live world layer fades in over the monitor near the end of the room. */
  portal: motionValue(0),
  /** 0 to 1 across each pinned section of the world. */
  hero: motionValue(0),
  about: motionValue(0),
  projects: motionValue(0),
  contact: motionValue(0),
};

let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Smooth scroll to a position or element, falling back to the browser when Lenis is off. */
export function scrollTo(target: number | HTMLElement, options: { immediate?: boolean } = {}) {
  if (lenis) lenis.scrollTo(target, { immediate: options.immediate, duration: 1.6 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: options.immediate ? "auto" : "smooth" });
  else target.scrollIntoView({ behavior: options.immediate ? "auto" : "smooth" });
}
