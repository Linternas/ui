import { test, expect, type Locator } from "@playwright/test";
import { uiCatalog } from "../src/system/ui-catalog";
const controls = [
  ["emoji-reaction", ".mi-reaction-trigger"],
  ["notification-bell", ".mi-notification-icon"],
  ["delete-button", ".mi-delete > button"],
  ["duration-picker", ".mi-duration"],
  ["gooey-nav", ".mi-gooey > button"],
  ["breadcrumbs", ".mingu-breadcrumbs li"],
  ["radio-group", ".mingu-radio-group"],
  ["switch", ".mingu-switch"],
  ["checkbox", ".mingu-checkbox"],
  ["button-group", ".mingu-button-group > button"],
  ["segmented-control", ".mingu-segmented"],
  ["bottom-sheet", ".ui-everyday-stack > .mingu-button"],
  ["pagination", ".mingu-pagination > button"],
  ["navigation", ".mingu-navigation a"],
  ["tabs", ".mingu-tablist > button"],
] as const;
async function expectCentered(items: Locator, frame: Locator, name: string) {
  await expect(items.first(), name).toBeVisible();
  const rects = await items.evaluateAll((nodes) =>
    nodes
      .map((node) => {
        const r = node.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          width: r.width,
          height: r.height,
        };
      })
      .filter((r) => r.width && r.height),
  );
  const bounds = (await frame.boundingBox())!;
  expect(
    Math.abs(
      (Math.min(...rects.map((r) => r.left)) +
        Math.max(...rects.map((r) => r.right))) /
        2 -
        bounds.x -
        bounds.width / 2,
    ),
    name,
  ).toBeLessThanOrEqual(1);
}
for (const width of [1440, 320])
  for (const theme of ["light", "dark"]) {
    test(`all requested controls are centered inside cards and expanded previews at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(
        `/?component-gallery&ids=${controls.map(([id]) => id).join(",")}&theme=${theme}`,
      );
      for (const [id, selector] of controls) {
        const tile = page.locator(`.ui-newest-card[data-preview-id="${id}"]`);
        await tile.scrollIntoViewIfNeeded();
        await expectCentered(
          tile.locator(selector),
          tile.locator(".ui-newest-demo"),
          `${id} card`,
        );
        // Center each segmented control. Checkbox/switch rows share a centered
        // group with one aligned control column, regardless of label length.
        if (["checkbox", "switch"].includes(id)) {
          const lefts = await tile
            .locator(selector)
            .evaluateAll((nodes) =>
              nodes.map((node) => node.getBoundingClientRect().left),
            );
          expect(
            Math.max(...lefts) - Math.min(...lefts),
            id,
          ).toBeLessThanOrEqual(1);
        }
        if (id === "segmented-control")
          for (const item of await tile.locator(selector).all())
            await expectCentered(item, tile.locator(".ui-newest-demo"), id);
        const name = uiCatalog.find((item) => item.id === id)!.name;
        await tile
          .getByRole("button", { name: `${name} 크게 보기`, exact: true })
          .click();
        const dialog = page.getByRole("dialog", { name, exact: true });
        await expectCentered(
          dialog.locator(".ui-preview-centered").locator(selector),
          dialog.locator(".ui-preview-centered"),
          `${id} expanded`,
        );
        expect(
          await dialog.evaluate((el) => el.scrollWidth - el.clientWidth),
          id,
        ).toBeLessThanOrEqual(1);
        await page.keyboard.press("Escape");
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
    });
  }

test("centered launchers and selection controls retain their native interactions", async ({
  page,
}) => {
  await page.goto(
    `/?component-gallery&ids=${controls.map(([id]) => id).join(",")}`,
  );
  const tile = (id: string) =>
    page.locator(`.ui-newest-card[data-preview-id="${id}"]`);
  const bell = tile("notification-bell");
  await bell.scrollIntoViewIfNeeded();
  await bell.getByRole("button", { name: /Notifications,.*unread/ }).click();
  await expect(
    bell.getByRole("button", { name: "Notifications, 0 unread" }),
  ).toBeVisible();
  const checkbox = tile("checkbox");
  await checkbox.scrollIntoViewIfNeeded();
  const unchecked = checkbox.getByRole("checkbox", {
    name: "Unselected",
    exact: true,
  });
  await unchecked.check();
  await expect(unchecked).toBeChecked();
  const tabs = tile("tabs");
  await tabs.scrollIntoViewIfNeeded();
  await tabs.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    tabs.getByRole("tab", { name: "Activity", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  const bottom = tile("bottom-sheet");
  await bottom.scrollIntoViewIfNeeded();
  await bottom.getByRole("button", { name: "Open filters" }).click();
  const sheet = page.getByRole("dialog", {
    name: "Make it yours",
    exact: true,
  });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("checkbox", { name: "Published only" }).check();
  await sheet.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    bottom.getByText("Showing published entries", { exact: true }),
  ).toBeVisible();
});
