"use client";

import { motion, type MotionValue, useMotionValue, useTransform } from "motion/react";
import { useRef } from "react";
import { MonoLabel } from "@/components/world/primitives";
import { PROFILE } from "@/data/profile";
import { scroll } from "@/lib/scroll";
import { scatter, useSectionProgress } from "./useSectionProgress";

/** One letter of the name. It flies in from a scattered spot as the light opens. */
function Letter({ char, index, enter }: { char: string; index: number; enter: MotionValue<number> }) {
  const x = useTransform(enter, [0, 1], [`${scatter(index, 1) * 60}vw`, "0vw"]);
  const y = useTransform(enter, [0, 1], [`${scatter(index, 2) * 60}vh`, "0vh"]);
  const rotate = useTransform(enter, [0, 1], [scatter(index, 3) * 120, 0]);
  const opacity = useTransform(enter, [0, 0.35, 1], [0, 0.5, 1]);
  return (
    <motion.span aria-hidden="true" className="inline-block will-change-transform" style={{ x, y, rotate, opacity }}>
      {char}
    </motion.span>
  );
}

function NameLine({ text, offset, enter, x }: { text: string; offset: number; enter: MotionValue<number>; x: MotionValue<string> }) {
  return (
    <motion.span className="block whitespace-nowrap" style={{ x }}>
      {[...text].map((char, index) => (
        <Letter key={index} char={char} index={index + offset} enter={enter} />
      ))}
    </motion.span>
  );
}

/** The arrival. The name assembles out of the light, then its two halves slide apart to let the introduction through. */
export function HeroSection({ still }: { still: boolean }) {
  const section = useRef<HTMLElement>(null);
  const progress = useSectionProgress(section, scroll.hero);

  const enter = useTransform(scroll.dive, [0.4, 1], [0, 1]);
  const firstX = useTransform(progress, [0.08, 0.6], ["0%", "-9%"]);
  const lastX = useTransform(progress, [0.08, 0.6], ["0%", "9%"]);
  const gap = useTransform(progress, [0.08, 0.6], ["0rem", "8.5rem"]);
  const introOpacity = useTransform(progress, [0.28, 0.55], [0, 1]);
  const introScale = useTransform(progress, [0.28, 0.6], [0.9, 1]);
  const rule = useTransform(progress, [0.3, 0.65], [0, 1]);
  const exitOpacity = useTransform(progress, [0.82, 1], [1, 0]);
  const exitScale = useTransform(progress, [0.75, 1], [1, 0.9]);
  const exitY = useTransform(progress, [0.75, 1], ["0vh", "-12vh"]);
  const hint = useTransform(progress, [0, 0.12], [1, 0]);

  const { firstName, lastName, roles } = PROFILE;
  const settled = useMotionValue(1);
  const centred = useMotionValue("0%");

  return (
    <section ref={section} aria-labelledby="hero-title" className="relative" style={{ height: still ? "auto" : "260lvh" }}>
      <motion.div
        className={still ? "flex min-h-svh flex-col items-center justify-center px-(--gutter) py-24" : "sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-(--gutter)"}
        style={still ? undefined : { opacity: exitOpacity, scale: exitScale, y: exitY }}
      >
        <motion.div style={still ? undefined : { opacity: enter }}>
          <MonoLabel dot className="mb-6 sm:mb-10">
            <span className="text-sky">00</span>Inside the machine
          </MonoLabel>
        </motion.div>

        <div className="relative flex w-full flex-col items-center">
        <h1 id="hero-title" aria-label={PROFILE.name} className="flex flex-col items-center font-display text-[clamp(3rem,13.5vw,13.5rem)] leading-[0.84] font-light tracking-[-0.055em] uppercase">
          <NameLine text={firstName} offset={0} enter={still ? settled : enter} x={still ? centred : firstX} />
          <motion.span aria-hidden="true" className="block" style={{ height: still ? "1.5rem" : gap }} />
          <NameLine text={lastName} offset={firstName.length} enter={still ? settled : enter} x={still ? centred : lastX} />
        </h1>

        {/* Sits in the gap that opens between the two halves of the name. */}
        <motion.div
          className={still ? "mt-10 flex flex-col items-center gap-4 text-center" : "absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4 text-center"}
          style={still ? undefined : { opacity: introOpacity, scale: introScale }}
        >
          <motion.span aria-hidden="true" className="hairline w-[min(34rem,80vw)]" style={still ? undefined : { scaleX: rule }} />
          <p className="flex flex-col items-center gap-0.5 font-display text-[1.0625rem] font-semibold tracking-tight sm:block sm:text-2xl">
            {roles.map((role, index) => (
              <span key={role}>
                {index > 0 && <span className="mx-3 hidden text-sky-bright sm:inline">/</span>}
                {role}
              </span>
            ))}
          </p>
          <motion.span aria-hidden="true" className="hairline w-[min(34rem,80vw)]" style={still ? undefined : { scaleX: rule }} />
        </motion.div>
        </div>

        {!still && (
          <motion.div aria-hidden="true" className="absolute bottom-24 flex flex-col items-center gap-2" style={{ opacity: hint }}>
            <MonoLabel>Keep scrolling</MonoLabel>
            <span className="h-8 w-px animate-pulse bg-gradient-to-b from-sky-bright to-transparent" />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
