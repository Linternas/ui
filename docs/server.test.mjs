import test from "node:test";
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
    const asset = html.match(/src="([^"]+\.js)"/)?.[1];
    assert.ok(asset);
    const js = await fetch(base + asset);
    assert.equal(js.status, 200);
    assert.match(js.headers.get("content-type"), /javascript/);
    assert.match(js.headers.get("cache-control"), /immutable/);
    for (const route of [
      "/button",
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
