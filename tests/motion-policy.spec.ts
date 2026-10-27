import { test, expect, type Page } from "@playwright/test";

const probe = (page: Page, name: string) => page.getByTestId(name);
async function animated(page: Page, name: string, expected: boolean) {
  const skeleton = probe(page, name).locator(".mingu-skeleton");
  await expect
    .poll(() =>
      skeleton.evaluate((el) => getComputedStyle(el).animationName !== "none"),
    )
    .toBe(expected);
}
async function dockScale(page: Page) {
  const button = page.getByRole("button", { name: "One", exact: true });
  await page.mouse.move(0, 0);
  await button.hover();
  return button;
}
for (const os of ["no-preference", "reduce"] as const) {
  test(`provider modes override ${os}, scope CSS, and preserve state without remounting`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: os });
    await page.goto("/?motion-policy");
    await page.getByLabel("Retained draft").fill("Keep my draft");
    await expect(probe(page, "outer-probe")).toContainText(
      `system:${os === "reduce"}`,
    );
    await animated(page, "outer-probe", os !== "reduce");
    await animated(page, "reduced-probe", false);
    await animated(page, "full-in-reduced", true);
    await animated(page, "full-probe", true);
    await animated(page, "system-in-full", os !== "reduce");
    const draft = await page.getByLabel("Retained draft").elementHandle();
    for (const mode of ["full", "reduced", "system"] as const) {
      await page.getByLabel("Motion policy").selectOption(mode);
      const reduced =
        mode === "reduced" || (mode === "system" && os === "reduce");
      await expect(probe(page, "inherited-probe")).toContainText(
        `${mode}:${reduced}`,
      );
      await animated(page, "outer-probe", !reduced);
      await animated(page, "standalone-probe", !reduced);
      await expect(page.getByLabel("Retained draft")).toHaveValue(
        "Keep my draft",
      );
      expect(await draft!.evaluate((el) => el.isConnected)).toBe(true);
      const button = await dockScale(page);
      await expect
        .poll(() =>
          button.evaluate(
            (el) => new DOMMatrix(getComputedStyle(el).transform).a,
          ),
        )
        .toBe(reduced ? 1 : 1.6);
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await page
        .getByRole("button", { name: "Ripple action", exact: true })
        .click();
      if (reduced)
        await expect(page.locator(".mingu-button-ripple")).toHaveCount(0);
      else
        await expect(page.locator(".mingu-button-ripple")).not.toHaveCount(0);
    }
  });
}

test("system policy follows OS changes live, including nested system inside full", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?motion-policy");
  for (const os of ["no-preference", "reduce", "no-preference"] as const) {
    await page.emulateMedia({ reducedMotion: os });
    await expect(probe(page, "outer-probe")).toContainText(
      `system:${os === "reduce"}`,
    );
    await animated(page, "outer-probe", os !== "reduce");
    await animated(page, "system-in-full", os !== "reduce");
    const button = await dockScale(page);
    await expect
      .poll(() =>
        button.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).a,
        ),
      )
      .toBe(os === "reduce" ? 1 : 1.6);
  }
});

async function hash(page: Page) {
  return page
    .getByTestId("canvas")
    .locator("canvas")
    .evaluate((el) => {
      const canvas = el as HTMLCanvasElement,
        p = canvas
          .getContext("2d")!
          .getImageData(0, 0, canvas.width, canvas.height).data;
      let h = 0;
      for (let i = 0; i < p.length; i += 16)
        h = (h * 31 + p[i] + p[i + 1] * 3 + p[i + 2] * 7) | 0;
      return h;
    });
}
test("canvas runs under full despite OS reduction, stops under reduced, and resumes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?motion-policy");
  await page.getByTestId("canvas").scrollIntoViewIfNeeded();
  await page.getByLabel("Motion policy").selectOption("full");
  const first = await hash(page);
  await expect.poll(() => hash(page)).not.toBe(first);
  await page.getByLabel("Motion policy").selectOption("reduced");
  await page.waitForTimeout(150);
  const stopped = await hash(page);
  await page.waitForTimeout(200);
  expect(await hash(page)).toBe(stopped);
  await page.getByLabel("Motion policy").selectOption("full");
  await expect.poll(() => hash(page)).not.toBe(stopped);
});

test("real catalog root allows motion under OS reduction and nested themes inherit full", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?catalog-motion");
  const hero = page.locator(".landing-sculpture");
  await expect(
    hero.getByRole("button", { name: "Pause motion", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".landing-page")).toHaveAttribute(
    "data-mingu-motion",
    "full",
  );
  await page.getByText("Pixels", { exact: true }).click();
  await expect(hero.getByLabel("Globe amount", { exact: true })).toHaveValue(
    "0",
  );
  await page.goto("/docs/focus-dock?catalog-motion");
  const button = page.getByRole("button", { name: "Projects", exact: true });
  await button.hover();
  await expect
    .poll(() =>
      button.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeGreaterThan(1.4);
  await page.goto("/docs/skeleton?catalog-motion");
  expect(
    await page
      .locator(".mingu-skeleton")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).not.toBe("none");
});

test("reorder restores layout motion after starting with reduction without losing items", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?motion-policy");
  await page.getByLabel("Motion policy").selectOption("full");
  const list = page.getByRole("list", { name: "Policy notes", exact: true });
  await list.scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Move Alpha note", exact: true })
    .focus();
  await page.keyboard.press("ArrowDown");
  await expect
    .poll(() =>
      list.locator("li").evaluateAll((rows) =>
        rows.some((el) => {
          const m = new DOMMatrix(getComputedStyle(el).transform);
          return Math.abs(m.m42) > 1;
        }),
      ),
    )
    .toBe(true);
  await expect(list.locator("li")).toHaveText(["Beta note", "Alpha note"]);
  await page.getByLabel("Motion policy").selectOption("reduced");
  await page
    .getByRole("button", { name: "Move Alpha note", exact: true })
    .focus();
  await page.keyboard.press("ArrowUp");
  await expect(list.locator("li")).toHaveText(["Alpha note", "Beta note"]);
});
