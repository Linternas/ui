import { test, expect, type Locator } from "@playwright/test";
const ids = [
  "hook-sidebar",
  "fluid-orb",
  "matrix-orb",
  "animated-counter",
  "folder",
  "skeleton",
  "avatar",
  "badge",
  "spinner",
  "tag-input",
  "prompt-composer",
  "sidebar",
  "step-player",
  "voice-note",
  "otp-input",
  "swipe-deck",
];
const card = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`.ui-newest-card[data-preview-id="${id}"]`);
async function centerOffset(item: Locator, stage: Locator) {
  const [a, b] = await Promise.all([item.boundingBox(), stage.boundingBox()]);
  return Math.abs(a!.x + a!.width / 2 - b!.x - b!.width / 2);
}
for (const width of [1440, 320]) {
  for (const theme of ["light", "dark"]) {
    test(`intrinsic previews stay centered and skeleton stays visible at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(
        `/?component-gallery&ids=${ids.join(",")}&theme=${theme}`,
      );
      for (const [id, selector] of [
        ["hook-sidebar", ".mi-sidebar"],
        ["fluid-orb", ".mi-fluid-orb"],
        ["matrix-orb", ".mi-matrix-orb"],
        ["animated-counter", ".mi-counter"],
        ["folder", ".mi-folder"],
        ["badge", ".mingu-stack"],
        ["spinner", ".mingu-stack"],
        ["sidebar", ".mingu-sidebar"],
        ["step-player", ".mi-player"],
        ["voice-note", ".mi-voice"],
        ["otp-input", ".mi-otp"],
        ["swipe-deck", ".ui-deck-demo"],
      ]) {
        const tile = card(page, id),
          item = tile.locator(selector).first();
        await tile.scrollIntoViewIfNeeded();
        await expect(item).toBeVisible();
        expect(
          await centerOffset(item, tile.locator(".ui-newest-demo")),
          id,
        ).toBeLessThanOrEqual(1);
      }
      const avatar = card(page, "avatar");
      await avatar.scrollIntoViewIfNeeded();
      await expect(avatar.locator(".mingu-avatar")).toHaveCount(4);
      const avatars = await avatar
        .locator(".mingu-avatar")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const b = node.getBoundingClientRect();
            return { left: b.left, right: b.right };
          }),
        );
      const stage = (await avatar.locator(".ui-newest-demo").boundingBox())!;
      expect(
        Math.abs(
          (Math.min(...avatars.map((a) => a.left)) +
            Math.max(...avatars.map((a) => a.right))) /
            2 -
            stage.x -
            stage.width / 2,
        ),
      ).toBeLessThanOrEqual(1);
      const skeleton = card(page, "skeleton");
      await skeleton.scrollIntoViewIfNeeded();
      const colors = await skeleton.evaluate((node) => ({
        fill: getComputedStyle(node.querySelector(".mingu-skeleton")!)
          .backgroundColor,
        background: getComputedStyle(node.querySelector(".ui-newest-demo")!)
          .backgroundColor,
      }));
      const rgb = (s: string) => s.match(/\d+/g)!.slice(0, 3).map(Number);
      expect(
        rgb(colors.fill).reduce(
          (sum, c, i) => sum + Math.abs(c - rgb(colors.background)[i]),
          0,
        ) / 3,
      ).toBeGreaterThan(20);
      for (const id of ["tag-input", "prompt-composer"]) {
        const tile = card(page, id);
        await tile.scrollIntoViewIfNeeded();
        await expect(tile.locator('[data-preview-ready="true"]')).toBeVisible();
        const bounds = (await tile
          .locator(".ui-gallery-demo-content > *")
          .first()
          .boundingBox())!;
        expect(bounds.width).toBeGreaterThan(
          (await tile.boundingBox())!.width * 0.8,
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
    });
  }
}

test("Hook sidebar keeps its arrow in the selected row through pointer and keyboard changes", async ({
  page,
}) => {
  await page.goto("/?component-gallery&ids=hook-sidebar");
  const sidebar = page.getByRole("navigation", {
    name: "Navigation",
    exact: true,
  });
  for (const name of ["Projects", "Activity", "Settings"]) {
    const button = sidebar.getByRole("button", { name: new RegExp(name) });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const svg = button.locator(".mi-sidebar-hook svg");
    await expect(svg).toHaveCount(1);
    await expect
      .poll(async () => (await svg.boundingBox())!.width)
      .toBeGreaterThanOrEqual(20);
    const [arrow, row] = await Promise.all([
      svg.boundingBox(),
      button.boundingBox(),
    ]);
    expect(arrow!.width).toBeLessThanOrEqual(22);
    expect(arrow!.height).toBeCloseTo(40, 0);
    expect(row!.width).toBeGreaterThan(200);
    expect(row!.height).toBeLessThan(60);
    const labelLines = await button
      .locator(":scope > span:last-child")
      .evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getClientRects().length;
      });
    expect(labelLines).toBe(1);
    expect(arrow!.x).toBeGreaterThanOrEqual(row!.x);
    expect(arrow!.y).toBeGreaterThanOrEqual(row!.y);
    expect(arrow!.y + arrow!.height).toBeLessThanOrEqual(
      row!.y + row!.height + 1,
    );
  }
  await sidebar.getByRole("button", { name: /Overview/ }).focus();
  await page.keyboard.press("Enter");
  await expect(
    sidebar.getByRole("button", { name: /Overview/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("expanded previews use the same centering as gallery cards", async ({
  page,
}) => {
  await page.goto("/?component-gallery&ids=folder,avatar");
  for (const [name, selector] of [
    ["Folder", ".mi-folder"],
    ["Avatar", ".mingu-stack"],
  ]) {
    await page
      .getByRole("button", { name: `${name} 크게 보기`, exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name, exact: true });
    await expect(dialog).toBeVisible();
    expect(
      await centerOffset(
        dialog.locator(selector).first(),
        dialog.locator(".ui-newest-expanded-preview"),
      ),
    ).toBeLessThanOrEqual(1);
    await page.keyboard.press("Escape");
  }
});
