"use client";

import { useProgress } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRoom } from "@/store/room";

/** Covers the room until every model and texture has loaded, showing real progress. */
export function Loader() {
  const progress = useProgress((state) => state.progress);
  const sceneReady = useRoom((state) => state.sceneReady);
  const loading = useRoom((state) => state.phase === "loading");
  const [shown, setShown] = useState(0);
  const target = useRef(0);

  // Assets can only take the bar to 96. The last stretch waits for shaders to compile so nothing pops in.
  useEffect(() => {
    target.current = sceneReady ? 100 : Math.max(target.current, Math.min(progress, 96));
  }, [progress, sceneReady]);

  useEffect(() => {
    if (!loading) return;
    let raf = 0;
    const tick = () => {
      setShown((value) => {
        const next = value + (target.current - value) * 0.12;
        return target.current - next < 0.4 ? target.current : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  useEffect(() => {
    if (loading && shown >= 100) useRoom.getState().setPhase("intro");
  }, [loading, shown]);

  const percent = Math.round(shown);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          aria-label={`Loading the room, ${percent} percent`}
          className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between bg-[#07090d] p-6 text-[#e9eef4] sm:p-10"
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.28em] text-[#8b95a5] uppercase">
            <span>Angelo Mouawad</span>
            <span className="text-[#6fe3ff]">Portfolio</span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <p className="max-w-[16rem] pb-3 font-mono text-[11px] leading-relaxed tracking-[0.2em] text-[#8b95a5] uppercase sm:pb-5">
              {percent < 100 ? "Setting up the room" : "Come on in"}
            </p>
            <p className="font-sans text-[clamp(5rem,22vw,15rem)] leading-[0.8] font-black tracking-tighter tabular-nums [font-stretch:115%]">
              {String(percent).padStart(2, "0")}
              <span className="text-[0.3em] text-[#6fe3ff]">%</span>
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-px bg-white/10">
            <div className="h-full origin-left bg-[#6fe3ff] shadow-[0_0_14px_rgb(111_227_255/0.8)]" style={{ transform: `scaleX(${shown / 100})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
