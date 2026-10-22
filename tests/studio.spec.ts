import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/?studio");
});
test("AI status keeps icon, first text line and timer aligned in all six states", async ({
  page,
}) => {
  const stage = page.getByTestId("status");
  let left: number | undefined;
  for (const state of [
    "thinking",
    "researching",
    "analyzing",
    "writing",
    "done",
    "error",
  ]) {
    await stage.getByRole("button", { name: state, exact: true }).click();
    await expect(stage.locator(".mi-ai-glyph svg")).toHaveCount(1);
    const geometry = await stage
      .locator(".mi-ai-status")
      .evaluate((element) => {
        const rect = (selector: string) =>
          element.querySelector(selector)!.getBoundingClientRect();
        const icon = rect(".mi-ai-icon"),
          label = rect(".mi-ai-label"),
          timer = rect(".mi-ai-elapsed");
        return {
          left: icon.left,
          width: icon.width,
          height: icon.height,
          iconCenter: icon.top + icon.height / 2,
          labelCenter: label.top + 10,
          timerCenter: timer.top + timer.height / 2,
        };
      });
    expect(geometry.width).toBe(20);
    expect(geometry.height).toBe(20);
    expect(Math.abs(geometry.iconCenter - geometry.labelCenter)).toBeLessThan(
      0.5,
    );
    expect(Math.abs(geometry.iconCenter - geometry.timerCenter)).toBeLessThan(
      0.5,
    );
    if (left !== undefined) expect(geometry.left).toBe(left);
    left = geometry.left;
  }
});
test("long AI labels wrap while the SVG stays aligned to the first line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const stage = page.getByTestId("long-status");
  for (const font of ["system-ui", "serif", '"Segoe UI",sans-serif']) {
    await stage.evaluate((element, font) => {
      (element as HTMLElement).style.fontFamily = font;
    }, font);
    const difference = await stage.evaluate((element) => {
      const icon = element
          .querySelector(".mi-ai-icon")!
          .getBoundingClientRect(),
        label = element.querySelector(".mi-ai-label")!.getBoundingClientRect();
      return {
        difference: icon.top + icon.height / 2 - label.top - 10,
        height: label.height,
      };
    });
    expect(Math.abs(difference.difference)).toBeLessThan(0.5);
    expect(difference.height).toBeGreaterThan(20);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("image lens magnifies actual source dimensions and supports keyboard positioning", async ({
  page,
}) => {
  const stage = page.getByTestId("lens"),
    image = stage.locator(".mingu-lens-image > img");
  await image.hover();
  await expect(stage.locator(".mingu-lens-window")).toHaveCSS("opacity", "1");
  const ratio = await stage.evaluate(
    (element) =>
      element.querySelector(".mingu-lens-window img")!.getBoundingClientRect()
        .width /
      element.querySelector(".mingu-lens-image > img")!.getBoundingClientRect()
        .width,
  );
  expect(ratio).toBeCloseTo(2.5, 1);
  await stage.getByRole("button", { name: "Magnify image" }).click();
  const lens = stage.locator(".mingu-lens-window"),
    before = (await lens.boundingBox())!.x;
  await stage.getByRole("button", { name: "Move lens right" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => (await lens.boundingBox())!.x)
    .toBeGreaterThan(before);
  await page.keyboard.press("Escape");
  await expect(
    stage.getByRole("button", { name: "Magnify image" }),
  ).toBeFocused();
  await expect(
    stage.getByRole("button", { name: "Magnify image" }),
  ).toHaveAttribute("aria-pressed", "false");
});
test("directional card enters from the approached side and retains native link navigation", async ({
  page,
}) => {
  const link = page.getByRole("link", { name: /Explore project/ });
  await link.scrollIntoViewIfNeeded();
  const box = (await link.boundingBox())!;
  await page.mouse.move(box.x - 15, box.y + box.height / 2);
  await page.mouse.move(box.x + 1, box.y + box.height / 2);
  const wash = link.locator(".mingu-directional-wash");
  expect(
    await wash.evaluate(
      (element) => new DOMMatrix(getComputedStyle(element).transform).m41,
    ),
  ).toBeLessThan(0);
  await expect(wash).toHaveCSS("opacity", "1");
  await expect(link.getByText("Always available")).toBeVisible();
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#destination$/);
});
test("ticker moves, pauses on hover and focus, and manual play resumes", async ({
  page,
}) => {
  const stage = page.getByTestId("ticker"),
    track = stage.locator(".mingu-ticker-track");
  await stage.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS("animation-play-state", "running");
  const initial = await track.evaluate(
    (element) => new DOMMatrix(getComputedStyle(element).transform).m41,
  );
  await expect
    .poll(() =>
      track.evaluate(
        (element) => new DOMMatrix(getComputedStyle(element).transform).m41,
      ),
    )
    .toBeLessThan(initial - 3);
  const link = stage.getByRole("link", { name: "React", exact: true });
  await expect(link).toHaveCount(1);
  await link.focus();
  const focusedBox = (await link.boundingBox())!,
    viewport = (await stage.locator(".mingu-ticker-viewport").boundingBox())!;
  expect(focusedBox.x).toBeGreaterThanOrEqual(viewport.x);
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await stage.getByRole("button", { name: "Pause ticker" }).click();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await stage.getByRole("button", { name: "Play ticker" }).click();
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS("animation-play-state", "running");
  await stage.locator(".mingu-ticker-viewport").hover();
  await expect(track).toHaveCSS("animation-play-state", "paused");
});
test("rotating text changes words without changing width and pause/play works", async ({
  page,
}) => {
  await page.clock.install();
  await page.reload();
  const stage = page.getByTestId("rotation");
  await stage.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.clock.runFor(100);
  const width = (await stage.locator(".mingu-rotating").boundingBox())!.width;
  await page.clock.runFor(850);
  await expect(stage.locator(".mingu-rotating-word").last()).toHaveText(
    "clarity.",
  );
  expect(
    (await stage.locator(".mingu-rotating").boundingBox())!.width,
  ).toBeCloseTo(width, 1);
  await stage.getByRole("button", { name: "Pause text rotation" }).click();
  await page.mouse.move(0, 0);
  await page.clock.runFor(1800);
  await expect(stage.locator(".mingu-rotating-word").last()).toHaveText(
    "clarity.",
  );
  await stage.getByRole("button", { name: "Play text rotation" }).click();
  await page.mouse.move(0, 0);
  await page.clock.runFor(850);
  await expect(stage.locator(".mingu-rotating-word").last()).toHaveText(
    "tomorrow.",
  );
});
test("reduced motion shows static content and keeps image controls usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const ticker = page.getByTestId("ticker");
  await expect(ticker.getByRole("button")).toHaveCount(0);
  await expect(ticker.locator(".mingu-ticker-track")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    page.getByTestId("rotation").locator(".mingu-rotating-word"),
  ).toHaveText("people.");
  await expect(page.getByTestId("rotation").getByRole("button")).toHaveCount(0);
  await page
    .getByTestId("lens")
    .getByRole("button", { name: "Magnify image" })
    .click();
  await expect(
    page.getByTestId("lens").locator(".mingu-lens-window"),
  ).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("status").locator(".mi-ai-spinner")).toHaveCSS(
    "animation-name",
    "none",
  );
});
test("touch users can pin and move a lens without overflowing a narrow screen", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/?studio");
  const stage = page.getByTestId("lens");
  await stage.getByRole("button", { name: "Magnify image" }).tap();
  await stage.locator(".mingu-lens-image").scrollIntoViewIfNeeded();
  const box = (await stage.locator(".mingu-lens-image").boundingBox())!,
    lens = stage.locator(".mingu-lens-window"),
    before = (await lens.boundingBox())!.x;
  const cdp = await context.newCDPSession(page);
  const point = (x: number) => ({
    x,
    y: box.y + box.height / 2,
    id: 1,
    radiusX: 2,
    radiusY: 2,
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point(box.x + box.width / 2)],
  });
  for (let i = 1; i <= 6; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [point(box.x + box.width / 2 + i * 10)],
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => (await lens.boundingBox())!.x)
    .toBeGreaterThan(before);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
