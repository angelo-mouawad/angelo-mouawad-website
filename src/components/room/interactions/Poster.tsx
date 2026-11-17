"use client";

import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { canvasTexture, fontFamily } from "@/components/room/scene/textures";
import { LinkObject } from "./LinkObject";

const SIZE = { width: 0.62, height: 0.88 };
// Laid out on a 744 × 1056 grid and drawn at 1.5× so the small type stays sharp.
const LAYOUT = { width: 744, height: 1056 };
const RES = 1.5;
const CANVAS = { width: LAYOUT.width * RES, height: LAYOUT.height * RES };

// The site's light theme: see the colour tokens in globals.css.
const PAGE = "#f4f7fb";
const INK = "#0b1220";
const MUTED = "#52627a";
const ICE = "#e1f0fb";
const DEEP = "#0b6bdc";
const SKY = "#2f9bff";
const CYAN = "#12b5e5";
const GRID = "rgba(18,80,150,0.07)";

function aurora(ctx: CanvasRenderingContext2D, x0: number, x1: number) {
  const gradient = ctx.createLinearGradient(x0, 0, x1, 0);
  gradient.addColorStop(0, DEEP);
  gradient.addColorStop(0.55, SKY);
  gradient.addColorStop(1, CYAN);
  return gradient;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** A studio ad in the site's own look: unmistakably an offer to build you a website. */
function drawPoster(ctx: CanvasRenderingContext2D) {
  const { width: w, height: h } = LAYOUT;
  const sans = fontFamily("--font-sans");
  const mono = fontFamily("--font-mono");
  ctx.setTransform(RES, 0, 0, RES, 0, 0);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Pale page with the same corner glows and faint grid as the site.
  ctx.fillStyle = PAGE;
  ctx.fillRect(0, 0, w, h);
  for (const [x, y, r, colour] of [
    [w * 0.1, -h * 0.05, w * 0.9, "rgba(111,227,255,0.38)"],
    [w * 0.95, h * 0.12, w * 0.75, "rgba(143,184,255,0.34)"],
  ] as const) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, colour);
    glow.addColorStop(1, "rgba(244,247,251,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 37.2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 37.2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Masthead.
  ctx.fillStyle = SKY;
  ctx.beginPath();
  ctx.arc(60, 59, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = `600 20px ${mono}`;
  ctx.fillText("A.M. WEB STUDIO", 78, 49);
  ctx.textAlign = "right";
  ctx.fillStyle = DEEP;
  ctx.fillText("NOW BOOKING", w - 52, 49);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(11,18,32,0.14)";
  ctx.fillRect(52, 88, w - 104, 2);

  // Headline.
  ctx.font = `900 112px ${sans}`;
  ctx.fillStyle = INK;
  ctx.fillText("NEED A", 48, 112);
  ctx.fillStyle = aurora(ctx, 48, 690);
  ctx.fillText("WEBSITE?", 48, 222);
  ctx.font = `500 27px ${sans}`;
  ctx.fillStyle = MUTED;
  ctx.fillText("I design and build websites that feel", 52, 352);
  ctx.fillText("made for you, from sketch to live domain.", 52, 388);

  // A client site in a browser window, with the cursor going for its button.
  const bx = 52;
  const by = 448;
  const bw = w - 104;
  const bh = 300;
  ctx.fillStyle = "rgba(20,60,120,0.16)";
  roundRect(ctx, bx + 4, by + 14, bw, bh, 20);
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, bx, by, bw, bh, 20);
  ctx.fillStyle = "#edf2f8";
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, 48, [20, 20, 0, 0]);
  ctx.fill();
  ["#c3d3e6", "#c3d3e6", "#c3d3e6"].forEach((colour, index) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(bx + 28 + index * 22, by + 24, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, bx + 110, by + 11, bw - 150, 26, 13);
  ctx.fillStyle = MUTED;
  ctx.font = `500 16px ${mono}`;
  ctx.fillText("yourbusiness.com", bx + 128, by + 16);

  const hx = bx + 22;
  const hy = by + 66;
  const hw = bw - 44;
  ctx.fillStyle = aurora(ctx, hx, hx + hw);
  roundRect(ctx, hx, hy, hw, 142, 14);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  roundRect(ctx, hx + 26, hy + 26, 290, 22, 6);
  roundRect(ctx, hx + 26, hy + 58, 200, 22, 6);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  roundRect(ctx, hx + 26, hy + 92, 340, 10, 5);
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, hx + hw - 196, hy + 84, 160, 40, 20);
  ctx.fillStyle = DEEP;
  ctx.font = `700 17px ${sans}`;
  ctx.fillText("Get started", hx + hw - 164, hy + 95);
  // Three content cards under the hero.
  const cw = (hw - 32) / 3;
  for (let i = 0; i < 3; i++) {
    const cx = hx + i * (cw + 16);
    ctx.fillStyle = ICE;
    roundRect(ctx, cx, hy + 160, cw, 56, 10);
    ctx.fillStyle = "rgba(11,107,220,0.35)";
    roundRect(ctx, cx + 14, hy + 174, cw * 0.55, 9, 4);
    ctx.fillStyle = "rgba(11,107,220,0.18)";
    roundRect(ctx, cx + 14, hy + 192, cw * 0.75, 7, 3);
  }
  // Cursor.
  const px = hx + hw - 70;
  const py = hy + 108;
  ctx.fillStyle = INK;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py + 50);
  ctx.lineTo(px + 13, py + 38);
  ctx.lineTo(px + 23, py + 60);
  ctx.lineTo(px + 33, py + 55);
  ctx.lineTo(px + 23, py + 34);
  ctx.lineTo(px + 40, py + 33);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // What you get.
  ctx.font = `600 19px ${mono}`;
  let chipX = 52;
  for (const label of ["Custom design", "Mobile ready", "Fast + SEO"]) {
    const textWidth = ctx.measureText(label).width;
    const chipW = textWidth + 62;
    ctx.fillStyle = ICE;
    roundRect(ctx, chipX, 786, chipW, 44, 22);
    ctx.strokeStyle = DEEP;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(chipX + 18, 808);
    ctx.lineTo(chipX + 25, 815);
    ctx.lineTo(chipX + 38, 800);
    ctx.stroke();
    ctx.fillStyle = "#0a57b4";
    ctx.fillText(label, chipX + 48, 798);
    chipX += chipW + 14;
  }

  // Call to action.
  ctx.fillStyle = "rgba(11,107,220,0.25)";
  roundRect(ctx, 56, 872, w - 104, 76, 38);
  ctx.fillStyle = aurora(ctx, 52, w - 52);
  roundRect(ctx, 52, 864, w - 104, 76, 38);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 30px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText("START YOUR PROJECT  →", w / 2, 885);
  ctx.font = `600 21px ${mono}`;
  ctx.fillStyle = INK;
  ctx.fillText("angelomouawad.com/websites", w / 2, 980);
  ctx.textAlign = "left";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/** Framed studio ad on the wall. Links to /websites. */
