"use client";

import { Download } from "lucide-react";
import { motion, type MotionValue, useTransform } from "motion/react";
import Image from "next/image";
import { type ReactNode, useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Chip, Container, MonoLabel, Panel } from "@/components/world/primitives";
import ContributionSkyline from "@/components/vendor/ContributionSkyline";
import ScrollVelocity from "@/components/vendor/ScrollVelocity";
import contributions from "@/data/contributions.json";
import { PROFILE, type Fact } from "@/data/profile";
import { techStack } from "@/data/projects";
import { scroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { scatter, useElementProgress, useSectionProgress } from "./useSectionProgress";

const SKYLINE_PALETTE = ["#bfe3ff", "#6fc1ff", "#2f9bff", "#0b6bdc"];

/** A word that sharpens from faint to full ink as the reader scrolls through its slot. */
function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span className="inline-block" style={{ opacity }}>
      {word}
      {" "}
    </motion.span>
  );
}

type FlyInProps = { index: number; total: number; progress: MotionValue<number>; still: boolean; children: ReactNode };

/** A grid cell that arrives from its own direction and settles into the row. */
function FlyIn({ index, total, progress, still, children }: FlyInProps) {
  const start = 0.42 + (index / total) * 0.24;
  const window: [number, number] = [start, start + 0.2];
  const fromSide = index % 3 !== 1;
  const x = useTransform(progress, window, [fromSide ? `${(index % 2 ? 1 : -1) * 70}vw` : "0vw", "0vw"]);
  const y = useTransform(progress, window, [fromSide ? `${scatter(index) * 12}vh` : "60vh", "0vh"]);
  const rotate = useTransform(progress, window, [scatter(index, 4) * 14, 0]);
  const opacity = useTransform(progress, window, [0, 1]);

  return (
    <motion.li className="will-change-transform" style={still ? undefined : { x, y, rotate, opacity }}>
      {children}
    </motion.li>
  );
}

/** The last card in the grid: the CV as a PDF download. */
function CvCard() {
  return (
    <Panel surface="glass" className="flex h-full flex-col gap-1.5 rounded-2xl px-3.5 py-2.5 sm:gap-2 sm:px-5 sm:py-4">
      <MonoLabel>Résumé</MonoLabel>
      <a href={PROFILE.cv.href} download={PROFILE.cv.fileName} className={cn(buttonVariants({ variant: "glow", size: "sm" }), "group/cv mt-auto self-start max-sm:h-8 max-sm:px-3 max-sm:text-xs")}>
        <Download aria-hidden="true" className="group-hover/cv:translate-y-0.5" />
        Download CV
        <span className="sr-only">(PDF)</span>
      </a>
    </Panel>
  );
}

function FactCard({ fact }: { fact: Fact }) {
  return (
    <Panel surface={fact.todo ? "sunk" : "glass"} className={`flex h-full flex-col gap-1.5 rounded-2xl px-3.5 py-2.5 sm:gap-2 sm:px-5 sm:py-4 ${fact.todo ? "border-dashed" : ""}`}>
        <MonoLabel>
          {fact.label}
          {fact.todo && <Chip tone="muted" className="h-5 px-2 text-[0.5625rem]">TODO</Chip>}
        </MonoLabel>
        <span className={`font-display text-sm leading-snug font-medium tracking-tight sm:text-lg ${fact.todo ? "text-muted-foreground" : ""}`}>{fact.value}</span>
    </Panel>
  );
}

/** The portrait: it wipes into its glass frame from the bottom behind a line of light, and drifts inside the frame as the page moves. */
function Portrait({ still }: { still: boolean }) {
  const block = useRef<HTMLDivElement>(null);
  const progress = useElementProgress(block, ["start end", "end start"]);
  const reveal = useTransform(progress, [0.1, 0.44], ["inset(100% 0% 0% 0% round 1.25rem)", "inset(0% 0% 0% 0% round 1.25rem)"]);
  const scanTop = useTransform(progress, [0.1, 0.44], ["100%", "0%"]);
  const scanOpacity = useTransform(progress, [0.1, 0.14, 0.4, 0.46], [0, 1, 1, 0]);
  const drift = useTransform(progress, [0, 1], ["-6%", "6%"]);
  const zoom = useTransform(progress, [0.1, 0.55], [1.28, 1.12]);
  const tilt = useTransform(progress, [0.1, 0.46], [-6, 0]);
  const textX = useTransform(progress, [0.14, 0.44], ["18vw", "0vw"]);
  const textOpacity = useTransform(progress, [0.16, 0.42], [0, 1]);

  return (
    <div ref={block} className="overflow-x-clip pt-(--section)">
      <Container className="grid items-center gap-12 md:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-24">
        <motion.div className="relative mx-auto w-full max-w-[21rem]" style={still ? undefined : { rotate: tilt }}>
          <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-[3rem] bg-[image:var(--gradient-aurora)] opacity-30 blur-3xl" />
          <Panel surface="glass" ticks className="relative p-2.5">
            <motion.div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-sunk" style={still ? undefined : { clipPath: reveal }}>
              <motion.div className="absolute inset-0" style={still ? undefined : { y: drift, scale: zoom }}>
                <Image src="/images/angelo.webp" alt={`Portrait of ${PROFILE.name}`} fill sizes="(min-width: 768px) 21rem, 80vw" className="object-cover object-top" />
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[rgb(11_18_32/0.62)] to-transparent p-4 pt-20">
                <span className="font-display text-lg font-medium tracking-tight text-white">{PROFILE.name}</span>
                <span className="type-label text-[0.5625rem] text-white/75">Portrait</span>
              </div>
            </motion.div>
            {!still && <motion.span aria-hidden="true" className="pointer-events-none absolute inset-x-2.5 h-px bg-sky-bright shadow-[0_0_16px_2px_var(--glow)]" style={{ top: scanTop, opacity: scanOpacity }} />}
          </Panel>
        </motion.div>
        <motion.div className="flex flex-col items-start gap-6" style={still ? undefined : { x: textX, opacity: textOpacity }}>
          <MonoLabel dot>Hello</MonoLabel>
          <p className="type-h2 text-balance">
            Nice to meet you. I&apos;m <span className="text-aurora">{PROFILE.firstName}</span>.
          </p>
          <ul className="flex flex-wrap gap-2">
            {PROFILE.roles.map((role) => (
              <li key={role}>
                <Chip tone="accent">{role}</Chip>
              </li>
            ))}
          </ul>
        </motion.div>
      </Container>
    </div>
  );
}

