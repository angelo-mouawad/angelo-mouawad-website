"use client";

import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { DURATION, EASE, fadeUp, IN_VIEW, lineUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const LIGHT = "radial-gradient(circle at 50% 45%, #ffffff 0%, #eaf6ff 45%, #cfe9fb 100%)";

/** A soft edged hole in the light, sized by the --hole custom property. */
const hole = (origin: string) => `radial-gradient(circle at ${origin}, transparent var(--hole), #000 calc(var(--hole) + 25%))`;

/** Wrap a page of the bright world once. Makes every Motion animation honour reduced motion. */
export function WorldMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ delay = 0, className, children, ...props }: ComponentProps<typeof motion.div> & { delay?: number }) {
  return (
    <motion.div className={className} variants={fadeUp} initial="hidden" whileInView="show" viewport={IN_VIEW} transition={{ delay }} {...props}>
      {children}
    </motion.div>
  );
}

/** Reveals children one after another. Give each child the fadeUp variants, or use RevealItem. */
export function RevealGroup({ gap = 0.08, delay = 0, className, children, ...props }: ComponentProps<typeof motion.div> & { gap?: number; delay?: number }) {
  return (
    <motion.div className={className} variants={stagger(gap, delay)} initial="hidden" whileInView="show" viewport={IN_VIEW} {...props}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ className, children, ...props }: ComponentProps<typeof motion.div>) {
  return (
    <motion.div className={className} variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Headline that rises word by word out of a clipped line. Screen readers get the plain sentence.
 * Gradient text goes on wordClassName: a clipped background on the parent does not survive the moving words.
 */
export function RevealText({ text, className, wordClassName, delay = 0 }: { text: string; className?: string; wordClassName?: string; delay?: number }) {
  return (
    <motion.span className={cn("inline", className)} variants={stagger(0.05, delay)} initial="hidden" whileInView="show" viewport={IN_VIEW} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span key={`${word}${index}`} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span className={cn("inline-block", wordClassName)} variants={lineUp}>
            {word}
            {" "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * The way into the bright world. Mounted on arrival, it starts as a field of light
 * and opens outward from the centre to uncover the page.
 */
export function LightGate({ origin = "50% 45%" }: { origin?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] h-lvh"
      style={{ background: LIGHT, WebkitMaskImage: reduced ? undefined : hole(origin), maskImage: reduced ? undefined : hole(origin) }}
      initial={reduced ? { opacity: 1 } : { opacity: 1, "--hole": "-25%" }}
      animate={reduced ? { opacity: 0 } : { opacity: [1, 1, 0], "--hole": "125%" }}
      transition={{ duration: reduced ? 0.3 : DURATION.page, ease: EASE.inOut, delay: reduced ? 0 : 0.15, times: reduced ? undefined : [0, 0.8, 1] }}
    />
  );
}

/**
 * The way out of the dark. A point of light grows from the given origin until it fills the screen.
 * Render it when leaving the room, then change route once it has covered the view.
 */
export function LightBloom({ show, origin = "50% 50%", onCovered }: { show: boolean; origin?: string; onCovered?: () => void }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="bloom"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[80] h-lvh"
          style={{ background: LIGHT }}
          initial={reduced ? { opacity: 0 } : { opacity: 1, clipPath: `circle(0% at ${origin})` }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: `circle(150% at ${origin})` }}
          exit={{ opacity: 0, transition: { duration: DURATION.base } }}
          transition={{ duration: reduced ? 0.25 : DURATION.slow, ease: EASE.inOut }}
          onAnimationComplete={(definition) => {
            if (typeof definition === "object" && "exit" in definition) return;
            onCovered?.();
          }}
        />
      )}
    </AnimatePresence>
  );
}
