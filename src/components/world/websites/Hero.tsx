"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useElementProgress } from "@/components/world/home/useSectionProgress";
import { Reveal, RevealText } from "@/components/world/motion";
import { Container, MonoLabel } from "@/components/world/primitives";
import { SITES } from "@/data/websites";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BrowserFrame } from "./DeviceFrames";

const MicroSlats = dynamic(() => import("@/components/vendor/MicroSlats"), { ssr: false });

/** The interactive field of slats behind the headline. Only on devices with a mouse and room to spare. */
function SlatField() {
  const reduced = useReducedMotion();
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    const check = () => setCapable(window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  if (!capable || reduced) return null;
  return (
    <div aria-hidden="true" className="absolute inset-0 [mask-image:radial-gradient(ellipse_85%_80%_at_50%_38%,#000_35%,transparent_88%)]">
      <MicroSlats preset="tide" color="#5aaef5" glintColor="#0b6bdc" backgroundColor="#f4f7fb" slatWidth={9} slatHeight={22} gap={4} cursorStrength={1.6} cursorSize={70} trail={2.2} className="size-full" />
    </div>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useElementProgress(section, ["start start", "end start"]);
  const reduced = useReducedMotion();
  const wallX = useTransform(progress, [0, 1], ["6%", "-34%"]);
  const wallTilt = useTransform(progress, [0, 1], [24, 8]);
  const wallY = useTransform(progress, [0, 1], ["0%", "-8%"]);
  const textY = useTransform(progress, [0, 1], ["0vh", "-14vh"]);

  return (
    <section ref={section} aria-labelledby="websites-title" className="relative -mt-18 overflow-hidden pt-18">
      <SlatField />
      <Container className="relative pt-16 pb-14 sm:pt-28">
        <motion.div className="flex max-w-4xl flex-col gap-8" style={reduced ? undefined : { y: textY }}>
          <MonoLabel dot>
            <span className="text-sky">A.M.</span>Web design and build
          </MonoLabel>
          <h1 id="websites-title" className="type-display text-[clamp(2.75rem,8.4vw,7.25rem)] text-balance">
            <RevealText text="Websites that feel" delay={0.55} /> <RevealText text="made for you." wordClassName="text-aurora" delay={0.8} />
          </h1>
          <Reveal delay={1}>
            <p className="type-lead max-w-2xl">
              I design and build websites for individuals and companies. Tell me what you need and I&apos;ll take it from the first sketch to a live domain.
            </p>
          </Reveal>
          <Reveal delay={1.12} className="flex flex-wrap gap-3">
            <a href="#contact" className={buttonVariants({ variant: "glow", size: "lg" })}>
              Start a project <ArrowRight aria-hidden="true" className="group-hover/button:translate-x-0.5" />
            </a>
            <a href="#work" className={buttonVariants({ variant: "glass", size: "lg" })}>
              See the work <ArrowDown aria-hidden="true" className="group-hover/button:translate-y-0.5" />
            </a>
          </Reveal>
        </motion.div>
      </Container>

      {/* A wall of live sites that slides across as the page starts to scroll. */}
      <div aria-hidden="true" className="relative pb-(--section) [perspective:1600px]">
        <motion.div className="flex w-max gap-6 pl-(--gutter) will-change-transform sm:gap-10" style={reduced ? undefined : { x: wallX, y: wallY, rotateX: wallTilt, rotateZ: -3, transformOrigin: "50% 0%" }}>
          {[...SITES, ...SITES.slice(0, 2)].map((site, index) => (
            <BrowserFrame key={`${site.slug}${index}`} src={`/sites/${site.slug}-desktop.webp`} alt="" url={site.url} priority={index < 3} className="w-[78vw] shrink-0 sm:w-[44vw]" />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
