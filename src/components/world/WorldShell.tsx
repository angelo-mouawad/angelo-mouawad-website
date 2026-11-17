"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { registerLenis } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { BackToRoom } from "./BackToRoom";
import { LightGate, WorldMotion } from "./motion";
import { Container, MonoLabel, WorldBackdrop } from "./primitives";

/** Momentum scrolling for long marketing pages. Reading pages leave the browser's own scroll alone. */
function SmoothPage() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09 });
    registerLenis(lenis);
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
}

/**
 * Frame shared by every page beyond the room: the bright backdrop, the light that opens
 * onto the page on arrival, and a top bar that always carries the way back.
 */
export function WorldShell({
  label,
  actions,
  smooth = false,
  bar = true,
  className,
  children,
}: {
  label: string;
  actions?: ReactNode;
  smooth?: boolean;
  /** Set false when the page draws its own top bar. */
  bar?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <WorldMotion>
      <div className={cn("world relative isolate min-h-dvh", className)}>
        <WorldBackdrop />
        <LightGate />
        {smooth && <SmoothPage />}
        <a
          href="#main"
          className="glass-strong sr-only z-[90] rounded-full px-5 py-3 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {bar && (
          <header className="pointer-events-none sticky top-0 z-40">
            {/* Fades whatever scrolls underneath so the bar stays readable. */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background via-background/70 to-transparent" />
            <Container wide className="relative flex h-18 items-center justify-between gap-4">
              <BackToRoom className="pointer-events-auto" />
              <div className="pointer-events-auto flex items-center gap-4">
                <MonoLabel dot className="hidden sm:inline-flex">
                  {label}
                </MonoLabel>
                {actions}
              </div>
            </Container>
          </header>
        )}
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
    </WorldMotion>
  );
}
