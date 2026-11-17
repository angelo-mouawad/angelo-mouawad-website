"use client";

import { ALargeSmall, ArrowLeft, ArrowRight, Bookmark, Check, ChevronRight, Circle, CircleCheck, CircleDot, Copy, Eraser, Share2, StickyNote, X } from "lucide-react";
import { motion } from "motion/react";
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getCanonBook } from "@/lib/bible/data/canon";
import { getPlan } from "@/lib/bible/data/plans";
import { getTranslationInfo } from "@/lib/bible/data/translations";
import { useAsync } from "@/lib/bible/hooks/useAsync";
import type { Route } from "@/lib/bible/hooks/useRoute";
import { loadBook } from "@/lib/bible/services/bibleService";
import { bookProgress, chapterStatus, isDayDone, isRead, planStatus } from "@/lib/bible/services/progress";
import { HIGHLIGHT_COLORS } from "@/lib/bible/services/storage";
import { useStore } from "@/lib/bible/store/AppStore";
import { useTranslationOrNull } from "@/lib/bible/store/BibleProvider";
import type { BookData, CanonBook, ChapterRef } from "@/lib/bible/types/bible";
import type { ChapterStatus, Highlight, HighlightColor, Note, ReadingWidth } from "@/lib/bible/types/storage";
import { copyText, percent, shareText } from "@/lib/bible/utils/misc";
import { passageText } from "@/lib/bible/utils/passage";
import { formatRef, nextChapter, previousChapter, verseKey } from "@/lib/bible/utils/references";
import { Button } from "@/components/ui/button";
import { MonoLabel, Panel } from "@/components/world/primitives";
import { cn } from "@/lib/utils";
import { NoteDialog } from "./NoteDialog";
import { EmptyState, ProgressRing, Segmented, useNav, useToast } from "./ui";

type BibleRoute = Extract<Route, { view: "bible" }>;

const WIDTH: Record<ReadingWidth, string> = { narrow: "max-w-[38rem]", medium: "max-w-3xl", wide: "max-w-[62rem]" };

const STATUS_OPTIONS: { id: ChapterStatus; label: string; icon: ReactNode }[] = [
  { id: "unread", label: "Unread", icon: <Circle aria-hidden="true" /> },
  { id: "in-progress", label: "In progress", icon: <CircleDot aria-hidden="true" /> },
  { id: "completed", label: "Completed", icon: <CircleCheck aria-hidden="true" /> },
];

const SKELETON = ["94%", "88%", "97%", "72%", "91%", "84%", "96%", "58%"];

