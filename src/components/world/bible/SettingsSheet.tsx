"use client";

import { Contrast, Minus, Moon, Plus, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { TRANSLATIONS } from "@/lib/bible/data/translations";
import { useStore } from "@/lib/bible/store/AppStore";
import type { ReadingWidth, Theme } from "@/lib/bible/types/storage";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { fieldClass, Segmented } from "./ui";

const THEMES: { id: Theme; label: string; icon: ReactNode }[] = [
  { id: "light", label: "Light", icon: <Sun aria-hidden="true" /> },
  { id: "dark", label: "Dark", icon: <Moon aria-hidden="true" /> },
  { id: "contrast", label: "Contrast", icon: <Contrast aria-hidden="true" /> },
];

const WIDTHS: { id: ReadingWidth; label: string }[] = [
  { id: "narrow", label: "Narrow" },
  { id: "medium", label: "Medium" },
  { id: "wide", label: "Wide" },
];

const MIN_SIZE = 14;
const MAX_SIZE = 34;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="type-label text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

/** Reading settings, in a sheet from the right. Every change is saved as it is made. */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, actions } = useStore();
  const prefs = data.preferences;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="w-[min(24rem,92vw)] gap-0 border-line bg-background p-0 font-body sm:max-w-none">
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle className="font-display text-lg font-semibold tracking-tight">Reading settings</SheetTitle>
          <SheetDescription className="sr-only">Text size, colours, reading width and translation. Changes are saved as you make them.</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain p-5">
          <Group title="Text size">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" disabled={prefs.fontSize <= MIN_SIZE} onClick={() => actions.setPreferences({ fontSize: Math.max(MIN_SIZE, prefs.fontSize - 2) })} aria-label="Make text smaller">
                <Minus aria-hidden="true" />
              </Button>
              <output aria-live="polite" aria-label={`Text size ${prefs.fontSize}`} className="flex-1 text-center font-display text-2xl font-semibold tracking-tight tabular-nums">
                {prefs.fontSize}
              </output>
              <Button variant="outline" size="icon" disabled={prefs.fontSize >= MAX_SIZE} onClick={() => actions.setPreferences({ fontSize: Math.min(MAX_SIZE, prefs.fontSize + 2) })} aria-label="Make text larger">
                <Plus aria-hidden="true" />
              </Button>
            </div>
            <p className="scripture rounded-2xl border border-line bg-card/70 p-4" style={{ fontSize: prefs.fontSize }}>
              Thy word is a lamp unto my feet, and a light unto my path.
            </p>
          </Group>

          <Group title="Colours">
            <Segmented full legend="Colours" options={THEMES} value={prefs.theme} onChange={(theme) => actions.setPreferences({ theme })} />
            {prefs.theme === "contrast" && <p className="type-small">High contrast: black on white, solid borders, no glass or glow.</p>}
          </Group>

          <Group title="Reading width">
            <Segmented full legend="Reading width" options={WIDTHS} value={prefs.width} onChange={(width) => actions.setPreferences({ width })} />
          </Group>

          <Group title="Verses">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-card/70 px-4 py-3 text-sm font-medium">
              Show verse numbers
              <span className="relative inline-flex">
                <input type="checkbox" role="switch" className="peer sr-only" checked={prefs.showVerseNumbers} onChange={(event) => actions.setPreferences({ showVerseNumbers: event.target.checked })} />
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-6 w-11 rounded-full border border-line-strong bg-sunk transition-colors duration-300 peer-checked:border-transparent peer-checked:bg-sky peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                    "after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-card after:shadow-soft after:transition-transform after:duration-300 after:ease-out-expo peer-checked:after:translate-x-5 motion-reduce:after:transition-none",
                  )}
                />
              </span>
            </label>
          </Group>

          <Group title="Translation">
            <select aria-label="Translation" className={cn(fieldClass, "cursor-pointer")} value={prefs.translation} onChange={(event) => actions.setPreferences({ translation: event.target.value })}>
              {TRANSLATIONS.map((translation) => (
                <option key={translation.id} value={translation.id}>
                  {translation.name} ({translation.abbreviation})
                </option>
              ))}
            </select>
            {TRANSLATIONS.length === 1 && <p className="type-small">More translations will be added later.</p>}
          </Group>
        </div>
      </SheetContent>
    </Sheet>
  );
}
