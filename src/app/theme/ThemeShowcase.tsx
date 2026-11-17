"use client";

import { ArrowRight, ArrowUpRight, Mail, Play } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BackToRoom } from "@/components/world/BackToRoom";
import { BrandIcon } from "@/components/world/BrandIcon";
import { LightBloom, LightGate, Reveal, RevealGroup, RevealItem, RevealText, WorldMotion } from "@/components/world/motion";
import { Chip, Container, MonoLabel, Panel, SectionHeading, TextLink, WorldBackdrop } from "@/components/world/primitives";
import { EASE, SPRING } from "@/lib/motion";

const COLOURS: { name: string; token: string; hex: string; use: string; dark?: boolean }[] = [
  { name: "Cloud", token: "background", hex: "#F4F7FB", use: "Page background" },
  { name: "Mist", token: "sunk", hex: "#EAF0F7", use: "Recessed areas, code" },
  { name: "Ice", token: "ice", hex: "#E1F0FB", use: "Tinted fills, hover" },
  { name: "Paper", token: "card", hex: "#FFFFFF", use: "Panels and cards" },
  { name: "Ink", token: "foreground", hex: "#0B1220", use: "Headings, primary buttons", dark: true },
  { name: "Slate", token: "ink-soft", hex: "#2C3A4F", use: "Body text", dark: true },
  { name: "Fog", token: "muted-foreground", hex: "#52627A", use: "Captions, labels", dark: true },
  { name: "Sky", token: "sky", hex: "#0B6BDC", use: "Links, accents on light", dark: true },
  { name: "Signal", token: "sky-bright", hex: "#2F9BFF", use: "Focus rings, lines, dots", dark: true },
  { name: "Cyan", token: "cyan", hex: "#12B5E5", use: "Data, highlights", dark: true },
  { name: "Glow", token: "glow", hex: "#6FE3FF", use: "Glows only, the room's cyan" },
];

const TYPE: { name: string; className: string; sample: string; spec: string }[] = [
  { name: "Display", className: "type-display", sample: "Into the light", spec: "Sora 300, 48 to 128px" },
  { name: "Heading 1", className: "type-h1", sample: "Websites that work", spec: "Sora 400, 40 to 76px" },
  { name: "Heading 2", className: "type-h2", sample: "Selected projects", spec: "Sora 500, 30 to 48px" },
  { name: "Heading 3", className: "type-h3", sample: "Flow Engine", spec: "Sora 600, 22 to 26px" },
  { name: "Lead", className: "type-lead", sample: "I design and build websites for people and companies who want something that feels made for them.", spec: "Inter 400, 17 to 20px" },
  { name: "Body", className: "type-body", sample: "The reader only downloads the book you open, so every chapter loads quickly, even on a slow connection.", spec: "Inter 400, 16px" },
  { name: "Label", className: "type-label text-muted-foreground", sample: "PRJ_01 / Backend architecture", spec: "JetBrains Mono 500, 11px" },
];

function Section({ index, label, title, lead, children }: { index: string; label: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-(--section)">
      <Container>
        <Reveal>
          <SectionHeading index={index} label={label} title={title} lead={lead} />
        </Reveal>
        <div className="mt-14">{children}</div>
      </Container>
    </section>
  );
}

