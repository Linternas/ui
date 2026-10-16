import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("escapes code and preserves highlighting without executing HTML", async ({
  page,
}) => {
  await expect(page.locator(".mru-code img, .mru-code script")).toHaveCount(0);
  await expect(page.locator(".mru-code").first().locator("code")).toContainText(
    "</code><img",
  );
  await expect(page.locator(".mru-code .hljs-keyword").first()).toHaveText(
    "const",
  );
  await expect(page.locator("[data-highlight]")).toHaveCount(1);
  expect(await page.evaluate(() => "compromised" in globalThis)).toBe(false);
});

test("copies the raw code, excluding line numbers", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(
    page.locator(".mru-code").first().getByRole("status"),
  ).toHaveText("Code copied to clipboard");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'const source = "</code><img src=x onerror=alert(1)>";\n// second line\nconst value = 42;',
  );
});

test("reports clipboard failure without a false success", async ({ page }) => {
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: () => Promise.reject(new Error("denied")),
    }),
  );
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(
    page.locator(".mru-code").first().getByRole("status"),
  ).toContainText("Could not copy");
});

test("tracks a nested scroll container and navigates without moving the page", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const toc = page.getByRole("navigation", { name: "On this page" });
  await expect(toc.locator("[aria-current]")).toHaveText("Introduction");
  await expect
    .poll(() => toc.locator(".mru-toc-track").getAttribute("d"))
    .toBe("M7 17 L19 51 L7 85");
  await toc.getByRole("link", { name: "Details", exact: true }).click();
  await expect(toc.locator("[aria-current]")).toHaveText("Details");
  await expect(page.locator("#detail")).toBeFocused();
  await expect
    .poll(() =>
      page
        .locator('[aria-label="reading area"]')
        .evaluate((node) => node.scrollTop),
    )
    .toBeGreaterThan(250);
  await page.locator('[aria-label="reading area"]').evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect(toc.locator("[aria-current]")).toHaveText("Finish");
  await expect(page.locator(".mru-progress-percent").first()).toHaveText(
    "100%",
  );
});

test("supports keyboard disclosure, Escape focus return, outside dismissal, and section focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const toggle = page.locator(".mru-progress-toggle").first();
  await toggle.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("navigation", { name: "Jump to a section" });
  await expect(panel.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole("button", { name: "Outside", exact: true }).click();
  await expect(panel).toHaveCount(0);
  await toggle.click();
  await panel.getByRole("link", { name: "Finish", exact: true }).click();
  await expect(panel).toHaveCount(0);
  await expect(page.locator("#finish")).toBeFocused();
  await expect(page.locator(".mru-progress-toggle").last()).toBeDisabled();
});

test("keeps a narrow viewport within its bounds and honors reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect
    .poll(() =>
      page
        .locator(".mru-toc-cursor")
        .evaluate((node) => getComputedStyle(node).transitionDuration),
    )
    .toBe("0s");
});
