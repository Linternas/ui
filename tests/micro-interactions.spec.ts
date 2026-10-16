import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/?micro");
});
test("magnetic, ripple and shine respond without replacing click or keyboard behavior", async ({
  page,
}) => {
  const magnet = page.getByRole("button", { name: "Magnetic", exact: true });
  const box = await magnet.boundingBox();
  if (!box) throw Error("Button absent");
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7);
  expect(
    await magnet.evaluate((el) =>
      el.style.getPropertyValue("--mingu-magnet-x"),
    ),
  ).not.toBe("");
  await magnet.click();
  await expect(page.getByRole("status", { name: "Clicks" })).toHaveText("1");
  await page.mouse.move(1, 1);
  await expect(magnet).toHaveCSS("--mingu-magnet-x", "0px");
  const ripple = page.getByRole("button", { name: "Ripple", exact: true });
  await ripple.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status", { name: "Clicks" })).toHaveText("2");
  await expect(ripple.locator(".mingu-button-ripple")).toHaveCount(1);
  await expect(ripple.locator(".mingu-button-ripple")).toHaveCount(0, {
    timeout: 2000,
  });
  await page
    .getByRole("button", { name: "Prevent ripple" })
    .dispatchEvent("pointerdown", {
      button: 0,
      pointerType: "mouse",
      clientX: 0,
      clientY: 0,
    });
  await expect(page.locator(".mingu-button-ripple")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Disabled motion" }),
  ).toBeDisabled();
});
test("copy completion is real, width stays stable, and failure is announced", async ({
  page,
}) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  const button = page.getByRole("button", { name: "Copy text" });
  const width = (await button.boundingBox())!.width;
  await button.click();
  await expect(page.getByRole("button", { name: /Copied/ })).toContainText(
    "Copied",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "raw clipboard text",
  );
  expect(
    (await page.getByRole("button", { name: /Copied/ }).boundingBox())!.width -
      width,
  ).toBeLessThan(1);
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: () => Promise.reject(new Error("denied")),
    });
  });
  await page.getByRole("button", { name: /Copied/ }).click();
  await expect(page.getByRole("button", { name: /Try again/ })).toContainText(
    "Unable to copy",
  );
});
test("floating field and segmented radio keep accessible names, native values and keyboard selection", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Email address" });
  await expect(input).toHaveAccessibleDescription("Work address");
  await input.fill("mingu@example.com");
  await expect(input).toHaveValue("mingu@example.com");
  await page.getByRole("radio", { name: "Monthly", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "Yearly", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Unavailable", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("status", { name: "Form data" })).toHaveText(
    '{"email":"mingu@example.com","billing":"yearly"}',
  );
  await page.getByRole("tab", { name: "First", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel")).toHaveText("Second panel");
  await expect(page.locator(".mingu-tab-indicator")).toHaveCount(1);
});
test("tilt is bounded, pointer exit resets it, and reduced motion removes movement", async ({
  page,
}) => {
  const card = page.getByTestId("tilt");
  await card.scrollIntoViewIfNeeded();
  const rect = await card.boundingBox();
  if (!rect) throw Error("Card absent");
  await page.mouse.move(rect.x + rect.width * 0.8, rect.y + rect.height * 0.7);
  expect(
    parseFloat(
      await card.evaluate((el) => el.style.getPropertyValue("--mingu-tilt-y")),
    ),
  ).toBeLessThanOrEqual(3.5);
  await page.mouse.move(1, 1);
  await expect(card).toHaveCSS("--mingu-tilt-y", "0deg");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Ripple", exact: true }).click();
  await expect(page.locator(".mingu-button-ripple")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ripple", exact: true }),
  ).toHaveCSS("transform", "none");
  await expect(card).toHaveCSS("transform", "none");
});
