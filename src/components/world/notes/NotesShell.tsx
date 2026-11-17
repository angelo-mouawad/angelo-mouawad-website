"use client";

import { PanelLeft } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BackToRoom } from "@/components/world/BackToRoom";
import { LightGate, WorldMotion } from "@/components/world/motion";
import { MonoLabel, WorldBackdrop } from "@/components/world/primitives";
import type { TreeNode } from "@/lib/notes/source";
import { Explorer } from "./Explorer";

/**
 * Frame for every notes page. The explorer is a fixed sidebar on wide screens
 * and a drawer on phones and tablets.
 */
export function NotesShell({ tree, children }: { tree: TreeNode[]; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  return (
    <WorldMotion>
      <div className="world relative isolate min-h-dvh">
        <WorldBackdrop />
        <LightGate />
        <a href="#main" className="glass-strong sr-only z-[90] rounded-full px-5 py-3 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-line bg-background/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[96rem] items-center justify-between gap-3 px-(--gutter)">
            <div className="flex items-center gap-2">
              <Sheet open={drawer} onOpenChange={setDrawer}>
                <SheetTrigger render={<Button variant="glass" size="icon-sm" className="xl:hidden" aria-label="Open the notes list" />}>
                  <PanelLeft aria-hidden="true" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(22rem,88vw)] gap-0 border-line bg-background p-0 sm:max-w-none">
                  <SheetHeader className="border-b border-line px-5 py-4">
                    <SheetTitle className="font-display text-lg font-semibold tracking-tight">Notes</SheetTitle>
                    <SheetDescription className="sr-only">Browse folders and open a note.</SheetDescription>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 p-4">
                    <Explorer tree={tree} onNavigate={() => setDrawer(false)} />
                  </div>
                </SheetContent>
              </Sheet>
              <BackToRoom compact />
            </div>
            <Link href="/notes/" className="rounded-full px-2 py-1">
              <MonoLabel dot>Notes</MonoLabel>
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-[96rem] gap-10 px-(--gutter) xl:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] py-6 xl:block">
            <div className="glass flex h-full flex-col rounded-3xl p-4">
              <Explorer tree={tree} />
            </div>
          </aside>
          <main id="main" tabIndex={-1} className="min-w-0 outline-none">
            {children}
          </main>
        </div>
      </div>
    </WorldMotion>
  );
}