/** One chapter, laid out like a note page: breadcrumbs, a large title, then a calm column of verses. */
export function Reader({ route }: { route: BibleRoute }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const toast = useToast();
  const translation = useTranslationOrNull();
  const fallback = data.lastLocation ?? { book: "GEN", chapter: 1 };
  const bookId = route.book ?? fallback.book;
  const chapter = route.chapter ?? (route.book ? 1 : fallback.chapter);
  const canon = getCanonBook(bookId);
  const translationId = data.preferences.translation;
  const book = useAsync(canon ? `${translationId}:${bookId}` : null, () => loadBook(translationId, bookId));

  if (!canon) {
    return (
      <div className="pt-10">
        <EmptyState title={`There is no book called "${route.book}"`} action={{ label: "Choose a book", onClick: nav.openBooks }}>
          Check the spelling, or pick a book from the list.
        </EmptyState>
      </div>
    );
  }

  if (chapter > canon.chapters) {
    return (
      <div className="pt-10">
        <EmptyState
          title={`${canon.name} has ${canon.chapters} ${canon.chapters === 1 ? "chapter" : "chapters"}`}
          action={{ label: `Open ${canon.name} ${canon.chapters}`, onClick: () => nav.go({ view: "bible", book: canon.id, chapter: canon.chapters }) }}
        >
          There is no chapter {chapter}.
        </EmptyState>
      </div>
    );
  }

  const here = { book: bookId, chapter };
  const previous = previousChapter(here);
  const next = nextChapter(here);
  const status = chapterStatus(data, bookId, chapter);
  const chapterBookmark = data.bookmarks.find((item) => item.kind === "chapter" && item.book === bookId && item.chapter === chapter);
  const open = (ref: ChapterRef) => nav.go({ view: "bible", book: ref.book, chapter: ref.chapter });
  const verseCount = (book.status === "ready" ? book.value.chapters[chapter - 1]?.length : translation?.books.find((item) => item.id === bookId)?.verseCounts[chapter - 1]) ?? 0;

  return (
    <div className="grid gap-12 pt-8 2xl:grid-cols-[minmax(0,1fr)_14rem]">
      <article className={cn("mx-auto w-full min-w-0", WIDTH[data.preferences.width])}>
        <nav aria-label="Breadcrumb">
          <ol className="type-label flex flex-wrap items-center gap-x-1.5 gap-y-2 text-muted-foreground">
            <li>
              <button type="button" onClick={() => nav.go({ view: "home" })} className="cursor-pointer rounded uppercase transition-colors hover:text-sky">
                Bible
              </button>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="size-3" />
              {canon.testament === "OT" ? "Old Testament" : "New Testament"}
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="size-3" />
              <button type="button" onClick={nav.openBooks} aria-label={`${canon.name}. Choose another book or chapter`} className="cursor-pointer rounded uppercase transition-colors hover:text-sky">
                {canon.name}
              </button>
            </li>
            <li className="flex items-center gap-1.5 text-foreground" aria-current="page">
              <ChevronRight aria-hidden="true" className="size-3 text-muted-foreground" />
              Chapter {chapter}
            </li>
          </ol>
        </nav>

        <div className="mt-6 flex items-end justify-between gap-4">
          <h1 className="type-h1 text-[clamp(2.125rem,4.6vw,3.5rem)] text-balance">{formatRef(here)}</h1>
          <div className="flex shrink-0 gap-1.5 pb-1">
            <Button variant="glass" size="icon-sm" disabled={!previous} onClick={() => previous && open(previous)} aria-label={previous ? `Previous chapter, ${formatRef(previous)}` : "No previous chapter"}>
              <ArrowLeft aria-hidden="true" />
            </Button>
            <Button variant="glass" size="icon-sm" disabled={!next} onClick={() => next && open(next)} aria-label={next ? `Next chapter, ${formatRef(next)}` : "No next chapter"}>
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Segmented legend="Chapter status" options={STATUS_OPTIONS} value={status} onChange={(value) => actions.setChapterStatus(here, value)} />
          <Button
            variant="glass"
            size="sm"
            aria-pressed={Boolean(chapterBookmark)}
            className={cn(chapterBookmark && "border-sky-bright/40 bg-accent text-accent-foreground hover:bg-accent")}
            onClick={() => {
              if (chapterBookmark) {
                actions.removeBookmark(chapterBookmark.id);
                toast("Chapter bookmark removed");
              } else {
                actions.addBookmark({ kind: "chapter", book: bookId, chapter });
                toast(`${canon.name} ${chapter} bookmarked`);
              }
            }}
          >
            <Bookmark aria-hidden="true" className={cn(chapterBookmark && "fill-current")} />
            {chapterBookmark ? "Bookmarked" : "Bookmark chapter"}
          </Button>
          <Button variant="glass" size="sm" onClick={nav.openSettings} aria-label="Text size and reading settings">
            <ALargeSmall aria-hidden="true" />
            Text
          </Button>
        </div>

        {book.status === "loading" && (
          <div role="status" className="mt-10 flex flex-col gap-5">
            <MonoLabel dot>Opening {canon.name}</MonoLabel>
            <div aria-hidden="true" className="flex flex-col gap-4">
              {SKELETON.map((width, index) => (
                <span key={index} className="h-4 animate-pulse rounded-full bg-sunk motion-reduce:animate-none" style={{ width }} />
              ))}
            </div>
          </div>
        )}
        {book.status === "error" && (
          <div className="mt-10">
            <EmptyState title={`${canon.name} could not be loaded`} action={{ label: "Try again", onClick: book.retry }}>
              Check your internet connection. {book.error}
            </EmptyState>
          </div>
        )}
        {book.status === "ready" && <Chapter key={`${bookId}.${chapter}`} book={book.value} canon={canon} chapter={chapter} route={route} translationId={translationId} />}

        <nav aria-label="More chapters" className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {previous ? (
            <button type="button" onClick={() => open(previous)} className="group/prev cursor-pointer rounded-3xl text-left outline-offset-4">
              <Panel surface="glass" className="flex h-full flex-col gap-2 p-5 transition-shadow duration-500 group-hover/prev:shadow-glow">
                <MonoLabel>
                  <ArrowLeft aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/prev:-translate-x-0.5" />
                  Previous
                </MonoLabel>
                <span className="font-display text-lg font-medium tracking-tight">{formatRef(previous)}</span>
              </Panel>
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button type="button" onClick={() => open(next)} className="group/next cursor-pointer rounded-3xl text-right outline-offset-4">
              <Panel surface="glass" className="flex h-full flex-col items-end gap-2 p-5 transition-shadow duration-500 group-hover/next:shadow-glow">
                <MonoLabel>
                  Next
                  <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/next:translate-x-0.5" />
                </MonoLabel>
                <span className="font-display text-lg font-medium tracking-tight">{formatRef(next)}</span>
              </Panel>
            </button>
          )}
        </nav>
      </article>

      <aside className="hidden 2xl:block">
        <BookRail canon={canon} chapter={chapter} verseCount={verseCount} activeVerse={route.verse} />
      </aside>
    </div>
  );
}

