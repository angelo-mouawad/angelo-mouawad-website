"use client";

import { Hammer } from "lucide-react";
import { motion, type MotionValue, useMotionValueEvent, useTransform } from "motion/react";
import Image from "next/image";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Chip, MonoLabel, Panel, TextLink } from "@/components/world/primitives";
import { PROJECTS, type Project } from "@/data/projects";
import { scroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { useSectionProgress } from "./useSectionProgress";

const pad = (value: number) => String(value).padStart(2, "0");

interface Layout {
  /** Distance the track has to travel so the last card clears the viewport. */
  travel: number;
  viewport: number;
  centres: number[];
}

function ProjectCard({ project, index, x, layout, still }: { project: Project; index: number; x: MotionValue<number>; layout: RefObject<Layout>; still: boolean }) {
  const soon = project.status === "soon";

  // How far this card sits from the middle of the screen, from -1 on the left to 1 on the right.
  const offset = useTransform(x, (value) => {
    const { centres, viewport } = layout.current;
    if (!viewport) return 0;
    return Math.max(-1.4, Math.min(1.4, (centres[index] + value - viewport / 2) / viewport));
  });
  const rotateY = useTransform(offset, [-1, 0, 1], [26, 0, -26]);
  const scale = useTransform(offset, [-1, 0, 1], [0.86, 1, 0.86]);
  const y = useTransform(offset, [-1, 0, 1], [36, 0, 36]);
  const opacity = useTransform(offset, [-1.3, -0.6, 0, 0.6, 1.3], [0.25, 0.85, 1, 0.85, 0.25]);
  const numeralX = useTransform(offset, [-1, 1], ["-40%", "40%"]);

  return (
    <motion.li className="flex w-[min(86vw,30rem)] shrink-0 will-change-transform lg:w-[min(82vw,60rem)]" style={still ? undefined : { rotateY, scale, y, opacity, transformPerspective: 1400 }}>
      {/* No fixed height: the card grows with its text, and the row stretches every card to the tallest one. */}
      <Panel
        surface={soon ? "sunk" : "glass"}
        ticks={!soon}
        className={cn("relative flex w-full flex-col overflow-hidden lg:grid lg:grid-cols-[1.08fr_1fr]", soon && "border-dashed bg-sunk/60")}
      >
        <ProjectMedia project={project} />

        <div className="relative flex flex-1 flex-col gap-3 p-5 sm:gap-3.5 sm:p-7 *:shrink-0">
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -bottom-10 font-display text-[9rem] leading-none font-semibold tracking-tighter text-sky-bright/10 select-none sm:text-[12rem]"
            style={still ? undefined : { x: numeralX }}
          >
            {pad(index + 1)}
          </motion.span>

        <div className="flex items-center justify-between gap-3">
          <MonoLabel dot={!soon}>
            <span className="text-sky">PRJ_{pad(index + 1)}</span>
            <span className="hidden sm:inline">{project.category}</span>
          </MonoLabel>
          {soon && <Chip tone="muted">Coming soon</Chip>}
        </div>

        <h3 className={cn("font-display text-[clamp(1.625rem,3vw,2.5rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance", soon && "text-muted-foreground")}>{project.title}</h3>
        <p className="type-label text-muted-foreground sm:hidden">{project.category}</p>
        <p className={cn("text-sm leading-relaxed text-ink-soft sm:text-[0.9375rem]", soon && "text-muted-foreground")}>{project.description}</p>

        {project.tech.length > 0 && (
          // One line that fades out on phones, where height is tight. Wraps on larger screens.
          <ul className="flex gap-1.5 overflow-hidden mask-[linear-gradient(to_right,black_80%,transparent)] sm:flex-wrap sm:mask-none">
            {project.tech.map((tech) => (
              <li key={tech} className="shrink-0">
                <Chip className="h-6 px-2.5 sm:h-7 sm:px-3">{tech}</Chip>
              </li>
            ))}
          </ul>
        )}

        <div className="relative mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4">
          {project.links.map((link) => (
            <TextLink key={link.href} href={link.href} external>
              {link.label}
            </TextLink>
          ))}
          {soon && <span className="type-label text-muted-foreground">Slot reserved</span>}
        </div>
        </div>
      </Panel>
    </motion.li>
  );
}

/** The screenshot side of a card. On phones it sits on top in a short strip; on wide screens it fills the left column. */
function ProjectMedia({ project }: { project: Project }) {
  return (
    <div className="relative aspect-2/1 shrink-0 overflow-hidden border-b border-line bg-sunk sm:aspect-video lg:aspect-auto lg:min-h-full lg:border-r lg:border-b-0">
      {project.image ? (
        <>
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes="(min-width: 1024px) 32rem, 86vw"
            className="object-cover"
            style={{ objectPosition: project.imagePosition ?? "left top" }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]" />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span className="type-label flex flex-col items-center gap-3 text-muted-foreground">
            <Hammer aria-hidden="true" className="size-6" />
            In progress
          </span>
        </div>
      )}
    </div>
  );
}

/** The showpiece: scrolling down drives a row of cards sideways, each one turning to face you as it passes the centre. */
export function ProjectsSection({ still }: { still: boolean }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const layout = useRef<Layout>({ travel: 0, viewport: 0, centres: [] });
  const [current, setCurrent] = useState(0);
  const progress = useSectionProgress(section, scroll.projects);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => {
      const viewport = window.innerWidth;
      const cards = [...element.children] as HTMLElement[];
      const centres = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
      // The first and last cards both come to rest in the middle of the screen.
      layout.current = { viewport, centres, travel: centres.length ? centres[centres.length - 1] - centres[0] : 0 };
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const along = useTransform(progress, [0.06, 0.94], [0, 1], { clamp: true });
  const x = useTransform(along, (value) => {
    const { centres, viewport, travel } = layout.current;
    const start = centres.length ? viewport / 2 - centres[0] : 0;
    return start - value * travel;
  });
  const wordX = useTransform(progress, [0, 1], ["35%", "-75%"]);
  const rail = useTransform(along, [0, 1], [0, 1]);
  const headerY = useTransform(progress, [0, 0.06], ["8vh", "0vh"]);
  const headerOpacity = useTransform(progress, [0, 0.06, 0.95, 1], [0, 1, 1, 0]);

  useMotionValueEvent(along, "change", (value) => setCurrent(Math.round(value * (PROJECTS.length - 1))));

  if (still) {
    return (
      <section id="projects" ref={section} aria-labelledby="projects-title" className="px-(--gutter) py-(--section)">
        <MonoLabel dot>
          <span className="text-sky">02</span>Projects
        </MonoLabel>
        <h2 id="projects-title" className="type-h2 mt-5 mb-10">
          Things I&apos;ve built
        </h2>
        <ul ref={track} className="flex flex-wrap gap-6">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} x={x} layout={layout} still />
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section id="projects" ref={section} aria-labelledby="projects-title" className="relative" style={{ height: `${PROJECTS.length * 70 + 120}lvh` }}>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 font-display text-[34vw] leading-none font-semibold tracking-[-0.06em] whitespace-nowrap text-transparent uppercase select-none [-webkit-text-stroke:1px_var(--line-strong)]"
          style={{ x: wordX }}
        >
          Projects
        </motion.span>

        <motion.header className="relative flex items-end justify-between gap-6 px-(--gutter) pt-16 sm:pt-20" style={{ y: headerY, opacity: headerOpacity }}>
          <div className="flex flex-col gap-3">
            <MonoLabel dot>
              <span className="text-sky">02</span>Projects
            </MonoLabel>
            <h2 id="projects-title" className="type-h2">
              Things I&apos;ve built
            </h2>
          </div>
          <p className="type-label hidden pb-2 text-muted-foreground sm:block" aria-live="polite">
            <span className="text-foreground">{pad(current + 1)}</span> / {pad(PROJECTS.length)}
          </p>
        </motion.header>

        <div className="relative flex flex-1 items-center">
          <motion.ul ref={track} className="flex items-stretch gap-[6vw] will-change-transform sm:gap-[4vw]" style={{ x }}>
            {PROJECTS.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} x={x} layout={layout} still={false} />
            ))}
          </motion.ul>
        </div>

        <motion.div className="relative mx-(--gutter) mb-24 flex items-center gap-4 sm:mb-28" style={{ opacity: headerOpacity }}>
          <span className="type-label text-muted-foreground sm:hidden">
            {pad(current + 1)} / {pad(PROJECTS.length)}
          </span>
          <div className="h-px flex-1 bg-line-strong">
            <motion.div className="h-px origin-left bg-sky-bright shadow-[0_0_10px_var(--glow)]" style={{ scaleX: rail }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
