// Prints the node tree, bounds and materials of a compressed model.
// Usage: node scripts/inspect.mjs public/models/name.glb
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });

const fmt = (v) => v.map((n) => n.toFixed(3)).join(", ");

for (const file of process.argv.slice(2)) {
  const doc = await io.read(file);
  const root = doc.getRoot();
  const scene = root.getDefaultScene() ?? root.listScenes()[0];
  const b = getBounds(scene);
  console.log(`\n${file}\n  bounds min [${fmt(b.min)}] max [${fmt(b.max)}]`);
  const walk = (node, depth) => {
    if (depth > 6) return;
    const mesh = node.getMesh();
    const nb = getBounds(node);
    const mats = mesh ? [...new Set(mesh.listPrimitives().map((p) => p.getMaterial()?.getName()))].join("|") : "";
    console.log(
      `  ${"  ".repeat(depth)}${node.getName() || "(unnamed)"}${mesh ? `  mesh<${mats}>` : ""}  [${fmt(nb.min)}]..[${fmt(nb.max)}]`,
    );
    node.listChildren().forEach((c) => walk(c, depth + 1));
  };
  scene.listChildren().forEach((n) => walk(n, 0));
  console.log("  materials:", root.listMaterials().map((m) => `${m.getName()}(e:${fmt(m.getEmissiveFactor())})`).join(", "));
}
