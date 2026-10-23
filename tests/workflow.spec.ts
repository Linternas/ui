import { test, expect } from "@playwright/test";
import { workflowCatalog } from "../src/collections/workflow.catalog";
import { kineticCatalog } from "../src/collections/kinetic.catalog";
import { uiCatalog, getNewestEntries } from "../src/system/ui-catalog";
import { matchesFilter } from "../src/collections/workflow";
const visit = (id: string) => `/?collection&id=${id}`;
const entries = [...workflowCatalog, ...kineticCatalog];
test("200 real components, 22 unique dated additions with code and expiring New badges", () => {
  const components = uiCatalog.filter(
    (e) => e.kind === "core" || e.kind === "interaction",
  );
  expect(components).toHaveLength(200);
  expect(new Set(uiCatalog.map((e) => e.id)).size).toBe(uiCatalog.length);
  for (const item of entries) {
    expect(components.find((e) => e.id === item.id)?.code).toContain(
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
    matchesFilter(
      { n: 12 },
      {
        mode: "and",
        rules: [{ id: "n", field: "n", operator: "gt", value: "10" }],
      },
    ),
  ).toBe(true);
  expect(
    matchesFilter(
      { n: "oops" },
      {
        mode: "and",
        rules: [{ id: "n", field: "n", operator: "lt", value: "10" }],
      },
    ),
  ).toBe(false);
});
for (const width of [1440, 320])
  for (const theme of ["light", "dark"])
    test(`22 previews fit ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const entry of entries) {
        await page.goto(`${visit(entry.id)}&theme=${theme}`);
        await expect(
          page
            .locator(".mingu-workflow,.mingu-kinetic,.mingu-design-lab")
            .first(),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
          entry.id,
        ).toBeLessThanOrEqual(1);
      }
      expect(errors).toEqual([]);
    });
test("dates validate order, presets and clear; time increments and slider enforces gap", async ({
  page,
}) => {
  await page.goto(visit("date-range-picker"));
  await expect(page.getByRole("status")).toHaveText("7 days selected");
  await page.getByLabel("End date", { exact: true }).fill("2026-10-20");
  await expect(page.getByLabel("End date", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page
    .getByRole("button", { name: "A long weekend", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("3 days selected");
  await page.getByRole("button", { name: "Clear dates" }).click();
  await expect(page.getByLabel("Start date", { exact: true })).toHaveValue("");
  await page.goto(visit("time-picker"));
  await page.getByRole("button", { name: "+ 5 min", exact: true }).click();
  await expect(page.getByLabel("Set Start time", { exact: true })).toHaveValue(
    "09:35",
  );
  await page.goto(visit("range-slider"));
  const low = page.getByRole("slider", { name: "Viewport width minimum" });
  await low.focus();
  await page.keyboard.press("End");
  await expect(low).toHaveValue("800");
  await expect(
    page.getByRole("slider", { name: "Viewport width maximum" }),
  ).toHaveValue("960");
});
test("tree partial parent and disabled leaf, cascader path, mention keyboard and Escape", async ({
  page,
}) => {
  await page.goto(visit("tree-select"));
  const parent = page.getByRole("checkbox", { name: "Design", exact: true });
  expect(await parent.evaluate((e: HTMLInputElement) => e.indeterminate)).toBe(
    true,
  );
  await parent.check();
  await expect(
    page.getByRole("checkbox", { name: "Motion", exact: true }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Expand Engineering", exact: true })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "Legacy", exact: true }),
  ).toBeDisabled();
  const engineering = page.getByRole("checkbox", {
    name: "Engineering",
    exact: true,
  });
  await engineering.check();
  await expect(engineering).toBeChecked();
  await engineering.uncheck();
  await expect(
    page.getByRole("checkbox", { name: "React", exact: true }),
  ).not.toBeChecked();
  await page.getByLabel("Search Choose folders", { exact: true }).fill("zzzz");
  await expect(page.getByText("No matching items")).toBeVisible();
  await page.goto(visit("cascader"));
  await page.getByRole("radio", { name: "Engineering", exact: true }).check();
  await expect(
    page.getByRole("radio", { name: "Color", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("radio", { name: "React", exact: true }).check();
  await expect(
    page.getByRole("radio", { name: "React", exact: true }),
  ).toBeChecked();
  await page.goto(visit("mention-input"));
  const text = page.getByRole("textbox");
  await text.fill("Hello @mi");
  await text.press("ArrowDown");
  await text.press("Enter");
  await expect(text).toHaveValue("Hello @mingu ");
  await text.fill("@a");
  await expect(page.getByRole("listbox")).toBeVisible();
  await text.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});
test("step validation, actual filtered records and table column visibility/order", async ({
  page,
}) => {
  await page.goto(visit("stepper"));
  await expect(
    page.getByRole("button", { name: "Continue →", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Project name", { exact: true }).fill("Fresh idea");
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fresh idea" })).toBeVisible();
  await page.getByRole("button", { name: "← Back", exact: true }).click();
  await expect(page.getByLabel("Project name", { exact: true })).toHaveValue(
    "Fresh idea",
  );
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Fresh idea is ready." }),
  ).toBeVisible();
  await page.goto(visit("filter-builder"));
  await expect(page.getByLabel("Filtered projects")).toContainText(
    "2 projects",
  );
  await page.getByLabel("Value 1", { exact: true }).fill("Draft");
  await expect(page.getByLabel("Filtered projects")).toContainText(
    "1 projects",
  );
  await expect(page.getByLabel("Filtered projects")).toContainText(
    "Quiet notes",
  );
  await page.goto(visit("column-manager"));
  await page.getByRole("checkbox", { name: "Visits", exact: true }).check();
  await page
    .getByRole("button", { name: "Move Visits up", exact: true })
    .click();
  await expect(page.getByRole("columnheader")).toHaveText([
    "Name",
    "Visits",
    "Status",
  ]);
  await expect(page.getByRole("checkbox", { name: /Name/ })).toBeDisabled();
});
test("schedule paints actual stroke and keyboard selection; window retains draft; inbox undo", async ({
  page,
}) => {
  await page.goto(visit("schedule-picker"));
  const from = page.getByRole("gridcell", { name: "Mon 10:00", exact: true }),
    to = page.getByRole("gridcell", { name: "Thu 10:00", exact: true });
  const a = (await from.boundingBox())!,
    b = (await to.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(to).toHaveAttribute("aria-selected", "true");
  await from.focus();
  await page.keyboard.press("ArrowRight");
  const next = page.getByRole("gridcell", { name: "Tue 10:00", exact: true });
  await expect(next).toBeFocused();
  await next.press("End");
  await expect(
    page.getByRole("gridcell", { name: "Thu 12:00", exact: true }),
  ).toBeFocused();
  await next.focus();
  await next.press("Space");
  await expect(next).toHaveAttribute("aria-selected", "false");
  await expect(
    page.getByRole("gridcell", { name: "Fri 12:00", exact: true }),
  ).toBeDisabled();
  await page.goto(visit("draggable-window"));
  await page
    .getByLabel("Quick note", { exact: true })
    .fill("Keep this thought");
  const mover = page.getByRole("button", {
    name: "Move Draft notes",
    exact: true,
  });
  await mover.focus();
  await mover.press("ArrowRight");
  await expect(page.locator(".mingu-floating-pane")).toHaveAttribute(
    "style",
    /10px/,
  );
  await page
    .getByRole("button", { name: "Minimize window", exact: true })
    .click();
  await expect(
    page.getByLabel("Quick note", { exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Restore window", exact: true })
    .click();
  await expect(page.getByLabel("Quick note", { exact: true })).toHaveValue(
    "Keep this thought",
  );
  await page.goto(visit("notification-inbox"));
  await page
    .getByRole("button", { name: "Archive Mina left a thought", exact: true })
    .click();
  await expect(
    page.getByText("Mina left a thought", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Undo/ }).click();
  await expect(
    page.getByText("Mina left a thought", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Mark Mina left a thought as read",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Mark Mina left a thought unread",
      exact: true,
    }),
  ).toBeVisible();
});
test("native submitted values, disabled omission, form reset and blocked first grid focus", async ({
  page,
}) => {
  await page.goto("/?workflow-form");
  await expect(page.locator('[data-slot="tue:9"]')).toHaveAttribute(
    "tabindex",
    "0",
  );
  await page.getByLabel("End date", { exact: true }).fill("2026-10-20");
  expect(
    await page
      .getByLabel("End date", { exact: true })
      .evaluate((e: HTMLInputElement) => e.validity.customError),
  ).toBe(true);
  await page.getByRole("button", { name: "Read form", exact: true }).click();
  await expect(page.getByLabel("Form data")).toHaveText("");
  await page.getByLabel("End date", { exact: true }).fill("2026-10-25");
  await page.getByLabel("Start date", { exact: true }).fill("2026-10-22");
  await page
    .getByRole("button", { name: "+ 5 min", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Read form", exact: true }).click();
  let data = JSON.parse((await page.getByLabel("Form data").textContent())!);
  expect(data).toEqual(
    expect.arrayContaining([
      ["dates.start", "2026-10-22"],
      ["time", "09:35"],
      ["width.min", "20"],
      ["topics", "a"],
      ["path", "root/a"],
      ["message", "Hello"],
      ["slots", "tue:9"],
    ]),
  );
  expect(data.some((v: string[]) => v[0] === "omitted")).toBe(false);
  await page.getByRole("button", { name: "Reset form", exact: true }).click();
  await page.getByRole("button", { name: "Read form", exact: true }).click();
  data = JSON.parse((await page.getByLabel("Form data").textContent())!);
  expect(data).toEqual(
    expect.arrayContaining([
      ["dates.start", "2026-10-23"],
      ["time", "09:30"],
    ]),
  );
});
test("controlled state emits changes without taking ownership", async ({
  page,
}) => {
  await page.goto("/?workflow-form&controlled");
  await page.getByRole("button", { name: "Clear dates" }).click();
  await expect(page.getByLabel("Start date", { exact: true })).toHaveValue(
    "2026-10-23",
  );
  await expect(page.getByLabel("Change request")).toContainText('"start":""');
  await page.getByRole("button", { name: "Show back ↷", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Show back ↷", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Change request")).toHaveText("true");
});
test("22 centered real gallery previews retain Docs links, New badges and deferred mounting", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(
    `/?component-gallery&ids=${entries.map((e) => e.id).join(",")}`,
  );
  expect(
    await page.locator(".ui-newest-demo [data-preview-mounted]").count(),
  ).toBeLessThan(24);
  for (const entry of entries) {
    const card = page.locator(`.ui-newest-card[data-preview-id="${entry.id}"]`);
    await card.scrollIntoViewIfNeeded();
    await expect(
      card.locator(".mingu-workflow,.mingu-kinetic,.mingu-design-lab").first(),
    ).toBeVisible();
    await expect(card.locator(".ui-new-badge")).toHaveText("New");
    await expect(
      card.getByRole("link", { name: `${entry.name} 코드 보기` }),
    ).toHaveAttribute("href", `/docs/${entry.id}`);
    const a = (await card
        .locator(".mingu-workflow-demo,.mingu-lab-demo")
        .first()
        .boundingBox())!,
      b = (await card.locator(".ui-newest-demo").boundingBox())!;
    expect(
      Math.abs(a.x + a.width / 2 - b.x - b.width / 2),
      entry.id,
    ).toBeLessThanOrEqual(1);
  }
});
test("touch schedule taps preserve scrolling and opt-in painting remains explicit", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 850 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(visit("schedule-picker"));
  const cell = page.getByRole("gridcell", { name: "Tue 09:00", exact: true });
  await cell.tap();
  await expect(cell).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("grid")).toHaveCSS("touch-action", "pan-y");
  await page.getByRole("checkbox", { name: "Paint with touch" }).check();
  await expect(page.getByRole("grid")).toHaveCSS("touch-action", "none");
  await context.close();
});
