"use client";

import { Chair } from "@/components/room/interactions/Chair";
import { Football } from "@/components/room/interactions/Football";
import { Poster } from "@/components/room/interactions/Poster";
import { WallClock } from "@/components/room/interactions/WallClock";
import { Desk } from "@/components/room/models/Desk";
import { CornerLight, Decor, Sideboard, WallShelves } from "@/components/room/models/Furniture";
import { Dust } from "./Dust";
import { ROOM } from "./layout";
import { Lighting } from "./Lighting";
import { useSettings } from "./settings";
import { Shell } from "./Shell";
import { WindowUnit } from "./WindowUnit";

export function Room() {
  const { quality, reducedMotion } = useSettings();
  return (
    <group>
      <Lighting />
      <Shell />
      <WindowUnit />

      <Desk />
      <WallShelves />
      <Sideboard />
      <CornerLight />
      <Decor />

      <Chair />
      <Football position={[0.62, 0, -1.5]} />
      <Poster position={[2.3, 1.56, ROOM.back + 0.002]} />
      <WallClock position={[1.78, 2.3, ROOM.back + 0.002]} />

      <Dust count={quality.dust} animate={!reducedMotion} />
    </group>
  );
}
