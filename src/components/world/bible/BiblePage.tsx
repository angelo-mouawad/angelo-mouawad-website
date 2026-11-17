"use client";

import dynamic from "next/dynamic";
import { MonoLabel, WorldBackdrop } from "@/components/world/primitives";

// The Bible reads the URL hash and localStorage, so it only ever renders in the browser.
const BibleApp = dynamic(() => import("./BibleApp"), {
  ssr: false,
  loading: () => (
    <div className="world relative isolate grid min-h-dvh place-items-center">
      <WorldBackdrop />
      <MonoLabel dot>Opening the Bible</MonoLabel>
    </div>
  ),
});

export function BiblePage() {
  return <BibleApp />;
}
