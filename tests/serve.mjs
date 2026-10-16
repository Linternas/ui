import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL("./fixture.tsx", import.meta.url))],
  bundle: true,
  write: false,
  outdir: "test-build",
  jsx: "automatic",
});
const js = outputFiles.find((file) => file.path.endsWith(".js")).text;
const css =
  (await readFile(new URL("../styles.css", import.meta.url), "utf8")).replace(
    '@import "./interaction.css";',
    "",
  ) + (await readFile(new URL("../interaction.css", import.meta.url), "utf8"));
createServer((req, res) => {
  if (req.url === "/fixture.js") {
    res.setHeader("Content-Type", "text/javascript");
    res.end(js);
  } else if (req.url === "/styles.css") {
    res.setHeader("Content-Type", "text/css");
    res.end(css);
  } else {
    res.setHeader("Content-Type", "text/html");
    res.end(
      '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>',
    );
  }
}).listen(4317, "127.0.0.1");
