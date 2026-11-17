"use client";

import { ChevronRight, LibraryBig, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CANON, TOTAL_CHAPTERS } from "@/lib/bible/data/canon";
import { bookProgress, chapterStatus } from "@/lib/bible/services/progress";
import { useStore } from "@/lib/bible/store/AppStore";
import type { BookId, CanonBook, ChapterRef, Testament } from "@/lib/bible/types/bible";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { chapterTone, ProgressRing, useNav } from "./ui";

const TESTAMENTS: { id: Testament; title: string }[] = [
  { id: "OT", title: "Old Testament" },
  { id: "NT", title: "New Testament" },
];

const STATE_WORD = { unread: "", "in-progress": ", in progress", completed: ", read" } as const;

/**
 * The Bible's sidebar: both testaments as folders, every book with its own progress ring,
 * and the chapters of the open book as a grid that shows what has been read.
 */
export function BooksExplorer({ current, inputId, onNavigate }: { current?: ChapterRef; inputId: string; onNavigate?: () => void }) {
  const { data } = useStore();
  const nav = useNav();
  const reduced = useReducedMotion();
  const list = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState<Record<Testament, boolean>>({ OT: false, NT: false });
  // A hand-picked book stays open until the reader moves to a different book.
  const [picked, setPicked] = useState<{ anchor: string; book: BookId | null } | null>(null);
  const anchor = current?.book ?? "";
  const expanded = picked && picked.anchor === anchor ? picked.book : (current?.book ?? null);

  const progress = useMemo(() => new Map(CANON.map((book) => [book.id, bookProgress(data, book.id, book.chapters)])), [data]);
  const read = useMemo(() => [...progress.values()].reduce((sum, item) => sum + item.completed, 0), [progress]);

  useEffect(() => {
    const box = list.current;
    const row = box?.querySelector<HTMLElement>("[data-current-book]");
    if (box && row) box.scrollTop += row.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 3;
  }, [anchor]);

  const term = query.trim().toLowerCase();
  const visible = term ? CANON.filter((book) => book.name.toLowerCase().includes(term) || book.aliases.some((alias) => alias.startsWith(term))) : CANON;

  const open = (ref: ChapterRef) => {
    nav.go({ view: "bible", book: ref.book, chapter: ref.chapter });
    onNavigate?.();
  };

  const bookRow = (book: CanonBook) => {
    const state = progress.get(book.id) ?? { completed: 0, inProgress: 0, total: book.chapters };
    const isCurrent = current?.book === book.id;
    const single = book.chapters === 1;
    const isOpen = !single && expanded === book.id;
    return (
      <li key={book.id}>
        <button
          type="button"
          onClick={() => (single ? open({ book: book.id, chapter: 1 }) : setPicked({ anchor, book: isOpen ? null : book.id }))}
          aria-expanded={single ? undefined : isOpen}
          aria-current={isCurrent ? "true" : undefined}
          aria-label={`${book.name}, ${state.completed} of ${state.total} ${state.total === 1 ? "chapter" : "chapters"} read`}
          data-current-book={isCurrent ? "" : undefined}
          className={cn(
            "relative flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[0.875rem] text-ink-soft transition-colors duration-200 hover:bg-accent/60 hover:text-foreground",
            isCurrent && "bg-accent font-medium text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {isCurrent && <span aria-hidden="true" className="absolute top-2 bottom-2 -left-[0.5625rem] w-0.5 rounded-full bg-sky-bright" />}
          <ProgressRing value={state.total ? state.completed / state.total : 0} size={16} stroke={2.5} />
          <span className="truncate">{book.name}</span>
          <span className="type-label ml-auto text-[0.5625rem] tracking-[0.08em] text-muted-foreground tabular-nums">
            {state.completed}/{state.total}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <ul aria-label={`Chapters of ${book.name}`} className="grid grid-cols-6 gap-1 px-1 pt-1.5 pb-2.5">
                {Array.from({ length: book.chapters }, (_, index) => index + 1).map((chapter) => {
                  const status = chapterStatus(data, book.id, chapter);
                  const here = isCurrent && current?.chapter === chapter;
                  return (
                    <li key={chapter}>
                      <button
                        type="button"
                        onClick={() => open({ book: book.id, chapter })}
                        aria-current={here ? "page" : undefined}
                        aria-label={`Chapter ${chapter}${STATE_WORD[status]}`}
                        className={cn("grid h-9 w-full cursor-pointer place-items-center rounded-lg border text-[0.8125rem] font-medium tabular-nums transition-colors duration-200", chapterTone(status, here))}
                      >
                        {chapter}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <nav aria-label="Books of the Bible" className="flex h-full min-h-0 flex-col gap-3">
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a book"
          aria-label="Find a book by name"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-input bg-card/70 pr-9 pl-9 text-sm outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground focus-visible:border-sky-bright focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear the book filter" className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <X aria-hidden="true" className="size-3.5" />
          </button>
        )}
      </div>

      <div ref={list} className="-mr-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2">
        {visible.length ? (
          <ul className="flex flex-col gap-0.5">
            {TESTAMENTS.map((testament) => {
              const books = visible.filter((book) => book.testament === testament.id);
              if (!books.length) return null;
              const isOpen = Boolean(term) || !closed[testament.id];
              return (
                <li key={testament.id}>
                  <button
                    type="button"
                    onClick={() => setClosed((state) => ({ ...state, [testament.id]: !state[testament.id] }))}
                    aria-expanded={isOpen}
                    className="flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-[0.875rem] font-medium text-foreground transition-colors duration-200 hover:bg-accent/60"
                  >
                    <ChevronRight aria-hidden="true" className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo", isOpen && "rotate-90")} />
                    <LibraryBig aria-hidden="true" className="size-4 shrink-0 text-sky" />
                    <span className="truncate">{testament.title}</span>
                    <span className="type-label ml-auto pr-1 text-[0.5625rem] text-muted-foreground">{books.length}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                        <ul className="ml-[1.05rem] flex flex-col gap-0.5 border-l border-line pt-0.5 pb-1 pl-2">{books.map(bookRow)}</ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="type-small px-2 py-6 text-center">No book matches &ldquo;{query}&rdquo;.</p>
        )}
      </div>
      <p className="type-label border-t border-line pt-3 text-[0.5625rem] text-muted-foreground" aria-live="polite">
        {read.toLocaleString()} of {TOTAL_CHAPTERS.toLocaleString()} chapters read
      </p>
    </nav>
  );
}
