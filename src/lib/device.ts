export type Tier = "phone" | "tablet" | "desktop";

export interface Quality {
  tier: Tier;
  dpr: number;
  moonShadow: number;
  lampShadow: boolean;
  ambientOcclusion: boolean;
  multisampling: number;
  dust: number;
}

const QUALITY: Record<Tier, Omit<Quality, "tier">> = {
  phone: { dpr: 1.25, moonShadow: 1024, lampShadow: false, ambientOcclusion: false, multisampling: 0, dust: 90 },
  tablet: { dpr: 1.5, moonShadow: 1024, lampShadow: false, ambientOcclusion: false, multisampling: 0, dust: 150 },
  desktop: { dpr: 1.75, moonShadow: 2048, lampShadow: true, ambientOcclusion: true, multisampling: 4, dust: 260 },
};

export function detectTier(): Tier {
  if (!window.matchMedia("(pointer: coarse)").matches) return "desktop";
  return Math.min(window.innerWidth, window.innerHeight) < 600 ? "phone" : "tablet";
}

export function detectQuality(): Quality {
  const tier = detectTier();
  return { tier, ...QUALITY[tier] };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
