import Image from "next/image";
import { Keypad, SpeakerGrid, Trackpad } from "@/components/vendor/MacbookScroll";
import { cn } from "@/lib/utils";

/**
 * An open MacBook around a desktop screenshot: the same black bezel, keyboard, speakers and trackpad
 * as the scroll MacBook on /websites, standing still. It is drawn at its natural 32rem width and scaled
 * to size with --mac-scale (set it in className, for example "[--mac-scale:0.6]").
 */
export function MacbookFrame({ src, alt, position = "left top", className }: { src: string; alt: string; position?: string; className?: string }) {
  return (
    <div className={cn("relative h-[calc(42rem*var(--mac-scale,1))] w-[calc(32rem*var(--mac-scale,1))] shrink-0", className)}>
      <div className="absolute top-0 left-0 w-[32rem] origin-top-left" style={{ transform: "scale(var(--mac-scale, 1))" }}>
        {/* Lid */}
        <div className="relative h-[20rem] w-[32rem] rounded-2xl bg-[#010101] p-2 shadow-lift">
          <div className="relative size-full overflow-hidden rounded-lg bg-[#272729]">
            <Image src={src} alt={alt} fill sizes="(min-width: 1280px) 23rem, 19rem" className="object-cover" style={{ objectPosition: position }} />
          </div>
        </div>
        {/* Base */}
        <div className="relative h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]">
          <div className="relative h-10 w-full">
            <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
          </div>
          <div className="relative flex">
            <div className="mx-auto h-full w-[10%] overflow-hidden">
              <SpeakerGrid />
            </div>
            <div className="mx-auto h-full w-[80%]">
              <Keypad />
            </div>
            <div className="mx-auto h-full w-[10%] overflow-hidden">
              <SpeakerGrid />
            </div>
          </div>
          <Trackpad />
          <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
        </div>
      </div>
    </div>
  );
}

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