export function ThemeShowcase() {
  const [bloom, setBloom] = useState(false);
  const [gateKey, setGateKey] = useState(0);
  const [replay, setReplay] = useState(0);

  return (
    <WorldMotion>
      <div className="world relative isolate min-h-dvh">
        <WorldBackdrop />
        <LightGate key={gateKey} />
        <LightBloom
          show={bloom}
          onCovered={() => {
            setBloom(false);
            setGateKey((key) => key + 1);
          }}
        />

        <header className="sticky top-0 z-40">
          <Container wide className="flex h-18 items-center justify-between">
            <BackToRoom />
            <MonoLabel dot>Design system / v1</MonoLabel>
          </Container>
        </header>

        <Container className="pt-16 pb-(--section) sm:pt-24">
          <MonoLabel dot className="mb-8">
            <span className="text-sky">00</span>The shared theme
          </MonoLabel>
          <h1 className="type-display max-w-5xl text-balance">
            <RevealText text="Step out of the room," delay={0.5} /> <RevealText text="into the light." wordClassName="text-aurora" delay={0.85} />
          </h1>
          <Reveal delay={1.1}>
            <p className="type-lead mt-10 max-w-2xl">
              One system for the monitor scene, the websites page, the notes and the Bible reader. Cool whites, glass, fine lines and calm motion, with the room&apos;s cyan carried through as light.
            </p>
          </Reveal>
        </Container>

        <Section index="01" label="Colour" title="A bright, cool palette" lead="Light backgrounds with a hint of ice blue. Ink for text, sky blue for anything you can act on. Every text colour here passes 4.5 to 1 contrast on the page background.">
          <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {COLOURS.map((colour) => (
              <RevealItem key={colour.token}>
                <Panel surface="solid" className="overflow-hidden">
                  <div className="h-24 border-b border-line" style={{ background: `var(--${colour.token})` }} />
                  <div className="flex flex-col gap-1.5 p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-base font-semibold">{colour.name}</span>
                      <span className="type-label text-muted-foreground">{colour.hex}</span>
                    </div>
                    <span className="type-small">{colour.use}</span>
                  </div>
                </Panel>
              </RevealItem>
            ))}
            <RevealItem>
              <Panel surface="solid" className="overflow-hidden">
                <div className="h-24 border-b border-line bg-[image:var(--gradient-aurora)]" />
                <div className="flex flex-col gap-1.5 p-4">
                  <span className="font-display text-base font-semibold">Aurora</span>
                  <span className="type-small">Gradient for key actions and glows</span>
                </div>
              </Panel>
            </RevealItem>
          </RevealGroup>
        </Section>

        <Section index="02" label="Typography" title="Sora, Inter and JetBrains Mono" lead="Sora in light weights for headlines, Inter for reading, and mono labels for the technical detail.">
          <div className="flex flex-col">
            {TYPE.map((row) => (
              <Reveal key={row.name} className="grid gap-3 border-b border-line py-8 md:grid-cols-[11rem_1fr] md:items-baseline md:gap-10">
                <div className="flex flex-col gap-2">
                  <MonoLabel>{row.name}</MonoLabel>
                  <span className="type-small">{row.spec}</span>
                </div>
                <p className={row.className}>{row.sample}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section index="03" label="Surfaces" title="Glass, panels and fine lines" lead="Three depths. Glass floats over the backdrop, panels sit on it, sunk areas recede into it.">
          <RevealGroup className="grid gap-5 md:grid-cols-3">
            <RevealItem>
              <Panel surface="glass" ticks className="flex h-56 flex-col justify-between p-6">
                <MonoLabel dot>Glass</MonoLabel>
                <p className="type-body">Translucent with a soft blur. For navigation, floating cards and anything layered over 3D.</p>
              </Panel>
            </RevealItem>
            <RevealItem>
              <Panel surface="solid" className="flex h-56 flex-col justify-between p-6">
                <MonoLabel dot>Panel</MonoLabel>
                <p className="type-body">Solid white with a hairline border. For reading surfaces and dense content.</p>
              </Panel>
            </RevealItem>
            <RevealItem>
              <Panel surface="sunk" className="flex h-56 flex-col justify-between p-6">
                <MonoLabel dot>Sunk</MonoLabel>
                <p className="type-body">A step down from the page. For code blocks, inputs and wells.</p>
              </Panel>
            </RevealItem>
          </RevealGroup>
          <Reveal className="mt-10 flex flex-col gap-3">
            <div className="hairline" />
            <span className="type-small">Radii: 8, 12, 18, 24 and full. Spacing on a 4px base. Sections breathe between 80 and 160px.</span>
          </Reveal>
        </Section>

        <Section index="04" label="Components" title="Buttons, chips, links and a card">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <RevealGroup className="flex flex-col gap-10">
              <RevealItem className="flex flex-col gap-4">
                <MonoLabel>Buttons</MonoLabel>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="glow" size="lg">
                    Start a project <ArrowRight className="group-hover/button:translate-x-0.5" />
                  </Button>
                  <Button size="lg">
                    View the work <ArrowUpRight />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="glass">
                    <Mail /> Email me
                  </Button>
                  <Button variant="outline">
                    <BrandIcon brand="github" /> GitHub
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </RevealItem>

              <RevealItem className="flex flex-col gap-4">
                <MonoLabel>Chips</MonoLabel>
                <div className="flex flex-wrap gap-2">
                  <Chip>Java 21</Chip>
                  <Chip>Spring Boot</Chip>
                  <Chip>Next.js</Chip>
                  <Chip tone="accent">Live</Chip>
                  <Chip tone="muted">Coming soon</Chip>
                </div>
              </RevealItem>

              <RevealItem className="flex flex-col gap-4">
                <MonoLabel>Links</MonoLabel>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  <TextLink href="/theme">An inline link</TextLink>
                  <TextLink href="https://github.com/angelo-mouawad" external>
                    An external link
                  </TextLink>
                </div>
              </RevealItem>

              <RevealItem className="flex flex-col gap-4">
                <MonoLabel>Field</MonoLabel>
                <label className="flex max-w-sm flex-col gap-2">
                  <span className="text-sm font-medium">Search notes</span>
                  <input
                    type="search"
                    placeholder="Type to filter"
                    className="h-11 rounded-xl border border-input bg-sunk px-4 text-sm outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground focus-visible:border-sky-bright focus-visible:ring-3 focus-visible:ring-ring/30"
                  />
                </label>
              </RevealItem>
            </RevealGroup>

            <Reveal>
              <motion.article whileHover={{ y: -6 }} transition={SPRING} className="group/card h-full">
                <Panel surface="glass" ticks className="relative flex h-full flex-col gap-6 overflow-hidden p-8 sm:p-10">
                  <div aria-hidden="true" className="absolute -top-24 -right-24 size-64 rounded-full bg-[image:var(--gradient-aurora)] opacity-25 blur-3xl transition-opacity duration-700 group-hover/card:opacity-45" />
                  <div className="flex items-center justify-between">
                    <MonoLabel dot>
                      <span className="text-sky">PRJ_01</span>Backend architecture
                    </MonoLabel>
                    <Chip tone="accent">Sample card</Chip>
                  </div>
                  <h3 className="type-h2">Flow Engine</h3>
                  <p className="type-body">
                    A configurable workflow engine. You define a flow once, trigger it over HTTP, and it walks its own steps, pausing while people approve them.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip>Java 21</Chip>
                    <Chip>Vue 3</Chip>
                    <Chip>MongoDB</Chip>
                    <Chip>WebSocket</Chip>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-line pt-6">
                    <TextLink href="https://github.com/angelo-mouawad/flow-engine" external>
                      View on GitHub
                    </TextLink>
                    <span className="type-label text-muted-foreground">01 / 09</span>
                  </div>
                </Panel>
              </motion.article>
            </Reveal>
          </div>
        </Section>

        <Section index="05" label="Motion" title="Smooth, calm and consistent" lead="One easing curve, three speeds. Content rises into place, light opens pages, and everything stands still for people who ask for reduced motion.">
          <div className="grid gap-5 md:grid-cols-3">
            <Reveal>
              <Panel surface="solid" className="flex h-full flex-col gap-5 p-6">
                <MonoLabel dot>Reveal</MonoLabel>
                <div key={replay} className="type-h3 min-h-16">
                  <RevealText text="Text rises word by word" />
                </div>
                <Button variant="outline" size="sm" className="mt-auto self-start" onClick={() => setReplay((value) => value + 1)}>
                  <Play /> Replay
                </Button>
              </Panel>
            </Reveal>
            <Reveal delay={0.08}>
              <Panel surface="solid" className="flex h-full flex-col gap-5 p-6">
                <MonoLabel dot>Drift</MonoLabel>
                <div className="relative grid min-h-16 flex-1 place-items-center">
                  <motion.div
                    aria-hidden="true"
                    className="size-14 rounded-2xl bg-[image:var(--gradient-aurora)] shadow-glow"
                    animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
                    transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                  />
                </div>
                <span className="type-small">Slow, looping float for 3D and decorative pieces.</span>
              </Panel>
            </Reveal>
            <Reveal delay={0.16}>
              <Panel surface="solid" className="flex h-full flex-col gap-5 p-6">
                <MonoLabel dot>Page transition</MonoLabel>
                <p className="type-body">Leaving the room, a point of light grows to fill the screen, then opens onto the page.</p>
                <Button variant="glow" size="sm" className="mt-auto self-start" onClick={() => setBloom(true)}>
                  <Play /> Play it
                </Button>
              </Panel>
            </Reveal>
          </div>
          <Reveal className="mt-10">
            <Panel surface="sunk" className="flex flex-wrap items-center gap-x-10 gap-y-3 p-6">
              <MonoLabel>Easing {EASE.out.join(", ")}</MonoLabel>
              <MonoLabel>Fast 180ms</MonoLabel>
              <MonoLabel>Base 420ms</MonoLabel>
              <MonoLabel>Slow 900ms</MonoLabel>
            </Panel>
          </Reveal>
        </Section>

        <footer className="border-t border-line py-12">
          <Container className="flex flex-wrap items-center justify-between gap-4">
            <MonoLabel>Angelo Mouawad / design system preview</MonoLabel>
            <BackToRoom />
          </Container>
        </footer>
      </div>
    </WorldMotion>
  );
}
