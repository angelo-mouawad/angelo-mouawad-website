"use client";

import { motion, useMotionTemplate, useMotionValueEvent, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { WorldMotion } from "@/components/world/motion";
import { scroll } from "@/lib/scroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { ProjectsSection } from "./ProjectsSection";

const WorldCanvas = dynamic(() => import("./WorldCanvas"), { ssr: false });

/**
 * Everything past the monitor. A fixed layer of light opens from the centre of the screen
 * as the dive progresses, and the sections scroll over it in normal page flow.
 */
export function World() {
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  useMotionValueEvent(scroll.dive, "change", (value) => setNear(value > 0.01));

  const radius = useTransform(scroll.dive, [0.04, 0.9], [-35, 135]);
  const mask = useMotionTemplate`radial-gradient(circle at 50% 50%, #000 ${radius}%, transparent calc(${radius}% + 35%))`;
  const fade = useTransform(scroll.dive, [0, 0.5], [0, 1]);

  return (
    <WorldMotion>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-10 h-lvh bg-background"
        style={reduced ? { opacity: fade, visibility: near ? "visible" : "hidden" } : { WebkitMaskImage: mask, maskImage: mask, visibility: near ? "visible" : "hidden" }}
      >
        <div className="world-glow absolute inset-0" />
        <div className="world-grid absolute inset-0" />
        {near && (
          <div className="absolute inset-0">
            <WorldCanvas active={near} reducedMotion={reduced} dpr={1.5} />
          </div>
        )}
      </motion.div>

      <div className="relative z-20 font-body text-foreground">
        <HeroSection still={reduced} />
        <AboutSection still={reduced} />
        <ProjectsSection still={reduced} />
        <ContactSection still={reduced} />
      </div>
    </WorldMotion>
  );
}
