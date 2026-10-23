import { test, expect } from "@playwright/test";
import { uiCatalog } from "../src/system/ui-catalog";
const entries = uiCatalog.filter(
  (entry) => entry.kind === "core" || entry.kind === "interaction",
);

test("All exposes every component once as real links without mounting previews", async ({
  page,
}) => {
  await page.goto("/?all-gallery");
  const links = page.locator(".ui-all-list > li > a");
  await expect(links).toHaveCount(entries.length);
  expect(
    new Set(
      await links.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("href")),
      ),
    ).size,
  ).toBe(entries.length);
  for (const entry of entries)
    await expect(
      page.getByRole("link", { name: entry.name, exact: true }),
    ).toHaveAttribute("href", `/${entry.id}`);
  await expect(page.locator(".ui-newest-card, canvas, iframe")).toHaveCount(0);
});

test("search and category intersect, announce no results and reset together", async ({
  page,
}) => {
  await page.goto("/?all-gallery");
  const search = page.getByRole("searchbox", { name: "컴포넌트 검색" }),
    category = page.getByRole("combobox", { name: "카테고리" });
  await category.selectOption("Forms");
  await expect(page.locator(".ui-all-list > li")).toHaveCount(
    entries.filter((entry) => entry.group === "Forms").length,
  );
  await search.fill("Tag input");
  await expect(
    page.getByRole("link", { name: "Tag input", exact: true }),
  ).toBeVisible();
  await category.selectOption("Navigation");
  await expect(
    page.getByText("검색 결과가 없습니다", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "필터 초기화" }).click();
  await expect(search).toHaveValue("");
  await expect(category).toHaveValue("all");
  await expect(page.locator(".ui-all-list > li")).toHaveCount(entries.length);
  await search.fill("NOT-A-COMPONENT-000");
  await expect(page.getByRole("status")).toHaveText(
    `0 / ${entries.length} components`,
  );
});

test("live view keeps the entire inventory deferred and filters work in both modes", async ({
  page,
}) => {
  await page.goto("/?all-gallery");
  await page.getByText("미리보기", { exact: true }).click();
  await expect(page.locator(".ui-newest-card")).toHaveCount(entries.length);
  await expect(
    page.locator('[data-preview-ready="true"]').first(),
  ).toBeVisible();
  expect(
    await page.locator('[data-preview-ready="true"]').count(),
  ).toBeLessThan(12);
  const search = page.getByRole("searchbox", { name: "컴포넌트 검색" });
  await search.fill("Tag input");
  await expect(page.locator(".ui-newest-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Tag input 크게 보기" }).click();
  await expect(
    page.getByRole("dialog", { name: "Tag input", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByText("목록", { exact: true }).click();
  await expect(page.locator(".ui-all-list > li")).toHaveCount(1);
  await expect(search).toHaveValue("Tag input");
  await expect(page.locator(".ui-newest-card")).toHaveCount(0);
});

test("dark mobile inventory stays within the viewport and supports keyboard view selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto("/?all-gallery&theme=dark");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await page.getByRole("radio", { name: "목록", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "미리보기", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".ui-newest-card")).toHaveCount(entries.length);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});