/** The right hand column on very wide screens: how far through the book, and a jump to any verse. */
function BookRail({ canon, chapter, verseCount, activeVerse }: { canon: CanonBook; chapter: number; verseCount: number; activeVerse?: number }) {
  const { data } = useStore();
  const nav = useNav();
  const progress = bookProgress(data, canon.id, canon.chapters);
  const fraction = progress.total ? progress.completed / progress.total : 0;

  return (
    <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col gap-4">
      <p className="type-label text-muted-foreground">This book</p>
      <div className="flex items-center gap-4">
        <ProgressRing value={fraction} size={64} display={`${percent(progress.completed, progress.total)}%`} />
        <p className="type-small">
          <span className="block font-medium text-foreground">{canon.name}</span>
          {progress.completed} of {progress.total} {progress.total === 1 ? "chapter" : "chapters"} read
        </p>
      </div>
      {verseCount > 0 && (
        <>
          <p className="type-label mt-4 text-muted-foreground">Jump to verse</p>
          <ul className="-mr-2 grid min-h-0 grid-cols-5 gap-1 overflow-y-auto overscroll-contain pr-2">
            {Array.from({ length: verseCount }, (_, index) => index + 1).map((verse) => (
              <li key={verse}>
                <button
                  type="button"
                  onClick={() => nav.openPassage({ book: canon.id, chapter, verse })}
                  aria-label={`Go to verse ${verse}`}
                  aria-current={activeVerse === verse ? "location" : undefined}
                  className={cn(
                    "grid h-8 w-full cursor-pointer place-items-center rounded-lg font-mono text-[0.6875rem] text-muted-foreground tabular-nums transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                    activeVerse === verse && "bg-accent font-medium text-accent-foreground",
                  )}
                >
                  {verse}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Chapter({ book, canon, chapter, route, translationId }: { book: BookData; canon: CanonBook; chapter: number; route: BibleRoute; translationId: string }) {
  const { data, actions } = useStore();
  const toast = useToast();
  const verses = book.chapters[chapter - 1];
  const [selected, setSelected] = useState<number[]>([]);
  const [noteVerse, setNoteVerse] = useState<number | null>(null);
  const prefs = data.preferences;
  const abbreviation = getTranslationInfo(translationId).abbreviation;
  const targetVerse = route.verse && verses && route.verse <= verses.length ? route.verse : undefined;

  useEffect(() => {
    actions.setLastLocation({ book: book.id, chapter, verse: route.verse });
  }, [actions, book.id, chapter, route.verse]);

  useEffect(() => {
    if (targetVerse) document.getElementById(`v${targetVerse}`)?.scrollIntoView({ block: "center" });
  }, [targetVerse]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector('[data-slot="dialog-content"], [data-slot="sheet-content"]')) setSelected([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = useCallback((verse: number) => setSelected((list) => (list.includes(verse) ? list.filter((item) => item !== verse) : [...list, verse].sort((a, b) => a - b))), []);
  const editNote = useCallback((verse: number) => setNoteVerse(verse), []);

  const bookmarkedVerses = useMemo(() => {
    const set = new Set<number>();
    for (const item of data.bookmarks) if (item.book === book.id && item.chapter === chapter && item.verse) set.add(item.verse);
    return set;
  }, [data.bookmarks, book.id, chapter]);

  if (!verses) {
    return (
      <div className="mt-10">
        <EmptyState title={`${canon.name} ${chapter} is missing from this translation`} />
      </div>
    );
  }

  const here = { book: book.id, chapter };
  const key = (verse: number) => verseKey(translationId, book.id, chapter, verse);
  const status = chapterStatus(data, book.id, chapter);
  const first = selected[0];
  const colours = new Set(selected.map((verse) => data.highlights[key(verse)]?.color));
  const sharedColour = colours.size === 1 ? [...colours][0] : undefined;
  const allBookmarked = selected.length > 0 && selected.every((verse) => bookmarkedVerses.has(verse));
  const passage = selected.length ? passageText(book, book.id, chapter, selected, abbreviation) : null;
  const inPlan = Boolean(route.planId && route.planDay);

  return (
    <>
      {route.verse && !targetVerse && (
        <p role="status" className="mt-8 rounded-2xl border border-line bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
          {canon.name} {chapter} has {verses.length} verses, so verse {route.verse} does not exist. Showing the whole chapter.
        </p>
      )}
      <p className="type-small mt-6">Select one or more verses to highlight them, add a note, bookmark, copy or share.</p>

      <div className="panel mt-6 rounded-3xl px-2 py-5 sm:px-6 sm:py-8">
      <ol className="scripture flex flex-col" style={{ fontSize: `${prefs.fontSize}px` }} aria-label={`${canon.name} chapter ${chapter}`}>
        {verses.map((text, index) => {
          const verse = index + 1;
          return (
            <Verse
              key={verse}
              verse={verse}
              text={text}
              selected={selected.includes(verse)}
              targeted={verse === targetVerse}
              highlight={data.highlights[key(verse)]}
              note={data.notes[key(verse)]}
              bookmarked={bookmarkedVerses.has(verse)}
              showNumber={prefs.showVerseNumbers}
              onToggle={toggle}
              onEditNote={editNote}
            />
          );
        })}
      </ol>
      </div>

      {inPlan && route.planId && route.planDay ? (
        <PlanDayPanel planId={route.planId} day={route.planDay} current={here} />
      ) : (
        <div className="mt-12 flex flex-wrap items-center gap-3">
          {status === "completed" ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-positive">
              <CircleCheck aria-hidden="true" className="size-4.5" />
              You have read this chapter
            </p>
          ) : (
            <Button
              onClick={() => {
                actions.setChapterStatus(here, "completed");
                toast(`${canon.name} ${chapter} marked as read`);
              }}
            >
              <Check aria-hidden="true" />
              Mark chapter as read
            </Button>
          )}
        </div>
      )}

      {selected.length > 0 && <div aria-hidden="true" className="h-40" />}
      {selected.length > 0 && passage && (
        <VerseBar
          label={passage.reference}
          count={selected.length}
          currentColour={sharedColour}
          hasNote={selected.length === 1 && Boolean(data.notes[key(first)])}
          bookmarked={allBookmarked}
          onHighlight={(colour) => {
            selected.forEach((verse) => actions.setHighlight({ ...here, verse }, colour));
            toast(colour ? `Highlighted ${colour}` : "Highlight removed");
          }}
          onNote={() => setNoteVerse(first)}
          onBookmark={() => {
            if (allBookmarked) {
              data.bookmarks.filter((item) => item.kind === "verse" && item.book === book.id && item.chapter === chapter && item.verse && selected.includes(item.verse)).forEach((item) => actions.removeBookmark(item.id));
              toast("Bookmark removed");
            } else {
              selected.forEach((verse) => actions.addBookmark({ kind: "verse", ...here, verse }));
              toast("Bookmarked");
            }
          }}
          onCopy={async () => {
            toast((await copyText(passage.text)) ? `Copied ${passage.reference}` : "Copying is not allowed in this browser");
          }}
          onShare={async () => {
            const result = await shareText(passage.reference, passage.text);
            if (result === "copied") toast(`Copied ${passage.reference}, ready to paste`);
            if (result === "failed") toast("Sharing is not available in this browser");
          }}
          onClear={() => setSelected([])}
        />
      )}

      <NoteDialog
        note={noteVerse ? { reference: `${canon.name} ${chapter}:${noteVerse}`, verseText: verses[noteVerse - 1] ?? "", initialText: data.notes[key(noteVerse)]?.text ?? "" } : null}
        onClose={() => setNoteVerse(null)}
        onSave={(text) => {
          if (noteVerse) actions.saveNote({ ...here, verse: noteVerse }, text);
          setNoteVerse(null);
          setSelected([]);
          toast("Note saved");
        }}
        onDelete={() => {
          if (noteVerse) actions.deleteNote({ ...here, verse: noteVerse });
          setNoteVerse(null);
          toast("Note deleted");
        }}
      />
    </>
  );
}

const Verse = memo(function Verse({
  verse,
  text,
  selected,
  targeted,
  highlight,
  note,
  bookmarked,
  showNumber,
  onToggle,
  onEditNote,
}: {
  verse: number;
  text: string;
  selected: boolean;
  targeted: boolean;
  highlight?: Highlight;
  note?: Note;
  bookmarked: boolean;
  showNumber: boolean;
  onToggle: (verse: number) => void;
  onEditNote: (verse: number) => void;
}) {
  const state = [highlight && `highlighted ${highlight.color}`, note && "has a note", bookmarked && "bookmarked"].filter(Boolean);
  return (
    <li id={`v${verse}`} data-ink={highlight ? "" : undefined}>
      <button
        type="button"
        onClick={() => onToggle(verse)}
        aria-pressed={selected}
        aria-label={`Verse ${verse}${state.length ? `, ${state.join(", ")}` : ""}. ${text}`}
        className={cn(
          "grid w-full cursor-pointer gap-x-2.5 rounded-xl px-2 py-1 text-left transition-colors duration-200 sm:px-3",
          showNumber ? "grid-cols-[1.5rem_minmax(0,1fr)] sm:grid-cols-[1.75rem_minmax(0,1fr)]" : "grid-cols-1",
          selected ? "bg-accent ring-1 ring-sky-bright/60" : targeted ? "bg-accent/50 ring-1 ring-cyan/70" : "hover:bg-accent/40",
        )}
      >
        {showNumber && (
          <span aria-hidden="true" className={cn("text-right font-mono text-[0.55em] leading-[3.36] text-muted-foreground tabular-nums select-none", selected && "text-sky")}>
            {verse}
          </span>
        )}
        <span aria-hidden="true">
          <span className={cn("verse-text box-decoration-clone rounded-[5px]", highlight && `ink-${highlight.color} px-1 py-0.5`)}>{text}</span>
          {(note || bookmarked) && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle text-sky">
              {bookmarked && <Bookmark className="size-[0.7em] fill-current" />}
              {note && <StickyNote className="size-[0.7em]" />}
            </span>
          )}
        </span>
      </button>
      {note && (
        <button
          type="button"
          onClick={() => onEditNote(verse)}
          aria-label={`Your note on verse ${verse}: ${note.text}. Edit note`}
          className={cn(
            "mt-1 mb-3 flex w-auto cursor-pointer flex-col gap-2 rounded-2xl border border-line bg-card/60 px-4 py-3 text-left transition-colors duration-200 hover:border-sky-bright/60",
            showNumber ? "ml-[2.625rem] sm:ml-[3.125rem]" : "ml-2 sm:ml-3",
          )}
        >
          <span aria-hidden="true" className="type-label text-[0.5625rem] text-sky">
            Your note
          </span>
          <span aria-hidden="true" className="font-body text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink-soft">
            {note.text}
          </span>
        </button>
      )}
    </li>
  );
});

const colourName = (colour: HighlightColor) => colour.charAt(0).toUpperCase() + colour.slice(1);

/** Floating tools for the selected verses. It takes the dock's place while it is open. */
function VerseBar({
  label,
  count,
  currentColour,
  hasNote,
  bookmarked,
  onHighlight,
  onNote,
  onBookmark,
  onCopy,
  onShare,
  onClear,
}: {
  label: string;
  count: number;
  currentColour?: HighlightColor;
  hasNote: boolean;
  bookmarked: boolean;
  onHighlight: (colour: HighlightColor | null) => void;
  onNote: () => void;
  onBookmark: () => void;
  onCopy: () => void;
  onShare: () => void;
  onClear: () => void;
}) {
  return createPortal(
    <div className="verse-bar bible-chrome pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] font-body">
      <motion.div
        role="region"
        aria-label={`Actions for ${label}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong pointer-events-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl p-4 text-foreground"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-baseline gap-2.5 font-display text-base font-semibold tracking-tight">
            <span className="truncate">{label}</span>
            {count > 1 && <span className="type-label shrink-0 text-[0.5625rem] text-muted-foreground">{count} verses</span>}
          </p>
          <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Close and clear selection">
            <X aria-hidden="true" />
          </Button>
        </div>

        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Highlight colour</legend>
          {HIGHLIGHT_COLORS.map((colour) => (
            <button
              key={colour}
              type="button"
              onClick={() => onHighlight(colour)}
              aria-pressed={currentColour === colour}
              aria-label={`Highlight ${colour}`}
              title={colourName(colour)}
              className={cn(
                `ink-${colour} grid size-10 cursor-pointer place-items-center rounded-full border border-line-strong transition-transform duration-300 ease-out-expo hover:scale-110 motion-reduce:hover:scale-100`,
                currentColour === colour && "border-foreground ring-2 ring-ring/40",
              )}
            >
              {currentColour === colour && <Check aria-hidden="true" className="size-4" />}
            </button>
          ))}
          {currentColour && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onHighlight(null)}>
              <Eraser aria-hidden="true" />
              Remove
            </Button>
          )}
        </fieldset>

        <div className="grid grid-cols-4 gap-2">
          <BarAction icon={<StickyNote aria-hidden="true" />} label={hasNote ? "Edit note" : "Note"} onClick={onNote} disabled={count !== 1} />
          <BarAction icon={<Bookmark aria-hidden="true" className={cn(bookmarked && "fill-current")} />} label={bookmarked ? "Saved" : "Bookmark"} onClick={onBookmark} active={bookmarked} />
          <BarAction icon={<Copy aria-hidden="true" />} label="Copy" onClick={onCopy} />
          <BarAction icon={<Share2 aria-hidden="true" />} label="Share" onClick={onShare} />
        </div>
        {count > 1 && <p className="type-small text-[0.8125rem]">Select a single verse to add a note.</p>}
      </motion.div>
    </div>,
    document.body,
  );
}

function BarAction({ icon, label, onClick, disabled, active }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex h-14 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-card/70 text-[0.8125rem] font-medium text-foreground transition-colors duration-300 hover:border-sky-bright hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40 sm:h-11 sm:flex-row sm:gap-2 [&_svg]:size-4",
        active && "border-sky-bright/40 bg-accent text-accent-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** Shown under a chapter opened from a reading plan: where this chapter sits in the day. */
function PlanDayPanel({ planId, day, current }: { planId: string; day: number; current: ChapterRef }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const plan = getPlan(planId);
  const planDay = plan?.days.find((item) => item.day === day);
  if (!plan || !planDay) return null;

  const done = isDayDone(data.plans[planId], day);
  const status = planStatus(plan, data.plans[planId]);
  const index = planDay.readings.findIndex((reading) => reading.book === current.book && reading.chapter === current.chapter);
  const nextReading = index >= 0 ? planDay.readings[index + 1] : undefined;

  return (
    <Panel surface="glass" ticks className="mt-12 flex flex-col gap-5 p-6" role="complementary" aria-label={`${plan.name}, day ${day}`}>
      <div className="flex items-center gap-4">
        <ProgressRing value={status.total ? status.completedCount / status.total : 0} size={56} display={`${status.completedCount}`} label={`${status.completedCount} of ${status.total} days done`} />
        <div className="flex flex-col gap-1.5">
          <MonoLabel>
            Day {day} of {plan.days.length}
          </MonoLabel>
          <p className="font-display text-lg font-semibold tracking-tight">{plan.name}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {planDay.readings.map((reading) => {
          const read = isRead(data, reading);
          const here = reading.book === current.book && reading.chapter === current.chapter;
          return (
            <li key={`${reading.book}${reading.chapter}`} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.9375rem]">
              {read ? <CircleCheck aria-hidden="true" className="size-4 text-positive" /> : <Circle aria-hidden="true" className="size-4 text-muted-foreground" />}
              <span className={cn(here ? "font-semibold text-foreground" : "text-ink-soft")}>{formatRef(reading)}</span>
              <span className="type-small text-[0.8125rem]">{read ? "Read" : "Not read yet"}</span>
              {here && <span className="type-label text-[0.5625rem] text-sky">You are here</span>}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        {nextReading && (
          <Button size="sm" onClick={() => nav.go({ view: "bible", ...nextReading, planId, planDay: day })}>
            Next: {formatRef(nextReading)}
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
        {done ? (
          <p className="inline-flex items-center gap-2 px-2 text-sm font-medium text-positive">
            <CircleCheck aria-hidden="true" className="size-4.5" />
            Day {day} complete
          </p>
        ) : (
          <Button size="sm" variant={nextReading ? "outline" : "default"} onClick={() => actions.setPlanDay(planId, day, true, planDay.readings)}>
            <Check aria-hidden="true" />
            Mark day {day} complete
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => nav.go({ view: "plans", planId, day })}>
          Back to plan
        </Button>
      </div>
    </Panel>
  );
}
