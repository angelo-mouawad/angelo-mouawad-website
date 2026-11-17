/** How the visitor points at things. Decides hit areas and labels, not rendering cost. */
export type Tier = "phone" | "tablet" | "desktop";

/** Which rendering preset the device gets. Laptops and other weak GPUs with a mouse get "laptop". */
export type Profile = Tier | "laptop";

export interface Quality {
  tier: Tier;
  profile: Profile;
  dpr: number;
  moonShadow: number;
  lampShadow: boolean;
  ambientOcclusion: boolean;
  /** MSAA samples on the effect composer. 0 turns it off. */
  multisampling: number;
  /** Cheap post-process anti-aliasing, used where MSAA is too expensive. */
  smaa: boolean;
  dust: number;
  /** Resolution of the selection outline mask. */
  outlineWidth: number;
  /** MSAA samples for the monitor's picture of the world. */
  screenSamples: number;
  /** Redraw the monitor's picture every n frames while the screen is small in view. */
  screenEvery: number;
  /** Pixel-ratio cap for the world layer's canvas behind the monitor. */
  worldDpr: number;
}

const QUALITY: Record<Profile, Omit<Quality, "tier" | "profile">> = {
  phone: { dpr: 1.25, moonShadow: 1024, lampShadow: false, ambientOcclusion: false, multisampling: 0, smaa: false, dust: 90, outlineWidth: 700, screenSamples: 2, screenEvery: 2, worldDpr: 1.5 },
  tablet: { dpr: 1.5, moonShadow: 1024, lampShadow: false, ambientOcclusion: false, multisampling: 0, smaa: false, dust: 150, outlineWidth: 700, screenSamples: 2, screenEvery: 2, worldDpr: 1.5 },
  laptop: { dpr: 1.25, moonShadow: 1024, lampShadow: false, ambientOcclusion: false, multisampling: 0, smaa: true, dust: 180, outlineWidth: 900, screenSamples: 2, screenEvery: 2, worldDpr: 1.25 },
  desktop: { dpr: 1.75, moonShadow: 2048, lampShadow: true, ambientOcclusion: true, multisampling: 4, smaa: false, dust: 260, outlineWidth: 1100, screenSamples: 4, screenEvery: 1, worldDpr: 1.5 },
};

export function detectTier(): Tier {
  if (!window.matchMedia("(pointer: coarse)").matches) return "desktop";
  return Math.min(window.innerWidth, window.innerHeight) < 600 ? "phone" : "tablet";
}

let renderer: string | null | undefined;

/** The GPU's name as WebGL reports it, e.g. "ANGLE (Intel, Intel(R) UHD Graphics 620 ...)". Null when hidden. */
export function gpuName(): string | null {
  if (renderer !== undefined) return renderer;
  renderer = null;
  try {
    const canvas = document.createElement("canvas");
    // Same preference as the real canvases, so dual-GPU laptops report the GPU that will actually draw.
    const gl = (canvas.getContext("webgl2", { powerPreference: "high-performance" }) ??
      canvas.getContext("webgl", { powerPreference: "high-performance" })) as WebGLRenderingContext | null;
    if (gl) {
      let name = String(gl.getParameter(gl.RENDERER));
      // Chrome and Safari only give the real name through the debug extension; Firefox gives it directly.
      if (/^webkit webgl$/i.test(name)) {
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        if (info) name = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
      }
      renderer = name;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    renderer = null;
  }
  return renderer;
}

// Integrated and entry-level GPUs: Intel HD/UHD/Iris and Meteor Lake Arc (not the discrete Arc A/B cards),
// AMD APUs, GeForce MX, and software renderers.
const WEAK_GPU = /intel|radeon(\(tm\))? (graphics|vega|\d{3}m\b)|vega \d+ graphics|geforce mx|swiftshader|llvmpipe|software|basic render/i;
const DISCRETE_ARC = /arc(\(tm\))? [ab]\d{3}/i;

/** True on GPUs and machines that cannot carry the full desktop preset at a high pixel ratio. */
export function isWeakDevice() {
  const name = gpuName();
  if (name && WEAK_GPU.test(name) && !DISCRETE_ARC.test(name)) return true;
  const cores = navigator.hardwareConcurrency;
  if (cores && cores <= 4) return true;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return memory !== undefined && memory <= 4;
}

/** `?quality=laptop` (or phone, tablet, desktop) forces a preset, for comparing them on one machine. */
function forcedProfile(): Profile | null {
  const value = new URLSearchParams(window.location.search).get("quality");
  return value && value in QUALITY ? (value as Profile) : null;
}

export function detectQuality(): Quality {
  const tier = detectTier();
  const profile: Profile = forcedProfile() ?? (tier === "desktop" && isWeakDevice() ? "laptop" : tier);
  return { tier, profile, ...QUALITY[profile] };
}

/**
 * Cheaper versions of a preset, in the order they are given up when the frame rate stays low:
 * ambient occlusion first, then MSAA (swapped for SMAA), then pixel ratio in quarter steps down to 1.
 * Shadow sizes are fixed at start, since changing them live would recompile every material.
 */
export function qualitySteps(base: Quality): Quality[] {
  const steps: Quality[] = [base];
  let current = base;
  if (current.ambientOcclusion) steps.push((current = { ...current, ambientOcclusion: false }));
  if (current.multisampling > 0) steps.push((current = { ...current, multisampling: 0, smaa: true }));
  while (current.dpr > 1) steps.push((current = { ...current, dpr: Math.max(1, current.dpr - 0.25) }));
  return steps;
}

/**
 * The lowest step a recovering frame rate may climb back to. Turning effects back on rebuilds the composer and
 * tends to flip-flop, so only pixel-ratio steps are ever undone.
 */
export function effectFloor(steps: Quality[]) {
  const index = steps.findIndex((step) => step.dpr < steps[0].dpr);
  return index === -1 ? steps.length - 1 : index - 1;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
