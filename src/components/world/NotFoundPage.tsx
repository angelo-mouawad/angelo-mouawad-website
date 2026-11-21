import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LINK_IDS, LINKS } from "@/lib/links";
import { cn } from "@/lib/utils";
import { Reveal, RevealGroup, RevealItem } from "./motion";
import { Container, MonoLabel, Panel } from "./primitives";
import { WorldShell } from "./WorldShell";

const DESCRIPTIONS: Record<(typeof LINK_IDS)[number], string> = {
  notes: "Study notes from my courses",
  bible: "The King James Bible with reading plans",
  websites: "Web design work and services",
};

/** Shown for any address the site does not have. Static export writes it to 404.html, which the host serves. */
export function NotFoundPage() {
  return (
    // No top bar: the main button already leads back to the room.
    <WorldShell label="404" bar={false}>
      <Container className="flex min-h-dvh flex-col justify-center gap-12 py-(--section)">
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <MonoLabel dot>Error 404</MonoLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <p aria-hidden="true" className="text-aurora font-display text-[clamp(6rem,22vw,15rem)] leading-[0.85] font-semibold tracking-[-0.06em]">
              404
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex max-w-2xl flex-col gap-4">
            <h1 className="type-h2 text-balance">There&apos;s no room here.</h1>
            <p className="type-lead text-pretty">
              The page you were looking for doesn&apos;t exist. The link may be old, or the address may have a typo.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link href="/" className={cn(buttonVariants({ variant: "glow", size: "lg" }), "group/home")}>
              <ArrowLeft aria-hidden="true" className="group-hover/home:-translate-x-0.5" />
              Back to the room
            </Link>
          </Reveal>
        </div>

        <nav aria-label="Other pages">
          <RevealGroup delay={0.2} className="grid gap-3 sm:grid-cols-3">
            {LINK_IDS.map((id) => (
              <RevealItem key={id}>
                <Link href={LINKS[id].href} className="group/card block h-full rounded-2xl outline-offset-4">
                  <Panel surface="glass" className="flex h-full items-start justify-between gap-4 rounded-2xl p-5 transition-colors duration-300 group-hover/card:bg-[var(--glass-strong)]">
                    <span className="flex flex-col gap-1.5">
                      <span className="font-display text-lg font-medium tracking-tight">{LINKS[id].label}</span>
                      <span className="type-small">{DESCRIPTIONS[id]}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 text-sky transition-transform duration-300 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                  </Panel>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </nav>
      </Container>
    </WorldShell>
  );
}
