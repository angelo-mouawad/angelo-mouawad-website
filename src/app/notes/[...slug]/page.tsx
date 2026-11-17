import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Toc } from "@/components/world/notes/Toc";
import { MonoLabel, Panel } from "@/components/world/primitives";
import { renderNote } from "@/lib/notes/render";
import { folderTitle, getAllNotes, getNote } from "@/lib/notes/source";

type Props = { params: Promise<{ slug: string[] }> };

// Every note becomes its own static page, so nothing here needs a server.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = getNote((await params).slug);
  return { title: note ? `${note.meta.title} | Notes | Angelo Mouawad` : "Notes | Angelo Mouawad" };
}

export default async function NotePage({ params }: Props) {
  const note = getNote((await params).slug);
  if (!note) notFound();

  const { content, headings } = await renderNote(note.markdown, note.meta);
  const all = getAllNotes();
  const index = all.findIndex((item) => item.href === note.meta.href);
  const previous = all[index - 1];
  const next = all[index + 1];

  return (
    <div className="grid gap-12 pt-8 pb-(--section) 2xl:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="mx-auto w-full max-w-3xl min-w-0">
        <nav aria-label="Breadcrumb">
          <ol className="type-label flex flex-wrap items-center gap-x-1.5 gap-y-2 text-muted-foreground">
            <li>
              <Link href="/notes/" className="rounded transition-colors hover:text-sky">
                Notes
              </Link>
            </li>
            {note.meta.folders.map((folder) => (
              <li key={folder} className="flex items-center gap-1.5">
                <ChevronRight aria-hidden="true" className="size-3" />
                {folderTitle(folder)}
              </li>
            ))}
            <li className="flex items-center gap-1.5 text-foreground" aria-current="page">
              <ChevronRight aria-hidden="true" className="size-3 text-muted-foreground" />
              {note.meta.title}
            </li>
          </ol>
        </nav>

        <h1 className="type-h1 mt-6 text-[clamp(2.125rem,4.6vw,3.5rem)] text-balance">{note.meta.title}</h1>

        <div className="mt-8">
          <Toc headings={headings} variant="inline" />
        </div>

        <div className="note-prose mt-8">{content}</div>

        <nav aria-label="More notes" className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {previous ? (
            <Link href={previous.href} className="group/prev rounded-3xl outline-offset-4">
              <Panel surface="glass" className="flex h-full flex-col gap-2 p-5 transition-shadow duration-500 group-hover/prev:shadow-glow">
                <MonoLabel>
                  <ArrowLeft aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/prev:-translate-x-0.5" />
                  Previous
                </MonoLabel>
                <span className="font-display text-lg font-medium tracking-tight">{previous.title}</span>
              </Panel>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.href} className="group/next rounded-3xl outline-offset-4">
              <Panel surface="glass" className="flex h-full flex-col items-end gap-2 p-5 text-right transition-shadow duration-500 group-hover/next:shadow-glow">
                <MonoLabel>
                  Next
                  <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/next:translate-x-0.5" />
                </MonoLabel>
                <span className="font-display text-lg font-medium tracking-tight">{next.title}</span>
              </Panel>
            </Link>
          )}
        </nav>
      </article>

      <aside>
        <Toc headings={headings} variant="side" />
      </aside>
    </div>
  );
}
