"use client";

import { ALargeSmall, BookOpen, CalendarCheck, ChartPie, Highlighter, PanelLeft, Search, Sunrise, X } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { type Route, routeToHash, useRoute, type View } from "@/lib/bible/hooks/useRoute";
import { AppStoreProvider, useStore } from "@/lib/bible/store/AppStore";
import { BibleProvider } from "@/lib/bible/store/BibleProvider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BackToRoom } from "@/components/world/BackToRoom";
import { Dock } from "@/components/world/Dock";
import { LightGate, WorldMotion } from "@/components/world/motion";
import { MonoLabel, WorldBackdrop } from "@/components/world/primitives";
import "./bible.css";
import { BooksExplorer } from "./BooksExplorer";
import { PlansView } from "./PlansView";
import { ProgressView } from "./ProgressView";
import { Reader } from "./Reader";
import { SearchDialog } from "./SearchDialog";
import { SettingsSheet } from "./SettingsSheet";
import { StudyView } from "./StudyView";
import { TodayView } from "./TodayView";
import { type BibleNav, ErrorBoundary, FeedbackProvider, NavProvider } from "./ui";

const AREAS: { view: View; title: string; icon: ReactNode }[] = [
  { view: "home", title: "Today", icon: <Sunrise aria-hidden="true" /> },
  { view: "bible", title: "Read", icon: <BookOpen aria-hidden="true" /> },
  { view: "plans", title: "Plans", icon: <CalendarCheck aria-hidden="true" /> },
  { view: "study", title: "Study", icon: <Highlighter aria-hidden="true" /> },
  { view: "progress", title: "Progress", icon: <ChartPie aria-hidden="true" /> },
];

const SIDE_FILTER = "book-filter-side";
const WIDE = "(min-width: 80rem)";

/**
 * The Bible under /bible. Areas are addressed in the URL hash (for example /bible/#/bible/JHN/3/16),
 * so every link works on a static host. Reading data lives in the visitor's browser.
 */
export default function BibleApp() {
  return (
    <AppStoreProvider>
      <BibleProvider>
        <WorldMotion>
          <FeedbackProvider>
            <Shell />
          </FeedbackProvider>
        </WorldMotion>
      </BibleProvider>
    </AppStoreProvider>
  );
}

