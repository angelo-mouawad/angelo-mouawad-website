"use client";

import { useMotionValueEvent } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { portal, screenInLayer } from "@/components/room/scene/portal";
import { WorldMotion } from "@/components/world/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scroll } from "@/lib/scroll";
import { useRoom } from "@/store/room";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { ProjectsSection } from "./ProjectsSection";

const WorldCanvas = dynamic(() => import("./WorldCanvas"), { ssr: false });

type Backdrop = { screen: ReturnType<typeof screenInLayer>; width: number; height: number };

/**
 * The page's .world-glow and .world-grid, laid over the whole monitor glass rather than just the viewport box,
 * with every position still measured from the box so they line up exactly once the box is the viewport.
 */
function backdropStyles({ screen, width: w, height: h }: Backdrop) {
  const x = (fraction: number) => `${-screen.left + fraction * w}px`;
  const y = (fraction: number) => `${-screen.top + fraction * h}px`;
  const rect = { left: screen.left, top: screen.top, width: screen.width, height: screen.height };
  const glow = {
    ...rect,
    background: [
      `radial-gradient(60rem 40rem at ${x(0.12)} ${y(-0.1)}, rgb(111 227 255 / 0.32), transparent 60%)`,
      `radial-gradient(50rem 36rem at ${x(0.95)} ${y(0.08)}, rgb(143 184 255 / 0.3), transparent 62%)`,
      `radial-gradient(46rem 30rem at ${x(0.5)} ${y(1.1)}, rgb(225 240 251 / 0.9), transparent 60%)`,
      "var(--background)",
    ].join(","),
  };
  const mask = `radial-gradient(ellipse ${0.8 * w}px ${0.7 * h}px at ${x(0.5)} ${y(0.3)}, #000 30%, transparent 85%)`;
  const grid = {
    ...rect,
    backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
    backgroundPosition: `${x(0)} ${y(0)}`,
    WebkitMaskImage: mask,
    maskImage: mask,
  };
  return { glow, grid };
}

/**
 * Everything past the monitor. The fixed backdrop layer is the monitor's screen: near the end of the room the
 * camera rig maps it onto the screen in perspective and fades it in over the monitor's own picture of it, and once
 * the camera arrives it is simply the viewport. The sections then scroll over it in normal page flow.
 */
export function World() {
  const reduced = useReducedMotion();
  const sceneReady = useRoom((state) => state.sceneReady);
  const layer = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [backdrop, setBackdrop] = useState<Backdrop | null>(null);
  useMotionValueEvent(scroll.portal, "change", (value) => setShown(value > 0));

  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    portal.element = element;
    const measure = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      setBackdrop({ screen: screenInLayer(width, height), width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (portal.element === element) portal.element = null;
    };
  }, []);

  // Clip to the monitor's glass. It reaches past the layer, so once the camera arrives nothing is clipped at all.
  const screen = backdrop?.screen;
  const clip = screen
    ? `polygon(${screen.left}px ${screen.top}px, ${screen.left + screen.width}px ${screen.top}px, ${screen.left + screen.width}px ${screen.top + screen.height}px, ${screen.left}px ${screen.top + screen.height}px)`
    : undefined;
  const styles = backdrop && backdropStyles(backdrop);

  return (
    <WorldMotion>
      <div
        ref={layer}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-10 h-lvh origin-top-left will-change-transform"
        style={{ clipPath: clip, WebkitClipPath: clip, visibility: shown ? "visible" : "hidden" }}
      >
        {styles && (
          <>
            <div className="absolute" style={styles.glow} />
            <div className="absolute" style={styles.grid} />
          </>
        )}
        {/* Mounted once the room is ready, so the world's renderer is warm long before the monitor needs it. */}
        {sceneReady && (
          <div className="absolute inset-0">
            <WorldCanvas active={shown} reducedMotion={reduced} dpr={1.5} />
          </div>
        )}
      </div>

      <div className="relative z-20 font-body text-foreground">
        <HeroSection still={reduced} />
        <AboutSection still={reduced} />
        <ProjectsSection still={reduced} />
        <ContactSection still={reduced} />
      </div>
    </WorldMotion>
  );
}
