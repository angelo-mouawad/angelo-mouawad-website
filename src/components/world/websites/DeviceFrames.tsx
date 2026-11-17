import Image from "next/image";
import { cn } from "@/lib/utils";

/** A browser window around a desktop screenshot. */
export function BrowserFrame({ src, alt, url, className, priority = false }: { src: string; alt: string; url: string; className?: string; priority?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line-strong bg-card shadow-lift", className)}>
      <div className="flex h-9 items-center gap-3 border-b border-line bg-sunk px-3.5">
        <span aria-hidden="true" className="flex gap-1.5">
          {["#ff6b5e", "#f5bd4f", "#5fcf65"].map((dot) => (
            <span key={dot} className="size-2.5 rounded-full" style={{ background: dot }} />
          ))}
        </span>
        <span className="type-label mx-auto flex h-5 min-w-0 max-w-[60%] items-center truncate rounded-full bg-card px-3 text-[0.5625rem] tracking-[0.08em] text-muted-foreground normal-case">
          {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </span>
        <span aria-hidden="true" className="w-10" />
      </div>
      <Image src={src} alt={alt} width={1440} height={900} priority={priority} sizes="(min-width: 1024px) 60vw, 92vw" className="block h-auto w-full" />
    </div>
  );
}

/** A phone around a mobile screenshot. */
export function PhoneFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] border-[6px] border-foreground bg-foreground shadow-lift", className)}>
      <span aria-hidden="true" className="absolute top-1.5 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-foreground" />
      <Image src={src} alt={alt} width={780} height={1688} sizes="(min-width: 1024px) 16vw, 36vw" className="block h-auto w-full rounded-[1.6rem]" />
    </div>
  );
}
