import { FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealText } from "@/components/world/motion";
import { FolderShelf, type ShelfFolder } from "@/components/world/notes/FolderShelf";
import { NotesStats } from "@/components/world/notes/NotesStats";
import { MonoLabel, Panel } from "@/components/world/primitives";
import { getAllNotes, getTree, type TreeNode } from "@/lib/notes/source";

export const metadata: Metadata = {
  title: "Notes | Angelo Mouawad",
  description: "Study notes by Angelo Mouawad on maths, algorithms and machine learning.",
};

const filesIn = (node: TreeNode): { title: string; href: string }[] => (node.type === "file" ? [{ title: node.title, href: node.href }] : node.children.flatMap(filesIn));

export default function NotesIndex() {
  const tree = getTree();
  const folders: ShelfFolder[] = tree.flatMap((node) => (node.type === "folder" ? [{ title: node.title, notes: filesIn(node) }] : []));
  const total = getAllNotes().length;

  return (
    <div className="pt-10 pb-(--section) sm:pt-16">
      <MonoLabel dot>
        <span className="text-sky">{String(total).padStart(2, "0")}</span>notes in {folders.length} folders
      </MonoLabel>
      <h1 className="type-h1 mt-6 max-w-3xl text-balance">
        <RevealText text="Things I'm learning," delay={0.5} /> <RevealText text="written down." wordClassName="text-aurora" delay={0.75} />
      </h1>
      <Reveal delay={0.95}>
        <p className="type-lead mt-6 max-w-2xl">My study notes, kept as plain markdown. Open a folder below, or use the list on the side to jump straight to a note.</p>
      </Reveal>

      <FolderShelf folders={folders} />

      <NotesStats />

      <section aria-labelledby="all-notes" className="mt-(--section)">
        <h2 id="all-notes" className="type-label text-muted-foreground">
          All notes
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {folders.map((folder) => (
            <Panel key={folder.title} surface="glass" className="p-5">
              <h3 className="type-h3">{folder.title}</h3>
              <ul className="mt-3 flex flex-col">
                {folder.notes.map((note) => (
                  <li key={note.href} className="border-t border-line first:border-t-0">
                    <Link href={note.href} className="group/note flex min-h-11 items-center gap-3 py-2 text-[0.9375rem] text-ink-soft transition-colors hover:text-sky">
                      <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/note:text-sky" />
                      {note.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
