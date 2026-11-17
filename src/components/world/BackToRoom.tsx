import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The same way home on every page beyond the room. Compact mode drops to an icon on narrow screens. */
export function BackToRoom({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label="Back to the room" className={cn(buttonVariants({ variant: "glass", size: "sm" }), "group/back", compact && "max-sm:size-9 max-sm:px-0", className)}>
      <ArrowLeft aria-hidden="true" className="group-hover/back:-translate-x-0.5" />
      <span className={cn(compact && "max-sm:hidden")}>Back to the room</span>
    </Link>
  );
}
