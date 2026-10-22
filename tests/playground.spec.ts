import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/?playground");
});
test("gallery expands on hover and keyboard skips disabled panels", async ({
  page,
}) => {
  const gallery = page.getByRole("group", { name: "Views", exact: true }),
    day = gallery.getByRole("button", { name: "Day" }),
    night = gallery.getByRole("button", { name: "Night" });
  await expect(day).toHaveAttribute("aria-pressed", "true");
  await night.hover();
  await expect(night).toHaveAttribute("aria-pressed", "true");
  await day.focus();
  await page.keyboard.press("ArrowRight");
  await expect(night).toBeFocused();
  await expect(night).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Home");
  await expect(day).toBeFocused();
  await expect(
    gallery.getByRole("button", { name: "Unavailable" }),
  ).toBeDisabled();
  const sizes = await gallery
    .locator("button")
    .evaluateAll((buttons) =>
      buttons.map((b) => b.getBoundingClientRect().width),
    );
  await expect
    .poll(async () => (await day.boundingBox())!.width)
    .toBeGreaterThan(sizes[1] * 2);
  await expect(
    page.getByRole("group", { name: "Empty gallery" }).getByRole("button"),
  ).toHaveCount(0);
});
test("scroll reveal follows nested scrolling while preserving a single accessible copy", async ({
  page,
}) => {
  const stage = page.getByTestId("reveal"),
    scroll = stage.getByRole("region"),
    word = stage
      .locator('.mingu-text-reveal [aria-hidden="true"] > span')
      .nth(12);
  await expect(word).toHaveCSS("opacity", "0.55");
  const before = Number(
    await word.evaluate((e) => getComputedStyle(e).opacity),
  );
  await scroll.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  await expect
    .poll(async () =>
      Number(await word.evaluate((e) => getComputedStyle(e).opacity)),
    )
    .toBeGreaterThan(before);
  await expect(stage.locator(".mingu-visually-hidden")).toHaveText(
    /Less noise. More meaning./,
  );
});
test("cursor trail is bounded, expires, pauses and clears on pointer exit", async ({
  page,
}) => {
  const stage = page.getByTestId("trail"),
    root = stage.locator(".mingu-cursor-trail");
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-active", "true");
  const box = (await root.boundingBox())!;
  for (let i = 0; i < 18; i++)
    await page.mouse.move(
      box.x + 30 + (i % 7) * 70,
      box.y + 80 + Math.floor(i / 7) * 40,
    );
  await expect(root.locator(".mingu-cursor-stamps img")).not.toHaveCount(0);
  expect(
    await root.locator(".mingu-cursor-stamps img").count(),
  ).toBeLessThanOrEqual(8);
  await expect(root.locator(".mingu-cursor-stamps img")).toHaveCount(0);
  await stage.getByRole("button", { name: "Pause trail" }).click();
  await expect(root).not.toHaveAttribute("data-active");
  await page.mouse.move(box.x + 50, box.y + 100);
  await page.mouse.move(box.x + 150, box.y + 100);
  await expect(root.locator(".mingu-cursor-stamps img")).toHaveCount(0);
  await stage.getByRole("button", { name: "Enable trail" }).click();
  await page.mouse.move(box.x + 200, box.y + 100);
  await expect(root.locator(".mingu-cursor-stamps img")).not.toHaveCount(0);
  await page.mouse.move(0, 0);
  await expect(root.locator(".mingu-cursor-stamps img")).toHaveCount(0);
});
test("avatar profiles open with keyboard, restore focus and retain native links", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "View Min" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Min" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Thoughtful interfaces")).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "View profile" }),
  ).toHaveAttribute("href", "#profile");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(
    page.getByRole("button", { name: "View Unavailable" }),
  ).toBeDisabled();
});
test("short click offers confirmation, rejects safely and allows keyboard retry", async ({
  page,
}) => {
  const stage = page.getByTestId("hold"),
    trigger = stage.getByRole("button", { name: "Hold to save" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(stage.getByLabel("Attempts")).toHaveText("0");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(stage.locator(".mingu-hold [role=status]")).toHaveText(
    "Something went wrong. Try again.",
  );
  await expect(stage.getByLabel("Attempts")).toHaveText("1");
  await trigger.focus();
  await page.keyboard.press("Space");
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(stage.getByLabel("Completed")).toHaveText("1");
  await expect(stage.getByLabel("Attempts")).toHaveText("2");
});
test("holding confirms once, pointer cancellation and disabled prevent execution", async ({
  page,
}) => {
  const stage = page.getByTestId("hold"),
    trigger = stage.getByRole("button", { name: "Hold to save" });
  await trigger.hover();
  await page.mouse.down();
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect(stage.getByLabel("Attempts")).toHaveText("0");
  await trigger.hover();
  await page.mouse.down();
  await expect(stage.getByLabel("Attempts")).toHaveText("1");
  await page.mouse.up();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(stage.locator(".mingu-hold [role=status]")).toHaveText(
    /Something went wrong/,
  );
  await stage.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(trigger).toBeDisabled();
  await expect(stage.getByLabel("Attempts")).toHaveText("1");
});
test("numeric scrubbing respects step, bounds, editing, form values and reset", async ({
  page,
}) => {
  const stage = page.getByTestId("numbers"),
    input = stage.getByRole("spinbutton", { name: "Amount" }),
    handle = stage.getByRole("button", { name: "Drag to adjust: Amount" });
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 32, box.y + box.height / 2, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(input).toHaveValue("4.5");
  await handle.focus();
  await page.keyboard.press("End");
  await expect(input).toHaveValue("10");
  await page.keyboard.press("ArrowRight");
  await expect(input).toHaveValue("10");
  await page.keyboard.press("Home");
  await expect(input).toHaveValue("0");
  await page.keyboard.press("Shift+ArrowRight");
  await expect(input).toHaveValue("5");
  await input.fill("3.2");
  await stage.getByRole("button", { name: "Submit" }).click();
  await expect(input).toHaveValue("3");
  await expect(stage.getByLabel("Submitted")).toHaveText("3");
  await stage.getByRole("button", { name: "Set controlled" }).click();
  await stage.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(input).toHaveValue("2.5");
  await expect(
    stage.getByRole("spinbutton", { name: "Controlled", exact: true }),
  ).toHaveValue("7");
  await expect(
    stage.getByRole("button", { name: "Drag to adjust: Disabled" }),
  ).toBeDisabled();
});
test("reduced motion keeps reveal opaque, trails static and controls usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByTestId("trail").getByRole("button")).toHaveCount(0);
  await expect(
    page.getByTestId("trail").locator(".mingu-cursor-samples img"),
  ).toHaveCount(3);
  await expect(
    page
      .getByTestId("reveal")
      .locator('.mingu-text-reveal [aria-hidden="true"] > span')
      .first(),
  ).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "Night", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Night", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("touch can select galleries, open profiles, confirm and scrub at 320px", async ({
  browser,
}) => {
  const context = await browser.newContext({
      viewport: { width: 320, height: 740 },
      hasTouch: true,
      isMobile: true,
    }),
    page = await context.newPage();
  await page.goto("/?playground");
  await page.getByRole("button", { name: "Night", exact: true }).tap();
  await expect(
    page.getByRole("button", { name: "Night", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "View Min" }).tap();
  await expect(page.getByRole("dialog", { name: "Min" })).toBeVisible();
  await page.getByRole("button", { name: "Close profile" }).tap();
  await page.getByRole("button", { name: "Hold to save" }).tap();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).tap();
  const handle = page.getByRole("button", { name: "Drag to adjust: Amount" });
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!,
    cdp = await context.newCDPSession(page);
  const point = (x: number) => ({
    x,
    y: box.y + box.height / 2,
    id: 1,
    radiusX: 2,
    radiusY: 2,
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point(box.x + 22)],
  });
  for (let i = 1; i <= 4; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [point(box.x + 22 + i * 8)],
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.getByRole("spinbutton", { name: "Amount" })).toHaveValue(
    "4.5",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
