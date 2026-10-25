import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/?controls");
});

test("composed fields retain labels, descriptions, refs and native submitted values", async ({
  page,
}) => {
  await expect(
    page.getByRole("textbox", { name: "Workspace", exact: true }),
  ).toHaveAccessibleDescription("Shared guidance. Lowercase name");
  await expect(
    page.getByRole("textbox", { name: "Description", exact: true }),
  ).toHaveAccessibleDescription("Shared guidance. Optional details");
  await expect(
    page.getByRole("combobox", { name: "Visibility" }),
  ).toHaveAccessibleDescription("Shared guidance. Access level");
  await page.getByRole("button", { name: "Focus input ref" }).click();
  await expect(
    page.getByRole("textbox", { name: "Workspace", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Focus textarea ref" }).click();
  await expect(
    page.getByRole("textbox", { name: "Description", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Focus select ref" }).click();
  await expect(
    page.getByRole("combobox", { name: "Visibility" }),
  ).toBeFocused();
  await page
    .getByRole("textbox", { name: "Workspace", exact: true })
    .fill("studio");
  await page
    .getByRole("combobox", { name: "Visibility" })
    .selectOption("public");
  await page.getByRole("button", { name: "Submit controls" }).click();
  await expect(
    page.getByRole("status", { name: "Submitted values" }),
  ).toHaveText(
    JSON.stringify({
      workspace: "studio",
      description: "A design system",
      visibility: "public",
      locked: "kept",
      password: "secret123",
    }),
  );
  await page.getByRole("textbox", { name: "Workspace", exact: true }).fill("");
  await page.getByRole("button", { name: "Submit controls" }).click();
  await expect(
    page.getByRole("textbox", { name: "Workspace", exact: true }),
  ).toBeFocused();
});

test("errors and read-only state stay perceivable, with a visible ring on the composed input", async ({
  page,
}) => {
  const error = page.getByRole("textbox", { name: "Invalid address" });
  await expect(error).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("textbox", { name: "Invalid notes" }),
  ).toHaveAccessibleDescription("Shared guidance. Write a note");
  await expect(
    page.getByRole("combobox", { name: "Invalid choice" }),
  ).toHaveAccessibleDescription("Choose a value");
  await error.hover();
  await error.focus();
  const shell = error.locator("..");
  expect(await shell.evaluate((el) => getComputedStyle(el).borderColor)).toBe(
    "rgb(180, 35, 50)",
  );
  expect(await shell.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe(
    "solid",
  );
  await expect(
    page.getByRole("textbox", { name: "Read only", exact: true }),
  ).toHaveAttribute("readonly", "");
  await expect(
    page.getByRole("textbox", { name: "Read only", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("textbox", { name: "Disabled", exact: true }),
  ).toBeDisabled();
});

test("password action preserves value, keyboard operation and inherited disabled state", async ({
  page,
}) => {
  const password = page.locator('input[name="password"]');
  const toggle = page
    .getByRole("button", { name: "Show password", exact: true })
    .first();
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("secret123");
  await expect(
    page.getByRole("button", { name: "Hide password" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "password");
  await expect(
    page.getByRole("button", { name: "Show password", exact: true }).nth(1),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Show password", exact: true }).nth(2),
  ).toBeDisabled();
});

test("button, input and select share the size scale and neutral themes remain isolated", async ({
  page,
}) => {
  for (const [size, height] of [
    ["sm", 36],
    ["md", 44],
    ["lg", 48],
  ] as const) {
    const dimensions = await page
      .locator(`[data-testid="sizes"] [data-size="${size}"]`)
      .evaluate((el) =>
        Array.from(
          el.children,
          (child) => child.getBoundingClientRect().height,
        ),
      );
    expect(dimensions).toEqual([height, height, height]);
  }
  const bg = (id: string) =>
    page
      .getByTestId(id)
      .getByRole("button")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await bg("neutral-dark")).toBe("rgb(237, 237, 237)");
  expect(await bg("brand-light")).toBe("rgb(37, 99, 166)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => bg("neutral-system")).toBe("rgb(237, 237, 237)");
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => bg("neutral-system")).toBe("rgb(17, 17, 17)");
});

test("column stacks keep long code inside its scroll area on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  // The size comparison is intentionally three columns; check the reusable Stack itself.
  const bounds = await page
    .getByTestId("long-content-stack")
    .evaluate((el) => ({
      own: el.getBoundingClientRect().width,
      code: el.firstElementChild!.getBoundingClientRect().width,
      scroll: el.querySelector(".mru-code-scroll")!.scrollWidth,
    }));
  expect(bounds.code).toBeLessThanOrEqual(bounds.own);
  expect(bounds.scroll).toBeGreaterThan(bounds.own);
});

test("status buttons preserve semantic backgrounds while hovered", async ({
  page,
}) => {
  const saved = page.getByRole("button", { name: "Saved state" });
  await saved.hover();
  await expect
    .poll(() => saved.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe("rgb(234, 247, 239)");
  const error = page.getByRole("button", { name: "Error state" });
  await error.hover();
  await expect
    .poll(() => error.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe("rgb(255, 240, 241)");
});

test("Select indicators share centered size, token insets and text clearance across fonts and RTL", async ({
  page,
}) => {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const font of ["Arial, sans-serif", "Georgia, serif"]) {
      await page.locator('[data-testid="sizes"]').evaluate((el, font) => {
        (el as HTMLElement).style.fontFamily = font;
      }, font);
      for (const [size, inset] of [
        ["sm", 10],
        ["md", 12],
        ["lg", 16],
      ] as const) {
        const select = page.getByRole("combobox", {
          name: `${size} select`,
          exact: true,
        });
        const css = await select.evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            appearance: s.appearance,
            size: s.backgroundSize,
            x: s.backgroundPositionX,
            y: s.backgroundPositionY,
            padding: s.paddingInlineEnd,
            color: s.color,
            image: s.backgroundImage,
          };
        });
        expect(css.appearance).toBe("none");
        expect(css.size).toBe("8px 8px, 8px 8px");
        expect(css.y).toBe("50%, 50%");
        expect(css.x).toContain(`${inset + 8}px`);
        expect(css.x).toContain(`${inset}px`);
        expect(parseFloat(css.padding)).toBe(inset + 24);
        expect(css.image).toContain(css.color);
        await select.evaluate((el) => (el.dir = "rtl"));
        await expect
          .poll(() =>
            select.evaluate((el) => getComputedStyle(el).backgroundPositionX),
          )
          .toBe(`${inset}px, ${inset + 8}px`);
        await select.evaluate((el) => (el.dir = "ltr"));
      }
    }
  }
  await expect(
    page.getByRole("listbox", { name: "Multi-select list" }),
  ).toHaveCSS("appearance", "auto");
  await expect(
    page.getByRole("listbox", { name: "Multi-select list" }),
  ).toHaveCSS("background-image", "none");
  await expect(page.getByRole("listbox", { name: "Single listbox" })).toHaveCSS(
    "background-image",
    "none",
  );
  await expect(
    page.getByRole("combobox", { name: "Explicit dropdown" }),
  ).toHaveCSS("appearance", "none");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(
    page.getByRole("combobox", { name: "md select", exact: true }),
  ).toHaveCSS("appearance", "auto");
  await expect(
    page.getByRole("combobox", { name: "md select", exact: true }),
  ).toHaveCSS("background-image", "none");
});

test("Select Docs indicators retain color and disabled state in light and dark", async ({
  page,
}) => {
  await page.goto("/docs/select");
  for (const theme of ["light", "dark"]) {
    await page
      .locator("[data-mingu-theme]")
      .first()
      .evaluate(
        (el, theme) => el.setAttribute("data-mingu-theme", theme),
        theme,
      );
    const select = page.getByRole("combobox", {
      name: "Environment (md)",
      exact: true,
    });
    const css = await select.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, image: s.backgroundImage };
    });
    expect(css.image).toContain(css.color);
    const disabled = page.getByRole("combobox", {
      name: "Disabled select",
      exact: true,
    });
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS("opacity", "0.5");
    await expect(disabled).toHaveCSS("appearance", "none");
    await select.selectOption("Preview");
    await expect(select).toHaveValue("Preview");
  }
});
