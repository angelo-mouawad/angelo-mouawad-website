import { create } from "zustand";
import type { LinkId } from "@/lib/links";

type Phase = "loading" | "intro" | "ready" | "leaving";

interface RoomState {
  phase: Phase;
  sceneReady: boolean;
  activeLink: LinkId | null;
  leavingTo: LinkId | null;
  lampOn: boolean;
  /** True once the dive through the monitor is complete. The room stops rendering while it is. */
  inWorld: boolean;
  setPhase: (phase: Phase) => void;
  setSceneReady: () => void;
  setActiveLink: (id: LinkId | null) => void;
  leave: (id: LinkId) => void;
  toggleLamp: () => void;
  setInWorld: (inWorld: boolean) => void;
  reset: () => void;
}

export const useRoom = create<RoomState>((set, get) => ({
  phase: "loading",
  sceneReady: false,
  activeLink: null,
  leavingTo: null,
  lampOn: true,
  inWorld: false,
  setPhase: (phase) => set({ phase }),
  setSceneReady: () => set({ sceneReady: true }),
  setActiveLink: (id) => {
    if (get().phase === "ready" && get().activeLink !== id) set({ activeLink: id });
  },
  leave: (id) => {
    if (get().phase === "ready") set({ phase: "leaving", leavingTo: id, activeLink: id });
  },
  toggleLamp: () => set({ lampOn: !get().lampOn }),
  setInWorld: (inWorld) => set({ inWorld }),
  reset: () => set({ phase: "loading", sceneReady: false, activeLink: null, leavingTo: null, inWorld: false }),
}));
