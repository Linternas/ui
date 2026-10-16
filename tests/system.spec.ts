import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/?system");
});
test("form names, descriptions, native toggles and busy buttons retain semantics", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Email" });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription("Enter an email");
  await page.getByRole("checkbox", { name: "Accept terms" }).check();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("switch", { name: "Notifications" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("switch")).toBeChecked();
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save" })).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("output")).toHaveText("0");
});
test("tabs use roving focus, skip disabled items and support Home and End", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "General", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Advanced" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveText("Advanced panel");
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "General", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Advanced" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "General", exact: true }),
  ).toBeFocused();
});
test("modal contains focus, closes with Escape and restores the trigger", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Open settings" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription("Manage your account");
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(trigger).toBeFocused();
});
test("nested themes isolate tokens, narrow grids fit, reduced motion stops loading animation", async ({
  page,
}) => {
  const outer = page.locator('[data-mingu-theme="light"]');
  const inner = page.getByTestId("nested-dark");
  expect(
    await outer.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--mingu-bg").trim(),
    ),
  ).toBe("#fdfdfd");
  expect(
    await inner.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--mingu-bg").trim(),
    ),
  ).toBe("#111111");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".mingu-spinner")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
