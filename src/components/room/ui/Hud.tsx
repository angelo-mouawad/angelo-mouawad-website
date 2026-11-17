"use client";

import { BookOpen, ChevronUp, DoorOpen, MonitorSmartphone, NotebookPen } from "lucide-react";
import { motion, useMotionValueEvent } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Dock, type DockItem } from "@/components/world/Dock";
import { frame } from "@/lib/frame";
import { LINK_IDS, LINKS, type LinkId } from "@/lib/links";
import { scroll, scrollTo } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { useRoom } from "@/store/room";

const ICONS: Record<LinkId, ReactNode> = {
  notes: <NotebookPen aria-hidden="true" />,
  bible: <BookOpen aria-hidden="true" />,
  websites: <MonitorSmartphone aria-hidden="true" />,
};

const SECTIONS: [keyof typeof scroll, string, string][] = [
  ["contact", "03", "Contact"],
  ["projects", "02", "Projects"],
  ["about", "01", "About"],
  ["hero", "00", "Hello"],
];

/**
 * Fixed overlay for the home page: name, progress, the dock that leads to the three pages,
 * and a scroll cue. It wears the dark theme in the room and switches to light inside the monitor.
 */
export function Hud() {
  const phase = useRoom((state) => state.phase);
  const inWorld = useRoom((state) => state.inWorld);
  const activeLink = useRoom((state) => state.activeLink);
  const visible = phase === "ready" || phase === "intro";
  // The overlay changes clothes halfway through the dive, as the light takes over the screen.
  const [light, setLight] = useState(false);
  useMotionValueEvent(scroll.dive, "change", (value) => setLight(value > 0.45));
  const bar = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let label = "";
    const tick = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${total > 0 ? Math.min(window.scrollY / total, 1) : 0})`;
      if (cue.current) cue.current.style.opacity = String(Math.max(0, 1 - frame.progress / 0.04));
      const here = SECTIONS.find(([key]) => scroll[key].get() > 0);
      const next = frame.dive < 0.5 ? "The room" : here ? `${here[1]} / ${here[2]}` : "00 / Hello";
      if (next !== label && section.current) {
        label = next;
        section.current.textContent = next;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const room = useRoom.getState;
  const items: DockItem[] = [
    ...(inWorld ? [{ id: "room", title: "Room", icon: <DoorOpen aria-hidden="true" />, onSelect: () => scrollTo(0) }] : []),
    ...LINK_IDS.map((id) => ({
      id,
      title: LINKS[id].label,
      icon: ICONS[id],
      href: LINKS[id].href,
      active: !inWorld && activeLink === id,
      // In the room, pointing at a dock icon lights up the object it leads to.
      onHover: (hovering: boolean) => {
        if (inWorld) return;
        if (hovering) room().setActiveLink(id);
        else if (room().activeLink === id) room().setActiveLink(null);
      },
      onSelect: (event: React.MouseEvent<HTMLElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        room().leave(id);
      },
    })),
  ];

  return (
    <motion.div
      className={cn("pointer-events-none fixed inset-x-0 top-0 z-40 h-lvh text-foreground", !light && "dark")}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8, delay: visible ? 0.5 : 0 }}
      // Hidden UI must never take clicks or focus.
      inert={!visible}
      style={{ visibility: phase === "loading" ? "hidden" : "visible" }}
    >
      <div ref={bar} className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#4da3ff] to-[#6fe3ff] shadow-[0_0_12px_rgb(111_227_255/0.6)]" />

      <header className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="glass grid size-9 place-items-center rounded-xl font-mono text-xs tracking-wider text-sky">AM</span>
          <p className="type-label hidden text-muted-foreground sm:block">Angelo Mouawad</p>
        </div>
        <p className="type-label flex items-center gap-2 text-muted-foreground">
          <span className="size-1.5 rounded-full bg-sky-bright shadow-[0_0_10px_var(--glow)]" />
          <span ref={section}>The room</span>
        </p>
      </header>

      <div className="absolute inset-x-0 bottom-0 flex h-svh flex-col items-center justify-end gap-4 pb-4 sm:pb-6">
        <div ref={cue} aria-hidden="true" className="glass flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 text-[0.8125rem] font-medium text-foreground/90">
          <span className="relative flex h-[1.125rem] w-3 justify-center rounded-full border-[1.5px] border-[#6fe3ff]/80 pointer-coarse:hidden">
            <span className="scroll-cue-wheel mt-[3px] h-1 w-[2px] rounded-full bg-[#6fe3ff]" />
          </span>
          <ChevronUp className="scroll-cue-swipe hidden size-4 text-[#6fe3ff] pointer-coarse:block" strokeWidth={2.25} />
          <span className="pointer-coarse:hidden">Scroll to step inside</span>
          <span className="hidden pointer-coarse:inline">Swipe up to step inside</span>
        </div>
        {visible && <Dock items={items} label="Places to go" />}
      </div>
    </motion.div>
  );
}
