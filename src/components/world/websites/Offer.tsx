"use client";

import { Gauge, Globe, Languages, PenTool, Smartphone, Wrench } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { type ReactNode, useRef } from "react";
import { useElementProgress } from "@/components/world/home/useSectionProgress";
import { Container, MonoLabel, Panel, SectionHeading } from "@/components/world/primitives";
import { PROCESS, SERVICES } from "@/data/websites";
import { DURATION, EASE, IN_VIEW } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ICONS: Record<(typeof SERVICES)[number]["id"], ReactNode> = {
  design: <PenTool aria-hidden="true" />,
  responsive: <Smartphone aria-hidden="true" />,
  multilingual: <Languages aria-hidden="true" />,
  performance: <Gauge aria-hidden="true" />,
  hosting: <Globe aria-hidden="true" />,
  maintenance: <Wrench aria-hidden="true" />,
};

/** What Angelo offers. The heading holds still while the cards come in from alternating sides. */
export function Offer() {
  return (
    <section aria-labelledby="offer-title" className="relative border-t border-line py-(--section)">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            index="01"
            label="What I offer"
            title={<span id="offer-title">Everything a site needs, from one person.</span>}
            lead="You talk to the person who designs it, builds it and puts it online. Nothing gets lost between a designer, a developer and a host."
          />
        </div>
        <ul className="grid gap-4 overflow-x-clip sm:grid-cols-2">
          {SERVICES.map((service, index) => (
            <motion.li
              key={service.id}
              initial={{ opacity: 0, x: index % 2 ? 70 : -70, y: 24, rotate: index % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              viewport={IN_VIEW}
              transition={{ duration: DURATION.slow, ease: EASE.out, delay: (index % 2) * 0.08 }}
            >
              <Panel surface="glass" className="group/card flex h-full flex-col gap-5 p-6 transition-shadow duration-500 hover:shadow-glow">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-500 ease-out-expo group-hover/card:-rotate-6 group-hover/card:scale-110 [&_svg]:size-5">
                  {ICONS[service.id]}
                </span>
                <h3 className="type-h3">{service.title}</h3>
                <p className="type-body">{service.text}</p>
              </Panel>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Four steps on a line that draws itself as the section scrolls through. */
export function Process() {
  const section = useRef<HTMLElement>(null);
  const progress = useElementProgress(section, ["start 0.85", "end 0.6"]);
  const reduced = useReducedMotion();
  const line = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section ref={section} aria-labelledby="process-title" className="relative border-t border-line py-(--section)">
      <Container>
        <SectionHeading index="03" label="How it goes" title={<span id="process-title">From a first chat to a live site.</span>} />
        <div className="relative mt-14">
          <div aria-hidden="true" className="absolute top-5 right-0 left-0 hidden h-px bg-line-strong lg:block">
            <motion.div className="h-px origin-left bg-sky-bright shadow-[0_0_10px_var(--glow)]" style={{ scaleX: reduced ? 1 : line }} />
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, index) => (
              <motion.li
                key={step.title}
                className="relative flex flex-col gap-4"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={IN_VIEW}
                transition={{ duration: DURATION.slow, ease: EASE.out, delay: index * 0.1 }}
              >
                <span className="glass relative grid size-10 place-items-center rounded-full font-mono text-xs text-sky">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="type-h3">{step.title}</h3>
                <p className="type-body">{step.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
        <MonoLabel className="mt-12">Every project is quoted on its own. Ask and I&apos;ll tell you what yours would take.</MonoLabel>
      </Container>
    </section>
  );
}
