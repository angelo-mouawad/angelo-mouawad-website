"use client";

import { ArrowRight, BookOpen, Bookmark, CalendarCheck, CircleCheck, Flame, Highlighter, Search, StickyNote, Target } from "lucide-react";
import type { ReactNode } from "react";
import { CANON } from "@/lib/bible/data/canon";
import { PLANS } from "@/lib/bible/data/plans";
import { useAsync } from "@/lib/bible/hooks/useAsync";
import type { StudyTab } from "@/lib/bible/hooks/useRoute";
import { useVerseLookup } from "@/lib/bible/hooks/useVerseLookup";
import { readingActivity } from "@/lib/bible/services/activity";
import { loadBook } from "@/lib/bible/services/bibleService";
import { bookProgress, dayAlreadyRead, isRead, nextUnreadChapter, overallProgress, planStatus } from "@/lib/bible/services/progress";
import { useStore } from "@/lib/bible/store/AppStore";
import { useTranslationOrNull } from "@/lib/bible/store/BibleProvider";
import type { Location } from "@/lib/bible/types/bible";
import { percent } from "@/lib/bible/utils/misc";
import { formatReadings, formatRef, nextChapter } from "@/lib/bible/utils/references";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/world/motion";
import { MonoLabel, Panel } from "@/components/world/primitives";
import { cn } from "@/lib/utils";
import { PageHeader, ProgressRing, useNav } from "./ui";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening.";
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

const todayLabel = () => new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

function Card({ title, action, className, children }: { title: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <RevealItem className={className}>
      <Panel surface="glass" className="flex h-full flex-col gap-5 p-6">
        <div className="flex min-h-5 items-center justify-between gap-3">
          <h2 className="type-label text-muted-foreground">{title}</h2>
          {action}
        </div>
        {children}
      </Panel>
    </RevealItem>
  );
}

function QuietLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="link-line group/q inline-flex cursor-pointer items-center gap-1 pb-0.5 text-[0.8125rem] font-medium text-sky">
      {children}
      <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/q:translate-x-0.5" />
    </button>
  );
}

function Stat({ value, of, label }: { value: number; of?: number; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="type-label text-[0.5625rem] text-muted-foreground">{label}</dt>
      <dd className="font-display text-xl leading-none font-semibold tracking-tight tabular-nums">{value.toLocaleString()}</dd>
      {of !== undefined && <dd className="type-small text-[0.75rem] tabular-nums">of {of.toLocaleString()}</dd>}
    </div>
  );
}

/** The Bible's front page: where you left off, how far you are, and what today's reading is. */
export function TodayView() {
  const { data } = useStore();
  const nav = useNav();
  const translation = useTranslationOrNull();
  const progress = overallProgress(data, translation);
  const isNew = !data.lastLocation && Object.keys(data.plans).length === 0 && Object.keys(data.chapters).length === 0 && data.bookmarks.length === 0;
  const pct = percent(progress.fraction, 1);

  return (
    <div className="flex flex-col gap-10 pt-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader label={todayLabel()} title={isNew ? "Welcome." : greeting()} lead={isNew ? "The King James Bible, with reading plans, highlights, notes and a record of what you have read. Everything stays in this browser." : undefined} />
        <button
          type="button"
          onClick={() => nav.openSearch()}
          className="glass flex h-12 w-full cursor-pointer items-center gap-3 rounded-full px-5 text-left text-[0.9375rem] text-muted-foreground transition-colors duration-300 hover:text-foreground lg:w-80"
        >
          <Search aria-hidden="true" className="size-4" />
          Find a verse, book or word
        </button>
      </div>

      <RevealGroup className="grid gap-5 lg:grid-cols-12">
        <RevealItem className="lg:col-span-7">{isNew ? <StartPanel /> : <ContinueReading />}</RevealItem>

        <Card title="Bible progress" className="lg:col-span-5" action={<QuietLink onClick={() => nav.go({ view: "progress" })}>By book</QuietLink>}>
          <div className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-6">
            <ProgressRing value={progress.fraction} size={148} display={`${pct}%`} caption="read" label={`${pct} percent of the Bible read`} />
            <dl className="grid gap-4">
              <Stat value={progress.booksCompleted} of={CANON.length} label="Books" />
              <Stat value={progress.chaptersCompleted} of={progress.totalChapters} label="Chapters" />
              <Stat value={progress.versesRead} of={progress.totalVerses || undefined} label="Verses" />
            </dl>
          </div>
        </Card>

        <TodayReading />
        <Activity />
        <Testaments />
        <Recent />
      </RevealGroup>
    </div>
  );
}

