import { test, expect } from "@playwright/test";
const visit = (id: string) => `/?collection=navigation&id=${id}`;

test("shared page transitions change content and restore the originating card focus", async ({
  page,
}) => {
  await page.goto(visit("page-transition"));
  const project = page.getByRole("button", { name: /A study in form/ });
  await project.click();
  await expect(
    page.getByRole("heading", { name: "A study in form" }),
  ).toBeFocused();
  await expect(
    page.getByText("Begin with a single circle.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All projects" }).click();
  await expect(project).toBeFocused();
  await page.evaluate(() =>
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.getByRole("button", { name: /Room to think/ }).click();
  await expect(
    page.getByRole("heading", { name: "Room to think" }),
  ).toBeFocused();
});

test("status island keeps actual task progress while collapsed and allows cancel and restart", async ({
  page,
}) => {
  await page.goto(visit("dynamic-status-island"));
  const trigger = page.locator(".mingu-collection-island-trigger");
  await trigger.click();
  await page.getByRole("button", { name: "Prepare collection" }).click();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect
    .poll(() => page.getByRole("progressbar").getAttribute("value"))
    .not.toBe("0");
  await trigger.click();
  await expect(page.getByRole("button", { name: "Cancel task" })).toBeHidden();
  await trigger.click();
  await page.getByRole("button", { name: "Cancel task" }).click();
  await expect(trigger).toContainText("Preparation interrupted");
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(trigger).toContainText("Preparing your collection");
  await expect(trigger).toContainText("Collection is ready", { timeout: 5000 });
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "100");
});

test("mega menu supports keyboard, real links, disabled groups, escape and outside dismissal", async ({
  page,
}) => {
  await page.goto(visit("animated-mega-menu"));
  const build = page.getByRole("button", { name: "Build" });
  await expect(
    page.getByRole("button", { name: "Coming soon" }),
  ).toBeDisabled();
  await build.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Learn" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("link", { name: /Design tokens/ })).toBeFocused();
  await expect(
    page.getByRole("link", { name: /Design tokens/ }),
  ).toHaveAttribute("href", "/foundations");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Learn" })).toBeFocused();
  await expect(page.getByRole("link", { name: /Design tokens/ })).toBeHidden();
  await build.click();
  await expect(page.getByRole("link", { name: /Playground/ })).toBeVisible();
  await page.getByRole("heading", { name: /Less searching/ }).click();
  await expect(build).toHaveAttribute("aria-expanded", "false");
});

test("sortable grid performs two-dimensional keyboard moves and commits pointer drop only on release", async ({
  page,
}) => {
  await page.setViewportSize({ width: 600, height: 900 });
  await page.goto(visit("sortable-grid"));
  const order = page.getByTestId("grid-order"),
    grip = page.getByRole("button", { name: "Move Notes" });
  const columns = await page
    .locator("[data-sort-grid-item]")
    .evaluateAll((items) => {
      const top = items[0].getBoundingClientRect().top;
      return items.filter(
        (i) => Math.abs(i.getBoundingClientRect().top - top) < 3,
      ).length;
    });
  await grip.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await expect
    .poll(async () => (await order.innerText()).split(" → ").indexOf("notes"))
    .toBe(columns);
  await expect(grip).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(grip).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Reset arrangement" }).click();
  const from = await grip.boundingBox(),
    target = await page.locator('[data-sort-grid-item="photos"]').boundingBox();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    target!.x + target!.width / 2,
    target!.y + target!.height / 2,
    { steps: 8 },
  );
  await expect(order).toHaveText(
    "notes → photos → music → ideas → links → tasks",
  );
  await page.mouse.up();
  await expect(order).toHaveText(
    "photos → notes → music → ideas → links → tasks",
  );
  await expect(page.getByRole("status")).toContainText(
    "Notes moved to position 2",
  );
});

test("card navigation exposes actual destinations and escape restores the toggle", async ({
  page,
}) => {
  await page.goto(visit("card-navigation"));
  const trigger = page.getByRole("button", { name: "Explore" });
  await expect(page.getByRole("link", { name: "Playground" })).toBeHidden();
  await trigger.click();
  const destination = page.getByRole("link", { name: /Playground/ });
  await expect(destination).toHaveAttribute("href", "/playground");
  await destination.focus();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(destination).toBeHidden();
});

test("scroll stack uses the nearest scrolling viewport without preventing its native scroll", async ({
  page,
}) => {
  await page.goto(visit("scroll-stack"));
  const scroller = page.getByTestId("navigation-scroll");
  await scroller.evaluate((el) => (el.scrollTop = 160));
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBe(160);
  const position = await scroller.evaluate((el) => {
    const card = el.querySelector(".mingu-collection-stack-card")!;
    return {
      delta: card.getBoundingClientRect().top - el.getBoundingClientRect().top,
      mode: getComputedStyle(card).position,
    };
  });
  expect(position.mode).toBe("sticky");
  expect(position.delta).toBeGreaterThanOrEqual(15);
  expect(position.delta).toBeLessThan(40);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    scroller.locator(".mingu-collection-stack-card").first(),
  ).toHaveCSS("position", "static");
});

