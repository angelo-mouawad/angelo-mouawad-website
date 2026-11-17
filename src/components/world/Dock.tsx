"use client";

import { AnimatePresence, motion, type MotionValue, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { type MouseEvent, type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DockItem {
  id: string;
  title: string;
  icon: ReactNode;
  href?: string;
  /** Runs on click. Call event.preventDefault() to take over from the link. */
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
  onHover?: (hovering: boolean) => void;
  active?: boolean;
}

const REST = 44;
const PEAK = 66;
const REACH = 130;

/**
 * The site's one dock: a glass bar whose icons swell under a mouse, as on a desktop OS.
 * Touch screens get a steady bar with small captions instead, since there is no hover to reveal names.
 */
export function Dock({ items, label, className }: { items: DockItem[]; label: string; className?: string }) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  return (
    <nav aria-label={label} className={cn("pointer-events-auto", className)}>
      <motion.ul
        onMouseMove={(event) => mouseX.set(event.pageX)}
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        className="glass flex h-[62px] items-end gap-2 rounded-[22px] px-2.5 pb-[9px] [@media(hover:none)]:h-auto [@media(hover:none)]:items-stretch [@media(hover:none)]:gap-1 [@media(hover:none)]:px-1.5 [@media(hover:none)]:py-1.5"
      >
        {items.map((item) => (
          <DockIcon key={item.id} item={item} mouseX={mouseX} />
        ))}
      </motion.ul>
    </nav>
  );
}

function DockIcon({ item, mouseX }: { item: DockItem; mouseX: MotionValue<number> }) {
  const tile = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    const bounds = tile.current?.getBoundingClientRect();
    return bounds ? x - window.scrollX - bounds.x - bounds.width / 2 : Number.POSITIVE_INFINITY;
  });
  const size = useSpring(useTransform(distance, [-REACH, 0, REACH], [REST, PEAK, REST]), { mass: 0.1, stiffness: 170, damping: 14 });
  const glyph = useTransform(size, [REST, PEAK], [20, 30]);

  const hover = (value: boolean) => {
    setHovered(value);
    item.onHover?.(value);
  };

  const content = (
    <>
      <motion.div
        ref={tile}
        style={{ width: size, height: size }}
        className={cn(
          "relative grid place-items-center rounded-2xl border border-line bg-card/70 text-ink-soft transition-colors duration-300 group-hover/dock:text-foreground [@media(hover:none)]:!size-11",
          item.active && "border-sky-bright/40 bg-accent text-accent-foreground",
        )}
      >
        <motion.span style={{ width: glyph, height: glyph }} className="grid place-items-center [&_svg]:size-full [@media(hover:none)]:!size-5">
          {item.icon}
        </motion.span>
        {item.active && <span className="absolute -bottom-1.5 size-1 rounded-full bg-sky-bright [@media(hover:none)]:hidden" />}
      </motion.div>
      <span className="type-label hidden pt-1 text-[0.5625rem] tracking-[0.1em] text-muted-foreground [@media(hover:none)]:block">{item.title}</span>
      <AnimatePresence>
        {hovered && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, y: 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            transition={{ duration: 0.18 }}
            className="type-label glass-strong pointer-events-none absolute -top-9 left-1/2 rounded-full px-2.5 py-1.5 whitespace-nowrap text-foreground [@media(hover:none)]:hidden"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  const shared = {
    className: "group/dock relative flex flex-col items-center rounded-2xl outline-offset-2 [@media(hover:none)]:min-w-14",
    "aria-current": item.active ? ("page" as const) : undefined,
    onMouseEnter: () => hover(true),
    onMouseLeave: () => hover(false),
    onFocus: () => hover(true),
    onBlur: () => hover(false),
    onClick: item.onSelect,
  };

  return (
    <li className="flex">
      {item.href ? (
        <Link href={item.href} aria-label={item.title} {...shared}>
          {content}
        </Link>
      ) : (
        <button type="button" aria-label={item.title} {...shared}>
          {content}
        </button>
      )}
    </li>
  );
}