function StartPanel() {
  const nav = useNav();
  const choices: { icon: ReactNode; title: string; text: string; onClick: () => void }[] = [
    {
      icon: <CalendarCheck aria-hidden="true" />,
      title: "New to the Bible?",
      text: "Start the Beginner Journey: 30 short readings with a note on why each one matters.",
      onClick: () => nav.go({ view: "plans", planId: "beginner" }),
    },
    {
      icon: <BookOpen aria-hidden="true" />,
      title: "Already reading?",
      text: "Open any book and chapter. Your place is remembered.",
      onClick: () => nav.go({ view: "bible", book: "GEN", chapter: 1 }),
    },
    {
      icon: <Target aria-hidden="true" />,
      title: "Want a daily rhythm?",
      text: `Pick from ${PLANS.length} reading plans. You can follow more than one.`,
      onClick: () => nav.go({ view: "plans" }),
    },
  ];
  return (
    <Panel surface="glass" ticks className="flex h-full flex-col gap-6 p-6 sm:p-8">
      <figure className="flex flex-col gap-3">
        <blockquote className="type-h3 text-balance">Thy word is a lamp unto my feet, and a light unto my path.</blockquote>
        <figcaption>
          <MonoLabel>Psalm 119:105</MonoLabel>
        </figcaption>
      </figure>
      <div className="hairline" />
      <h2 className="type-label text-muted-foreground">Where to start</h2>
      <ul className="flex flex-col gap-2">
        {choices.map((choice, index) => (
          <li key={choice.title}>
            <button
              type="button"
              onClick={choice.onClick}
              className="group/start flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-line bg-card/60 p-4 text-left transition-[border-color,box-shadow] duration-300 hover:border-sky-bright/50 hover:shadow-soft"
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl border border-line text-sky [&_svg]:size-4.5", index === 0 ? "bg-accent" : "bg-card/70")}>{choice.icon}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-display text-base font-semibold tracking-tight">{choice.title}</span>
                <span className="type-small text-pretty">{choice.text}</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover/start:translate-x-0.5 group-hover/start:text-sky" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ContinueReading() {
  const { data } = useStore();
  const nav = useNav();
  const location = data.lastLocation ?? { book: "GEN", chapter: 1, verse: undefined, translation: data.preferences.translation };
  const book = useAsync(`${location.translation}:${location.book}`, () => loadBook(location.translation, location.book));
  const verse = location.verse ?? 1;
  const chapter = book.status === "ready" ? book.value.chapters[location.chapter - 1] : undefined;
  const text = chapter?.[verse - 1];
  const length = chapter?.length ?? 0;
  const finished = isRead(data, location);
  const next = finished ? (nextUnreadChapter(data, location) ?? nextChapter(location)) : undefined;

  return (
    <Panel surface="glass" ticks className="flex h-full flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2>
          <MonoLabel dot>{data.lastLocation ? "Continue reading" : "Start reading"}</MonoLabel>
        </h2>
        {finished && (
          <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-positive">
            <CircleCheck aria-hidden="true" className="size-4" />
            Chapter read
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="type-h2">{formatRef(location)}</p>
          <p className="type-lead line-clamp-3 min-h-[1.65em] text-pretty">{text ?? " "}</p>
        </div>
        {length > 0 && <ProgressRing value={Math.min(1, verse / length)} size={76} display={`${verse}/${length}`} label={`Verse ${verse} of ${length}`} className="hidden sm:inline-grid" />}
      </div>
      {length > 0 && (
        <p className="type-small sm:hidden">
          Verse {verse} of {length}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Button variant="glow" onClick={() => nav.openPassage(location)}>
          {data.lastLocation ? "Continue" : "Open Genesis 1"}
          <ArrowRight aria-hidden="true" className="group-hover/button:translate-x-0.5" />
        </Button>
        {next && (
          <Button variant="outline" onClick={() => nav.openPassage(next)}>
            Next unread: {formatRef(next)}
          </Button>
        )}
      </div>
    </Panel>
  );
}

function TodayReading() {
  const { data } = useStore();
  const nav = useNav();
  const plans = PLANS.filter((plan) => data.plans[plan.id]).map((plan) => ({ plan, status: planStatus(plan, data.plans[plan.id]) }));

  return (
    <Card title="Today's reading" className="lg:col-span-7" action={<QuietLink onClick={() => nav.go({ view: "plans" })}>{plans.length ? "All plans" : "Browse plans"}</QuietLink>}>
      {plans.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-4">
          <p className="type-body max-w-md">A plan gives you one short reading a day and keeps track for you.</p>
          <Button variant="outline" size="sm" onClick={() => nav.go({ view: "plans" })}>
            Choose a plan
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {plans.map(({ plan, status }) => (
            <li key={plan.id}>
              <button
                type="button"
                onClick={() => nav.go({ view: "plans", planId: plan.id, day: status.nextDay?.day })}
                className="group/plan flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-line bg-card/60 p-3.5 text-left transition-[border-color,box-shadow] duration-300 hover:border-sky-bright/50 hover:shadow-soft"
              >
                <ProgressRing value={status.total ? status.completedCount / status.total : 0} size={52} display={`${percent(status.completedCount, status.total)}%`} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="type-label text-[0.5625rem] leading-[1.6] text-muted-foreground">
                    {plan.name}, {status.finished ? "finished" : `day ${status.nextDay?.day} of ${status.total}`}
                  </span>
                  {status.nextDay && (
                    <>
                      <span className="truncate font-display text-base font-semibold tracking-tight">{status.nextDay.title ?? formatReadings(status.nextDay.readings)}</span>
                      {status.nextDay.title && <span className="type-small truncate">{formatReadings(status.nextDay.readings)}</span>}
                    </>
                  )}
                </span>
                {status.nextDay && dayAlreadyRead(data, status.nextDay) ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] font-medium text-positive">
                    <CircleCheck aria-hidden="true" className="size-4" />
                    <span className="max-sm:sr-only">Already read</span>
                  </span>
                ) : (
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover/plan:translate-x-0.5 group-hover/plan:text-sky" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Activity() {
  const { data } = useStore();
  const { streak, week, todayCount } = readingActivity(data);
  const max = Math.max(3, ...week.map((day) => day.count));

  return (
    <Card title="This week" className="lg:col-span-5">
      <div className="flex flex-1 flex-wrap items-end justify-between gap-6">
        <dl className="flex gap-8">
          <div className="flex flex-col gap-1.5">
            <dt className="type-label flex items-center gap-1.5 text-[0.5625rem] text-muted-foreground">
              <Flame aria-hidden="true" className="size-3 text-sky" />
              Reading streak
            </dt>
            <dd className="font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">
              {streak}
              <span className="ml-1.5 font-body text-sm font-normal text-muted-foreground">{streak === 1 ? "day" : "days"}</span>
            </dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="type-label text-[0.5625rem] text-muted-foreground">Chapters today</dt>
            <dd className="font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">{todayCount}</dd>
          </div>
        </dl>
        <figure aria-label={`Chapters read each day this week: ${week.map((day) => day.count).join(", ")}`} className="flex flex-col gap-2">
          <div aria-hidden="true" className="flex h-20 items-end gap-2">
            {week.map((day, index) => (
              <div key={index} className="flex h-full w-6 flex-col items-center justify-end gap-1">
                <span className="font-mono text-[0.625rem] leading-none text-muted-foreground tabular-nums">{day.count || ""}</span>
                <span
                  className={cn("w-full rounded-md", day.count ? "bg-[image:var(--gradient-aurora)]" : "bg-sunk", day.isToday && !day.count && "border border-dashed border-sky-bright/60")}
                  style={{ height: `${day.count ? Math.max(18, (day.count / max) * 100) : 10}%` }}
                />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="flex gap-2">
            {week.map((day, index) => (
              <span key={index} className={cn("w-6 text-center font-mono text-[0.625rem] uppercase", day.isToday ? "font-semibold text-sky" : "text-muted-foreground")}>
                {day.label}
              </span>
            ))}
          </div>
        </figure>
      </div>
    </Card>
  );
}

function Testaments() {
  const { data } = useStore();
  const nav = useNav();
  const parts = (["OT", "NT"] as const).map((testament) => {
    let done = 0;
    let total = 0;
    for (const book of CANON.filter((item) => item.testament === testament)) {
      const state = bookProgress(data, book.id, book.chapters);
      done += state.completed;
      total += state.total;
    }
    return { testament, name: testament === "OT" ? "Old Testament" : "New Testament", done, total };
  });
  const next = nextUnreadChapter(data);

  return (
    <Card title="Testaments" className="lg:col-span-12">
      <div className="grid gap-5 md:grid-cols-3">
        {parts.map((part) => (
          <div key={part.testament} className="flex items-center gap-4">
            <ProgressRing value={part.total ? part.done / part.total : 0} size={64} display={`${percent(part.done, part.total)}%`} />
            <div className="flex flex-col gap-1">
              <p className="font-display text-base font-semibold tracking-tight">{part.name}</p>
              <p className="type-small tabular-nums">
                {part.done} of {part.total} chapters
              </p>
            </div>
          </div>
        ))}
        {next && (
          <button
            type="button"
            onClick={() => nav.openPassage(next)}
            className="group/next flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-card/60 px-4 py-3 text-left transition-[border-color,box-shadow] duration-300 hover:border-sky-bright/50 hover:shadow-soft"
          >
            <span className="flex flex-col gap-1.5">
              <span className="type-label text-[0.5625rem] text-muted-foreground">First unread chapter</span>
              <span className="font-display text-base font-semibold tracking-tight">{formatRef(next)}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform duration-300 group-hover/next:translate-x-0.5 group-hover/next:text-sky" />
          </button>
        )}
      </div>
    </Card>
  );
}

const LIMIT = 3;

function Recent() {
  const { data } = useStore();
  const nav = useNav();
  const highlights = Object.values(data.highlights)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, LIMIT);
  const notes = Object.values(data.notes)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, LIMIT);
  const bookmarks = data.bookmarks.slice(0, LIMIT);
  const text = useVerseLookup([...highlights, ...bookmarks]);

  const columns: { tab: StudyTab; title: string; icon: ReactNode; total: number; empty: string; items: { key: string; location: Location; body: string; ink?: string }[] }[] = [
    {
      tab: "highlights",
      title: "Highlights",
      icon: <Highlighter aria-hidden="true" />,
      total: Object.keys(data.highlights).length,
      empty: "Select any verse while reading to highlight it.",
      items: highlights.map((item) => ({ key: `${item.book}${item.chapter}.${item.verse}`, location: item, body: text(item.translation, item.book, item.chapter, item.verse) ?? "", ink: `ink-${item.color}` })),
    },
    {
      tab: "notes",
      title: "Notes",
      icon: <StickyNote aria-hidden="true" />,
      total: Object.keys(data.notes).length,
      empty: "Select a verse and choose Note to write down a thought.",
      items: notes.map((item) => ({ key: `${item.book}${item.chapter}.${item.verse}`, location: item, body: item.text })),
    },
    {
      tab: "bookmarks",
      title: "Bookmarks",
      icon: <Bookmark aria-hidden="true" />,
      total: data.bookmarks.length,
      empty: "Bookmark verses or chapters to find them again quickly.",
      items: bookmarks.map((item) => ({ key: item.id, location: item, body: text(item.translation, item.book, item.chapter, item.verse) ?? "" })),
    },
  ];

  return (
    <>
      {columns.map((column) => (
        <Card
          key={column.tab}
          title={column.title}
          className="lg:col-span-4"
          action={
            <QuietLink onClick={() => nav.go({ view: "study", tab: column.tab })}>
              <span className="tabular-nums">{column.total}</span>
              <span>
                See all<span className="sr-only"> {column.title.toLowerCase()}</span>
              </span>
            </QuietLink>
          }
        >
          {column.items.length === 0 ? (
            <div className="flex flex-1 items-start gap-3 text-muted-foreground">
              <span className="mt-0.5 shrink-0 text-sky [&_svg]:size-4">{column.icon}</span>
              <p className="type-small text-pretty">{column.empty}</p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {column.items.map((item) => (
                <li key={item.key} className="border-t border-line first:border-t-0">
                  <button type="button" onClick={() => nav.openPassage(item.location)} className="-mx-2 flex w-[calc(100%+1rem)] cursor-pointer flex-col gap-1.5 rounded-xl px-2 py-2.5 text-left transition-colors duration-200 hover:bg-accent/60">
                    <span className="type-label text-[0.5625rem] text-sky">{formatRef(item.location)}</span>
                    <span className="line-clamp-2 text-[0.875rem] leading-relaxed text-ink-soft">{item.ink ? <span className={cn(item.ink, "box-decoration-clone rounded-[4px] px-1 py-0.5")}>{item.body}</span> : item.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </>
  );
}