function Shell() {
  const { route, navigate } = useRoute();
  const { data, recovered, canSave } = useStore();
  const [search, setSearch] = useState({ open: false, query: "", visit: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const theme = data.preferences.theme;

  // The reader's light, dark or high contrast choice applies to the whole page while it is open.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("contrast", theme === "contrast");
    const meta = document.querySelector('meta[name="theme-color"]');
    const previous = meta?.getAttribute("content");
    meta?.setAttribute("content", getComputedStyle(root).getPropertyValue("--background").trim());
    return () => {
      root.classList.remove("dark", "contrast");
      if (previous) meta?.setAttribute("content", previous);
    };
  }, [theme]);

  const go = useCallback(
    (next: Route) => {
      setNoticeDismissed(true);
      navigate(next);
      window.scrollTo({ top: 0 });
    },
    [navigate],
  );

  const nav = useMemo<BibleNav>(
    () => ({
      go,
      openPassage: (location) => go({ view: "bible", book: location.book, chapter: location.chapter, verse: location.verse }),
      openSearch: (query = "") => setSearch((state) => ({ open: true, query, visit: state.visit + 1 })),
      openSettings: () => setSettingsOpen(true),
      openBooks: () => {
        if (window.matchMedia(WIDE).matches) document.getElementById(SIDE_FILTER)?.focus();
        else setDrawer(true);
      },
    }),
    [go],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target.closest("input, textarea, select, [contenteditable]") || document.querySelector('[data-slot="dialog-content"], [data-slot="sheet-content"]')) return;
      event.preventDefault();
      setSearch((state) => ({ open: true, query: "", visit: state.visit + 1 }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goToArea = (view: View) => {
    if (view === "bible") {
      const last = data.lastLocation;
      go(last ? { view: "bible", book: last.book, chapter: last.chapter } : { view: "bible" });
    } else go({ view } as Route);
  };

  const current = route.view === "bible" ? { book: route.book ?? data.lastLocation?.book ?? "GEN", chapter: route.chapter ?? (route.book ? 1 : (data.lastLocation?.chapter ?? 1)) } : undefined;

  const notice = !canSave
    ? "Your browser is not letting this page save. Highlights and progress will be lost when you close it."
    : recovered && !noticeDismissed
      ? "Your saved reading data could not be read, so the page started fresh. A copy of the old data was kept in this browser."
      : undefined;

  return (
    <NavProvider value={nav}>
      <div className="world relative isolate min-h-dvh">
        <WorldBackdrop />
        <LightGate />
        <a
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("main")?.focus();
          }}
          className="glass-strong sr-only z-[90] rounded-full px-5 py-3 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>

        <header className="bible-chrome sticky top-0 z-40 border-b border-line bg-background/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[96rem] items-center justify-between gap-3 px-(--gutter)">
            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon-sm" className="xl:hidden" aria-label="Open the list of books" onClick={() => setDrawer(true)}>
                <PanelLeft aria-hidden="true" />
              </Button>
              <BackToRoom compact />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => nav.openSearch()}
                aria-label="Search the Bible"
                className="glass flex h-9 cursor-pointer items-center gap-2.5 rounded-full px-2.5 text-[0.8125rem] font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground md:w-56 md:px-4"
              >
                <Search aria-hidden="true" className="size-3.5" />
                <span className="hidden md:inline">Search</span>
                <kbd aria-hidden="true" className="type-label ml-auto hidden rounded-md border border-line px-1.5 py-1 text-[0.5625rem] md:inline">
                  /
                </kbd>
              </button>
              <Button variant="glass" size="icon-sm" onClick={() => setSettingsOpen(true)} aria-label="Reading settings">
                <ALargeSmall aria-hidden="true" />
              </Button>
              <a
                href="#/"
                onClick={(event) => {
                  event.preventDefault();
                  go({ view: "home" });
                }}
                className="rounded-full py-1 pr-0 pl-2"
              >
                <MonoLabel dot>Bible</MonoLabel>
              </a>
            </div>
          </div>
          {notice && (
            <div role="alert" className="border-t border-line bg-accent/80 text-accent-foreground">
              <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-3 px-(--gutter) py-2.5 text-sm">
                <p className="text-pretty">{notice}</p>
                {canSave && (
                  <Button variant="ghost" size="icon-sm" className="shrink-0" onClick={() => setNoticeDismissed(true)} aria-label="Dismiss this message">
                    <X aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="mx-auto grid max-w-[96rem] gap-10 px-(--gutter) xl:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="bible-chrome sticky top-16 hidden h-[calc(100dvh-4rem)] py-6 xl:block">
            <div className="glass flex h-full flex-col rounded-3xl p-4">
              <BooksExplorer current={current} inputId={SIDE_FILTER} />
            </div>
          </aside>
          <main id="main" tabIndex={-1} className="min-w-0 pb-40 outline-none">
            <ErrorBoundary resetKey={routeToHash(route)}>
              <motion.div key={route.view} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                {route.view === "home" && <TodayView />}
                {route.view === "bible" && <Reader route={route} />}
                {route.view === "plans" && <PlansView planId={route.planId} day={route.day} />}
                {route.view === "study" && <StudyView tab={route.tab ?? "highlights"} />}
                {route.view === "progress" && <ProgressView />}
              </motion.div>
            </ErrorBoundary>
          </main>
        </div>

        <div className="bible-chrome bible-dock pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Dock label="Bible areas" items={AREAS.map((area) => ({ id: area.view, title: area.title, icon: area.icon, active: area.view === route.view, onSelect: () => goToArea(area.view) }))} />
        </div>

        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent side="left" className="w-[min(22rem,88vw)] gap-0 border-line bg-background p-0 font-body sm:max-w-none">
            <SheetHeader className="border-b border-line px-5 py-4">
              <SheetTitle className="font-display text-lg font-semibold tracking-tight">Books</SheetTitle>
              <SheetDescription className="sr-only">Choose a book, then a chapter.</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 p-4">
              <BooksExplorer current={current} inputId="book-filter-drawer" onNavigate={() => setDrawer(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <SearchDialog key={search.visit} open={search.open} initialQuery={search.query} onClose={() => setSearch((state) => ({ ...state, open: false }))} />
        <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </NavProvider>
  );
}
