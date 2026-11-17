"use client";

import { ArrowRight, Bookmark, Highlighter, Pencil, StickyNote, Trash2 } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { bookIndex, CANON } from "@/lib/bible/data/canon";
import type { StudyTab } from "@/lib/bible/hooks/useRoute";
import { useVerseLookup } from "@/lib/bible/hooks/useVerseLookup";
import { HIGHLIGHT_COLORS } from "@/lib/bible/services/storage";
import { useStore } from "@/lib/bible/store/AppStore";
import type { HighlightColor, Note } from "@/lib/bible/types/storage";
import { formatDate } from "@/lib/bible/utils/misc";
import { formatRef } from "@/lib/bible/utils/references";
import { Button } from "@/components/ui/button";
import { MonoLabel, Panel } from "@/components/world/primitives";
import { cn } from "@/lib/utils";
import { NoteDialog } from "./NoteDialog";
import { EmptyState, fieldClass, PageHeader, Segmented, useConfirm, useNav, useToast } from "./ui";

const TABS: { id: StudyTab; label: string }[] = [
  { id: "highlights", label: "Highlights" },
  { id: "notes", label: "Notes" },
  { id: "bookmarks", label: "Bookmarks" },
];

type SortMode = "recent" | "bible";

const SORTS: { id: SortMode; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "bible", label: "Bible order" },
];

type Place = { book: string; chapter: number; verse?: number };

const inBook = (book: string) => (item: { book: string }) => book === "all" || item.book === book;
const byBibleOrder = (a: Place, b: Place) => bookIndex(a.book) - bookIndex(b.book) || a.chapter - b.chapter || (a.verse ?? 0) - (b.verse ?? 0);

