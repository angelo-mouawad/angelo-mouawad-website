"use client";

import { AnimatePresence, motion } from "motion/react";
import { Component, createContext, type ErrorInfo, type ReactNode, useCallback, useContext, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Nav } from "@/lib/bible/types/nav";
import type { ChapterStatus } from "@/lib/bible/types/storage";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MonoLabel, Panel } from "@/components/world/primitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export const fieldClass =
  "h-10 w-full rounded-xl border border-input bg-card/70 px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground focus-visible:border-sky-bright focus-visible:ring-3 focus-visible:ring-ring/30";

export const STATUS_LABEL: Record<ChapterStatus, string> = { unread: "Unread", "in-progress": "In progress", completed: "Completed" };

/** How a chapter tile looks for each reading state. Shared by the sidebar and the progress page. */
export function chapterTone(status: ChapterStatus, current = false) {
  if (current) return "border-primary bg-primary text-primary-foreground";
  if (status === "completed") return "border-sky-bright/30 bg-accent text-accent-foreground hover:border-sky-bright";
  if (status === "in-progress") return "border-dashed border-sky-bright/70 bg-card/70 text-foreground hover:bg-accent/60";
  return "border-line bg-card/60 text-ink-soft hover:border-line-strong hover:text-foreground";
}

export type BibleNav = Nav & { openSettings: () => void; openBooks: () => void };

const NavContext = createContext<BibleNav | null>(null);

export const NavProvider = NavContext.Provider;

export function useNav(): BibleNav {
  const nav = useContext(NavContext);
  if (!nav) throw new Error("useNav must be used inside the Bible shell");
  return nav;
}

/**
 * The one progress ring used across the Bible: a round track that fills clockwise from the top,
 * with the number in the middle when there is room for it.
 */
export function ProgressRing({
  value,
  size = 96,
  stroke,
  display,
  caption,
  label,
  className,
}: {
  /** Fraction complete, from 0 to 1. */
  value: number;
  size?: number;
  stroke?: number;
  display?: string;
  caption?: string;
  /** Spoken description. Leave it out when the text beside the ring already says the same thing. */
  label?: string;
  className?: string;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const fraction = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const width = stroke ?? Math.max(2.5, size * 0.085);
  const radius = (size - width) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--cyan)" }} />
            <stop offset="1" style={{ stopColor: "var(--sky)" }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={width} className="ring-track stroke-line-strong" />
        {fraction > 0 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - fraction) }}
            transition={{ duration: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={size >= 88 ? { filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--glow) 60%, transparent))" } : undefined}
          />
        )}
      </svg>
      {display && (
        <span aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-foreground">
          <span className="font-display leading-none font-semibold tracking-tight tabular-nums" style={{ fontSize: Math.round(size * (display.length > 4 ? 0.19 : 0.25)) }}>
            {display}
          </span>
          {caption && size >= 120 && <span className="type-label text-[0.5625rem] text-muted-foreground">{caption}</span>}
        </span>
      )}
    </span>
  );
}

/** A row of pill choices where exactly one is on. */
export function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
  full = false,
  className,
}: {
  legend: string;
  options: { id: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  full?: boolean;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="sr-only">{legend}</legend>
      <div className={cn("rounded-full border border-line bg-card/60 p-1", full ? "grid auto-cols-fr grid-flow-col" : "inline-flex max-w-full")}>
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-medium whitespace-nowrap text-muted-foreground transition-colors duration-300 hover:text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0",
                active && "bg-primary text-primary-foreground shadow-soft hover:text-primary-foreground",
              )}
            >
              {option.icon}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Label, title and lead at the top of each area, matching the note pages. */
export function PageHeader({ label, title, lead, children }: { label: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5">
      <MonoLabel dot>{label}</MonoLabel>
      <h1 className="type-h1 text-[clamp(2.125rem,4.6vw,3.5rem)] text-balance">{title}</h1>
      {lead && <p className="type-lead max-w-2xl text-pretty">{lead}</p>}
      {children}
    </header>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <Panel surface="sunk" className="flex flex-col items-start gap-3 border-dashed border-line-strong p-6 sm:p-8">
      {icon && <span className="grid size-10 place-items-center rounded-xl border border-line bg-card/70 text-sky [&_svg]:size-4.5">{icon}</span>}
      <h2 className="type-h3">{title}</h2>
      {children && <p className="type-body max-w-xl text-pretty">{children}</p>}
      {action && (
        <Button variant="outline" size="sm" className="mt-1" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Panel>
  );
}

type ConfirmOptions = { title: string; body?: string; confirm: string; destructive?: boolean };

const FeedbackContext = createContext<{ toast: (message: string) => void; confirm: (options: ConfirmOptions) => Promise<boolean> } | null>(null);

export function useToast() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useToast must be used inside FeedbackProvider");
  return context.toast;
}

export function useConfirm() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useConfirm must be used inside FeedbackProvider");
  return context.confirm;
}

/** Short status messages and yes or no questions, both in the site's own surfaces. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null);
  const [question, setQuestion] = useState<{ options: ConfirmOptions; resolve: (ok: boolean) => void; open: boolean } | null>(null);
  const timer = useRef(0);

  const toast = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    setMessage({ id: Date.now(), text });
    timer.current = window.setTimeout(() => setMessage(null), 2600);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setQuestion({ options, resolve, open: true })), []);

  const settle = (ok: boolean) => {
    if (!question?.open) return;
    question.resolve(ok);
    setQuestion({ ...question, open: false });
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {createPortal(
        <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4">
          <AnimatePresence>
            {message && (
              <motion.p
                key={message.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-foreground"
              >
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
      <Dialog open={Boolean(question?.open)} onOpenChange={(open) => !open && settle(false)}>
        <DialogContent showCloseButton={false} role="alertdialog">
          <DialogHeader className="pr-0">
            <DialogTitle>{question?.options.title}</DialogTitle>
            {question?.options.body && <DialogDescription>{question.options.body}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => settle(false)}>
              Cancel
            </Button>
            <Button variant={question?.options.destructive ? "destructive" : "default"} size="sm" onClick={() => settle(true)}>
              {question?.options.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FeedbackContext.Provider>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Section crashed:", error, info.componentStack);
  }

  componentDidUpdate(previous: { resetKey?: string }) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="pt-10">
        <Panel surface="glass" ticks className="flex flex-col items-start gap-3 p-6 sm:p-8">
          <h2 className="type-h3">This section could not be shown</h2>
          <p className="type-body">Your highlights, notes and progress are safe. Try again, or go back to Today.</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
            <a href="#/" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Go to Today
            </a>
          </div>
        </Panel>
      </div>
    );
  }
}
