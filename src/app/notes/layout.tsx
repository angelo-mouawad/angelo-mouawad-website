import type { ReactNode } from "react";
import "katex/dist/katex.min.css";
import "./notes.css";
import { NotesShell } from "@/components/world/notes/NotesShell";
import { getTree } from "@/lib/notes/source";

export default function NotesLayout({ children }: { children: ReactNode }) {
  return <NotesShell tree={getTree()}>{children}</NotesShell>;
}
