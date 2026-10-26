import test from "node:test";
import { uiCatalog, playgroundExperiments } from "./routes.mjs";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

test("production docs server serves built routes, assets and health without exposing source files", async () => {
  const child = spawn(
    process.execPath,
    [fileURLToPath(new URL("./server.mjs", import.meta.url))],
    {
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  let output = "";
  const base = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Server startup timeout")),
      10000,
    );
    child.once("error", reject);
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(Error(`Server exited: ${code}`));
    });
    child.stdout.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/0\.0\.0\.0:(\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(`http://127.0.0.1:${match[1]}`);
      }
    });
  });
  try {
    const home = await fetch(base);
    assert.equal(home.status, 200);
    const html = await home.text();
    const pkg = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    );
    assert.ok(
      html.includes(`name="mingu-ui-version" content="${pkg.version}"`),
    );
    for (const route of [
      ...uiCatalog.map((item) => `/${item.id}`),
      "/docs",
      "/native",
      "/native/",
      "/docs/",
      ...uiCatalog
        .filter((item) => !["all", "playground"].includes(item.id))
        .map((item) => `/docs/${item.id}`),
      ...playgroundExperiments.map((item) => item.path),
    ])
      assert.equal((await fetch(base + route)).status, 200, route);
    const asset = html.match(/src="([^"]+\.js)"/)?.[1];
    assert.ok(asset);
    const js = await fetch(base + asset);
    assert.equal(js.status, 200);
    assert.match(js.headers.get("content-type"), /javascript/);
    assert.match(js.headers.get("cache-control"), /immutable/);
    // Every emitted import must remain fetchable after splitting the catalog from home.
    const visited = new Set();
    const queue = [new URL(asset, base).href];
    while (queue.length) {
      const url = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);
      const response = await fetch(url);
      assert.equal(response.status, 200, url);
      assert.match(response.headers.get("content-type"), /javascript/);
      const source = await response.text();
      for (const match of source.matchAll(
        /(?:from|import\s*\(?)["'](\.\/[^"']+\.js)["']/g,
      ))
        queue.push(new URL(match[1], url).href);
    }
    assert.ok(visited.size > 1, "home and catalog have separate module assets");

    for (const route of [
      "/cloth-playground",
      "/fluid-sandbox",
      "/orbit-composer",
      "/playground/cloth-playground",
      "/playground/fluid-sandbox",
      "/playground/orbit-composer",
      "/playground",
      "/playground/particle-text",
      "/playground/spatial-board",
      "/playground/sound-pad",
      "/particle-text",
      "/spatial-board",
      "/sound-pad",
      "/button",
      "/controls",
      "/image-lens",
      "/directional-card",
      "/looping-ticker",
      "/rotating-text",

      "/image-lightbox",
      "/expandable-card",
      "/animated-filter-bar",
      "/resizable-panels",
      "/sortable-list",
      "/inline-edit",
      "/selection-toolbar",
      "/smart-header",
      "/code-tabs",
      "/bottom-sheet",
      "/action-toast",
      "/file-dropzone",

      "/radial-menu",
      "/preview-link",
      "/morphing-search",
      "/elastic-slider",
      "/swipe-deck",
      "/focus-dock",
      "/image-compare",
      "/command-palette",
      "/scramble-text",
      "/ui-lab/landscape-night.svg",
      "/textarea-field",
      "/select-field",
      "/floating-field",
      "/healthz",
      "/ui-lab/landscape.svg",
      "/ui-lab/note.wav",
    ])
      assert.equal((await fetch(base + route)).status, 200, route);
    for (const route of [
      "/.env",
      "/package.json",
      "/docs/server.mjs",
      "/assets/missing.js",
      "/not-a-component",
      "/docs/not-a-component",
      "/docs/all",
      "/docs/playground",
      "/newest",
      "/newest/",
      "/playground/missing",
    ])
      assert.equal((await fetch(base + route)).status, 404, route);
    const head = await fetch(base + "/button", { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
    assert.equal(
      (await fetch(base + "/button", { method: "POST" })).status,
      405,
    );
    const old = await fetch(base + "/lab/ui/button", { redirect: "manual" });
    assert.equal(old.status, 308);
    assert.equal(old.headers.get("location"), "/button");
    assert.equal(home.headers.get("x-frame-options"), "DENY");
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
});

test("playground inventory starts at 01 and stays in numeric order", () => {
  assert.deepEqual(
    playgroundExperiments.map((item) => item.number),
    playgroundExperiments.map((_, index) => String(index + 1).padStart(2, "0")),
  );
  assert.equal(playgroundExperiments[0].id, "particle-text");
  assert.equal(
    new Set(playgroundExperiments.map((item) => item.path)).size,
    playgroundExperiments.length,
  );
});
