"use client";

import { useEffect, useState } from "react";
import GlassFolder from "@/components/vendor/GlassFolder";

export interface ShelfFolder {
  title: string;
  notes: { title: string; href: string }[];
}

/** The opening scene of /notes: one glass folder per subject. Open a folder and its notes fan out as links. */
export function FolderShelf({ folders }: { folders: ShelfFolder[] }) {
  // The folders are drawn at a fixed pixel width, so pick one that fits the screen.
  const [width, setWidth] = useState(300);
  useEffect(() => {
    const fit = () => setWidth(Math.min(300, window.innerWidth - 48));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <ul className="flex flex-wrap justify-center gap-x-10 gap-y-16 pt-16 sm:justify-start">
      {folders.map((folder, index) => (
        <li key={folder.title}>
          <GlassFolder
            label={folder.title}
            meta={`${folder.notes.length} ${folder.notes.length === 1 ? "note" : "notes"}`}
            tone="light"
            art="glacier"
            seed={index * 7 + 3}
            action="none"
            width={width}
            appear
            appearDelay={index * 140}
            files={folder.notes.map((note) => ({ name: note.title, meta: "Markdown", href: note.href }))}
          />
        </li>
      ))}
    </ul>
  );
}
