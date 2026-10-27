import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/?refinement");
});
test("filter removes outgoing items from flow immediately and finishes its exit promptly", async ({
  page,
}) => {
  const stage = page.getByTestId("animated-filter-bar");
  await stage.getByText("Design · 2", { exact: true }).click();
  await expect(stage.getByRole("status")).toHaveText("2 results");
  const outgoing = stage.locator(
    '.mingu-filter-results > [aria-hidden="true"]',
  );
  // Read transient exit styles atomically; cards may unmount between locator calls.
  const positions = await outgoing.evaluateAll((elements) =>
    elements.map((el) => getComputedStyle(el).position),
  );
  for (const position of positions) expect(position).toBe("absolute");
  await expect(outgoing).toHaveCount(0, { timeout: 500 });
  await stage.getByText("All · 4", { exact: true }).click();
  await stage.getByText("Web · 2", { exact: true }).click();
  await expect(stage.getByRole("listitem")).toHaveCount(2);
  await expect(stage.getByRole("status")).toHaveText("2 results");
});
test("radial SVG icons stay centered across system fonts", async ({ page }) => {
  const stage = page.getByTestId("radial-menu");
  await stage.getByRole("button", { name: "Create something" }).click();
  for (const font of ["system-ui", "serif", '"Segoe UI",sans-serif']) {
    await stage.evaluate((el, font) => {
      (el as HTMLElement).style.fontFamily = font;
    }, font);
    const differences = await stage.locator("button").evaluateAll((buttons) =>
      buttons.map((button) => {
        const icon = button.querySelector("svg")!,
          a = button.getBoundingClientRect(),
          b = icon.getBoundingClientRect();
        return {
          x: a.x + a.width / 2 - b.x - b.width / 2,
          y: a.y + a.height / 2 - b.y - b.height / 2,
        };
      }),
    );
    for (const d of differences) {
      expect(Math.abs(d.x)).toBeLessThan(0.6);
      expect(Math.abs(d.y)).toBeLessThan(0.6);
    }
  }
});
test("expandable card saves, closes, restores focus and reopens quickly", async ({
  page,
}) => {
  const trigger = page.getByTestId("expandable-card").getByRole("button");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Field notes" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Save to collection" }).click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Saved to your preview collection.",
  );
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("dock magnification reserves space and arrow keys preserve selection", async ({
  page,
}) => {
  const stage = page.getByTestId("focus-dock"),
    button = stage.getByRole("button", { name: "Projects", exact: true });
  await button.hover();
  await expect
    .poll(() =>
      button.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeGreaterThan(1.2);
  await expect
    .poll(async () => {
      const boxes = await stage
        .locator(".mingu-dock-item")
        .evaluateAll((buttons) =>
          buttons.map((el) => el.getBoundingClientRect().toJSON()),
        );
      return Math.min(
        ...boxes.slice(1).map((box, i) => box.left - boxes[i].right),
      );
    })
    .toBeGreaterThanOrEqual(0);
  await button.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(
    stage.getByRole("button", { name: "Activity", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    stage.getByText("Activity", { exact: true }).last(),
  ).toBeVisible();
});
test("short sheet fits content, handle taps preserve size and manual snaps still work", async ({
  page,
}) => {
  await page
    .getByTestId("bottom-sheet")
    .getByRole("button", { name: "Open filters" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Make it yours" }),
    handle = dialog.getByRole("slider", { name: "Sheet height" });
  await expect
    .poll(() =>
      dialog.evaluate((el) => {
        const done = Array.from(el.querySelectorAll("button")).find(
          (b) => b.textContent === "Done",
        )!;
        return (
          el.getBoundingClientRect().bottom -
          done.getBoundingClientRect().bottom
        );
      }),
    )
    .toBeLessThan(40);
  const before = (await dialog.boundingBox())!.height;
  await handle.click();
  await expect(dialog).toBeVisible();
  await expect
    .poll(async () => (await dialog.boundingBox())!.height)
    .toBeCloseTo(before, 0);
  await handle.focus();
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "92");
  await page.keyboard.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "40");
});
test("auto-fit sheet responds to changing content without a resize loop", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open dynamic sheet" }).click();
  const dialog = page.getByRole("dialog", { name: "Adaptive sheet" });
  const before = (await dialog.boundingBox())!.height;
  await dialog.getByRole("button", { name: "Toggle details" }).click();
  await expect
    .poll(async () => (await dialog.boundingBox())!.height)
    .toBeGreaterThan(before + 200);
  await dialog.getByRole("button", { name: "Toggle details" }).click();
  await expect
    .poll(async () => (await dialog.boundingBox())!.height)
    .toBeCloseTo(before, 0);
});
test("deck uses available width, separates illustration and copy, and never layers two live cards", async ({
  page,
}) => {
  const stage = page.getByTestId("swipe-deck"),
    deck = stage.locator(".mingu-deck");
  await expect
    .poll(async () => (await deck.boundingBox())!.width)
    .toBeGreaterThan(350);
  const spacing = await stage.evaluate((el) => {
    const illustration = el
        .querySelector(".ui-deck-orbit")!
        .getBoundingClientRect(),
      copy = el.querySelector("h3")!.getBoundingClientRect();
    return copy.top - illustration.bottom;
  });
  expect(spacing).toBeGreaterThanOrEqual(0);
  for (let i = 0; i < 5; i++) {
    await stage.getByRole("button", { name: "Next card" }).click();
    expect(await stage.locator(".mingu-deck-card").count()).toBeLessThanOrEqual(
      1,
    );
  }
  await expect(stage.getByRole("status")).toHaveText("3 / 3");
  await expect(
    stage.getByRole("group", { name: "Find your flow", exact: true }),
  ).toBeVisible();
});
test("cached grid image returns after repeated generation and quick restarts", async ({
  page,
}) => {
  const stage = page.getByTestId("grid-reveal"),
    image = stage.getByRole("img");
  await expect(image).toHaveAttribute("data-ready", "true");
  for (let i = 0; i < 3; i++) {
    await stage.getByRole("button", { name: "Generate again" }).click();
    if (i === 1)
      await stage.getByRole("button", { name: "Generate again" }).click();
    await expect(stage.locator("figure")).toHaveAttribute("aria-busy", "true");
    await expect(image).toHaveAttribute("data-ready", "true");
    await expect(image).toHaveCSS("opacity", "1");
    expect(
      await image.evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
      ),
    ).toBe(true);
  }
});
test("progress animates actual values and supports start, pause, reset and indeterminate", async ({
  page,
}) => {
  const stage = page.getByTestId("progress"),
    bar = stage.getByRole("progressbar", { name: "Preview task" });
  await stage.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(async () => Number(await bar.getAttribute("value")))
    .toBeGreaterThan(45);
  await stage.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(stage.locator(".ui-progress-heading [role=status]")).toHaveText(
    "Paused",
  );
  await stage.getByRole("slider", { name: "Progress value" }).fill("82");
  await expect(bar).toHaveAttribute("value", "82");
  await expect
    .poll(() =>
      stage
        .locator(".mingu-progress-track")
        .first()
        .evaluate(
          (el) =>
            el.querySelector(".mingu-progress-fill")!.getBoundingClientRect()
              .width / el.getBoundingClientRect().width,
        ),
    )
    .toBeCloseTo(0.82, 2);
  await stage.getByText("Indeterminate", { exact: true }).click();
  await expect(bar).not.toHaveAttribute("value");
  await expect(stage.locator(".mingu-progress-fill")).toHaveCSS(
    "animation-name",
    "mingu-progress-travel",
  );
  await stage.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(bar).toHaveAttribute("value", "0");
  await expect(
    stage.getByRole("progressbar", { name: "Native progress" }),
  ).toHaveAttribute("value", "25");
});
test("320px reduced motion keeps cards, dock and progress operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const dock = page.getByTestId("focus-dock");
  await dock.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    dock.getByRole("button", { name: "Settings", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const deck = page.getByTestId("swipe-deck");
  await deck.getByRole("button", { name: "Next card" }).click();
  await expect(
    deck.getByRole("group", { name: "Room to think", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId("progress").locator(".mingu-progress-fill"),
  ).toHaveCSS("transition-duration", "0s");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("larger docks wrap at native button sizes without overflowing mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const dock = page.getByRole("toolbar", { name: "Many actions" });
  await dock.getByRole("button", { name: "Action 7", exact: true }).hover();
  const geometry = await dock
    .locator("button")
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getBoundingClientRect().toJSON()),
    );
  expect(new Set(geometry.map((r) => r.top)).size).toBeGreaterThan(1);
  expect(
    geometry.every((r) => r.width >= 44 && r.left >= 0 && r.right <= 320),
  ).toBe(true);
});
