// Capture the built catalog. Screenshots are review evidence, not visual approvals.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { uiCatalog } from "../docs/routes.mjs";

const output = resolve(process.env.AUDIT_DIR || "test-results/web-audit");
const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4324";
const entries = uiCatalog.filter((entry) =>
  ["core", "interaction"].includes(entry.kind),
);
const requested = new Set(
  (process.env.AUDIT_IDS || "").split(",").filter(Boolean),
);
for (const id of requested)
  if (!entries.some((entry) => entry.id === id))
    throw new Error(`Unknown component: ${id}`);
const conditions = [
  "desktop-light",
  "desktop-dark",
  "mobile-light",
  "mobile-dark",
];
await mkdir(output, { recursive: true });
await writeFile(
  join(output, "inventory.json"),
  JSON.stringify(
    entries.map(({ id, name, kind, group }) => ({ id, name, kind, group })),
    null,
    2,
  ),
);
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL,
});
let failures = 0;
try {
  await Promise.all(
    conditions.map(async (condition) => {
      const dir = join(output, condition);
      await mkdir(dir, { recursive: true });
      const context = await browser.newContext({
        viewport: {
          width: condition.startsWith("mobile") ? 390 : 1440,
          height: 1000,
        },
        deviceScaleFactor: 1,
        colorScheme: condition.endsWith("dark") ? "dark" : "light",
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      let errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const results = [];
      for (const [index, entry] of entries.entries()) {
        if (requested.size && !requested.has(entry.id)) continue;
        const file = join(
          dir,
          `${String(index + 1).padStart(3, "0")}-${entry.id}`,
        );
        if (process.env.AUDIT_RESUME === "1") {
          try {
            const previous = JSON.parse(await readFile(file + ".json", "utf8"));
            if (
              previous.status === "captured" &&
              !previous.errors.length &&
              previous.pageOverflow <= 1
            ) {
              results.push(previous);
              continue;
            }
          } catch {
            /* Capture missing/failed entries again. */
          }
        }
        errors = [];
        const result = { index: index + 1, id: entry.id, condition };
        try {
          const response = await page.goto(`${base}/docs/${entry.id}`, {
            waitUntil: "domcontentloaded",
          });
          if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
          const preview = page.locator(".system-catalog-preview");
          await preview.waitFor({ state: "visible" });
          await preview.scrollIntoViewIfNeeded();
          await page.mouse.move(0, 0);
          await page.waitForTimeout(350);
          await preview.screenshot({ path: file + ".png" });
          result.pageOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          );
          result.aria = await preview.ariaSnapshot();
          result.status = "captured";
        } catch (error) {
          result.status = "error";
          result.error = String(error);
        }
        result.errors = [...errors];
        if (
          result.status === "error" ||
          errors.length ||
          result.pageOverflow > 1
        )
          failures++;
        results.push(result);
        await writeFile(file + ".json", JSON.stringify(result, null, 2));
      }
      await writeFile(
        join(output, condition + ".json"),
        JSON.stringify(results, null, 2),
      );
      console.log(`${condition}: ${results.length} entries`);
      await context.close();
    }),
  );
} finally {
  await browser.close();
}
if (failures)
  throw new Error(
    `${failures} capture/runtime/overflow failures. Inspect the JSON reports.`,
  );
console.log(`Screenshots ready for manual review: ${output}`);
