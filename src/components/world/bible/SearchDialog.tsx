"use client";

import { ArrowRight, Search } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { CANON, getCanonBook } from "@/lib/bible/data/canon";
import { loadAllBooks } from "@/lib/bible/services/bibleService";
import { parseWordQuery, searchBooks, type SearchHit, type SearchOptions, termPattern } from "@/lib/bible/services/search";
import { useStore } from "@/lib/bible/store/AppStore";
import type { BookData } from "@/lib/bible/types/bible";
import { formatRef, parseReference } from "@/lib/bible/utils/references";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MonoLabel } from "@/components/world/primitives";
import { cn } from "@/lib/utils";
import { fieldClass, useNav } from "./ui";

const PAGE = 50;
const EXAMPLES = ["John 3:16", "Psalm 23", "love", '"the Lord is my shepherd"', "faith hope"];

/** Search as a command palette: type a reference to jump there, or words to find every verse with them. */
export function SearchDialog({ open, initialQuery, onClose }: { open: boolean; initialQuery: string; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent initialFocus={input} className="top-4 max-h-[calc(100dvh-2rem)] translate-y-0 gap-0 overflow-hidden p-0 sm:top-[10vh] sm:max-h-[80dvh] sm:max-w-2xl">
        <SearchPanel initialQuery={initialQuery} input={input} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

function SearchPanel({ initialQuery, input, onClose }: { initialQuery: string; input: RefObject<HTMLInputElement | null>; onClose: () => void }) {
  const nav = useNav();
  const translationId = useStore().data.preferences.translation;
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [scope, setScope] = useState<SearchOptions["scope"]>("all");
  const [more, setMore] = useState({ key: "", limit: PAGE });
  const [books, setBooks] = useState<BookData[] | null>(null);
  const [loaded, setLoaded] = useState({ count: 0, total: CANON.length });
  const [loadError, setLoadError] = useState(false);
  const started = useRef<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const reference = useMemo(() => parseReference(debounced), [debounced]);
  const wordQuery = useMemo(() => parseWordQuery(debounced), [debounced]);
  const wanted = wordQuery !== null;

  // The whole text is fetched the first time a word search needs it, then kept by the Bible service.
  useEffect(() => {
    if (!wanted || started.current === translationId) return;
    started.current = translationId;
    loadAllBooks(translationId, (count, total) => setLoaded({ count, total }))
      .then((all) => {
        setLoadError(false);
        setBooks(all);
      })
      .catch(() => {
        started.current = null;
        setLoadError(true);
      });
  }, [wanted, translationId]);

  const moreKey = `${debounced}|${scope}`;
  const limit = more.key === moreKey ? more.limit : PAGE;
  const results = useMemo(() => (books && wordQuery ? searchBooks(books, wordQuery, { scope, limit }) : null), [books, wordQuery, scope, limit]);

  const openHit = (location: { book: string; chapter: number; verse?: number }) => {
    onClose();
    nav.openPassage(location);
  };

  const refBook = reference ? getCanonBook(reference.book) : undefined;
  const typed = debounced.trim().length > 0;

  return (
    <>
      <div className="border-b border-line p-4 pr-14 sm:p-5 sm:pr-16">
        <DialogTitle className="sr-only">Search the Bible</DialogTitle>
        <DialogDescription className="sr-only">Search words, phrases or references in the King James Version.</DialogDescription>
        <form role="search" onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-3">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Search words, phrases or references"
              placeholder="Try John 3:16, Genesis 1 or a word like love"
              className={cn(fieldClass, "h-12 pl-11 text-base [&::-webkit-search-cancel-button]:hidden")}
            />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="search-scope" className="type-label shrink-0 text-muted-foreground">
              Search in
            </label>
            <select id="search-scope" value={scope} onChange={(event) => setScope(event.target.value)} className={cn(fieldClass, "h-9 max-w-64 cursor-pointer")}>
              <option value="all">The whole Bible</option>
              <option value="OT">Old Testament</option>
              <option value="NT">New Testament</option>
              {CANON.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-5" aria-live="polite">
        {!typed && (
          <div className="flex flex-col gap-4">
            <p className="type-body">Search for a word, a phrase in quotes, a book, a chapter or a verse.</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <Button key={example} variant="outline" size="sm" onClick={() => setQuery(example)}>
                  {example}
                </Button>
              ))}
            </div>
          </div>
        )}

        {reference && refBook && (
          <button
            type="button"
            onClick={() => openHit(reference)}
            className="group/go flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-sky-bright/30 bg-accent px-5 py-4 text-left text-accent-foreground transition-shadow duration-500 hover:shadow-glow"
          >
            <span className="flex flex-col gap-2">
              <span className="type-label text-[0.5625rem]">Go to</span>
              <span className="font-display text-xl font-semibold tracking-tight">{formatRef(reference)}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-5 transition-transform duration-300 group-hover/go:translate-x-1" />
          </button>
        )}

        {wanted && !books && !loadError && (
          <p role="status" className="flex items-center gap-3">
            <MonoLabel dot>
              Preparing search, {loaded.count} of {loaded.total} books
            </MonoLabel>
          </p>
        )}
        {wanted && loadError && (
          <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            Search could not load the Bible text. Check your connection and try again.
          </p>
        )}

        {results && (
          <Results
            hits={results.hits}
            total={results.total}
            terms={wordQuery?.terms ?? []}
            hasReference={Boolean(reference && refBook)}
            query={debounced}
            onOpen={openHit}
            onMore={() => setMore({ key: moreKey, limit: limit + PAGE })}
          />
        )}
      </div>
    </>
  );
}

function Results({ hits, total, terms, hasReference, query, onOpen, onMore }: { hits: SearchHit[]; total: number; terms: string[]; hasReference: boolean; query: string; onOpen: (hit: SearchHit) => void; onMore: () => void }) {
  if (total === 0) {
    if (hasReference) return null;
    return (
      <div className="flex flex-col gap-2">
        <p className="font-display text-lg font-semibold tracking-tight">No verses contain &ldquo;{query.replace(/"/g, "")}&rdquo;</p>
        <p className="type-body">
          The King James Version uses older English, so try other forms of the word (for example &ldquo;believeth&rdquo; instead of &ldquo;believes&rdquo;), fewer words, or search the whole Bible.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <MonoLabel>
        {total.toLocaleString()} {total === 1 ? "verse" : "verses"} found
      </MonoLabel>
      <ul className="flex flex-col">
        {hits.map((hit) => (
          <li key={`${hit.book}.${hit.chapter}.${hit.verse}`} className="border-t border-line first:border-t-0">
            <button type="button" onClick={() => onOpen(hit)} className="-mx-2 flex w-[calc(100%+1rem)] cursor-pointer flex-col gap-1.5 rounded-xl px-2 py-3 text-left transition-colors duration-200 hover:bg-accent/60">
              <span className="type-label text-[0.625rem] text-sky">{formatRef(hit)}</span>
              <span className="text-[0.9375rem] leading-relaxed text-ink-soft">
                <Marked text={hit.text} terms={terms} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {hits.length < total && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={onMore}>
            Show more results
          </Button>
        </div>
      )}
    </div>
  );
}

function Marked({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const parts = text.split(termPattern(terms));
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="rounded-[4px] bg-accent px-0.5 font-medium text-accent-foreground">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
