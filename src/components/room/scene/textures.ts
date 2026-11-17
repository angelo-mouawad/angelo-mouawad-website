"use client";

import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export type PbrName = "herringbone_parquet" | "painted_plaster_wall" | "walnut_veneer" | "brown_leather" | "cotton_jersey";

const PBR_NAMES: PbrName[] = ["herringbone_parquet", "painted_plaster_wall", "walnut_veneer", "brown_leather", "cotton_jersey"];

const urls = (name: PbrName) => ({
  map: `/textures/${name}_diff.webp`,
  normalMap: `/textures/${name}_nor.webp`,
  roughnessMap: `/textures/${name}_rough.webp`,
});

/** Tiling PBR maps. Each call gets its own repeat and offset while sharing the image data. */
export function usePbr(name: PbrName, repeatX = 1, repeatY = 1, offsetX = 0, offsetY = 0) {
  const maps = useTexture(urls(name));
  return useMemo(() => {
    const tile = (source: THREE.Texture, color: boolean) => {
      const texture = source.clone();
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeatX, repeatY);
      texture.offset.set(offsetX, offsetY);
      texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
      return texture;
    };
    return {
      map: tile(maps.map, true),
      normalMap: tile(maps.normalMap, false),
      roughnessMap: tile(maps.roughnessMap, false),
    };
  }, [maps, repeatX, repeatY, offsetX, offsetY]);
}

PBR_NAMES.forEach((name) => useTexture.preload(Object.values(urls(name))));

export function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Resolves the real family name behind a next/font CSS variable so it can be used on a canvas. */
export function fontFamily(variable: "--font-sans" | "--font-mono" | "--font-display") {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || (variable === "--font-mono" ? "monospace" : "sans-serif");
}

let softDot: THREE.Texture | null = null;

/** Soft radial falloff used for fake contact shadows and light pools. */
export function softDotTexture() {
  if (softDot) return softDot;
  softDot = canvasTexture(128, 128, (ctx) => {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.45)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  });
  softDot.colorSpace = THREE.NoColorSpace;
  return softDot;
}
