"use client";

import { ArrowUp, ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { motion, type MotionValue, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { BrandIcon } from "@/components/world/BrandIcon";
import { RevealText } from "@/components/world/motion";
import { Container, MonoLabel, Panel } from "@/components/world/primitives";
import { PROFILE, type Social } from "@/data/profile";
import { LINK_IDS, LINKS } from "@/lib/links";
import { scroll, scrollTo } from "@/lib/scroll";
import { useSectionProgress } from "./useSectionProgress";

// Each tile arrives from a different edge of the screen.
const ORIGINS: [string, string][] = [
  ["-60vw", "0vh"],
  ["0vw", "-60vh"],
  ["0vw", "60vh"],
  ["60vw", "0vh"],
];

function SocialTile({ social, index, progress, still }: { social: Social; index: number; progress: MotionValue<number>; still: boolean }) {
  const [fromX, fromY] = ORIGINS[index % ORIGINS.length];
  const window: [number, number] = [0.12 + index * 0.06, 0.5 + index * 0.06];
  const x = useTransform(progress, window, [fromX, "0vw"]);
  const y = useTransform(progress, window, [fromY, "0vh"]);
  const rotate = useTransform(progress, window, [(index % 2 ? 1 : -1) * 16, 0]);
  const opacity = useTransform(progress, [window[0], window[0] + 0.15], [0, 1]);
  const external = social.id !== "email";

  return (
    <motion.li className="will-change-transform" style={still ? undefined : { x, y, rotate, opacity }}>
      <a
        href={social.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group/tile block h-full rounded-3xl outline-offset-4 transition-transform duration-500 ease-out-expo hover:-translate-y-1.5"
      >
        <Panel surface="glass" className="flex h-full flex-col gap-3 p-3.5 transition-shadow duration-500 group-hover/tile:shadow-glow sm:gap-8 sm:p-7">
          <div className="flex items-start justify-between">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground sm:size-11 sm:rounded-2xl [&_svg]:size-4 sm:[&_svg]:size-5">
              {social.id === "email" ? <Mail aria-hidden="true" /> : <BrandIcon brand={social.id} />}
            </span>
            <ArrowUpRight aria-hidden="true" className="size-5 text-muted-foreground transition-transform duration-500 ease-out-expo group-hover/tile:translate-x-1 group-hover/tile:-translate-y-1 group-hover/tile:text-sky" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-base font-medium tracking-tight sm:text-xl">{social.label}</span>
            <span className="type-small hidden break-all sm:block">{social.handle}</span>
            {external && <span className="sr-only">(opens in a new tab)</span>}
          </div>
        </Panel>
      </a>
    </motion.li>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };
  return (
    <Button variant="glass" onClick={copy} aria-live="polite">
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy my email"}
    </Button>
  );
}

/** The end of the dive: four ways to reach Angelo fly in from four sides, then the way back up. */
export function ContactSection({ still }: { still: boolean }) {
  const section = useRef<HTMLElement>(null);
  const progress = useSectionProgress(section, scroll.contact);
  const headingScale = useTransform(progress, [0, 0.4], [0.82, 1]);
  const { contact, socials, email } = PROFILE;

  return (
    <section id="contact" ref={section} aria-labelledby="contact-title" className="relative" style={{ height: still ? "auto" : "230lvh" }}>
      <div className={still ? "py-(--section)" : "sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-14 pb-36 sm:pb-28"}>
        <Container className="flex flex-col gap-5 sm:gap-10">
          <motion.div className="flex origin-left flex-col gap-3.5 sm:gap-5" style={still ? undefined : { scale: headingScale }}>
            <MonoLabel dot>
              <span className="text-sky">03</span>Contact me
            </MonoLabel>
            <h2 id="contact-title" className="type-h1 text-balance">
              <RevealText text={contact.heading} />
            </h2>
            <p className="max-w-xl text-[0.9375rem] leading-relaxed text-ink-soft sm:text-lg">{contact.lead}</p>
            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${email}`} className={buttonVariants({ variant: "glow" })}>
                <Mail aria-hidden="true" /> {email}
              </a>
              <CopyEmail />
            </div>
          </motion.div>

          <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {socials.map((social, index) => (
              <SocialTile key={social.id} social={social} index={index} progress={progress} still={still} />
            ))}
          </ul>
        </Container>
      </div>

      <footer className={still ? "border-t border-line py-10" : "absolute inset-x-0 bottom-0 border-t border-line bg-background/70 py-6 backdrop-blur-md"}>
        <Container wide className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <Button variant="outline" size="sm" onClick={() => scrollTo(0)}>
            <ArrowUp /> Back up to the room
          </Button>
          <nav aria-label="Other pages" className="flex flex-wrap gap-x-6 gap-y-2">
            {LINK_IDS.map((id) => (
              <Link key={id} href={LINKS[id].href} className="link-line type-label pb-1 text-ink-soft">
                {LINKS[id].label}
              </Link>
            ))}
          </nav>
          <MonoLabel>Built by Angelo Mouawad</MonoLabel>
        </Container>
      </footer>
    </section>
  );
}
