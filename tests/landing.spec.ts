import { test, expect, type Page } from "@playwright/test";
import { uiCatalog } from "../src/system/ui-catalog";
const count = uiCatalog.filter(
  (entry) => entry.kind === "core" || entry.kind === "interaction",
).length;
const visit = async (page: Page) => {
  await page.goto("/?landing");
  await page.addStyleTag({ content: "body{margin:0}" });
};
async function pixels(page: Page) {
  return page.locator(".landing-sculpture canvas").evaluate((node) => {
    const canvas = node as HTMLCanvasElement,
      pixels = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 0;
    for (let i = 0; i < pixels.length; i += 16)
      hash =
        (hash * 31 +
          pixels[i] +
          pixels[i + 1] * 3 +
          pixels[i + 2] * 7 +
          pixels[i + 3]) |
        0;
    return hash;
  });
}

test("landing starts with one live sculpture, real inventory and deferred lower sections", async ({
  page,
}) => {
  await visit(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Built tofeel right.",
  );
  await expect(page).toHaveTitle("Mingu UI — Built to feel right.");
  await expect(page.locator('a[href="/newest"]')).toHaveCount(0);
  await expect(page.locator(".landing-facts")).toContainText(String(count));
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByTestId("landing-bench")).toHaveCount(0);
  await expect(page.locator(".ui-newest-card")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "컴포넌트 둘러보기" }),
  ).toHaveAttribute("href", "/all");
  await page.locator("#craft").scrollIntoViewIfNeeded();
  await expect(page.locator(".ui-newest-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Elastic mesh 크게 보기" }).click();
  await expect(
    page.getByRole("dialog", { name: "Elastic mesh", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
});

test("hero shape controls change real pixels and respect reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await visit(page);
  const hero = page.locator(".landing-sculpture");
  await expect(hero.getByLabel("Globe amount", { exact: true })).toHaveValue(
    "1",
  );
  await expect.poll(() => pixels(page)).not.toBe(0);
  const sphere = await pixels(page);
  await page.getByText("Pixels", { exact: true }).click();
  await expect(hero.getByLabel("Globe amount", { exact: true })).toHaveValue(
    "0",
  );
  await expect.poll(() => pixels(page)).not.toBe(sphere);
  const flat = await pixels(page);
  await page.waitForTimeout(120);
  expect(await pixels(page)).toBe(flat);
  await page.getByText("Volume", { exact: true }).click();
  await expect(hero.getByLabel("Globe amount", { exact: true })).toHaveValue(
    "1",
  );
  await expect(
    hero.getByRole("button", { name: "Pause motion" }),
  ).toBeDisabled();
});

test("hero rotation pauses explicitly without changing its controls", async ({
  page,
}) => {
  await visit(page);
  await expect.poll(() => pixels(page)).not.toBe(0);
  const before = await pixels(page);
  await expect.poll(() => pixels(page)).not.toBe(before);
  const hero = page.locator(".landing-sculpture");
  await hero.getByRole("button", { name: "Pause motion" }).click();
  await expect(
    hero.getByRole("button", { name: "Resume motion" }),
  ).toBeVisible();
  await page.waitForTimeout(60);
  const paused = await pixels(page);
  await page.waitForTimeout(120);
  expect(await pixels(page)).toBe(paused);
});

test("workbench controls update actual theme, radius, button response and matching code", async ({
  page,
}) => {
  await visit(page);
  await page.locator("#system").scrollIntoViewIfNeeded();
  const bench = page.getByTestId("landing-bench");
  await expect(bench).toBeVisible();
  await bench.getByText("Dark surface", { exact: true }).click();
  await expect(
    bench.getByRole("switch", { name: "Dark surface" }),
  ).toBeChecked();
  await expect(bench.locator(".landing-bench-provider")).toHaveAttribute(
    "data-mingu-theme",
    "dark",
  );
  await bench
    .getByRole("slider", { name: "Corner radius", exact: true })
    .fill("24");
  await expect(bench.locator(".landing-product-card")).toHaveCSS(
    "border-radius",
    "24px",
  );
  await bench.getByRole("button", { name: "Ripple", exact: true }).click();
  await expect(bench.locator("code")).toContainText('interaction="ripple"');
  await expect(bench.locator("code")).toContainText("'24px'");
  const action = bench.getByRole("button", { name: "Make it happen" });
  await expect(action).toHaveAttribute("data-interaction", "ripple");
  await expect(action).toHaveCSS("border-radius", "24px");
  await bench
    .getByRole("textbox", { name: "Your next idea" })
    .fill("A useful thing");
  await action.click();
  await expect(
    bench.locator(".landing-product-card [role=status]"),
  ).toContainText("A useful thing");
  await bench.getByRole("textbox", { name: "Your next idea" }).fill("");
  await expect(action).toBeDisabled();
});

test("landing preserves native navigation and theme across lazy catalog routes", async ({
  page,
}) => {
  await visit(page);
  await page.getByRole("button", { name: "다크 테마로 전환" }).click();
  await expect(page.locator(".landing-page")).toHaveAttribute(
    "data-mingu-theme",
    "dark",
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: /Components/ })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "All", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".system-catalog")).toHaveAttribute(
    "data-mingu-theme",
    "dark",
  );
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Built to",
  );
  await expect(page.locator(".landing-page")).toHaveAttribute(
    "data-mingu-theme",
    "dark",
  );
});

test("landing and loaded workbench fit a narrow touch viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 820 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await visit(page);
  const overflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(await overflow()).toBeLessThanOrEqual(1);
  await page.getByText("Pixels", { exact: true }).tap();
  await expect(
    page.getByRole("radio", { name: "Pixels", exact: true }),
  ).toBeChecked();
  await page.locator("#system").scrollIntoViewIfNeeded();
  const bench = page.getByTestId("landing-bench");
  await expect(bench).toBeVisible();
  await bench
    .getByRole("textbox", { name: "Your next idea" })
    .fill("Mobile idea");
  await bench.getByRole("button", { name: "Make it happen" }).tap();
  await expect(
    bench.locator(".landing-product-card [role=status]"),
  ).toContainText("Mobile idea");
  expect(await overflow()).toBeLessThanOrEqual(1);
  await context.close();
});

test("particle morph honors controlled ownership, clamps values and restores the provided default", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?morph-consumer");
  const amount = page.getByRole("slider", {
    name: "Globe amount",
    exact: true,
  });
  await expect(amount).toHaveValue("0.8");
  await page.getByRole("button", { name: "Form image", exact: true }).click();
  await expect(
    page.getByRole("status", { name: "Requested amount" }),
  ).toHaveText("0");
  await expect(amount).toHaveValue("0.8");
  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect(
    page.getByRole("status", { name: "Requested amount" }),
  ).toHaveText("0.25");
  await expect(amount).toHaveValue("0.8");
  await page.getByRole("checkbox", { name: "Accept updates" }).check();
  await page.getByRole("button", { name: "Form image", exact: true }).click();
  await expect(amount).toHaveValue("0");
  await page.getByRole("button", { name: "Set external amount" }).click();
  await expect(amount).toHaveValue("1");
  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect(amount).toHaveValue("0.25");
  await page.goto("/?morph-consumer&uncontrolled");
  await expect(amount).toHaveValue("0.25");
  await page.getByRole("button", { name: "Form globe", exact: true }).click();
  await expect(amount).toHaveValue("1");
  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect(amount).toHaveValue("0.25");
});
