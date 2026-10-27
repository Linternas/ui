import { test, expect } from "@playwright/test";
import { nativeCatalog, nativeReleaseIsNew } from "../packages/native/catalog";
import { uiCatalog } from "../src/system/ui-catalog";
test("Native inventory stays separate from the 200 Web components and New expires", () => {
  expect(
    uiCatalog.filter((e) => e.kind === "core" || e.kind === "interaction"),
  ).toHaveLength(200);
  expect(new Set(nativeCatalog.map((e) => e.id)).size).toBe(
    nativeCatalog.length,
  );
  expect(nativeCatalog.length).toBeGreaterThanOrEqual(40);
  expect(nativeReleaseIsNew(Date.parse("2026-10-26T00:00:00Z"))).toBe(true);
  expect(nativeReleaseIsNew(Date.parse("2026-11-25T00:00:00Z"))).toBe(false);
});
for (const width of [1440, 320])
  test(`Native docs route, inventory and installation fit ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.setFixedTime(new Date("2026-10-26T12:00:00Z"));
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/native");
    await expect(
      page.getByRole("heading", { name: "Made for touch.", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".native-docs-grid li")).toHaveCount(
      nativeCatalog.length,
    );
    await expect(page.locator(".native-docs-grid .ui-new-badge")).toHaveCount(
      nativeCatalog.length,
    );
    await expect(
      page.getByRole("link", { name: "모바일 예제 실행", exact: true }),
    ).toHaveAttribute("href", /examples\/native/);
    await expect(
      page.getByRole("heading", { name: "휴대폰에서 직접 확인하기" }),
    ).toBeVisible();
    await expect(
      page.locator("code").filter({ hasText: "cd ui/examples/native" }).first(),
    ).toBeVisible();
    await expect(
      page.locator("code").filter({ hasText: "NativeProvider" }).first(),
    ).toBeVisible();
    await page.getByLabel("Native docs theme").selectOption("dark");
    await expect(page.locator(".native-docs")).toHaveAttribute(
      "data-mingu-theme",
      "dark",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
    await page.clock.setFixedTime(new Date("2026-11-25T12:00:00Z"));
    await page.reload();
    await expect(page.locator(".native-docs-grid .ui-new-badge")).toHaveCount(
      0,
    );
    await page
      .getByRole("link", { name: "Web components", exact: true })
      .click();
    await expect(page).toHaveURL(/\/all$/);
    await expect(page.locator(".ui-newest-card")).toHaveCount(200);
  });
