"use client";

import { useGLTF } from "@react-three/drei";
import { type ThreeElements, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { canvasTexture, fontFamily } from "@/components/room/scene/textures";
import { enableShadows, fit, modelUrl } from "./Model";

// A 16" MacBook Pro is about 35.6 cm wide.
const WIDTH = 0.356;
// Matches the display's own proportions, at a size that holds up when the camera comes close.
const SCREEN_PX = { width: 2048, height: 1416 };

// Flat colours in the file, restyled as space grey aluminium with dark keys. Low roughness keeps the edges crisp.
const FINISH: Record<string, Partial<THREE.MeshStandardMaterial>> = {
  mat16: { color: new THREE.Color("#9aa0a8"), metalness: 0.7, roughness: 0.24 },
  mat15: { color: new THREE.Color("#5d6168"), metalness: 0.5, roughness: 0.4 },
  mat17: { color: new THREE.Color("#3e4249"), metalness: 0.45, roughness: 0.3 },
  mat23: { color: new THREE.Color("#07080a"), metalness: 0.15, roughness: 0.45 },
};

const CODE: [string, string][] = [
  ["#c792ea", "export function Room() {"],
  ["#89ddff", "  const { quality } = useSettings();"],
  ["#c3e88d", "  return ("],
  ["#f07178", "    <Canvas shadows>"],
  ["#ffcb6b", "      <Desk />"],
  ["#ffcb6b", "      <Chair />"],
  ["#ffcb6b", "      <Monitor animate />"],
  ["#f07178", "    </Canvas>"],
  ["#c3e88d", "  );"],
  ["#c792ea", "}"],
];

/**
 * A quiet desktop: a soft wallpaper with a code editor open on it. The type is large and heavy on purpose: the screen
 * is usually seen small, and fine strokes would wash out when the texture is shrunk.
 */
function drawScreen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, w, h);
  sky.addColorStop(0, "#1b2a4a");
  sky.addColorStop(0.55, "#2c3e6b");
  sky.addColorStop(1, "#6a4a7a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.85, h * 0.1, 0, w * 0.85, h * 0.1, w * 0.6);
  glow.addColorStop(0, "rgba(111,227,255,0.3)");
  glow.addColorStop(1, "rgba(111,227,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Menu bar.
  ctx.fillStyle = "rgba(10,14,24,0.6)";
  ctx.fillRect(0, 0, w, 44);

  // Editor window, filling most of the screen.
  const x = w * 0.05;
  const y = h * 0.08;
  const ww = w * 0.9;
  const wh = h * 0.86;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 18, ww, wh, 24);
  ctx.fill();
  ctx.fillStyle = "#0b0f18";
  ctx.beginPath();
  ctx.roundRect(x, y, ww, wh, 24);
  ctx.fill();
  ctx.fillStyle = "#151b29";
  ctx.beginPath();
  ctx.roundRect(x, y, ww, 72, [24, 24, 0, 0]);
  ctx.fill();
  ["#ff5f57", "#febc2e", "#28c840"].forEach((colour, index) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x + 46 + index * 40, y + 36, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  const mono = fontFamily("--font-mono");
  ctx.textBaseline = "middle";
  ctx.font = `600 30px ${mono}`;
  ctx.fillStyle = "rgba(226,236,248,0.7)";
  ctx.textAlign = "center";
  ctx.fillText("Room.tsx", x + ww / 2, y + 37);
  ctx.textAlign = "left";

  const lineHeight = 104;
  ctx.font = `700 64px ${mono}`;
  CODE.forEach(([colour, line], index) => {
    const lineY = y + 150 + index * lineHeight;
    ctx.fillStyle = "rgba(226,236,248,0.35)";
    ctx.fillText(String(index + 1).padStart(2, " "), x + 40, lineY);
    ctx.fillStyle = colour;
    ctx.fillText(line, x + 160, lineY);
  });
  // Cursor.
  ctx.fillStyle = "#6fe3ff";
  ctx.fillRect(x + 200, y + 150 + CODE.length * lineHeight - 34, 7, 68);
}

/**
 * Laptop / MacBook Pro by Alex Safayan (CC BY 3.0), via Poly Pizza. The file is untextured, so it renders crisp at any
 * distance; its screen is replaced by a canvas drawn here. `turn` spins it before it is fitted, so it lands flat.
 */
export function Laptop({ turn = 0, ...props }: ThreeElements["group"] & { turn?: number }) {
  const { scene } = useGLTF(modelUrl("laptop"));
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const screen = useMemo(() => {
    const texture = canvasTexture(SCREEN_PX.width, SCREEN_PX.height, drawScreen);
    // Full anisotropic filtering: the screen is almost always seen at an angle.
    texture.anisotropy = anisotropy;
    return texture;
  }, [anisotropy]);

  useEffect(() => {
    document.fonts.ready.then(() => {
      drawScreen(screen.image.getContext("2d")!, SCREEN_PX.width, SCREEN_PX.height);
      screen.needsUpdate = true;
    });
  }, [screen]);

  const { object, placement } = useMemo(() => {
    const clone = scene.clone(true);
    enableShadows(clone);
    clone.updateMatrixWorld(true);
    let panel: THREE.Box3 | null = null;
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = mesh.material as THREE.MeshStandardMaterial;
      const bounds = new THREE.Box3().setFromObject(mesh, true);
      // The display is the tall, flat panel in the lid; it is swapped for the drawn screen below.
      if (source.name === "mat17" && bounds.max.y - bounds.min.y > 1) {
        mesh.visible = false;
        panel = bounds;
        return;
      }
      const finish = FINISH[source.name];
      if (finish) mesh.material = Object.assign(source.clone(), finish);
    });
    if (panel) {
      const box = panel as THREE.Box3;
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      // Kept under the room's bloom threshold so the text does not glow and smear.
      const display = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x, size.y),
        new THREE.MeshBasicMaterial({ map: screen, color: new THREE.Color(0.8, 0.8, 0.8), toneMapped: false }),
      );
      display.position.set(centre.x, centre.y, box.max.z + 0.004);
      clone.add(display);
    }
    clone.rotation.y = turn;
    const raw = fit(clone, {});
    const scale = WIDTH / new THREE.Box3().setFromObject(scene, true).getSize(new THREE.Vector3()).x;
    return { object: clone, placement: { scale, position: raw.position.map((value) => value * scale) as [number, number, number] } };
  }, [scene, screen, turn]);

  return (
    <group {...props}>
      <group scale={placement.scale} position={placement.position}>
        <primitive object={object} />
      </group>
    </group>
  );
}
