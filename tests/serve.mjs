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
const styleResult = await build({
  stdin: {
    contents:
      '@import "../system.css"; @import "../styles.css"; @import "../docs/src/system-catalog.css"; @import "../docs/src/interaction-previews.css"; @import "../docs/src/newest-preview.css";',
    loader: "css",
    resolveDir: fileURLToPath(new URL("./", import.meta.url)),
  },
  bundle: true,
  write: false,
});
const css = styleResult.outputFiles[0].text;
createServer(async (req, res) => {
  if (
    [
      "/ui-lab/landscape.svg",
      "/ui-lab/landscape-night.svg",
      "/ui-lab/form.svg",
      "/ui-lab/echo.svg",
      "/ui-lab/fold.svg",
    ].includes(req.url)
  ) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.end(
      await readFile(new URL("../docs/public" + req.url, import.meta.url)),
    );
    return;
  }
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
