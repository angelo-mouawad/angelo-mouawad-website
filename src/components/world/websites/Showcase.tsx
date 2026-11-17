"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { MacbookScroll } from "@/components/vendor/MacbookScroll";
import { useElementProgress } from "@/components/world/home/useSectionProgress";
import { Chip, Container, MonoLabel, TextLink } from "@/components/world/primitives";
import { SITES, type Site } from "@/data/websites";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BrowserFrame, PhoneFrame } from "./DeviceFrames";

const pad = (value: number) => String(value).padStart(2, "0");

/** One site: its desktop view swings up flat, its phone view slides in beside it, and the write-up arrives from the other side. */
function ShowcaseItem({ site, index, still }: { site: Site; index: number; still: boolean }) {
  const item = useRef<HTMLElement>(null);
  const progress = useElementProgress(item, ["start end", "end start"]);
  const flipped = index % 2 === 1;
  const side = flipped ? -1 : 1;

  const tilt = useTransform(progress, [0.05, 0.42], [28, 0]);
  const lift = useTransform(progress, [0.05, 0.42], [90, 0]);
  const scale = useTransform(progress, [0.05, 0.42], [0.86, 1]);
  const phoneX = useTransform(progress, [0.12, 0.5], [side * 180, 0]);
  const phoneY = useTransform(progress, [0, 1], [70, -70]);
  const phoneTurn = useTransform(progress, [0.12, 0.5], [side * 14, 0]);
  const textX = useTransform(progress, [0.1, 0.44], [side * -90, 0]);
  const textOpacity = useTransform(progress, [0.1, 0.4], [0, 1]);
  const numeralX = useTransform(progress, [0, 1], [`${side * 22}%`, `${side * -22}%`]);

  return (
    <article ref={item} aria-labelledby={`site-${site.slug}`} className="relative py-14 sm:py-24">
      <motion.span
        aria-hidden="true"
        className={cn("pointer-events-none absolute top-0 font-display text-[38vw] leading-none font-semibold tracking-tighter text-sky-bright/[0.07] select-none sm:text-[22vw]", flipped ? "left-0" : "right-0")}
        style={still ? undefined : { x: numeralX }}
      >
        {pad(index + 1)}
      </motion.span>

      <Container wide className={cn("relative grid items-center gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16", flipped && "lg:[&>*:first-child]:order-2")}>
        <div className={cn("relative [perspective:1600px]", flipped ? "lg:pl-12" : "lg:pr-12")}>
          <motion.div className="will-change-transform" style={still ? undefined : { rotateX: tilt, y: lift, scale, transformOrigin: "50% 100%" }}>
            <BrowserFrame src={`/sites/${site.slug}-desktop.webp`} alt={`${site.name} home page on a desktop screen`} url={site.url} />
          </motion.div>
          <motion.div
            className={cn("absolute -bottom-8 w-[24%] min-w-24 will-change-transform sm:-bottom-12", flipped ? "-left-2 lg:left-0" : "-right-2 lg:right-0")}
            style={still ? undefined : { x: phoneX, y: phoneY, rotate: phoneTurn }}
          >
            <PhoneFrame src={`/sites/${site.slug}-mobile.webp`} alt={`${site.name} home page on a phone`} />
          </motion.div>
        </div>

        <motion.div className="flex flex-col gap-5 pt-6 lg:pt-0" style={still ? undefined : { x: textX, opacity: textOpacity }}>
          <MonoLabel dot>
            <span className="text-sky">SITE_{pad(index + 1)}</span>
            {site.client}
          </MonoLabel>
          <h3 id={`site-${site.slug}`} className="type-h2">
            {site.name}
          </h3>
          <p className="type-body">{site.description}</p>
          <ul className="flex flex-wrap gap-1.5">
            {site.stack.map((tech) => (
              <li key={tech}>
                <Chip>{tech}</Chip>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <a href={site.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
              Visit the live site <ArrowUpRight aria-hidden="true" className="group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <TextLink href={site.repo} external>
              View the code
            </TextLink>
          </div>
        </motion.div>
      </Container>
    </article>
  );
}

export function Showcase() {
  const still = useReducedMotion();
  const cover = SITES[0];

  return (
    <section id="work" aria-labelledby="work-title" className="relative border-t border-line">
      {still ? (
        <Container className="pt-(--section)">
          <MonoLabel dot>
            <span className="text-sky">02</span>The work
          </MonoLabel>
          <h2 id="work-title" className="type-h1 mt-5 text-balance">
            {SITES.length} sites, live right now.
          </h2>
        </Container>
      ) : (
        <div className="overflow-hidden">
          <MacbookScroll
            src={`/sites/${cover.slug}-desktop.webp`}
            title={
              <span className="flex flex-col items-center gap-5 font-normal text-foreground">
                <MonoLabel dot>
                  <span className="text-sky">02</span>The work
                </MonoLabel>
                <span id="work-title" className="type-h1 block text-balance">
                  {SITES.length} sites, live right now.
                </span>
              </span>
            }
          />
        </div>
      )}

      <div className="overflow-x-clip">
        {SITES.map((site, index) => (
          <ShowcaseItem key={site.slug} site={site} index={index} still={still} />
        ))}
      </div>
    </section>
  );
}
