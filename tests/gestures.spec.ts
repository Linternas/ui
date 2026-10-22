import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/?gestures");
});

test("radial menu supports keyboard navigation, selection and focus restoration", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Create", exact: true });
  await expect(
    page.getByRole("button", { name: "Empty actions" }),
  ).toBeDisabled();
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Note", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("menuitem", { name: "Image", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("menuitem", { name: "Link", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status", { name: "Selected action" }),
  ).toHaveText("note");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("ArrowUp");
  await expect(
    page.getByRole("menuitem", { name: "Link", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("radial menu dismisses on outside click or Tab, including all-disabled actions", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Create", exact: true });
  await trigger.click();
  await page.getByRole("button", { name: "Outside", exact: true }).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page.keyboard.press("Tab");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page
    .getByRole("button", { name: "Disabled actions", exact: true })
    .click();
  await expect(
    page.getByRole("menu", { name: "Disabled actions", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Disabled actions", exact: true }),
  ).toBeFocused();
});

test("preview follows pointer in the top layer, preserves theme and native link navigation", async ({
  page,
}) => {
  const link = page.getByTestId("preview-link");
  await link.hover();
  const preview = page.locator(".mingu-link-preview:popover-open");
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("inert", "");
  await expect(preview).toHaveAttribute("aria-hidden", "true");
  await expect(preview).toHaveCSS("color", "rgb(237, 237, 237)");
  const bounds = await link.boundingBox();
  if (!bounds) throw Error("Missing link");
  const before = (await preview.boundingBox())!.x;
  await page.mouse.move(
    bounds.x + bounds.width - 1,
    bounds.y + bounds.height / 2,
  );
  await expect
    .poll(async () => (await preview.boundingBox())!.x)
    .toBeGreaterThan(before + 20);
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await link.click();
  await expect(page).toHaveURL(/#project$/);
});

test("preview supports keyboard focus, viewport clamping and scroll dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const link = page.getByTestId("preview-link");
  await link.focus();
  const preview = page.locator(".mingu-link-preview:popover-open");
  await expect(preview).toBeVisible();
  const bounds = (await preview.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(15);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(305);
  expect(bounds.y).toBeGreaterThanOrEqual(15);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(625);
  await page.mouse.wheel(0, 80);
  await expect(preview).toHaveCount(0);
});

test("search expands with focus, submits actual text, clears, and retains value when collapsed", async ({
  page,
}) => {
  const search = page.getByRole("search", { name: "Find projects" });
  await search
    .getByRole("button", { name: "Find projects", exact: true })
    .click();
  const input = search.getByRole("searchbox");
  await expect(input).toBeFocused();
  await input.fill("quiet work");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status", { name: "Submitted query" }),
  ).toHaveText("quiet work");
  await page.keyboard.press("Escape");
  await expect(
    search.getByRole("button", { name: "Find projects", exact: true }),
  ).toBeFocused();
  await expect(input).toHaveCount(0);
  await search
    .getByRole("button", { name: "Find projects", exact: true })
    .click();
  await expect(input).toHaveValue("quiet work");
  await search.getByRole("button", { name: "Clear search" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Disabled search" }),
  ).toBeDisabled();
});

test("elastic slider bends during actual drag and springs back without losing native values", async ({
  page,
}) => {
  const slider = page.getByRole("slider", { name: "Intensity" });
  await slider.scrollIntoViewIfNeeded();
  const bounds = (await slider.boundingBox())!;
  const circle = slider.locator("..").locator("circle");
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.8,
    bounds.y + bounds.height / 2 - 28,
    { steps: 10 },
  );
  await expect(slider).toHaveValue("80");
  await expect
    .poll(async () => Number(await circle.getAttribute("cy")))
    .toBeLessThan(23);
  await page.mouse.up();
  await expect
    .poll(async () => Math.abs(Number(await circle.getAttribute("cy")) - 28))
    .toBeLessThan(0.1);
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("81");
  await expect(slider).toHaveAttribute("aria-valuetext", "81%");
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("100");
});

test("range steps, disabled state, form submission and reset stay synchronized", async ({
  page,
}) => {
  const stepped = page.getByRole("slider", { name: "Stepped" });
  await expect(stepped).toHaveValue("1");
  await expect(stepped).toHaveAttribute("aria-valuetext", "1");
  await stepped.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(stepped).toHaveValue("0.7");
  await expect(
    page.getByRole("slider", { name: "Disabled level" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Read values" }).click();
  await expect(page.getByRole("status", { name: "Form values" })).toHaveText(
    '{"intensity":"50","stepped":"0.7"}',
  );
  await page.getByRole("button", { name: "Reset values" }).click();
  await expect(stepped).toHaveValue("1");
  await expect(stepped).toHaveAttribute("aria-valuetext", "1");
});

test("reduced motion leaves the elastic track straight and radial actions still usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Image", exact: true }).click();
  await expect(
    page.getByRole("status", { name: "Selected action" }),
  ).toHaveText("image");
  const slider = page.getByRole("slider", { name: "Intensity" });
  await slider.scrollIntoViewIfNeeded();
  const bounds = (await slider.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 28);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.7, bounds.y);
  await expect(slider).toHaveValue("70");
  await expect(slider.locator("..").locator("circle")).toHaveAttribute(
    "cy",
    "28",
  );
  await page.mouse.up();
});

test("mobile touch range aligns with the visible track and search fits a narrow viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/?gestures");
  await page.getByRole("button", { name: "Create", exact: true }).tap();
  await page.getByRole("menuitem", { name: "Image", exact: true }).tap();
  await expect(
    page.getByRole("status", { name: "Selected action" }),
  ).toHaveText("image");
  const slider = page.getByRole("slider", { name: "Intensity" });
  await slider.scrollIntoViewIfNeeded();
  const bounds = (await slider.boundingBox())!;
  await page.touchscreen.tap(
    bounds.x + bounds.width * 0.75,
    bounds.y + bounds.height / 2,
  );
  await expect(slider).toHaveValue("75");
  await page
    .getByRole("search", { name: "Find projects" })
    .getByRole("button")
    .tap();
  await page.getByRole("searchbox").fill("mobile");
  await expect(page.getByRole("searchbox")).toHaveValue("mobile");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
