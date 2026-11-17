"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "@/components/room/scene/layout";
import { canvasTexture, fontFamily } from "@/components/room/scene/textures";

const UNIT = 0.0235;
const GAP = 0.0024;
const KEY_HEIGHT = 0.0085;
const CASE_HEIGHT = 0.02;
const TILT = 0.075;

// A 75% layout. Each entry is a legend and the key's width in units.
const LAYOUT: [string, number][][] = [
  ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Prt", "Del"].map((key) => [key, 1]),
  [..."`1234567890-=".split("").map((key): [string, number] => [key, 1]), ["Back", 2]],
  [["Tab", 1.5], ..."QWERTYUIOP[]".split("").map((key): [string, number] => [key, 1]), ["\\", 1.5]],
  [["Caps", 1.75], ..."ASDFGHJKL;'".split("").map((key): [string, number] => [key, 1]), ["Enter", 2.25]],
  [["Shift", 2.25], ..."ZXCVBNM,./".split("").map((key): [string, number] => [key, 1]), ["Shift", 1.75], ["↑", 1]],
  [["Ctrl", 1.25], ["Win", 1.25], ["Alt", 1.25], ["", 5.25], ["Alt", 1], ["Fn", 1], ["Ctrl", 1], ["←", 1], ["↓", 1], ["→", 1]],
];

const COLUMNS = 15;
const ROWS = LAYOUT.length;
const ACCENTS = new Set(["Esc", "Enter"]);

const KEYS = LAYOUT.flatMap((row, rowIndex) => {
  let cursor = 0;
  return row.map(([legend, width]) => {
    const key = {
      legend,
      width,
      // Centre of the key in units, measured from the top left of the layout.
      u: cursor + width / 2,
      v: rowIndex + 0.5,
      color: ACCENTS.has(legend) ? "#b3141d" : legend.length === 1 ? "#2b2f38" : "#16181d",
    };
    cursor += width;
    return key;
  });
});

function keycap() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    if (position.getY(i) > 0) position.setXYZ(i, position.getX(i) * 0.88, position.getY(i), position.getZ(i) * 0.84);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function drawLegends(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sans = fontFamily("--font-sans");
  const cell = w / COLUMNS;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(226, 236, 248, 0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const key of KEYS) {
    if (!key.legend) continue;
    ctx.font = `${key.legend.length === 1 ? 600 : 500} ${cell * (key.legend.length === 1 ? 0.36 : 0.2)}px ${sans}`;
    ctx.fillText(key.legend, key.u * cell, key.v * cell);
  }
}

/** Compact mechanical keyboard: sculpted caps on a tilted case, with shine-through legends. */
export function Keyboard(props: ThreeElements["group"]) {
  const caps = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => keycap(), []);
  const legends = useMemo(() => canvasTexture(1920, (1920 / COLUMNS) * ROWS, drawLegends), []);
  const width = COLUMNS * UNIT;
  const depth = ROWS * UNIT;

  useEffect(() => {
    document.fonts.ready.then(() => {
      drawLegends(legends.image.getContext("2d")!, legends.image.width, legends.image.height);
      legends.needsUpdate = true;
    });
  }, [legends]);

  useLayoutEffect(() => {
    const mesh = caps.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    KEYS.forEach((key, index) => {
      dummy.position.set((key.u - COLUMNS / 2) * UNIT, 0, (key.v - ROWS / 2) * UNIT);
      dummy.scale.set(key.width * UNIT - GAP, KEY_HEIGHT, UNIT - GAP);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, color.set(key.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  const keyTop = CASE_HEIGHT + KEY_HEIGHT - 0.002;

  return (
    <group {...props}>
      <group position-y={(depth / 2) * Math.sin(TILT)} rotation-x={TILT}>
        <RoundedBox args={[width + 0.016, CASE_HEIGHT, depth + 0.016]} radius={0.006} smoothness={3} position-y={CASE_HEIGHT / 2} castShadow receiveShadow>
          <meshStandardMaterial color="#1b1d23" roughness={0.38} metalness={0.75} />
        </RoundedBox>
        <mesh position-y={CASE_HEIGHT + 0.0004} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial color={PALETTE.cyan} toneMapped={false} transparent opacity={0.4} />
        </mesh>
        <instancedMesh ref={caps} args={[geometry, undefined, KEYS.length]} position-y={keyTop - KEY_HEIGHT / 2} castShadow>
          <meshStandardMaterial roughness={0.55} />
        </instancedMesh>
        <mesh position-y={keyTop + 0.0003} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial map={legends} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
