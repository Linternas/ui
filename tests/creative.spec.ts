import { test, expect } from "@playwright/test";
import { creativeCatalog } from "../src/collections/creative.catalog";
import { getNewestEntries, uiCatalog } from "../src/system/ui-catalog";
import { gradientCss } from "../src/collections/creative";
const visit = (id: string) => `/?collection&id=${id}`;

test("all new catalog entries have live code, release dates and New badges without duplicate IDs", () => {
  for (const item of creativeCatalog) {
    expect(uiCatalog.filter((e) => e.id === item.id)).toHaveLength(1);
    expect(uiCatalog.find((e) => e.id === item.id)!.code).toContain(
      item.component,
    );
    expect(
      getNewestEntries(uiCatalog, Date.parse("2026-10-23T12:00:00Z")).some(
        (e) => e.id === item.id,
      ),
    ).toBe(true);
    expect(
      getNewestEntries(uiCatalog, Date.parse("2026-11-22T00:00:00Z")).some(
        (e) => e.id === item.id,
      ),
    ).toBe(false);
  }
  expect(
    gradientCss({
      angle: 90,
      stops: [
        { id: "unsafe", color: "url(javascript:alert(1))", position: 500 },
        { id: "a", color: "#aabbcc", position: 0 },
      ],
    }),
  ).toBe("linear-gradient(90deg, #aabbcc 0%, #777777 100%)");
});

for (const width of [1440, 320])
  for (const theme of ["light", "dark"])
    test(`eight new previews fit ${width}px in ${theme} without browser errors`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const entry of creativeCatalog) {
        await page.goto(`${visit(entry.id)}&theme=${theme}`);
        await expect(page.locator(".mingu-creative").first()).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
          entry.id,
        ).toBeLessThanOrEqual(1);
      }
      expect(errors).toEqual([]);
    });

