import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Where the notes live. Everything on /notes is read from this folder at build time.
 * To publish the real notes, point NOTES_DIR at a checkout of the notes repository
 * (for example a git submodule), or change the fallback path below.
 */
export const NOTES_DIR = process.env.NOTES_DIR ? path.resolve(process.env.NOTES_DIR) : path.join(process.cwd(), "content", "notes");

/** Images and other files beside the notes are copied here by scripts/notes-assets.mjs. */
export const ASSET_BASE = "/notes-assets";

export interface NoteMeta {
  title: string;
  /** URL segments, for example ["math", "linear-algebra-basics"]. */
  slug: string[];
  href: string;
  /** Folder names as written on disk, used to resolve relative images and links. */
  folders: string[];
  file: string;
  order: number;
}

export type TreeNode = { type: "folder"; name: string; title: string; slug: string[]; children: TreeNode[] } | { type: "file"; title: string; slug: string[]; href: string };

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/\.mdx?$/, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const humanise = (name: string) => {
  const words = name.replace(/\.mdx?$/, "").replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

function readMeta(file: string, folders: string[], slug: string[]): NoteMeta {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return {
    title: typeof data.title === "string" ? data.title : (heading ?? humanise(path.basename(file))),
    slug,
    href: `/notes/${slug.join("/")}/`,
    folders,
    file,
    order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
  };
}

interface Scan {
  tree: TreeNode[];
  notes: NoteMeta[];
}

function scan(dir: string, folders: string[], slug: string[], root: boolean): Scan {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => !entry.name.startsWith("."));
  const tree: TreeNode[] = [];
  const notes: NoteMeta[] = [];

  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const child = scan(path.join(dir, entry.name), [...folders, entry.name], [...slug, slugify(entry.name)], false);
    if (child.notes.length === 0) continue;
    tree.push({ type: "folder", name: entry.name, title: humanise(entry.name), slug: [...slug, slugify(entry.name)], children: child.tree });
    notes.push(...child.notes);
  }

  const files = entries
    // A README at the top level describes the folder itself and is not a note.
    .filter((item) => item.isFile() && /\.mdx?$/.test(item.name) && !(root && /^readme\.mdx?$/i.test(item.name)))
    .map((item) => readMeta(path.join(dir, item.name), folders, [...slug, slugify(item.name)]))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  for (const note of files) tree.push({ type: "file", title: note.title, slug: note.slug, href: note.href });
  notes.push(...files);

  return { tree, notes };
}

let cache: Scan | null = null;

function library(): Scan {
  // Re-scan on every request in development so new files show up without a restart.
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = fs.existsSync(NOTES_DIR) ? scan(NOTES_DIR, [], [], true) : { tree: [], notes: [] };
  return cache;
}

export const getTree = () => library().tree;
export const getAllNotes = () => library().notes;

export function getNote(slug: string[]) {
  const meta = getAllNotes().find((note) => note.slug.join("/") === slug.join("/"));
  if (!meta) return null;
  const { content } = matter(fs.readFileSync(meta.file, "utf8"));
  return { meta, markdown: content };
}

/** Resolves a relative link such as ./other-note.md to that note's URL. */
export function resolveNoteLink(from: NoteMeta, target: string) {
  const [file, hash] = target.split("#");
  const absolute = path.resolve(path.dirname(from.file), decodeURIComponent(file));
  const match = getAllNotes().find((note) => path.resolve(note.file) === absolute);
  return match ? `${match.href}${hash ? `#${hash}` : ""}` : null;
}
