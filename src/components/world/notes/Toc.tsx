"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/notes/render";
import { cn } from "@/lib/utils";

function Links({ headings, active }: { headings: Heading[]; active: string }) {
  return (
    <ul className="flex flex-col border-l border-line">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            aria-current={active === heading.id ? "location" : undefined}
            className={cn(
              "-ml-px block border-l border-transparent py-1.5 text-[0.8125rem] leading-snug text-muted-foreground transition-colors duration-200 hover:text-foreground",
              heading.depth === 2 ? "pl-4" : "pl-7",
              active === heading.id && "border-sky-bright font-medium text-sky",
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Table of contents for the open note. A side column on wide screens, a fold-out above the text otherwise. */
export function Toc({ headings, variant }: { headings: Heading[]; variant: "side" | "inline" }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (variant !== "side") return;
    const targets = headings.map((heading) => document.getElementById(heading.id)).filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -65% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [headings, variant]);

  if (headings.length < 2) return null;

  if (variant === "inline") {
    return (
      <details className="group rounded-2xl border border-line bg-card/60 px-4 py-3 2xl:hidden">
        <summary className="type-label flex cursor-pointer list-none items-center justify-between text-muted-foreground [&::-webkit-details-marker]:hidden">
          On this page
          <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>
        <nav aria-label="On this page" className="pt-3">
          <Links headings={headings} active="" />
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden max-h-[calc(100dvh-8rem)] scroll-thin flex-col gap-4 overflow-y-auto overscroll-contain pr-2 2xl:flex">
      <p className="type-label text-muted-foreground">On this page</p>
      <Links headings={headings} active={active} />
    </nav>
  );
}