/** Who Angelo is: a statement that fills in as you scroll, facts that fly into place, then a year of commits. */
export function AboutSection({ still }: { still: boolean }) {
  const pinned = useRef<HTMLDivElement>(null);
  const activity = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(pinned, scroll.about);
  const activityProgress = useElementProgress(activity, ["start end", "start 0.25"]);

  const { statement, detail, facts } = PROFILE.about;
  const words = statement.split(" ");
  const exitOpacity = useTransform(progress, [0.92, 1], [1, 0]);
  const exitY = useTransform(progress, [0.86, 1], ["0vh", "-10vh"]);
  const labelX = useTransform(progress, [0, 0.12], ["-30vw", "0vw"]);

  const panelX = useTransform(activityProgress, [0, 1], ["45vw", "0vw"]);
  const panelRotate = useTransform(activityProgress, [0, 1], [6, 0]);
  const textX = useTransform(activityProgress, [0, 1], ["-30vw", "0vw"]);
  const sideOpacity = useTransform(activityProgress, [0, 0.6], [0, 1]);

  return (
    <section id="about" aria-labelledby="about-title" className="relative">
      <div ref={pinned} style={{ height: still ? "auto" : "300lvh" }}>
        <motion.div className={still ? "py-(--section)" : "sticky top-0 flex h-svh items-center overflow-hidden pt-14 pb-24"} style={still ? undefined : { opacity: exitOpacity, y: exitY }}>
          <Container className="flex flex-col gap-5 sm:gap-10">
            <motion.div style={still ? undefined : { x: labelX }}>
              <MonoLabel dot>
                <span className="text-sky">01</span>About me
              </MonoLabel>
            </motion.div>
            <h2 id="about-title" aria-label={statement} className="font-display text-[clamp(1.4375rem,4.3vw,3.75rem)] leading-[1.12] font-normal tracking-[-0.035em]">
              {words.map((word, index) => (
                <span key={index} aria-hidden="true">
                  {still ? `${word} ` : <Word word={word} progress={progress} range={[0.03 + (index / words.length) * 0.36, 0.03 + ((index + 1) / words.length) * 0.36 + 0.04]} />}
                </span>
              ))}
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {facts.map((fact, index) => (
                <FlyIn key={fact.label} index={index} total={facts.length + 1} progress={progress} still={still}>
                  <FactCard fact={fact} />
                </FlyIn>
              ))}
              <FlyIn index={facts.length} total={facts.length + 1} progress={progress} still={still}>
                <CvCard />
              </FlyIn>
            </ul>
          </Container>
        </motion.div>
      </div>

      <Portrait still={still} />

      <div ref={activity} className="overflow-x-clip py-(--section)">
        <Container className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <motion.div className="flex flex-col gap-6" style={still ? undefined : { x: textX, opacity: sideOpacity }}>
            <MonoLabel dot>A year of commits</MonoLabel>
            <p className="type-h3 text-balance">{detail}</p>
            <p className="type-small">Pulled from my public GitHub activity. Switch between the flat map and the skyline, or drag the skyline to turn it.</p>
          </motion.div>
          <motion.div style={still ? undefined : { x: panelX, rotate: panelRotate, opacity: sideOpacity }}>
            <Panel surface="glass" ticks className="overflow-hidden p-4 text-foreground sm:p-6">
              <ContributionSkyline data={contributions} palette={SKYLINE_PALETTE} unit="contribution" defaultView="3d" className="bg-transparent font-body" />
            </Panel>
          </motion.div>
        </Container>

        <div className="mt-(--section) flex flex-col gap-3" aria-hidden="true">
          <ScrollVelocity
            texts={[techStack().join("  /  "), [...techStack()].reverse().join("  /  ")]}
            velocity={still ? 0 : 60}
            numCopies={4}
            className="font-display text-[clamp(2rem,6vw,5rem)] font-light tracking-[-0.03em] text-foreground/15 uppercase"
          />
        </div>
        <p className="sr-only">Technologies I work with: {techStack().join(", ")}.</p>
      </div>
    </section>
  );
}
