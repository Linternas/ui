import { test, expect } from "@playwright/test";
import {
  getNewestEntries,
  uiCatalog,
  type UiCatalogEntry,
} from "../src/system/ui-catalog";
const now = Date.parse("2026-10-22T12:00:00Z");
const entry = (id: string, addedAt: string): UiCatalogEntry => ({
  id,
  addedAt,
  name: id,
  group: "Actions",
  kind: "interaction",
  code: "<Button />",
  description: id,
});

test("newest uses UTC release windows and excludes future, invalid and expired dates", () => {
  const entries = [
    entry("older", "2026-10-01"),
    entry("today", "2026-10-22"),
    entry("future", "2026-10-23"),
    entry("expired", "2026-09-22"),
    entry("invalid", "2026-02-30"),
    entry("malformed", "today"),
  ];
  expect(getNewestEntries(entries, now).map((e) => e.id)).toEqual([
    "today",
    "older",
  ]);
  const start = Date.parse("2026-10-22T00:00:00Z"),
    end = start + 30 * 86400000;
  expect(getNewestEntries([entries[1]], start - 1)).toHaveLength(0);
  expect(getNewestEntries([entries[1]], start)).toHaveLength(1);
  expect(getNewestEntries([entries[1]], end - 1)).toHaveLength(1);
  expect(getNewestEntries([entries[1]], end)).toHaveLength(0);
  expect(uiCatalog.some((e) => e.id === "swipe-deck")).toBe(true);
  expect(getNewestEntries(uiCatalog, now).map((e) => e.id)).toEqual([
    "swipe-deck",
    "image-compare",
    "focus-dock",
    "command-palette",
    "scramble-text",
  ]);
});

test("every component added after the legacy catalog has a valid release date", async () => {
  const { readFileSync } = await import("node:fs");
  const legacy = new Set<string>(
    JSON.parse(
      readFileSync(
        new URL("./catalog-legacy-ids.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  for (const item of uiCatalog.filter(
    (entry) => entry.kind === "core" || entry.kind === "interaction",
  )) {
    if (legacy.has(item.id)) continue;
    expect(item.addedAt, `${item.id} needs an addedAt date for Newest`).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
    expect(
      new Date(`${item.addedAt}T00:00:00.000Z`).toISOString().slice(0, 10),
    ).toBe(item.addedAt);
  }
});