export function StudyView({ tab }: { tab: StudyTab }) {
  const { data } = useStore();
  const nav = useNav();
  const [book, setBook] = useState("all");
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});

  const counts = { highlights: Object.keys(data.highlights).length, notes: Object.keys(data.notes).length, bookmarks: data.bookmarks.length };

  const booksWithItems = useMemo(() => {
    const ids = new Set<string>();
    Object.values(data.highlights).forEach((item) => ids.add(item.book));
    Object.values(data.notes).forEach((item) => ids.add(item.book));
    data.bookmarks.forEach((item) => ids.add(item.book));
    return CANON.filter((item) => ids.has(item.id));
  }, [data.highlights, data.notes, data.bookmarks]);

  const onTabKey = (event: KeyboardEvent) => {
    const index = TABS.findIndex((item) => item.id === tab);
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = TABS[(index + step + TABS.length) % TABS.length];
    nav.go({ view: "study", tab: next.id });
    tabs.current[next.id]?.focus();
  };

  return (
    <div className="flex flex-col gap-8 pt-8">
      <PageHeader label="Study" title="What you have marked." lead="Everything you have highlighted, written and saved, in one place." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Study sections" onKeyDown={onTabKey} className="inline-flex max-w-full rounded-full border border-line bg-card/60 p-1">
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabs.current[item.id] = element;
                }}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={active}
                aria-controls={`panel-${item.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => nav.go({ view: "study", tab: item.id })}
                className={cn(
                  "flex h-9 min-w-0 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[0.8125rem] font-medium whitespace-nowrap text-muted-foreground transition-colors duration-300 hover:text-foreground",
                  active && "bg-primary text-primary-foreground shadow-soft hover:text-primary-foreground",
                )}
              >
                {item.label}
                <span className={cn("font-mono text-[0.6875rem] tabular-nums", active ? "opacity-70" : "text-muted-foreground")}>{counts[item.id]}</span>
              </button>
            );
          })}
        </div>
        {booksWithItems.length > 1 && (
          <div className="flex items-center gap-3">
            <label htmlFor="study-book" className="type-label text-muted-foreground">
              Book
            </label>
            <select id="study-book" value={book} onChange={(event) => setBook(event.target.value)} className={cn(fieldClass, "h-9 w-48 cursor-pointer")}>
              <option value="all">All books</option>
              {booksWithItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="flex flex-col gap-5">
        {tab === "highlights" && <Highlights book={book} />}
        {tab === "notes" && <Notes book={book} />}
        {tab === "bookmarks" && <Bookmarks book={book} />}
      </div>
    </div>
  );
}

function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li>
      <Panel surface="solid" className={cn("flex items-start gap-2 rounded-2xl p-2 pl-4 sm:pl-5", className)}>
        {children}
      </Panel>
    </li>
  );
}

const openClass = "group/open -ml-2 flex min-w-0 flex-1 cursor-pointer flex-col gap-2 rounded-xl px-2 py-2.5 text-left transition-colors duration-200 hover:bg-accent/60";

function Highlights({ book }: { book: string }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const [colour, setColour] = useState<HighlightColor | "all">("all");
  const [sort, setSort] = useState<SortMode>("recent");
  const items = useMemo(
    () =>
      Object.values(data.highlights)
        .filter(inBook(book))
        .filter((item) => colour === "all" || item.color === colour)
        .sort(sort === "recent" ? (a, b) => b.updatedAt - a.updatedAt : byBibleOrder),
    [data.highlights, book, colour, sort],
  );
  const text = useVerseLookup(items);

  if (Object.keys(data.highlights).length === 0) {
    return (
      <EmptyState icon={<Highlighter aria-hidden="true" />} title="No highlights yet" action={{ label: "Open the Bible", onClick: () => nav.go({ view: "bible" }) }}>
        While reading, select any verse and choose a colour to highlight it.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex flex-wrap items-center gap-1.5">
          <legend className="sr-only">Colour</legend>
          <button
            type="button"
            aria-pressed={colour === "all"}
            onClick={() => setColour("all")}
            className={cn("h-9 cursor-pointer rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors duration-300", colour === "all" ? "border-primary bg-primary text-primary-foreground" : "border-line bg-card/60 text-muted-foreground hover:text-foreground")}
          >
            All
          </button>
          {HIGHLIGHT_COLORS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={colour === item}
              onClick={() => setColour(item)}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-[0.8125rem] font-medium capitalize transition-colors duration-300",
                colour === item ? "border-primary bg-card text-foreground" : "border-line bg-card/60 text-muted-foreground hover:text-foreground",
              )}
            >
              <span aria-hidden="true" className={cn(`ink-${item}`, "size-3.5 rounded-full border border-line-strong")} />
              {item}
            </button>
          ))}
        </fieldset>
        <Segmented legend="Order" options={SORTS} value={sort} onChange={setSort} />
      </div>
      {items.length === 0 && <p className="type-body">No highlights match these filters.</p>}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <Row key={`${item.translation}:${item.book}.${item.chapter}.${item.verse}`}>
            <button type="button" onClick={() => nav.openPassage(item)} className={openClass}>
              <span className="type-label text-[0.625rem] text-sky">
                {formatRef(item)}
                <span className="sr-only">, {item.color}</span>
              </span>
              <span className="text-[0.9375rem] leading-relaxed text-foreground">
                <span className={cn(`ink-${item.color}`, "box-decoration-clone rounded-[5px] px-1 py-0.5")}>{text(item.translation, item.book, item.chapter, item.verse) ?? "…"}</span>
              </span>
            </button>
            <Button variant="ghost" size="icon-sm" className="mt-1 text-muted-foreground hover:text-destructive" aria-label={`Remove highlight on ${formatRef(item)}`} onClick={() => actions.setHighlight(item, null)}>
              <Trash2 aria-hidden="true" />
            </Button>
          </Row>
        ))}
      </ul>
    </>
  );
}

function Notes({ book }: { book: string }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Note | null>(null);
  const [sort, setSort] = useState<SortMode>("recent");
  const items = useMemo(
    () =>
      Object.values(data.notes)
        .filter(inBook(book))
        .sort(sort === "recent" ? (a, b) => b.updatedAt - a.updatedAt : byBibleOrder),
    [data.notes, book, sort],
  );
  const text = useVerseLookup(items);

  if (Object.keys(data.notes).length === 0) {
    return (
      <EmptyState icon={<StickyNote aria-hidden="true" />} title="No notes yet" action={{ label: "Open the Bible", onClick: () => nav.go({ view: "bible" }) }}>
        While reading, select a verse and choose Note to write down a thought or a prayer.
      </EmptyState>
    );
  }

  const remove = async (note: Note) => {
    if (await confirm({ title: `Delete your note on ${formatRef(note)}?`, body: "This cannot be undone.", confirm: "Delete note", destructive: true })) {
      actions.deleteNote(note);
      toast("Note deleted");
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Segmented legend="Order" options={SORTS} value={sort} onChange={setSort} />
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <Row key={`${item.translation}:${item.book}.${item.chapter}.${item.verse}`} className="flex-col gap-0 p-4 sm:p-5">
            <button type="button" onClick={() => nav.openPassage(item)} className={cn(openClass, "w-[calc(100%+1rem)] flex-none")}>
              <span className="type-label text-[0.625rem] text-sky">{formatRef(item)}</span>
              <span className="border-l-2 border-line-strong pl-3 text-[0.875rem] leading-relaxed text-muted-foreground">{text(item.translation, item.book, item.chapter, item.verse) ?? "…"}</span>
            </button>
            <p className="mt-2 text-base leading-relaxed whitespace-pre-wrap text-foreground">{item.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1">
              <span className="type-small mr-auto text-[0.8125rem]">Edited {formatDate(item.updatedAt)}</span>
              <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                <Pencil aria-hidden="true" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-destructive" onClick={() => remove(item)}>
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </Row>
        ))}
      </ul>
      {items.length === 0 && <p className="type-body">No notes in this book.</p>}
      <NoteDialog
        note={editing ? { reference: formatRef(editing), verseText: text(editing.translation, editing.book, editing.chapter, editing.verse) ?? "", initialText: editing.text } : null}
        onClose={() => setEditing(null)}
        onSave={(value) => {
          if (editing) actions.saveNote(editing, value);
          setEditing(null);
          toast("Note saved");
        }}
        onDelete={() => {
          if (editing) actions.deleteNote(editing);
          setEditing(null);
          toast("Note deleted");
        }}
      />
    </>
  );
}

function Bookmarks({ book }: { book: string }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const [sort, setSort] = useState<SortMode>("recent");
  const items = useMemo(() => data.bookmarks.filter(inBook(book)).sort(sort === "recent" ? (a, b) => b.createdAt - a.createdAt : byBibleOrder), [data.bookmarks, book, sort]);
  const text = useVerseLookup(items);
  const last = data.lastLocation;

  return (
    <>
      {last && (
        <button type="button" onClick={() => nav.openPassage(last)} className="group/last cursor-pointer rounded-3xl text-left outline-offset-4">
          <Panel surface="glass" ticks className="flex items-center justify-between gap-4 p-5 transition-shadow duration-500 group-hover/last:shadow-glow">
            <span className="flex flex-col gap-2">
              <MonoLabel dot>Where you stopped reading</MonoLabel>
              <span className="font-display text-xl font-semibold tracking-tight">{formatRef(last)}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-5 text-muted-foreground transition-transform duration-300 group-hover/last:translate-x-1 group-hover/last:text-sky" />
          </Panel>
        </button>
      )}
      {data.bookmarks.length === 0 ? (
        <EmptyState icon={<Bookmark aria-hidden="true" />} title="No bookmarks yet">
          Select a verse and choose Bookmark, or use Bookmark chapter at the top of any chapter.
        </EmptyState>
      ) : (
        <>
          <div className="flex justify-end">
            <Segmented legend="Order" options={SORTS} value={sort} onChange={setSort} />
          </div>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <Row key={item.id}>
                <button type="button" onClick={() => nav.openPassage(item)} className={openClass}>
                  <span className="type-label flex items-center gap-2 text-[0.625rem] text-sky">
                    <Bookmark aria-hidden="true" className="size-3 fill-current" />
                    {formatRef(item)}
                    {item.kind === "chapter" && <span className="text-muted-foreground">Whole chapter</span>}
                  </span>
                  <span className="line-clamp-3 text-[0.9375rem] leading-relaxed text-ink-soft">{text(item.translation, item.book, item.chapter, item.verse) ?? "…"}</span>
                </button>
                <Button variant="ghost" size="icon-sm" className="mt-1 text-muted-foreground hover:text-destructive" aria-label={`Remove bookmark ${formatRef(item)}`} onClick={() => actions.removeBookmark(item.id)}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </Row>
            ))}
          </ul>
          {items.length === 0 && <p className="type-body">No bookmarks in this book.</p>}
        </>
      )}
    </>
  );
}
