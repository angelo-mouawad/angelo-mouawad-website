"use client";

import { Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BackToRoom } from "@/components/world/BackToRoom";
import { BrandIcon } from "@/components/world/BrandIcon";
import { Reveal, RevealText } from "@/components/world/motion";
import { Container, MonoLabel, Panel, TextLink } from "@/components/world/primitives";
import { WorldShell } from "@/components/world/WorldShell";
import { PROFILE } from "@/data/profile";
import { ContactForm } from "./ContactForm";
import { Hero } from "./Hero";
import { Offer, Process } from "./Offer";
import { Showcase } from "./Showcase";

function Contact() {
  const others = PROFILE.socials.flatMap((social) => (social.id === "email" ? [] : [{ ...social, id: social.id }]));
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-20 border-t border-line py-(--section)">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="flex flex-col gap-7">
          <MonoLabel dot>
            <span className="text-sky">04</span>Start a project
          </MonoLabel>
          <h2 id="contact-title" className="type-h1 text-balance">
            <RevealText text="Tell me about" /> <RevealText text="your site." wordClassName="text-aurora" delay={0.15} />
          </h2>
          <p className="type-lead">Send a few lines about what you need. I&apos;ll come back with questions, ideas and what it would take.</p>
          <Reveal className="flex flex-col gap-4 border-t border-line pt-7">
            <p className="type-body">Prefer email? Write to me directly.</p>
            <a href={`mailto:${PROFILE.email}`} className={`${buttonVariants({ variant: "glass", size: "lg" })} self-start`}>
              <Mail aria-hidden="true" /> {PROFILE.email}
            </a>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
              {others.map((social) => (
                <li key={social.id} className="flex items-center gap-2 text-ink-soft">
                  <BrandIcon brand={social.id} className="size-4" />
                  <TextLink href={social.href} external>
                    {social.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Panel surface="glass" ticks className="p-6 sm:p-9">
            <ContactForm />
          </Panel>
        </Reveal>
      </Container>
    </section>
  );
}

/** The services page. It has to prove the point on its own, so it is the most worked page on the site. */
export function WebsitesPage() {
  return (
    <WorldShell
      label="Web design and build"
      smooth
      actions={
        <a href="#contact" className={buttonVariants({ size: "sm" })}>
          Start a project
        </a>
      }
    >
      <Hero />
      <Offer />
      <Showcase />
      <Process />
      <Contact />
      <footer className="border-t border-line py-10">
        <Container wide className="flex flex-wrap items-center justify-between gap-4">
          <MonoLabel>Designed and built by Angelo Mouawad</MonoLabel>
          <BackToRoom />
        </Container>
      </footer>
    </WorldShell>
  );
}
