import { test, expect } from "@playwright/test";
import { uiCatalog } from "../src/system/ui-catalog";
const entries = uiCatalog.filter(
  (entry) => entry.kind === "core" || entry.kind === "interaction",
);

test("All always shows every live preview without a search, filter or view toolbar", async ({
  page,
}) => {
  await page.goto("/?all-gallery");
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByRole("radiogroup")).toHaveCount(0);
  await expect(page.locator(".ui-all-controls, .ui-all-list")).toHaveCount(0);
  const cards = page.locator(".ui-newest-card");
  await expect(cards).toHaveCount(entries.length);
  expect(
    new Set(
      await cards.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-preview-id")),
      ),
    ).size,
  ).toBe(entries.length);
  for (const entry of entries)
    await expect(
      page.getByRole("link", { name: `${entry.name} 코드 보기`, exact: true }),
    ).toHaveAttribute("href", `/docs/${entry.id}`);
  await expect(
    page.locator('[data-preview-ready="true"]').first(),
  ).toBeVisible();
  expect(
    await page.locator('[data-preview-ready="true"]').count(),
  ).toBeLessThan(24);
});

test("live tiles still expand into the actual component and its usage code", async ({
  page,
}) => {
  await page.goto("/?all-gallery");
  const open = page.getByRole("button", {
    name: "Tag input 크게 보기",
    exact: true,
  });
  await open.scrollIntoViewIfNeeded();
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Tag input", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("tab", { name: "코드", exact: true }).click();
  await expect(dialog.locator("code")).toContainText("TagInput");
  await expect(dialog.getByRole("link", { name: /컴포넌트/ })).toHaveAttribute(
    "href",
    "/docs/tag-input",
  );
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
});

test("All uses the full viewport with equal preview tiles on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/?catalog-shell&selected=all");
  await page.addStyleTag({ content: "body { margin: 0; }" });
  for (const width of [1440, 1920, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const bounds = await page.locator(".system-catalog-main").boundingBox();
    expect(bounds!.x).toBe(0);
    expect(bounds!.width).toBe(width);
    await expect(page.locator(".system-catalog-sidebar")).toBeHidden();
    await expect(
      page.getByRole("combobox", { name: "Select a component" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Docs", exact: true }),
    ).toBeVisible();
    const tile = page.locator(".ui-newest-card").first();
    const columns = width >= 1800 ? 4 : width >= 1180 ? 3 : 1;
    expect(
      await page
        .locator(".ui-newest-grid")
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        ),
    ).toBe(columns);
    expect((await tile.boundingBox())!.width).toBeCloseTo(
      (width - 32 - (columns - 1) * 16) / columns,
      0,
    );
    expect((await tile.boundingBox())!.height).toBe(420);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
});

test("New badges remain on previews and expire without removing components", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-23T12:00:00Z"));
  await page.goto("/?catalog-shell&selected=all");
  await expect(
    page.locator('a[href="/newest"], option[value="newest"]'),
  ).toHaveCount(0);
  await expect(
    page.locator(
      '.ui-newest-card[data-preview-id="prompt-composer"] .ui-new-badge',
    ),
  ).toHaveText("New");
  await expect(
    page.locator('.ui-newest-card[data-preview-id="button"] .ui-new-badge'),
  ).toHaveCount(0);
  await page.clock.setFixedTime(new Date("2026-11-23T12:00:00Z"));
  await page.reload();
  await expect(page.locator(".ui-newest-card")).toHaveCount(entries.length);
  await expect(page.locator(".ui-new-badge")).toHaveCount(0);
});

test("Docs reuses the searchable sidebar, real state examples and usage code", async ({
  page,
}) => {
  await page.goto("/docs?landing");
  await expect(
    page.getByRole("heading", { level: 1, name: "Foundations", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".ui-docs-header")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page
    .getByRole("searchbox", { name: "Find a component" })
    .fill("Tag input");
  await page
    .getByRole("navigation", { name: "Design system components" })
    .getByRole("link", { name: /^Tag input/ })
    .click();
  await expect(page).toHaveURL(/\/docs\/tag-input$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Tag input", exact: true }),
  ).toBeFocused();
  await expect(page.locator("#usage code")).toContainText("TagInput");
  await expect(
    page.getByRole("region", { name: "Tag input preview", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Tag input", exact: true }),
  ).toBeVisible();
});

test("mobile Docs can select a component, open code and return to all previews", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/docs?landing");
  await page.addStyleTag({ content: "body { margin: 0; }" });
  await page
    .getByRole("combobox", { name: "Select a component" })
    .selectOption("button");
  await expect(page).toHaveURL(/\/docs\/button$/);
  await expect(page.locator("#usage code")).toContainText("Button");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await page
    .getByRole("combobox", { name: "Select a component" })
    .selectOption("all");
  await expect(page).toHaveURL(/\/all$/);
  await expect(page.locator(".ui-newest-card")).toHaveCount(entries.length);
});
