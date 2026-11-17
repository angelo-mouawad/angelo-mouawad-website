import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft glows and a fine grid behind every page of the bright world. */
export function WorldBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none fixed inset-0 -z-10 h-lvh overflow-hidden bg-background", className)}>
      <div className="world-glow absolute inset-0" />
      <div className="world-grid absolute inset-0" />
    </div>
  );
}

/** Small mono caption, in the spirit of the old PRJ_01 tags. */
export function MonoLabel({ children, className, dot = false }: { children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("type-label inline-flex items-center gap-2 text-muted-foreground", className)}>
      {dot && <span className="size-1.5 rounded-full bg-sky-bright shadow-[0_0_10px_var(--glow)]" />}
      {children}
    </span>
  );
}

export function Chip({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "accent" | "muted" }) {
  return (
    <span
      className={cn(
        "type-label inline-flex h-7 items-center rounded-full border px-3 tracking-[0.12em]",
        tone === "neutral" && "border-line-strong bg-card/70 text-ink-soft",
        tone === "accent" && "border-sky-bright/30 bg-accent text-accent-foreground",
        tone === "muted" && "border-dashed border-line-strong text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

type PanelProps = ComponentProps<"div"> & {
  /** glass floats over the backdrop, solid sits on it, sunk recedes into it. */
  surface?: "glass" | "solid" | "sunk";
  ticks?: boolean;
};

export function Panel({ surface = "glass", ticks = false, className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        surface === "glass" && "glass",
        surface === "solid" && "panel",
        surface === "sunk" && "border border-line bg-sunk",
        ticks && "ticks",
        className,
      )}
      {...props}
    />
  );
}

type TextLinkProps = Omit<ComponentProps<typeof Link>, "className"> & { className?: string; external?: boolean };

/** Inline link with a drawn underline. External links open in a new tab and say so. */
export function TextLink({ children, className, external = false, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn("link-line group/link inline-flex items-center gap-1 pb-0.5 font-medium text-sky outline-offset-4", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
      {external && (
        <>
          <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 ease-out-expo group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </Link>
  );
}

export function SectionHeading({
  index,
  label,
  title,
  lead,
  as: Heading = "h2",
  className,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <header className={cn("flex max-w-3xl flex-col gap-5", className)}>
      <MonoLabel dot>
        {index && <span className="text-sky">{index}</span>}
        {label}
      </MonoLabel>
      <Heading className="type-h2 text-balance">{title}</Heading>
      {lead && <p className="type-lead max-w-2xl text-pretty">{lead}</p>}
    </header>
  );
}

export function Container({ className, wide = false, ...props }: ComponentProps<"div"> & { wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-(--gutter)", wide ? "max-w-[90rem]" : "max-w-6xl", className)} {...props} />;
}
