import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/?expanded");
});
test("controls submit native values, exclude disabled fields and preserve refs", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Focus project" }).click();
  await expect(
    page.getByRole("textbox", { name: "Project", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("radio", { name: "Personal", exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("radio", { name: "Team", exact: true }),
  ).toBeChecked();
  await page.getByRole("slider", { name: "Volume" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("checkbox", { name: "Partial selection" }),
  ).toHaveJSProperty("indeterminate", true);
  await page.getByRole("button", { name: "Submit form" }).click();
  const result = JSON.parse(
    (await page.getByRole("status", { name: "Form result" }).textContent()) ||
      "{}",
  );
  expect(result).toMatchObject({
    project: "Website",
    password: "secret123",
    seats: "3",
    date: "2026-10-16",
    terms: "yes",
    plan: "team",
    notifications: "yes",
    volume: "45",
    framework: "react",
  });
  expect(result).not.toHaveProperty("disabled");
  await page
    .getByLabel("Upload", { exact: true })
    .setInputFiles({
      name: "sample.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("example"),
    });
  expect(
    await page
      .getByLabel("Upload", { exact: true })
      .evaluate((el: HTMLInputElement) => el.files?.[0]?.name),
  ).toBe("sample.txt");
});
test("combobox filters, skips disabled options, selects and escapes without submitting", async ({
  page,
}) => {
  const combo = page.getByRole("combobox", { name: "Framework" });
  await combo.fill("Next");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(
    page.getByRole("option", { name: "Next disabled" }),
  ).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveValue("Next.js");
  await expect(combo).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("status", { name: "Form result" })).toBeEmpty();
  await combo.fill("missing");
  await expect(page.getByRole("listbox")).toContainText("No results");
  await page.keyboard.press("Escape");
  await expect(combo).toHaveValue("Next.js");
});
test("dropdown roves focus, skips disabled, selects and restores trigger", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Project actions" });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Edit", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Delete", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("status", { name: "Menu result" })).toHaveText(
    "Delete",
  );
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("popover, tooltip, drawer and confirmation preserve dismissal and focus behavior", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Display settings" });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Display settings" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  const tooltip = page.getByRole("button", { name: "Tooltip trigger" });
  await tooltip.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await expect(tooltip).toHaveAccessibleDescription("Change project settings");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).not.toBeVisible();
  await page.getByRole("button", { name: "Open drawer" }).click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open drawer" })).toBeFocused();
  await page.getByRole("button", { name: "Open confirmation" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("alertdialog")).not.toBeVisible();
  await expect(page.getByRole("status", { name: "Menu result" })).toHaveText(
    "Confirmed",
  );
});
test("data sort, pagination bounds, disclosure and toast reflect real state", async ({
  page,
}) => {
  const table = page.getByRole("table", { name: "Projects", exact: true });
  await table.getByRole("button", { name: "Count" }).click();
  await expect(table.locator("tbody tr").first()).toContainText("Alpha");
  await expect(
    table.getByRole("columnheader", { name: "Count" }),
  ).toHaveAttribute("aria-sort", "ascending");
  await table.getByRole("button", { name: "Count" }).click();
  await expect(table.locator("tbody tr").first()).toContainText("Beta");
  await expect(
    page.getByRole("table", { name: "Empty records" }),
  ).toContainText("No records");
  await expect(
    page.getByRole("button", { name: "Previous page" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(
    page.getByRole("button", { name: "Page 2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.locator("summary").filter({ hasText: "First question" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByText("First answer", { exact: true })).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: "Disabled question" })
    .click();
  await expect(
    page.getByText("Hidden answer", { exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Upload progress" }),
  ).toHaveAttribute("value", "100");
  await page.getByRole("button", { name: "Show toast" }).click();
  await expect(
    page.getByRole("region", { name: "Notifications" }),
  ).toContainText("Saved");
  await page.getByRole("button", { name: "Dismiss Saved" }).click();
  await expect(
    page.getByRole("region", { name: "Notifications" }),
  ).not.toContainText("Project updated");
});
