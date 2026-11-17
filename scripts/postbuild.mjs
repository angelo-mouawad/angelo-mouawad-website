// The static export writes route prefetch data as out/notes/__next.notes/__PAGE__.txt,
// but the client asks for out/notes/__next.notes.__PAGE__.txt. A plain static host cannot
// rewrite one to the other, so this copies each file to the flat name the client requests.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "..", "out");
let copied = 0;

function flatten(dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const source = path.join(dir, entry.name);
    const flatName = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) flatten(source, flatName);
    else {
      fs.copyFileSync(source, path.join(path.dirname(prefix), path.basename(flatName)));
      copied += 1;
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) flatten(full, full);
    else walk(full);
  }
}

walk(OUT);
console.log(`postbuild: flattened ${copied} prefetch file(s)`);
