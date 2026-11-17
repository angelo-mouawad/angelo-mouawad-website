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

/** Folders may start with a number that only sets their order, for example "2 Python". */
const ORDER_PREFIX = /^\d+[\s._-]+/;

/** The display name of a folder on disk: "2 Python" becomes "Python". */
export const folderTitle = (name: string) => humanise(name.replace(ORDER_PREFIX, ""));

const folderSlug = (name: string) => slugify(name.replace(ORDER_PREFIX, ""));

/**
 * Folders that hold no notes of their own. Graphs only shapes the Obsidian graph view,
 * and images folders hold diagrams (any stray markdown in them is not a note).
 */
const IGNORED_FOLDERS = new Set(["graphs", "images", "attachments", "assets"]);

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

  const subfolders = entries
    .filter((item) => item.isDirectory() && !IGNORED_FOLDERS.has(item.name.toLowerCase()))
    // Numeric sort keeps "10 History" after "9 Linux", not after "1 General Notes".
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  for (const entry of subfolders) {
    const folderPath = [...slug, folderSlug(entry.name)];
    const child = scan(path.join(dir, entry.name), [...folders, entry.name], folderPath, false);
    if (child.notes.length === 0) continue;
    tree.push({ type: "folder", name: entry.name, title: folderTitle(entry.name), slug: folderPath, children: child.tree });
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

let assetCache: string[] | null = null;

/** Every non-markdown file in the notes, as paths relative to NOTES_DIR with forward slashes. */
function assets(): string[] {
  if (assetCache && process.env.NODE_ENV === "production") return assetCache;
  const found: string[] = [];
  const walkDir = (dir: string, relative: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      if (entry.isDirectory()) walkDir(path.join(dir, entry.name), [...relative, entry.name]);
      else if (!/\.mdx?$/i.test(entry.name)) found.push([...relative, entry.name].join("/"));
    }
  };
  if (fs.existsSync(NOTES_DIR)) walkDir(NOTES_DIR, []);
  assetCache = found;
  return found;
}

const toUrl = (relative: string) => [ASSET_BASE, ...relative.split("/").map(encodeURIComponent)].join("/");

/**
 * Resolves an image path from a note to its URL under ASSET_BASE, the way Obsidian does:
 * first relative to the note, then by file name anywhere in the vault, since Obsidian's
 * default "shortest path" links write just `diagram.svg` for a file in `images/`.
 * Prefers a match inside the note's own folder, then the closest one.
 */
export function resolveAsset(from: NoteMeta, src: string) {
  let target = src.replace(/^\.\//, "");
  try {
    target = decodeURI(target);
  } catch {
    // A stray % that is not an escape, so the path is already plain text.
  }
  const relative = path.posix.normalize([...from.folders, target].join("/"));
  const all = assets();
  if (all.includes(relative)) return toUrl(relative);

  const name = path.posix.basename(target).toLowerCase();
  const candidates = all.filter((file) => file.toLowerCase().endsWith(`/${name}`) || file.toLowerCase() === name);
  if (candidates.length === 0) return null;
  const sharedDepth = (file: string) => {
    const parts = file.split("/");
    let depth = 0;
    while (depth < from.folders.length && parts[depth] === from.folders[depth]) depth += 1;
    return depth;
  };
  candidates.sort((a, b) => sharedDepth(b) - sharedDepth(a) || a.split("/").length - b.split("/").length);
  return toUrl(candidates[0]);
}
