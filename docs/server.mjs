import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uiCatalog, playgroundExperiments } from "./routes.mjs";
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const index = await readFile(path.join(root, "index.html"));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const known = new Set([
  "/docs",
  "/native",
  ...uiCatalog
    .filter((item) => !["all", "playground"].includes(item.id))
    .map((item) => "/docs/" + item.id),
  ...uiCatalog.map((item) => "/" + item.id),
  ...playgroundExperiments.map((item) => item.path),
]);
const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  );
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end();
  }
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
  } catch {
    res.writeHead(400);
    return res.end();
  }
  if (pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end(req.method === "HEAD" ? undefined : "ok");
  }
  if (pathname === "/lab/ui" || pathname.startsWith("/lab/ui/")) {
    const target = pathname.replace(/^\/lab\/ui/, "") || "/";
    res.writeHead(308, { Location: target });
    return res.end();
  }
  if (pathname === "/robots.txt") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end(
      req.method === "HEAD" ? undefined : "User-agent: *\nDisallow: /\n",
    );
  }
  const target = path.resolve(root, "." + pathname);
  if (target !== root && !target.startsWith(root + path.sep)) {
    res.writeHead(404);
    return res.end();
  }
  try {
    const info = await stat(target);
    if (info.isFile()) {
      const content = await readFile(target);
      res.writeHead(200, {
        "Content-Type":
          types[path.extname(target)] ?? "application/octet-stream",
        "Cache-Control": pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      });
      return res.end(req.method === "HEAD" ? undefined : content);
    }
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "ENOTDIR") {
      console.error("Static response failed");
      res.writeHead(500);
      return res.end();
    }
  }
  if (pathname.startsWith("/assets/") || path.extname(pathname)) {
    res.writeHead(404);
    return res.end();
  }
  const route = pathname.replace(/\/$/, "") || "/";
  res.writeHead(route === "/" || known.has(route) ? 200 : 404, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end(req.method === "HEAD" ? undefined : index);
});
server.listen(Number(process.env.PORT ?? 3000), "0.0.0.0", () =>
  console.log(`Mingu UI listening on 0.0.0.0:${server.address().port}`),
);
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
});