test("sticky story changes its real preview on scroll and exposes each preview on mobile", async ({
  page,
}) => {
  await page.goto(visit("sticky-scroll-story"));
  const scroller = page.getByTestId("navigation-scroll");
  await expect(
    page.locator(".mingu-collection-story-mobile-preview"),
  ).toHaveCount(0);
  await expect(page.locator(".mingu-collection-story-preview")).toHaveCount(1);
  await expect(
    page.getByRole("complementary", { name: "Find the shape preview" }),
  ).toBeVisible();
  await scroller.evaluate((el) => (el.scrollTop = 370));
  await expect(
    page.getByRole("complementary", { name: "Give it space preview" }),
  ).toBeVisible();
  await scroller.evaluate((el) => (el.scrollTop = 0));
  await page.getByRole("button", { name: "Show Find the shape" }).click();
  await expect(
    page.getByRole("complementary", { name: "Find the shape preview" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 700, height: 844 });
  await expect(page.locator(".mingu-collection-story-preview")).toHaveCount(0);
  await expect(
    page.locator(".mingu-collection-story-mobile-preview"),
  ).toHaveCount(3);
  for (const preview of await page
    .locator(".mingu-collection-story-mobile-preview")
    .all())
    await expect(preview).toBeVisible();
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(
    page.locator(".mingu-collection-story-mobile-preview"),
  ).toHaveCount(0);
  await expect(page.locator(".mingu-collection-story-preview")).toHaveCount(1);
});

test("footer reveal exposes its native link at the end of nested scrolling", async ({
  page,
}) => {
  await page.goto(visit("footer-reveal"));
  const scroller = page.getByTestId("navigation-scroll");
  await scroller.evaluate((el) => (el.scrollTop = el.scrollHeight));
  const link = page.getByRole("link", { name: "Explore the playground" });
  await expect(link).toHaveAttribute("href", "/playground");
  const box = await link.boundingBox(),
    viewport = await scroller.boundingBox();
  expect(box!.y).toBeGreaterThan(viewport!.y);
  expect(box!.y + box!.height).toBeLessThan(viewport!.y + viewport!.height);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".mingu-collection-reveal-footer")).toHaveCSS(
    "position",
    "static",
  );
});

test("scroll expanding media changes real scale and reduced motion shows the final frame", async ({
  page,
}) => {
  await page.goto(visit("scroll-expand-media"));
  const scroller = page.getByTestId("navigation-scroll"),
    frame = page.locator(".mingu-collection-expand-frame");
  const scale = () =>
    frame.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  await expect.poll(scale).toBeLessThan(0.99);
  const before = await scale();
  await scroller.evaluate((el) => (el.scrollTop = 300));
  await expect.poll(scale).toBeGreaterThan(before + 0.05);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await scroller.evaluate((el) => (el.scrollTop = 0));
  await expect.poll(scale).toBe(1);
});

test("coverflow respects boundaries and supports native keyboard selection and swipes", async ({
  page,
}) => {
  await page.goto(visit("coverflow-carousel"));
  const previous = page.getByRole("button", { name: "Previous slide" }),
    next = page.getByRole("button", { name: "Next slide" }),
    stage = page.getByLabel("Gallery. Use left and right arrows to navigate.");
  await expect(previous).toBeDisabled();
  await stage.focus();
  await page.keyboard.press("End");
  await expect(next).toBeDisabled();
  await expect(page.getByRole("group", { name: /3 of 3/ })).toBeVisible();
  await page.keyboard.press("Home");
  const box = await stage.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.8, box!.y + 100);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + 105, { steps: 8 });
  await page.mouse.up();
  await expect(
    page.getByRole("group", { name: /2 of 3: Room to think/ }),
  ).toBeVisible();
  await expect(
    page.locator(".mingu-collection-coverflow-card[inert]"),
  ).toHaveCount(2);
  await page.keyboard.press("ArrowLeft");
  await expect(previous).toBeDisabled();
});

test("coverflow preserves native slide buttons, text selection keys and links", async ({
  page,
}) => {
  await page.goto(visit("coverflow-carousel"));
  const save = page.getByRole("button", {
    name: "Save A study in form",
    exact: true,
  });
  const previous = page.getByRole("button", { name: "Previous slide" });
  await save.click();
  await expect(save).toHaveText("Save study · 1");
  const note = page.getByRole("textbox", {
    name: "Note for A study in form",
    exact: true,
  });
  await note.fill("Stay curious");
  await note.press("Home");
  await expect
    .poll(() => note.evaluate((el) => (el as HTMLInputElement).selectionStart))
    .toBe(0);
  await note.press("ArrowRight");
  await expect
    .poll(() => note.evaluate((el) => (el as HTMLInputElement).selectionStart))
    .toBe(1);
  await note.press("End");
  await expect
    .poll(() => note.evaluate((el) => (el as HTMLInputElement).selectionStart))
    .toBe(12);
  await expect(previous).toBeDisabled();
  await save.focus();
  await save.press("ArrowRight");
  await expect(previous).toBeDisabled();
  const link = page.getByRole("link", { name: "View study", exact: false });
  await link.click();
  await expect.poll(() => new URL(page.url()).hash).toBe("#study-form");
  await expect(previous).toBeDisabled();
});

test("keyboard focus reveals footer links above the covering content", async ({
  page,
}) => {
  await page.goto(visit("footer-reveal"));
  const scroller = page.getByTestId("navigation-scroll");
  await scroller.evaluate((el) => {
    el.scrollTop = 0;
  });
  const link = page.getByRole("link", { name: "Explore the playground" });
  await link.focus();
  await expect(link).toBeFocused();
  await expect(page.locator(".mingu-collection-reveal-footer")).toHaveCSS(
    "position",
    "relative",
  );
  await expect
    .poll(() =>
      link.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          document
            .elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
            ?.closest("a") === el
        );
      }),
    )
    .toBe(true);
  const box = await link.boundingBox(),
    viewport = await scroller.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(viewport!.y);
  expect(box!.y + box!.height).toBeLessThanOrEqual(
    viewport!.y + viewport!.height,
  );
});
