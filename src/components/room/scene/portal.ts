import { SCREEN } from "./layout";

/**
 * The monitor is a window into the world layer. At the end of the room's path the camera sits so the
 * viewport covers this fraction of the screen, and from there on the world layer simply is the viewport.
 */
export const FILL = 0.97;

/** Camera progress over which the live world layer fades in on top of the monitor's own picture of it. */
export const REVEAL = [0.8, 0.92] as const;

/** The part of the screen (in metres) that the viewport covers at the end of the room. */
export function fillRect(aspect: number) {
  const height = FILL * Math.min(SCREEN.height, SCREEN.width / aspect);
  return { width: height * aspect, height };
}

/** The whole monitor screen in the pixel space of a viewport-sized layer. It always reaches past the layer's edges. */
export function screenInLayer(width: number, height: number) {
  const fill = fillRect(width / height);
  const w = (SCREEN.width / fill.width) * width;
  const h = (SCREEN.height / fill.height) * height;
  return { left: (width - w) / 2, top: (height - h) / 2, width: w, height: h };
}

/** The world layer element. The room's camera rig maps it onto the monitor every frame. */
export const portal = { element: null as HTMLDivElement | null };

/** Maps a width × height box onto a quad (top left, top right, bottom right, bottom left) as a CSS matrix3d. */
export function quadTransform(width: number, height: number, quad: number[]) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = quad;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3;
  const sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(den) < 1e-9) return null;
  const g = (sx * dy2 - dx2 * sy) / den;
  const h = (dx1 * sy - sx * dy1) / den;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + h * y3;
  const m = [a / width, d / width, 0, g / width, b / height, e / height, 0, h / height, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.map((value) => +value.toFixed(8)).join(",")})`;
}
