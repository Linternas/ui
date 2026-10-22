import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/?explorations");
});

test("dock proximity magnifies neighbors and keyboard selection skips disabled actions", async ({
  page,
}) => {
  const home = page.getByRole("button", { name: "Home", exact: true });
  await home.hover();
  await expect
    .poll(() =>
      home.evaluate(
        (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a,
      ),
    )
    .toBeGreaterThan(1.2);
  await home.focus();
  await page.keyboard.press("ArrowRight");
  const projects = page.getByRole("button", { name: "Projects", exact: true });
  await expect(projects).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(projects).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status", { name: "Dock selection" })).toHaveText(
    "projects",
  );
  await page.keyboard.press("End");
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeFocused();
});

test("deck supports actual drag, buttons, bounds and clickable card content", async ({
  page,
}) => {
  await expect(
    page.getByRole("button", { name: "Previous card" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Card action" }).click();
  await expect(page.getByRole("status", { name: "Card clicks" })).toHaveText(
    "1",
  );
  await expect(
    page.getByRole("group", { name: "First project", exact: true }),
  ).toBeVisible();
  const bounds = await page
    .getByRole("group", { name: "First project", exact: true })
    .boundingBox();
  if (!bounds) throw Error("Missing card");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 70);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 - 130, bounds.y + 70, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("group", { name: "Second project", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next card" }).click();
  await expect(
    page.getByRole("group", { name: "Third project", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Next card" })).toBeDisabled();
  await page.getByRole("button", { name: "Previous card" }).click();
  await expect(
    page.getByRole("group", { name: "Second project", exact: true }),
  ).toBeVisible();
});

test("comparison tracks pointer position and retains native range keyboard controls", async ({
  page,
}) => {
  const slider = page.getByRole("slider", { name: "Image comparison" });
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("100");
  const bounds = await slider.boundingBox();
  if (!bounds) throw Error("Missing compare");
  await page.mouse.move(
    bounds.x + bounds.width * 0.25,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  const value = Number(await slider.inputValue());
  expect(value).toBeGreaterThan(68);
  expect(value).toBeLessThan(72);
  await expect(slider).toHaveAttribute("aria-valuetext", /70% Before/);
});

test("command palette filters keywords, skips disabled items and restores focus", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Open commands" });
  await trigger.click();
  const input = page.getByRole("combobox", { name: "Search commands…" });
  await expect(input).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: "Settings", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await input.fill("프로젝트");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status", { name: "Command selection" }),
  ).toHaveText("new");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(input).toHaveValue("");
  await input.fill("nothing matches");
  await expect(
    page.getByRole("status").filter({ hasText: "No commands found" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Commands", exact: true }),
  ).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
});

test("scramble resolves to the original text and reduced motion keeps the final state", async ({
  page,
}) => {
  const visible = page.getByTestId("scramble").locator('[aria-hidden="true"]');
  await page.getByRole("button", { name: "Replay text" }).click();
  await expect(visible).not.toHaveText("BUILD SOMETHING GOOD.");
  await expect(visible).toHaveText("BUILD SOMETHING GOOD.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Replay text" }).click();
  await expect(visible).toHaveText("BUILD SOMETHING GOOD.");
  await page.getByRole("button", { name: "Home", exact: true }).hover();
  await expect
    .poll(() =>
      page
        .getByRole("button", { name: "Home", exact: true })
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .toBe("none");
});

test("new interactions fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open commands" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("touch users can compare images and swipe cards without horizontal page overflow", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4317/?explorations");
    const slider = page.getByRole("slider", { name: "Image comparison" });
    await slider.scrollIntoViewIfNeeded();
    const comparison = await slider.boundingBox();
    if (!comparison) throw Error("Missing comparison");
    await page.touchscreen.tap(
      comparison.x + comparison.width * 0.2,
      comparison.y + comparison.height / 2,
    );
    expect(Number(await slider.inputValue())).toBeGreaterThan(18);
    expect(Number(await slider.inputValue())).toBeLessThan(22);
    const card = page.getByRole("group", {
      name: "First project",
      exact: true,
    });
    await card.scrollIntoViewIfNeeded();
    const bounds = await card.boundingBox();
    if (!bounds) throw Error("Missing touch card");
    const session = await context.newCDPSession(page);
    const x = bounds.x + bounds.width * 0.7,
      y = bounds.y + 60;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y, id: 1 }],
    });
    for (let step = 1; step <= 8; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - step * 16, y, id: 1 }],
      });
      await page.evaluate(() => new Promise(requestAnimationFrame));
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(
      page.getByRole("group", { name: "Second project", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => new Promise(requestAnimationFrame));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});
