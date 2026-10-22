import { test, expect, type Page, type Locator } from "@playwright/test";
async function touchDrag(
  page: Page,
  target: Locator,
  dx: number,
  dy: number,
  cancel = false,
) {
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!,
    cdp = await page.context().newCDPSession(page),
    x = box.x + box.width * 0.55,
    y = box.y + Math.min(box.height / 2, 80);
  const point = (px: number, py: number) => ({
    x: px,
    y: py,
    id: 1,
    radiusX: 2,
    radiusY: 2,
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point(x, y)],
  });
  for (let i = 1; i <= 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [point(x + (dx * i) / 10, y + (dy * i) / 10)],
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: cancel ? "touchCancel" : "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/?mobile");
});
test("mobile demos render without errors and fit 320px", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.reload();
  await expect(
    page
      .getByTestId("selection-bar")
      .getByRole("group", { name: "Selection actions" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("keyboard reveals explicit swipe actions and preserves failure/retry", async ({
  page,
}) => {
  const stage = page.getByTestId("swipe-errors"),
    toggle = stage.getByRole("button", { name: "Actions", exact: true });
  await toggle.focus();
  await page.keyboard.press("Enter");
  const run = stage.getByRole("button", { name: "Run action" });
  await run.click();
  await expect(run).toBeDisabled();
  await expect(stage.getByRole("alert")).toHaveText(
    "Action failed. Try again.",
  );
  await expect(
    stage.getByRole("button", { name: "Unavailable" }),
  ).toBeDisabled();
  await run.click();
  await expect(stage.getByLabel("Action successes")).toHaveText("1");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
test("refresh button rejects, retries, blocks duplicates and respects disabled", async ({
  page,
}) => {
  const stage = page.getByTestId("refresh-errors"),
    button = stage.getByRole("button", { name: "Refresh", exact: true });
  await button.click();
  await expect(button).toBeDisabled();
  await expect(stage.getByRole("status").first()).toHaveText(
    "Could not refresh. Try again.",
  );
  await expect(stage.getByLabel("Refresh attempts")).toHaveText("1");
  await button.click();
  await expect(stage.getByRole("status").first()).toHaveText("Updated");
  await expect(stage.getByLabel("Refresh successes")).toHaveText("1");
  await stage.getByRole("button", { name: "Toggle refresh disabled" }).click();
  await expect(button).toBeDisabled();
});
test("long press menu supports keyboard, disabled actions and failed action retry", async ({
  page,
}) => {
  const stage = page.getByTestId("long-failure"),
    trigger = stage.getByRole("button", { name: "Actions", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Failure menu" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Unavailable" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Try action" }).click();
  await expect(dialog.getByRole("alert")).toHaveText(
    "Action failed. Try again.",
  );
  await dialog.getByRole("button", { name: "Try action" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(stage.getByLabel("Action successes")).toHaveText("1");
  await expect(trigger).toBeFocused();
});
test("selection bar reflects actual selection, clears focus and retries failed bulk work", async ({
  page,
}) => {
  const demo = page.getByTestId("selection-bar");
  await demo.getByText("Weekend plans", { exact: true }).click();
  await expect(demo.getByRole("status")).toHaveText("2 selected");
  await demo.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(demo.getByText("Field notes", { exact: true })).toHaveCount(0);
  await expect(demo.getByText("Weekend plans", { exact: true })).toHaveCount(0);
  await expect(
    demo.getByRole("group", { name: "Selection actions" }),
  ).toHaveCount(0);
  const stage = page.getByTestId("selection-failure"),
    bar = stage.getByRole("group", { name: "Selection actions" });
  await bar.getByRole("button", { name: "Apply selection" }).click();
  await expect(bar.getByRole("alert")).toHaveText("Action failed. Try again.");
  await bar.getByRole("button", { name: "Apply selection" }).click();
  await expect(bar).toHaveCount(0);
  await expect(
    stage.getByRole("button", { name: "Select items" }),
  ).toBeFocused();
  await stage.getByRole("button", { name: "Select items" }).click();
  await stage.getByRole("button", { name: "Clear selection" }).click();
  await expect(
    stage.getByRole("button", { name: "Select items" }),
  ).toBeFocused();
});
test("reduced motion keeps touch actions and sheets functional", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const stage = page.getByTestId("long-press-menu");
  await stage.getByRole("button", { name: "Actions", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Weekend field notes" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Weekend field notes" }),
  ).toHaveCount(0);
  await page
    .getByTestId("swipe-actions")
    .getByRole("button", { name: "Actions", exact: true })
    .click();
  await expect(
    page
      .getByTestId("swipe-actions")
      .getByRole("button", { name: "Archive", exact: true }),
  ).toBeVisible();
});
test.describe("native touch gestures", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  test("swipe in both directions reveals actions without auto-running them", async ({
    page,
  }) => {
    const stage = page.getByTestId("swipe-actions"),
      content = stage.locator(".mingu-swipe-content");
    await touchDrag(page, content, -130, 0);
    await expect(
      stage.getByRole("button", { name: "Archive", exact: true }),
    ).toBeVisible();
    await expect(stage.getByText("Moved to the archive.")).toHaveCount(0);
    await stage.getByRole("button", { name: "Archive", exact: true }).tap();
    await expect(stage.getByText("Moved to the archive.")).toBeVisible();
    await stage.getByRole("button", { name: "Undo archive" }).tap();
    await touchDrag(page, content, 130, 0);
    await stage.getByRole("button", { name: "Pin", exact: true }).tap();
    await expect(
      stage.getByText("Pinned · Field notes", { exact: true }),
    ).toBeVisible();
  });
  test("vertical swipes scroll natively and nested buttons retain clicks", async ({
    page,
  }) => {
    const stage = page.getByTestId("vertical-scroll"),
      scroll = stage.getByRole("region", { name: "Scrollable inbox" });
    await scroll.scrollIntoViewIfNeeded();
    await stage.getByRole("button", { name: "Open message 1" }).tap();
    await expect(stage.getByLabel("Native clicks")).toHaveText("1");
    await touchDrag(page, scroll, 2, -130);
    await expect
      .poll(() => scroll.evaluate((e) => e.scrollTop))
      .toBeGreaterThan(20);
    expect(await stage.locator('[aria-expanded="true"]').count()).toBe(0);
  });
  test("pull refresh runs once only at the top and over the threshold", async ({
    page,
  }) => {
    const stage = page.getByTestId("pull-to-refresh"),
      scroll = stage.getByRole("region", { name: "Your reading list" });
    await touchDrag(page, scroll, 0, 45);
    await expect(stage.getByText(/A new perspective/)).toHaveCount(0);
    await touchDrag(page, scroll, 0, 165);
    await expect(stage.getByText("A new perspective #1")).toBeVisible();
    await scroll.evaluate((e) => {
      e.scrollTop = 100;
    });
    await touchDrag(page, scroll, 0, 165);
    await expect(stage.getByText("A new perspective #2")).toHaveCount(0);
  });
  test("canceled pull and swipe gestures do not activate actions", async ({
    page,
  }) => {
    const stage = page.getByTestId("cancel-refresh");
    await touchDrag(
      page,
      stage.getByRole("region", { name: "Canceled refresh" }),
      0,
      165,
      true,
    );
    await expect(stage.getByLabel("Canceled callback")).toHaveText("false");
    const swipe = page.getByTestId("swipe-actions");
    await touchDrag(page, swipe.locator(".mingu-swipe-content"), -130, 0, true);
    await expect(
      swipe.getByRole("button", { name: "Actions", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
  });
  test("holding opens a sheet while movement cancels and native children remain usable", async ({
    page,
  }) => {
    const stage = page.getByTestId("long-failure"),
      surface = stage.locator(".mingu-long-surface");
    await surface.scrollIntoViewIfNeeded();
    const box = (await surface.boundingBox())!,
      cdp = await page.context().newCDPSession(page),
      point = (x: number) => ({
        x,
        y: box.y + 20,
        id: 1,
        radiusX: 2,
        radiusY: 2,
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [point(box.x + 40)],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [point(box.x + 80)],
    });
    await page.waitForTimeout(450);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(
      page.getByRole("dialog", { name: "Failure menu" }),
    ).toHaveCount(0);
    await stage
      .getByRole("button", { name: "Native child", exact: true })
      .tap();
    await expect(stage.getByLabel("Native clicks")).toHaveText("1");
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [point(box.x + 40)],
    });
    await expect(
      page.getByRole("dialog", { name: "Failure menu" }),
    ).toBeVisible();
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page
      .getByRole("dialog", { name: "Failure menu" })
      .getByRole("button", { name: "Close", exact: true })
      .tap();
    await expect(
      stage.getByRole("button", { name: "Actions", exact: true }),
    ).toBeFocused();
    await cdp.detach();
  });
});

test("pending refresh receives an abort signal when the surface unmounts", async ({
  page,
}) => {
  const stage = page.getByTestId("abort-refresh");
  await stage.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(
    stage.getByRole("button", { name: "Refresh", exact: true }),
  ).toBeDisabled();
  await stage.getByRole("button", { name: "Unmount refresh" }).click();
  await expect(stage.getByLabel("Request aborted")).toHaveText("true");
});
