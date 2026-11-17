"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SmoothScroll } from "@/components/room/camera/SmoothScroll";
import { World } from "@/components/world/home/World";
import { LightBloom } from "@/components/world/motion";
import { prefersReducedMotion } from "@/lib/device";
import { LEAVE, LINK_IDS, LINKS } from "@/lib/links";
import { useRoom } from "@/store/room";
import { Hud } from "./Hud";
import { Loader } from "./Loader";

const Experience = dynamic(() => import("@/components/room/scene/Experience"), { ssr: false });

/** Leaving for another page: light grows over the end of the camera move, then the route changes. */
function RoomExit() {
  const leavingTo = useRoom((state) => state.leavingTo);
  const router = useRouter();
  const [bloom, setBloom] = useState(false);

  useEffect(() => {
    LINK_IDS.forEach((id) => router.prefetch(LINKS[id].href));
  }, [router]);

  useEffect(() => {
    if (!leavingTo) return;
    // From inside the monitor there is no camera move to wait for.
    const wait = useRoom.getState().inWorld || prefersReducedMotion() ? 0 : LEAVE.curtainDelay;
    const timer = window.setTimeout(() => setBloom(true), wait * 1000);
    return () => window.clearTimeout(timer);
  }, [leavingTo]);

  return <LightBloom show={bloom} onCovered={() => leavingTo && router.push(LINKS[leavingTo].href)} />;
}

export function RoomPage() {
  useEffect(() => {
    useRoom.getState().reset();
    return () => useRoom.getState().reset();
  }, []);

  return (
    <main data-world="room">
      <Experience />
      <SmoothScroll />
      <World />
      <Hud />
      <Loader />
      <RoomExit />
    </main>
  );
}
