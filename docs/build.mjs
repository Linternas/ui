import { build } from "esbuild";
import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const version = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
).version;
const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "dist");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const result = await build({
  absWorkingDir: root,
  entryPoints: ["docs/src/main.tsx"],
  outdir: "dist/assets",
  entryNames: "[name]-[hash]",
  assetNames: "[name]-[hash]",
  bundle: true,
  minify: true,
  format: "esm",
  jsx: "automatic",
  target: ["es2022"],
  define: { "process.env.NODE_ENV": '"production"' },
  metafile: true,
  alias: {
    "@mingu/interaction-ui/catalog": path.join(
      root,
      "src/system/ui-catalog.ts",
    ),
    "@mingu/interaction-ui/system": path.join(root, "src/system/index.tsx"),
    "@mingu/interaction-ui": path.join(root, "src/index.ts"),
  },
  logLevel: "info",
});
await build({
  absWorkingDir: root,
  entryPoints: ["src/system/ui-catalog.ts"],
  outfile: "docs/routes.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  logLevel: "silent",
});
const files = Object.keys(result.metafile.outputs);
const js = files.find((file) => file.endsWith(".js")),
  css = files.find((file) => file.endsWith(".css"));
if (!js || !css) throw Error("Docs bundle did not produce JS and CSS");
await cp(path.join(root, "docs/public"), out, { recursive: true });
await writeFile(
  path.join(out, "index.html"),
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Mingu UI — foundations, components, interactions and patterns."><meta name="mingu-ui-version" content="${version}"><meta name="robots" content="noindex,nofollow"><title>Mingu UI</title><link rel="stylesheet" href="/${css.replace(/^dist\//, "")}"></head><body><div id="root"></div><script type="module" src="/${js.replace(/^dist\//, "")}"></script></body></html>`,
);
console.log("Standalone Mingu UI docs built to dist/");
