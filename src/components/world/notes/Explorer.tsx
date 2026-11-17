"use client";

import { ChevronRight, FileText, Folder, FolderOpen, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TreeNode } from "@/lib/notes/source";
import { cn } from "@/lib/utils";

const key = (slug: string[]) => slug.join("/");
const countFiles = (nodes: TreeNode[]): number => nodes.reduce((sum, node) => sum + (node.type === "file" ? 1 : countFiles(node.children)), 0);

/** Keeps files whose title matches, and any folder that still has something in it. */
function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  return nodes.flatMap((node): TreeNode[] => {
    if (node.type === "file") return node.title.toLowerCase().includes(query) ? [node] : [];
    if (node.title.toLowerCase().includes(query)) return [node];
    const children = filterTree(node.children, query);
    return children.length ? [{ ...node, children }] : [];
  });
}

function Branch({ nodes, depth, open, toggle, active, forceOpen, onNavigate }: { nodes: TreeNode[]; depth: number; open: Set<string>; toggle: (id: string) => void; active: string; forceOpen: boolean; onNavigate?: () => void }) {
  return (
    <ul className={cn("flex flex-col gap-0.5", depth > 0 && "ml-[1.05rem] border-l border-line pl-2")}>
      {nodes.map((node) => {
        if (node.type === "file") {
          const current = active === node.href;
          return (
            <li key={node.href}>
              <Link
                href={node.href}
                onClick={onNavigate}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group/file relative flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.875rem] text-ink-soft transition-colors duration-200 hover:bg-accent/60 hover:text-foreground",
                  current && "bg-accent font-medium text-accent-foreground hover:bg-accent",
                )}
              >
                {current && <span aria-hidden="true" className="absolute top-2 bottom-2 -left-[0.5625rem] w-0.5 rounded-full bg-sky-bright" />}
                <FileText aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground", current && "text-sky")} />
                <span className="truncate">{node.title}</span>
              </Link>
            </li>
          );
        }
        const id = key(node.slug);
        const expanded = forceOpen || open.has(id);
        const Icon = expanded ? FolderOpen : Folder;
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => toggle(id)}
              aria-expanded={expanded}
              className="flex min-h-9 w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-[0.875rem] font-medium text-foreground transition-colors duration-200 hover:bg-accent/60"
            >
              <ChevronRight aria-hidden="true" className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo", expanded && "rotate-90")} />
              <Icon aria-hidden="true" className="size-4 shrink-0 text-sky" />
              <span className="truncate">{node.title}</span>
              <span className="type-label ml-auto pr-1 text-[0.5625rem] text-muted-foreground">{countFiles(node.children)}</span>
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                  <div className="pt-0.5 pb-1">
                    <Branch nodes={node.children} depth={depth + 1} open={open} toggle={toggle} active={active} forceOpen={forceOpen} onNavigate={onNavigate} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

/** The notes sidebar: a file explorer with collapsible folders and a quick filter. */
export function Explorer({ tree, onNavigate }: { tree: TreeNode[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Every folder on the way to the open note starts expanded.
  const onPath = useMemo(() => {
    const parts = active.replace(/^\/notes\/|\/$/g, "").split("/").filter(Boolean).slice(0, -1);
    return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
  }, [active]);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const open = useMemo(() => {
    const ids = new Set(onPath);
    for (const [id, value] of Object.entries(toggled)) {
      if (value) ids.add(id);
      else ids.delete(id);
    }
    return ids;
  }, [onPath, toggled]);
  const toggle = (id: string) => setToggled((state) => ({ ...state, [id]: !open.has(id) }));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement).closest("input, textarea, select, [contenteditable]");
      if (event.key !== "/" || event.metaKey || event.ctrlKey || typing) return;
      if (!input.current || input.current.offsetParent === null) return;
      event.preventDefault();
      input.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const term = query.trim().toLowerCase();
  const visible = term ? filterTree(tree, term) : tree;

  return (
    <nav aria-label="Notes" className="flex h-full min-h-0 flex-col gap-3">
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter notes"
          aria-label="Filter notes by title"
          className="h-10 w-full rounded-xl border border-input bg-card/70 pr-9 pl-9 text-sm outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground focus-visible:border-sky-bright focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear filter" className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : (
          <kbd aria-hidden="true" className="type-label pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-line px-1.5 py-1 text-[0.5625rem] text-muted-foreground xl:block">
            /
          </kbd>
        )}
      </div>

      <div className="scroll-thin -mr-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2">
        {visible.length ? (
          <Branch nodes={visible} depth={0} open={open} toggle={toggle} active={active} forceOpen={Boolean(term)} onNavigate={onNavigate} />
        ) : (
          <p className="type-small px-2 py-6 text-center">No notes match &ldquo;{query}&rdquo;.</p>
        )}
      </div>
      <p className="type-label border-t border-line pt-3 text-[0.5625rem] text-muted-foreground" aria-live="polite">
        {countFiles(visible)} of {countFiles(tree)} notes
      </p>
    </nav>
  );
}
