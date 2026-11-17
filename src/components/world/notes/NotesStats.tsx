import { ArrowRight, FileText, Image as ImageIcon, Type, WholeWord } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Panel } from "@/components/world/primitives";
import { getAllNotes, getNote } from "@/lib/notes/source";

const IMAGE = /!\[[^\]]*\]\([^)]+\)|<img\b|<svg\b/gi;
const number = new Intl.NumberFormat("en");

const humanise = (folder: string) => {
  const words = folder.replace(/[-_]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Counts what is written in one note. Drawings and image syntax are counted as images, not as text. */
function measure(markdown: string) {
  const images = markdown.match(IMAGE)?.length ?? 0;
  const text = markdown.replace(/<svg[\s\S]*?<\/svg>/gi, " ").replace(/!\[[^\]]*\]\([^)]+\)/g, " ");
  return {
    images,
    words: text.match(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu)?.length ?? 0,
    letters: text.match(/\p{L}/gu)?.length ?? 0,
  };
}

function Tile({ icon, label, value, note }: { icon: ReactNode; label: string; value: number; note: string }) {
  return (
    <Panel surface="glass" className="flex flex-col gap-5 p-5 sm:p-6">
      <dt className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl border border-line bg-card/70 text-sky [&_svg]:size-4">{icon}</span>
        <span className="type-label text-muted-foreground">{label}</span>
      </dt>
      <dd className="flex flex-col gap-2">
        <span className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none font-semibold tracking-tight tabular-nums">{number.format(value)}</span>
        <span className="type-small">{note}</span>
      </dd>
    </Panel>
  );
}

/** The notes in numbers, counted from the markdown files when the site is built. */
export function NotesStats() {
  const notes = getAllNotes().map((meta) => ({ meta, ...measure(getNote(meta.slug)?.markdown ?? "") }));
  const total = notes.reduce((sum, note) => ({ words: sum.words + note.words, letters: sum.letters + note.letters, images: sum.images + note.images }), { words: 0, letters: 0, images: 0 });
  const folders = new Set(notes.map((note) => note.meta.folders[0] ?? "")).size;
  const minutes = Math.max(1, Math.round(total.words / 200));
  const longest = [...notes].sort((a, b) => b.words - a.words).slice(0, 5);
  const most = Math.max(1, ...longest.map((note) => note.words));

  return (
    <section aria-labelledby="notes-stats" className="mt-(--section)">
      <h2 id="notes-stats" className="type-label text-muted-foreground">
        The notes in numbers
      </h2>
      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Tile icon={<FileText aria-hidden="true" />} label="Files" value={notes.length} note={`in ${folders} ${folders === 1 ? "folder" : "folders"}`} />
        <Tile icon={<WholeWord aria-hidden="true" />} label="Words" value={total.words} note={`about ${number.format(minutes)} ${minutes === 1 ? "minute" : "minutes"} of reading`} />
        <Tile icon={<Type aria-hidden="true" />} label="Letters" value={total.letters} note="not counting spaces, digits or symbols" />
        <Tile icon={<ImageIcon aria-hidden="true" />} label="Images" value={total.images} note="pictures and drawings in the notes" />
      </dl>

      <h3 className="type-h3 mt-10">Longest notes</h3>
      <ol className="mt-4 flex flex-col gap-2">
        {longest.map((note, index) => (
          <li key={note.meta.href}>
            <Link href={note.meta.href} className="group/note block rounded-2xl outline-offset-4">
              <Panel surface="solid" className="grid items-center gap-x-4 gap-y-2 rounded-2xl p-4 transition-shadow duration-500 group-hover/note:shadow-glow sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,14rem)_auto_1rem] sm:px-5">
                <span className="type-label text-sky max-sm:hidden">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-display text-base font-semibold tracking-tight">{note.meta.title}</span>
                  <span className="type-small truncate text-[0.8125rem]">{note.meta.folders.map(humanise).join(" / ") || "Loose note"}</span>
                </span>
                <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-sunk">
                  <span className="block h-full rounded-full bg-[image:var(--gradient-aurora)]" style={{ width: `${Math.max(2, (note.words / most) * 100)}%` }} />
                </span>
                <span className="text-sm text-ink-soft tabular-nums">{number.format(note.words)} words</span>
                <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform duration-300 group-hover/note:translate-x-0.5 group-hover/note:text-sky max-sm:hidden" />
              </Panel>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