test("gradient stop edits update actual preview CSS, drag and copied output", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(visit("gradient-editor"));
  await page.getByLabel("Stop color", { exact: true }).fill("#ff8844");
  await expect(
    page.getByRole("img", { name: "Gradient preview" }),
  ).toHaveAttribute("style", /rgb\(255, 136, 68\)|#ff8844/);
  const track = page.locator(".mingu-gradient-track"),
    r = (await track.boundingBox())!;
  const handle = page.getByRole("button", {
    name: "Select color stop 1",
    exact: true,
  });
  const h = (await handle.boundingBox())!;
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width * 0.25, r.y + r.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(
    page.getByRole("slider", { name: "Stop position", exact: true }),
  ).toHaveValue("25");
  await page.getByRole("button", { name: "+ Add stop", exact: true }).click();
  await expect(page.getByText("4 color stops")).toBeVisible();
  await page.getByRole("button", { name: "Remove stop", exact: true }).click();
  await expect(page.getByText("3 color stops")).toBeVisible();
  await page
    .getByRole("slider", { name: "Gradient angle", exact: true })
    .fill("180");
  await page.getByRole("button", { name: "Copy CSS", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("linear-gradient(180deg");
  expect(copied).toContain("#ff8844 25%");
});

test("pixel editor paints an actual stroke, moves by keyboard, erases and exports SVG", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(visit("pixel-editor"));
  const cell = page.getByRole("gridcell", { name: "Pixel 1, 1", exact: true }),
    last = page.getByRole("gridcell", { name: "Pixel 1, 5", exact: true });
  const a = (await cell.boundingBox())!,
    b = (await last.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(last).toHaveAttribute("aria-selected", "true");
  await cell.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("gridcell", { name: "Pixel 2, 1", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("gridcell", { name: "Pixel 2, 1", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Copy SVG", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    '<rect x="4" y="0"',
  );
  await page.getByRole("button", { name: "Eraser", exact: true }).click();
  await last.click();
  await expect(last).toHaveAttribute("aria-selected", "false");
  await page.getByRole("button", { name: "Clear pixels", exact: true }).click();
  await expect(
    page.locator('[role="gridcell"][aria-selected="true"]'),
  ).toHaveCount(0);
});

test("scratch strokes reveal real content and keyboard fallback resets the cover", async ({
  page,
}) => {
  await page.goto(visit("scratch-card"));
  const cover = page.locator(".mingu-scratch-cover"),
    prize = page.locator(".mingu-scratch-prize");
  await expect(prize).toHaveAttribute("inert", "");
  const box = (await cover.boundingBox())!;
  await page.mouse.move(box.x + 8, box.y + 8);
  await page.mouse.down();
  for (let y = 0; y < 6; y++) {
    if ((await cover.count()) === 0) break;
    const from = y % 2 ? box.x + box.width - 8 : box.x + 8,
      to = y % 2 ? box.x + 8 : box.x + box.width - 8;
    await page.mouse.move(from, box.y + 10 + (y * box.height) / 7);
    await page.mouse.move(to, box.y + 10 + (y * box.height) / 7, { steps: 18 });
  }
  await page.mouse.up();
  await expect(cover).toHaveCount(0);
  await expect(prize).toHaveAttribute("aria-hidden", "false");
  await page.getByRole("button", { name: "Cover again", exact: true }).click();
  await expect(cover).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("0% uncovered");
  await page.getByRole("button", { name: "Reveal card", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(cover).toHaveCount(0);
});

test("history changes restore actual preview content and a new edit discards the future branch", async ({
  page,
}) => {
  await page.goto(visit("undo-history"));
  await expect(
    page.getByRole("heading", { name: "Good things take shape" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Room to think" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Make a change", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Room to think" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Redo", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: /Find the words/ }),
  ).toHaveCount(0);
});

test("multi select searches, enforces a limit, keeps disabled choices and restores focus", async ({
  page,
}) => {
  await page.goto(visit("multi-select"));
  const trigger = page.getByRole("button", { name: "2 selected · Edit" });
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "Project stack",
    exact: true,
  });
  await expect(panel.getByRole("searchbox")).toBeFocused();
  await panel.getByRole("checkbox", { name: /CSS/ }).check();
  await expect(
    panel.getByRole("checkbox", { name: /TypeScript/ }),
  ).toBeDisabled();
  await expect(
    panel.getByRole("checkbox", { name: "Legacy adapter" }),
  ).toBeDisabled();
  await panel.getByRole("searchbox").fill("zzzz");
  await expect(panel.getByText("No matching options.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "3 selected · Edit" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Remove Motion", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "2 selected · Edit" }),
  ).toBeVisible();
});

test("transfer moves checked items in both directions while locked membership stays untouched", async ({
  page,
}) => {
  await page.goto(visit("transfer-list"));
  const available = page.getByRole("region", { name: "Available items" }),
    assigned = page.getByRole("region", { name: "Assigned items" });
  await available.getByRole("checkbox", { name: "Jun", exact: true }).check();
  await page.getByRole("button", { name: "Assign", exact: true }).click();
  await expect(
    assigned.getByRole("checkbox", { name: "Jun" }),
  ).not.toBeChecked();
  await assigned.getByRole("checkbox", { name: "Jun" }).check();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(available.getByRole("checkbox", { name: "Jun" })).toBeVisible();
  await expect(
    assigned.getByRole("checkbox", { name: "Owner" }),
  ).toBeDisabled();
});

test("rating hover is only a preview and native keyboard selection updates the value", async ({
  page,
}) => {
  await page.goto(visit("rating"));
  await page.getByRole("radio", { name: "5 stars", exact: true }).hover();
  await expect(page.locator(".mingu-rating-stars [data-filled]")).toHaveCount(
    5,
  );
  await expect(
    page.getByRole("radio", { name: "3 stars", exact: true }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "3 stars", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("radio", { name: "2 stars", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Clear rating" }).click();
  await expect(page.locator(".mingu-rating input:checked")).toHaveCount(0);
});

test("dial pointer, keyboard bounds and step buttons all update the same value", async ({
  page,
}) => {
  await page.goto(visit("circular-dial"));
  const dial = page.getByRole("slider", { name: "Intensity" });
  await dial.focus();
  await page.keyboard.press("End");
  await expect(dial).toHaveAttribute("aria-valuenow", "100");
  await expect(
    page.getByRole("button", { name: "Increase Intensity" }),
  ).toBeDisabled();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await expect(dial).toHaveAttribute("aria-valuenow", "5");
  const r = (await dial.boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + 8);
  await page.mouse.down();
  await page.mouse.up();
  await expect(dial).toHaveAttribute("aria-valuenow", "50");
});

test("native form data and resets include every selected value, rating and dial", async ({
  page,
}) => {
  await page.goto("/?creative-form");
  await page.getByRole("button", { name: "1 selected · Edit" }).click();
  const panel = page.getByRole("dialog", { name: "Stack", exact: true });
  await panel.getByRole("checkbox", { name: "Motion", exact: true }).check();
  await page.keyboard.press("Escape");
  await page.getByRole("radio", { name: "4 stars", exact: true }).check();
  await page.getByRole("button", { name: "Increase Dial" }).click();
  await page.getByRole("button", { name: "Read form" }).click();
  const entries = JSON.parse(
    (await page.getByLabel("Form data").textContent()) ?? "[]",
  );
  expect(entries).toEqual(
    expect.arrayContaining([
      ["stack", "react"],
      ["stack", "motion"],
      ["members", "css"],
      ["rating", "4"],
      ["dial", "35"],
    ]),
  );
  await page.getByRole("button", { name: "Reset form" }).click();
  await page.getByRole("button", { name: "Read form" }).click();
  expect(
    JSON.parse((await page.getByLabel("Form data").textContent()) ?? "[]"),
  ).toEqual([
    ["stack", "react"],
    ["members", "css"],
    ["rating", "2"],
    ["dial", "30"],
  ]);
});

test("controlled ownership remains with the consumer for selection, dial, pixels and gradient", async ({
  page,
}) => {
  await page.goto("/?creative-form&controlled");
  await page.getByRole("button", { name: "Increase Fixed dial" }).click();
  await expect(
    page.getByRole("slider", { name: "Fixed dial" }),
  ).toHaveAttribute("aria-valuenow", "40");
  await expect(page.getByLabel("Change request")).toHaveText("45");
  await page.getByRole("gridcell", { name: "Pixel 1, 1", exact: true }).click();
  await expect(
    page.getByRole("gridcell", { name: "Pixel 1, 1", exact: true }),
  ).toHaveAttribute("aria-selected", "false");
  await page
    .getByRole("slider", { name: "Gradient angle", exact: true })
    .fill("180");
  await expect(
    page.getByRole("slider", { name: "Gradient angle", exact: true }),
  ).toHaveValue("90");
});

test("all eight ship as centered live gallery tiles with Docs links and New badges", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(
    `/?component-gallery&ids=${creativeCatalog.map((e) => e.id).join(",")}`,
  );
  for (const entry of creativeCatalog) {
    const card = page.locator(`.ui-newest-card[data-preview-id="${entry.id}"]`);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".mingu-creative").first()).toBeVisible();
    await expect(card.locator(".ui-new-badge")).toHaveText("New");
    await expect(
      card.getByRole("link", { name: `${entry.name} 코드 보기` }),
    ).toHaveAttribute("href", `/docs/${entry.id}`);
    const a = (await card.locator(".mingu-creative-demo").boundingBox())!,
      b = (await card.locator(".ui-newest-demo").boundingBox())!;
    expect(
      Math.abs(a.x + a.width / 2 - b.x - b.width / 2),
      entry.id,
    ).toBeLessThanOrEqual(1);
    if (entry.id === "transfer-list" || entry.id === "undo-history") {
      const action = card.getByRole("button", {
        name: entry.id === "transfer-list" ? "Assign" : "Make a change",
        exact: true,
      });
      const actionBox = (await action.boundingBox())!;
      expect(
        actionBox.y + actionBox.height,
        `${entry.id} primary action stays in the tile`,
      ).toBeLessThanOrEqual(b.y + b.height - 8);
    }
    await card.getByRole("button", { name: `${entry.name} 크게 보기` }).click();
    await expect(
      page
        .getByRole("dialog", { name: entry.name, exact: true })
        .locator(".mingu-creative")
        .first(),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

test("native touch preserves tap painting and opt-in dial and scratch gestures", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 850 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(visit("pixel-editor"));
  const pixel = page.getByRole("gridcell", { name: "Pixel 1, 1", exact: true });
  await pixel.tap();
  await expect(pixel).toHaveAttribute("aria-selected", "true");
  await page.goto(visit("circular-dial"));
  const dial = page.getByRole("slider", { name: "Intensity" }),
    box = (await dial.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + 8);
  await expect(dial).toHaveAttribute("aria-valuenow", "40");
  await page.getByRole("checkbox", { name: "Turn with touch" }).check();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + 8);
  await expect(dial).toHaveAttribute("aria-valuenow", "50");
  await page.goto(visit("scratch-card"));
  const cover = page.locator(".mingu-scratch-cover"),
    r = (await cover.boundingBox())!;
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
  await expect(cover.locator("mask circle")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Scratch with touch" }).check();
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
  await expect(cover.locator("mask circle")).toHaveCount(1);
  await context.close();
});
