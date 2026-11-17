"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { portal } from "@/components/room/scene/portal";
import { prefersReducedMotion } from "@/lib/device";
import { frame } from "@/lib/frame";
import { registerLenis, scroll } from "@/lib/scroll";
import { useRoom } from "@/store/room";

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * Owns the page scroll. Lenis smooths wheel input, and the scroll position becomes
 * two numbers: progress through the room, then the dive from the monitor into the world.
 */
export function SmoothScroll() {
  const phase = useRoom((state) => state.phase);
  const lenis = useRef<Lenis | null>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("room-page");

    // The probe is exactly one large viewport tall, so nothing here moves when mobile browser bars show or hide.
    const update = () => {
      const viewport = probe.current?.offsetHeight ?? 0;
      const limit = (spacer.current?.offsetHeight ?? 0) - viewport;
      if (limit <= 0 || viewport <= 0) return;
      frame.progress = clamp(window.scrollY / limit);
      // The world starts right under the room's scroll track, so it rises into view over one viewport.
      frame.dive = clamp((window.scrollY - limit) / viewport);
      scroll.dive.set(frame.dive);
      // The camera keeps easing in on its own as the dive starts; it is only parked once the room stops drawing.
      const inWorld = frame.dive >= 0.999;
      if (inWorld) {
        frame.cameraProgress = 1;
        if (portal.element) portal.element.style.transform = "none";
      }
      if (inWorld !== useRoom.getState().inWorld) useRoom.getState().setInWorld(inWorld);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    let raf = 0;
    if (!prefersReducedMotion()) {
      const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
      instance.stop();
      lenis.current = instance;
      registerLenis(instance);
      const loop = (time: number) => {
        instance.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
      registerLenis(null);
      lenis.current?.destroy();
      lenis.current = null;
      document.documentElement.classList.remove("room-page");
      frame.progress = 0;
      frame.cameraProgress = 0;
      frame.dive = 0;
      for (const value of Object.values(scroll)) value.set(0);
    };
  }, []);

  useEffect(() => {
    const locked = phase !== "ready";
    document.documentElement.style.overflow = locked ? "hidden" : "";
    if (locked) lenis.current?.stop();
    else lenis.current?.start();
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  return (
    <>
      <div ref={probe} className="lvh-probe" />
      <div ref={spacer} className="room-scroll" />
    </>
  );
}
