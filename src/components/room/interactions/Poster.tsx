"use client";

import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { canvasTexture, fontFamily } from "@/components/room/scene/textures";
import { LinkObject } from "./LinkObject";

const SIZE = { width: 0.62, height: 0.88 };
const CANVAS = { width: 744, height: 1056 };
const INK = "#111318";
const PAPER = "#efe8d9";
const ACCENT = "#ff4d1c";

function drawPoster(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sans = fontFamily("--font-sans");
  const mono = fontFamily("--font-mono");
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = INK;
  ctx.font = `500 20px ${mono}`;
  ctx.textBaseline = "top";
  ctx.fillText("A.M. WEB STUDIO", 52, 52);
  ctx.textAlign = "right";
  ctx.fillText("DESIGN + CODE", w - 52, 52);
  ctx.textAlign = "left";
  ctx.fillRect(52, 90, w - 104, 3);

  // Browser window with a cursor about to click.
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.roundRect(52, 128, w - 104, 372, 18);
  ctx.fill();
  ctx.fillStyle = PAPER;
  [0, 1, 2].forEach((dot) => {
    ctx.beginPath();
    ctx.arc(84 + dot * 26, 160, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.beginPath();
  ctx.roundRect(76, 192, w - 152, 284, 10);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillRect(104, 224, 250, 22);
  ctx.fillRect(104, 262, 180, 22);
  ctx.globalAlpha = 0.22;
  ctx.fillRect(104, 316, w - 208, 10);
  ctx.fillRect(104, 340, w - 268, 10);
  ctx.globalAlpha = 1;
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.roundRect(104, 392, 168, 52, 26);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(250, 412);
  ctx.lineTo(250, 478);
  ctx.lineTo(267, 462);
  ctx.lineTo(280, 490);
  ctx.lineTo(292, 484);
  ctx.lineTo(279, 457);
  ctx.lineTo(302, 455);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = INK;
  ctx.font = `900 118px ${sans}`;
  ctx.fillText("WEBSITES", 46, 540);
  ctx.fillText("THAT", 46, 650);
  ctx.fillStyle = ACCENT;
  ctx.fillText("WORK.", 46, 760);

  ctx.fillStyle = INK;
  ctx.fillRect(52, 908, w - 104, 3);
  ctx.font = `500 21px ${mono}`;
  ctx.fillText("DESIGN / BUILD / LAUNCH", 52, 934);
  ctx.font = `700 26px ${sans}`;
  ctx.fillText("angelomouawad.com/websites", 52, 972);
}

/** Framed studio ad on the wall. Links to /websites. */
export function Poster(props: Omit<ThreeElements["group"], "id">) {
  const art = useMemo(() => canvasTexture(CANVAS.width, CANVAS.height, drawPoster), []);

  useEffect(() => {
    const sans = fontFamily("--font-sans");
    Promise.all([document.fonts.load(`900 118px ${sans}`), document.fonts.ready]).then(() => {
      drawPoster(art.image.getContext("2d")!, CANVAS.width, CANVAS.height);
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
        <meshStandardMaterial map={art} roughness={0.85} emissive="#ffffff" emissiveMap={art} emissiveIntensity={0.06} />
      </mesh>
    </LinkObject>
  );
}
