import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?interactions");
});

test("all 22 additional components render without browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const select = page.getByLabel("Component under test");
  const names = await select.locator("option").allTextContents();
  expect(names).toHaveLength(22);
  for (const name of names) {
    await select.selectOption(name);
    await expect
      .poll(
        () =>
          page.locator("main > div").evaluate((node) => node.childElementCount),
        { message: `${name} mounts a rendered component` },
      )
      .toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test("folder opens and counter crosses a digit boundary", async ({ page }) => {
  const folder = page.getByRole("button", { name: "Files" });
  await folder.click();
  await expect(folder).toHaveAttribute("aria-expanded", "true");
  await page.getByLabel("Component under test").selectOption("AnimatedCounter");
  await page.getByRole("button", { name: "Increment" }).click();
  await expect(page.getByRole("img", { name: "1,000" })).toBeVisible();
});

test("duration clamps inputs, confirms, and OTP normalizes pasted values", async ({
  page,
}) => {
  await page.getByLabel("Component under test").selectOption("DurationPicker");
  await page.getByRole("button", { name: "Edit duration" }).click();
  await expect(page.getByRole("spinbutton", { name: "Hours" })).toBeFocused();
  await page.getByRole("spinbutton", { name: "Hours" }).fill("99");
  await page.getByRole("spinbutton", { name: "Minutes" }).fill("99");
  await page.getByRole("button", { name: "Confirm duration" }).click();
  await expect(page.getByLabel("Callback result")).toHaveText(
    '{"hours":24,"minutes":59}',
  );
  await page.getByLabel("Component under test").selectOption("OtpInput");
  await page.getByLabel("One-time code").fill("123456");
  await expect(page.getByLabel("Callback result")).toHaveText("123456");
  await page
    .getByLabel("One-time code")
    .evaluate((element: HTMLInputElement) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text", "98-76 54");
      element.dispatchEvent(
        new ClipboardEvent("paste", { clipboardData, bubbles: true }),
      );
    });
  await expect(page.getByLabel("One-time code")).toHaveValue("987654");
});

test("delete requires explicit confirmation and task completion reorders the list", async ({
  page,
}) => {
  await page.getByLabel("Component under test").selectOption("DeleteButton");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByLabel("Callback result")).toBeEmpty();
  await page.getByRole("button", { name: "Cancel delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByLabel("Callback result")).toHaveText(
    "Deleted callback",
  );
  await page.getByLabel("Component under test").selectOption("TaskList");
  await page.getByLabel("First task").check();
  await expect(page.locator(".mi-tasks li").last()).toContainText("First task");
  await expect(page.getByLabel("First task")).toBeChecked();
});

test("all navigation variants select a new destination", async ({ page }) => {
  for (const name of [
    "BounceSidebar",
    "HookSidebar",
    "ProximitySidebar",
    "GooeyNav",
  ]) {
    await page.getByLabel("Component under test").selectOption(name);
    const next = page.getByRole("button", { name: "Projects", exact: true });
    await next.click();
    await expect(next).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Overview", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
  }
});

test("FAQ keyboard navigation and reactions are usable without a pointer", async ({
  page,
}) => {
  await page.getByLabel("Component under test").selectOption("Faq");
  await page.getByRole("button", { name: "First question" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("button", { name: "Second question" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Second answer")).toBeVisible();
  await page.getByLabel("Component under test").selectOption("EmojiReaction");
  await page.getByRole("button", { name: "Add reaction" }).click();
  await expect(
    page.getByRole("button", { name: "Love", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Callback result")).toHaveText("👍");
});

test("player completes, voice can seek, and notifications clear", async ({
  page,
}) => {
  await page.getByLabel("Component under test").selectOption("StepPlayer");
  await page.getByRole("button", { name: "Play steps" }).click();
  await expect(
    page.getByRole("button", { name: "Replay steps" }),
  ).toBeVisible();
  await expect(page.getByLabel("Callback result")).toHaveText("Finished");
  await page.getByLabel("Component under test").selectOption("VoiceNote");
  await page.getByRole("button", { name: "Play voice note" }).click();
  await expect(
    page.getByRole("button", { name: "Pause voice note" }),
  ).toBeVisible();
  await page.getByRole("slider", { name: "Seek voice note" }).fill("1.5");
  await expect(page.getByRole("slider")).toHaveValue("1.5");
  await page
    .getByLabel("Component under test")
    .selectOption("NotificationBell");
  await expect(page.getByText("99+")).toBeVisible();
  await page.getByRole("button", { name: "Notifications, 128 unread" }).click();
  await expect(
    page.getByRole("button", { name: "Notifications, 0 unread" }),
  ).toBeVisible();
});

test("activity stack, image resolution, and source disclosure update", async ({
  page,
}) => {
  await page.getByLabel("Component under test").selectOption("GithubActivity");
  await page.getByRole("button", { name: "Top contributions" }).click();
  await expect(page.getByText("project", { exact: true })).toBeVisible();
  await page.getByLabel("Component under test").selectOption("GridReveal");
  await page.getByRole("button", { name: "Resolve image" }).click();
  await expect(page.getByRole("img", { name: "Test image" })).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.getByLabel("Component under test").selectOption("WebSearch");
  await expect(page.getByText("An answer with context.").first()).toBeVisible();
  const toggle = page.getByRole("button", { name: "Searched 1 sources" });
  await toggle.click();
  await expect(page.getByRole("link", { name: /A good source/ })).toHaveCount(
    0,
  );
});

test("gravity supports keyboard drops and respects its body limit", async ({
  page,
}) => {
  await page.getByLabel("Component under test").selectOption("GravityLetters");
  const field = page.getByRole("button", { name: /Drop letters/ });
  await field.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("Enter");
  await expect(page.locator(".mi-gravity-glyph")).toHaveCount(3);
});

test("all additional previews stay within a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const select = page.getByLabel("Component under test");
  for (const name of await select.locator("option").allTextContents()) {
    await select.selectOption(name);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      name,
    ).toBe(true);
  }
});
