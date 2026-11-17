"use client";

import { ArrowRight, Check, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { CANON } from "@/lib/bible/data/canon";
import { PLANS } from "@/lib/bible/data/plans";
import { readingActivity } from "@/lib/bible/services/activity";
import { bookProgress, chapterStatus, overallProgress, planStatus } from "@/lib/bible/services/progress";
import { parseBackup } from "@/lib/bible/services/storage";
import { useStore } from "@/lib/bible/store/AppStore";
import { useTranslationOrNull } from "@/lib/bible/store/BibleProvider";
import type { CanonBook } from "@/lib/bible/types/bible";
import type { ChapterStatus } from "@/lib/bible/types/storage";
import { percent } from "@/lib/bible/utils/misc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RevealGroup, RevealItem } from "@/components/world/motion";
import { MonoLabel, Panel } from "@/components/world/primitives";
import { cn } from "@/lib/utils";
import { chapterTone, PageHeader, ProgressRing, STATUS_LABEL, useConfirm, useNav, useToast } from "./ui";

const NEXT: Record<ChapterStatus, ChapterStatus> = { unread: "in-progress", "in-progress": "completed", completed: "unread" };

export function ProgressView() {
  const { data } = useStore();
  const nav = useNav();
  const translation = useTranslationOrNull();
  const overall = overallProgress(data, translation);
  const { streak } = readingActivity(data);
  const activePlans = PLANS.filter((plan) => data.plans[plan.id]);
  const pct = percent(overall.fraction, 1);
  const [openBook, setOpenBook] = useState<CanonBook | null>(null);

  const stats: { label: string; value: number; of?: number; unit?: string }[] = [
    { label: "Books finished", value: overall.booksCompleted, of: CANON.length },
    { label: "Chapters read", value: overall.chaptersCompleted, of: overall.totalChapters },
    { label: "Verses read", value: overall.versesRead, of: overall.totalVerses || undefined },
    { label: "Reading streak", value: streak, unit: streak === 1 ? "day" : "days" },
  ];

  return (
    <div className="flex flex-col gap-10 pt-8">
      <PageHeader label="Progress" title="How far you have read." lead="Every chapter you mark as read counts here, whether you read it on your own or in a plan." />

      <RevealGroup className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
        <RevealItem>
          <Panel surface="glass" ticks className="flex h-full flex-col items-center justify-center gap-5 p-8">
            <h2 className="type-label text-muted-foreground">Whole Bible</h2>
            <ProgressRing value={overall.fraction} size={208} display={`${pct}%`} caption="of the Bible read" label={`${pct} percent of the Bible read`} />
          </Panel>
        </RevealItem>
        <RevealItem>
          <dl className="grid h-full grid-cols-2 gap-5">
            {stats.map((stat) => (
              <Panel key={stat.label} surface="glass" className="flex flex-col justify-between gap-4 p-5 sm:p-6">
                <dt className="type-label text-[0.625rem] text-muted-foreground">{stat.label}</dt>
                <dd className="flex flex-col gap-1.5">
                  <span className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none font-semibold tracking-tight tabular-nums">
                    {stat.value.toLocaleString()}
                    {stat.unit && <span className="ml-2 font-body text-sm font-normal tracking-normal text-muted-foreground">{stat.unit}</span>}
                  </span>
                  {stat.of !== undefined && <span className="type-small tabular-nums">of {stat.of.toLocaleString()}</span>}
                </dd>
              </Panel>
            ))}
          </dl>
        </RevealItem>
      </RevealGroup>

      {activePlans.length > 0 && (
        <section aria-labelledby="plan-progress" className="flex flex-col gap-4">
          <h2 id="plan-progress" className="type-h3">
            Plans
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {activePlans.map((plan) => {
              const status = planStatus(plan, data.plans[plan.id]);
              return (
                <li key={plan.id}>
                  <button type="button" onClick={() => nav.go({ view: "plans", planId: plan.id })} className="group/plan w-full cursor-pointer rounded-2xl text-left outline-offset-4">
                    <Panel surface="solid" className="flex items-center gap-4 rounded-2xl p-4 transition-shadow duration-500 group-hover/plan:shadow-glow">
                      <ProgressRing value={status.total ? status.completedCount / status.total : 0} size={56} display={`${percent(status.completedCount, status.total)}%`} />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate font-display text-base font-semibold tracking-tight">{plan.name}</span>
                        <span className="type-small tabular-nums">
                          {status.completedCount} of {status.total} days
                        </span>
                      </span>
                      <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform duration-300 group-hover/plan:translate-x-0.5 group-hover/plan:text-sky" />
                    </Panel>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {(["OT", "NT"] as const).map((testament) => (
        <section key={testament} aria-labelledby={`books-${testament}`} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id={`books-${testament}`} className="type-h3">
              {testament === "OT" ? "Old Testament" : "New Testament"}
            </h2>
            <p className="type-small">Open a book to see and change each chapter.</p>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {CANON.filter((book) => book.testament === testament).map((book) => (
              <BookTile key={book.id} book={book} onOpen={() => setOpenBook(book)} />
            ))}
          </ul>
        </section>
      ))}

      <Backup />
      <BookDialog book={openBook} onClose={() => setOpenBook(null)} />
    </div>
  );
}

function BookTile({ book, onOpen }: { book: CanonBook; onOpen: () => void }) {
  const { data } = useStore();
  const state = bookProgress(data, book.id, book.chapters);
  const done = state.completed === state.total;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${book.name}: ${state.completed} of ${state.total} chapters read${done ? ", finished" : ""}. Show chapters`}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-[border-color,box-shadow] duration-300 hover:border-sky-bright/50 hover:shadow-soft",
          done ? "border-sky-bright/30 bg-accent" : "border-line bg-card/70",
        )}
      >
        <ProgressRing value={state.total ? state.completed / state.total : 0} size={34} stroke={3.5} />
        <span className="flex min-w-0 flex-col gap-1">
          <span className={cn("flex items-center gap-1.5 truncate text-[0.875rem] font-medium", done ? "text-accent-foreground" : "text-foreground")}>
            <span className="truncate">{book.name}</span>
            {done && <Check aria-hidden="true" className="size-3.5 shrink-0" />}
          </span>
          <span className="truncate font-mono text-[0.625rem] text-muted-foreground tabular-nums">
            {state.completed}/{state.total}
            {state.inProgress > 0 && `, ${state.inProgress} in progress`}
          </span>
        </span>
      </button>
    </li>
  );
}

function BookDialog({ book, onClose }: { book: CanonBook | null; onClose: () => void }) {
  // Keeps the last book on screen while the dialog fades out.
  const [shown, setShown] = useState(book);
  if (book && book !== shown) setShown(book);
  return (
    <Dialog open={book !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">{shown && <BookChapters key={shown.id} book={shown} onClose={onClose} />}</DialogContent>
    </Dialog>
  );
}

function BookChapters({ book, onClose }: { book: CanonBook; onClose: () => void }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const [clearing, setClearing] = useState(false);
  const state = bookProgress(data, book.id, book.chapters);
  const done = state.completed === state.total;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-4">
          <ProgressRing value={state.total ? state.completed / state.total : 0} size={56} display={`${percent(state.completed, state.total)}%`} label={`${state.completed} of ${state.total} chapters read`} />
          <div className="flex flex-col gap-1.5">
            <DialogTitle>{book.name}</DialogTitle>
            <DialogDescription>Select a chapter to change it: unread, then in progress, then completed.</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div aria-hidden="true" className="flex flex-wrap gap-x-5 gap-y-2">
        {(["unread", "in-progress", "completed"] as const).map((status) => (
          <span key={status} className="type-small inline-flex items-center gap-2 text-[0.8125rem]">
            <span className={cn("size-4 rounded-md border", chapterTone(status))} />
            {STATUS_LABEL[status]}
          </span>
        ))}
      </div>

      <ul className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
        {Array.from({ length: book.chapters }, (_, index) => index + 1).map((chapter) => {
          const status = chapterStatus(data, book.id, chapter);
          return (
            <li key={chapter}>
              <button
                type="button"
                onClick={() => actions.setChapterStatus({ book: book.id, chapter }, NEXT[status])}
                aria-label={`${book.name} ${chapter}, ${STATUS_LABEL[status].toLowerCase()}. Change status`}
                className={cn("grid h-11 w-full cursor-pointer place-items-center rounded-xl border text-sm font-medium tabular-nums transition-colors duration-200", chapterTone(status))}
              >
                {chapter}
              </button>
            </li>
          );
        })}
      </ul>

      {clearing ? (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">Clear your progress in {book.name}?</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setClearing(false)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                actions.setBookStatus(book.id, "unread");
                setClearing(false);
              }}
            >
              Clear book
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              onClose();
              nav.go({ view: "bible", book: book.id, chapter: 1 });
            }}
          >
            Open {book.name}
          </Button>
          {!done && (
            <Button size="sm" variant="outline" onClick={() => actions.setBookStatus(book.id, "completed")}>
              Mark whole book read
            </Button>
          )}
          {(state.completed > 0 || state.inProgress > 0) && (
            <Button size="sm" variant="ghost" className="hover:text-destructive" onClick={() => setClearing(true)}>
              Clear book
            </Button>
          )}
        </div>
      )}
    </>
  );
}

function Backup() {
  const { data, actions } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const file = useRef<HTMLInputElement>(null);

  const save = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `lamp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restore = async (picked: File) => {
    try {
      const next = parseBackup(await picked.text());
      if (await confirm({ title: "Replace everything in this browser with the backup?", body: "Your current highlights, notes, bookmarks and progress will be overwritten.", confirm: "Restore backup" })) {
        actions.replaceAll(next);
        toast("Backup restored");
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "That file could not be read");
    }
  };

  const reset = async () => {
    if (await confirm({ title: "Delete all reading data?", body: "Highlights, notes, bookmarks and progress will be removed from this browser. This cannot be undone.", confirm: "Delete all data", destructive: true })) {
      actions.resetAll();
      toast("All reading data deleted");
    }
  };

  return (
    <section aria-labelledby="backup">
      <Panel surface="sunk" className="flex flex-col gap-4 p-6 sm:p-8">
        <MonoLabel>Your data</MonoLabel>
        <h2 id="backup" className="type-h3">
          Saved in this browser only
        </h2>
        <p className="type-body max-w-2xl text-pretty">Your highlights, notes and progress never leave this device. Save a backup to move them to another device or to keep them safe.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={save}>
            <Download aria-hidden="true" />
            Save a backup
          </Button>
          <Button size="sm" variant="outline" onClick={() => file.current?.click()}>
            <Upload aria-hidden="true" />
            Restore a backup
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              if (picked) void restore(picked);
              event.target.value = "";
            }}
          />
          <Button size="sm" variant="destructive" className="sm:ml-auto" onClick={reset}>
            Delete all data
          </Button>
        </div>
      </Panel>
    </section>
  );
}