export function Poster(props: Omit<ThreeElements["group"], "id">) {
  const art = useMemo(() => canvasTexture(CANVAS.width, CANVAS.height, (ctx) => drawPoster(ctx)), []);

  useEffect(() => {
    const sans = fontFamily("--font-sans");
    Promise.all([document.fonts.load(`900 112px ${sans}`), document.fonts.load(`800 30px ${sans}`), document.fonts.ready]).then(() => {
      drawPoster(art.image.getContext("2d")!);
      art.needsUpdate = true;
    });
  }, [art]);

  const { width, height } = SIZE;

  return (
    <LinkObject id="websites" hitSize={[width + 0.12, height + 0.12, 0.12]} hitPosition={[0, 0, 0.04]} labelPosition={[0, height / 2 + 0.12, 0.05]} lift={0.012} {...props}>
      <mesh position-z={0.012} castShadow>
        <boxGeometry args={[width + 0.036, height + 0.036, 0.024]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position-z={0.0245}>
        <planeGeometry args={[width, height]} />
        {/* A little self-light keeps the blues reading true under the room's warm lamps. */}
        <meshStandardMaterial map={art} roughness={0.85} emissive="#ffffff" emissiveMap={art} emissiveIntensity={0.12} />
      </mesh>
    </LinkObject>
  );
}
