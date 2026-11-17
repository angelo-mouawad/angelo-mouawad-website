// Downloads source assets and writes compressed versions into public/.
// Usage: node scripts/assets.mjs [--only name,name]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".asset-cache");
const OLD_SITE = path.resolve(ROOT, "..", "Personal Resume website", "objects");
// Uncompressed models added by hand (Sketchfab exports). Their compressed copies in public/models are the ones kept;
// to rebuild one, put its source file here again and run the script with --only <name>.
const LOCAL_SOURCE = path.join(ROOT, "assets", "models");
const OUT_MODELS = path.join(ROOT, "public", "models");
const OUT_TEXTURES = path.join(ROOT, "public", "textures");
const OUT_HDRI = path.join(ROOT, "public", "hdri");

// tex: longest texture edge after compression. keep: preserve the node tree for animated parts.
// palette: false keeps materials separate so code can restyle them by name.
// simplify: mesh simplification error, as a fraction of the mesh extent (gltf-transform default 0.0001).
const POLYHAVEN_MODELS = {
  binder_notebook: { tex: 512, keep: true },
  office_notepads: { tex: 512, keep: true },
  book_encyclopedia_set_01: { tex: 512 },
  desk_lamp_arm_01: { tex: 512 },
  modern_wooden_cabinet: { tex: 512 },
  potted_plant_01: { tex: 512 },
  potted_plant_02: { tex: 512 },
  potted_plant_04: { tex: 512 },
  wall_clock: { tex: 512, keep: true },
  
  Camera_01: { tex: 256 },
  
  football: { tex: 512, keep: true },
};

const OLD_MODELS = {
  classic_ps5: { tex: 512 },
  cameraman_backpack: { tex: 1024 },
};

// Source file name → output name and options.
const LOCAL_MODELS = {
  lain_li_pc_case: { out: "lian_li_case", tex: 2048, palette: false },
  modern_chair_3d_model: { out: "modern_chair", tex: 512, palette: false, simplify: 0.0008 },
  mouse_and_keyboard: { out: "mouse_and_keyboard", tex: 1024, palette: false, simplify: 0.0005 },
  playstation_5_dualsense: { out: "dualsense", tex: 512, palette: false, simplify: 0.0005 },
};

// Poly Pizza model id → output name and options. Files come from static.poly.pizza.
const POLYPIZZA_MODELS = {
  "7528df1c-c611-4e42-9210-eba9fcaf4269": { out: "laptop", palette: false, join: false },
};

const POLYHAVEN_TEXTURES = {
  herringbone_parquet: 1024,
  painted_plaster_wall: 1024,
  walnut_veneer: 1024,
  brown_leather: 512,
  cotton_jersey: 512,
};

const HDRI = "shanghai_bund";

const only = process.argv.includes("--only")
  ? new Set(process.argv[process.argv.indexOf("--only") + 1].split(","))
  : null;
const wanted = (name) => !only || only.has(name);

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function filesOf(id) {
  const res = await fetch(`https://api.polyhaven.com/files/${id}`);
  if (!res.ok) throw new Error(`files ${id}: ${res.status}`);
  return res.json();
}

function optimize(src, name, { tex, keep, simplify, palette = true, join = true }) {
  const out = path.join(OUT_MODELS, `${name}.glb`);
  const args = [
    path.join(ROOT, "node_modules", "@gltf-transform", "cli", "bin", "cli.js"),
    "optimize", src, out,
    "--compress", "meshopt",
    "--texture-compress", "webp",
    ...(tex ? ["--texture-size", String(tex)] : []),
  ];
  if (simplify) args.push("--simplify-error", String(simplify));
  if (!palette && !keep) args.push("--palette", "false");
  if (!join && !keep) args.push("--join", "false");
  if (keep) args.push("--flatten", "false", "--join", "false", "--instance", "false", "--palette", "false");
  execFileSync(process.execPath, args, { stdio: ["ignore", "ignore", "inherit"] });
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`  ${name}.glb ${kb} KB`);
}

async function polyhavenModel(id, opts) {
  const files = await filesOf(id);
  const entry = files.gltf["1k"].gltf;
  const dir = path.join(CACHE, "models", id);
  const main = path.join(dir, `${id}.gltf`);
  await download(entry.url, main);
  await Promise.all(
    Object.entries(entry.include ?? {}).map(([rel, f]) => download(f.url, path.join(dir, rel))),
  );
  optimize(main, id.toLowerCase(), opts);
}

async function polyhavenTexture(id, size) {
  const files = await filesOf(id);
  const maps = { diff: files.Diffuse, nor: files.nor_gl, rough: files.Rough };
  for (const [key, map] of Object.entries(maps)) {
    if (!map) continue;
    const src = path.join(CACHE, "textures", `${id}_${key}.jpg`);
    await download(map["1k"].jpg.url, src);
    const out = path.join(OUT_TEXTURES, `${id}_${key}.webp`);
    await sharp(src).resize(size, size).webp({ quality: key === "diff" ? 82 : 78 }).toFile(out);
  }
  console.log(`  ${id} textures`);
}

async function hdri(id) {
  const files = await filesOf(id);
  await download(files.hdri["1k"].hdr.url, path.join(OUT_HDRI, `${id}_1k.hdr`));
  const jpg = path.join(CACHE, "hdri", `${id}.jpg`);
  await download(files.tonemapped.url, jpg);
  console.log(`  ${id} hdri`);
}

for (const dir of [OUT_MODELS, OUT_TEXTURES, OUT_HDRI]) fs.mkdirSync(dir, { recursive: true });

console.log("Poly Haven models");
for (const [id, opts] of Object.entries(POLYHAVEN_MODELS)) {
  if (wanted(id)) await polyhavenModel(id, opts);
}

console.log("Models reused from the old site");
for (const [name, opts] of Object.entries(OLD_MODELS)) {
  if (wanted(name)) optimize(path.join(OLD_SITE, `${name}.glb`), name, opts);
}

console.log("Local models");
for (const [source, { out, ...opts }] of Object.entries(LOCAL_MODELS)) {
  if (!wanted(source) && !wanted(out)) continue;
  const file = path.join(LOCAL_SOURCE, `${source}.glb`);
  if (fs.existsSync(file)) optimize(file, out, opts);
  else console.log(`  ${out}.glb kept as is (no source at assets/models/${source}.glb)`);
}

console.log("Poly Pizza models");
for (const [id, { out, ...opts }] of Object.entries(POLYPIZZA_MODELS)) {
  if (!wanted(out)) continue;
  const src = path.join(CACHE, "models", "polypizza", `${out}.glb`);
  await download(`https://static.poly.pizza/${id}.glb`, src);
  optimize(src, out, opts);
}

console.log("Textures");
for (const [id, size] of Object.entries(POLYHAVEN_TEXTURES)) {
  if (wanted(id)) await polyhavenTexture(id, size);
}

if (wanted(HDRI)) {
  console.log("HDRI");
  await hdri(HDRI);
}
