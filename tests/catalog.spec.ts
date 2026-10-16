import { test, expect } from "@playwright/test";
import {
  uiCatalog,
  uiGroups,
  uiFamilies,
  interactionCatalog,
} from "../src/system/ui-catalog";
import { systemCatalog } from "../src/system/catalog";
test("one catalogue includes every component once and makes all groups and variants reachable", () => {
  expect(new Set(uiCatalog.map((entry) => entry.id)).size).toBe(
    uiCatalog.length,
  );
  expect(uiCatalog.filter((entry) => entry.kind === "core")).toHaveLength(
    systemCatalog.length,
  );
  expect(
    uiCatalog.filter((entry) => entry.kind === "interaction"),
  ).toHaveLength(interactionCatalog.length);
  for (const item of uiCatalog) {
    expect(uiGroups).toContain(item.group);
    expect(item.code.trim().length).toBeGreaterThan(0);
  }
  for (const id of uiFamilies.flat()) {
    expect(uiCatalog.some((entry) => entry.id === id)).toBe(true);
  }
  expect(uiCatalog.find((entry) => entry.id === "sidebar")?.group).toBe(
    uiCatalog.find((entry) => entry.id === "bounce-sidebar")?.group,
  );
  expect(uiCatalog.find((entry) => entry.id === "delete-button")?.group).toBe(
    uiCatalog.find((entry) => entry.id === "button")?.group,
  );
});
