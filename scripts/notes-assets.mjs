// Copies images and other files that sit beside the notes into public/notes-assets,
// so relative image paths in the markdown keep working on the static site.
// Runs automatically before `npm run dev` and `npm run build`.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = process.env.NOTES_DIR ? path.resolve(process.env.NOTES_DIR) : path.join(ROOT, "content", "notes");
const TARGET = path.join(ROOT, "public", "notes-assets");

let copied = 0;

function copy(dir, relative) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const from = path.join(dir, entry.name);
    const to = path.join(relative, entry.name);
    if (entry.isDirectory()) copy(from, to);
    else if (!/\.mdx?$/i.test(entry.name)) {
      fs.mkdirSync(path.join(TARGET, relative), { recursive: true });
      fs.copyFileSync(from, path.join(TARGET, to));
      copied += 1;
    }
  }
}

fs.rmSync(TARGET, { recursive: true, force: true });
if (fs.existsSync(SOURCE)) copy(SOURCE, "");
console.log(`notes-assets: copied ${copied} file(s) from ${path.relative(ROOT, SOURCE) || SOURCE}`);
