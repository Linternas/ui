import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`reaction diffusion retains a spatial pattern after 760 steps in ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/?collection&id=reaction-diffusion&theme=${theme}`);
    const canvas = page.getByRole("img", {
      name: "Reaction diffusion pattern",
    });
    await expect(canvas).toBeVisible();
    // The old full Euler step saturated the field. Merely checking that its
    // pixel hash changes on the first step did not detect this failure.
    for (let i = 0; i < 30; i++)
      await page
        .getByRole("button", { name: "Step pattern", exact: true })
        .click();
    await expect
      .poll(() =>
        canvas.evaluate((node: HTMLCanvasElement) => {
          const pixels = node
            .getContext("2d")!
            .getImageData(0, 0, node.width, node.height).data;
          let min = 255,
            max = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            min = Math.min(min, pixels[i]);
            max = Math.max(max, pixels[i]);
          }
          return max - min;
        }),
      )
      .toBeGreaterThan(80);
    await page
      .getByRole("button", { name: "Reset pattern", exact: true })
      .click();
    await expect(page.getByText("Tap to seed · 0 manual steps")).toBeVisible();
  });
}

for (const width of [320, 1440]) {
  test(`cursor labels and multi-select contents fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?collection&id=collaborative-cursor");
    const labels = page.locator(".mingu-peer > span");
    await expect(labels).toHaveCount(2);
    const positions = await labels.evaluateAll((nodes) =>
      nodes.map((node) => {
        const r = node.getBoundingClientRect();
        const frame = node
          .closest(".mingu-cursor-space")!
          .getBoundingClientRect();
        return {
          width: r.width,
          left: r.left - frame.left,
          right: frame.right - r.right,
          top: r.top - frame.top,
          bottom: frame.bottom - r.bottom,
        };
      }),
    );
    for (const box of positions) {
      expect(box.width).toBeGreaterThan(80);
      expect(
        Math.min(box.left, box.right, box.top, box.bottom),
      ).toBeGreaterThanOrEqual(0);
    }
    // Positioned field decorations must not paint over another peer's name.
    const nameVisibility = await labels.evaluateAll((nodes) =>
      nodes.map((node) => {
        const overlay = node.closest<HTMLElement>(".mingu-cursor-overlay")!;
        const previous = overlay.style.pointerEvents;
        // Hit-testing ignores pointer-events:none. Temporarily enable it to
        // inspect painting order without changing positioning or stacking.
        overlay.style.pointerEvents = "auto";
        try {
          const box = node.getBoundingClientRect();
          return node.contains(
            document.elementFromPoint(box.left + 8, box.top + 8),
          );
        } finally {
          overlay.style.pointerEvents = previous;
        }
      }),
    );
    expect(nameVisibility).toEqual([true, true]);
    await page.goto("/?collection&id=multi-select");
    await page.getByRole("button", { name: /selected · Edit/ }).click();
    const dialog = page.getByRole("dialog", { name: "Project stack" });
    await expect(dialog).toBeVisible();
    expect(
      await dialog.evaluate((el) => el.scrollWidth - el.clientWidth),
    ).toBeLessThanOrEqual(1);
    const input = page.getByRole("searchbox", { name: "Search Project stack" });
    const box = (await input.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(8);
    expect(box.x + box.width).toBeLessThanOrEqual(width - 8);
    await page.getByRole("checkbox", { name: /TypeScript/ }).check();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "3 selected · Edit" }),
    ).toBeFocused();
  });

  test(`duration editing exposes full two-digit values at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?interactions");
    await page
      .getByLabel("Component under test")
      .selectOption("DurationPicker");
    await page.getByRole("button", { name: "Edit duration" }).click();
    const hours = page.getByRole("spinbutton", { name: "Hours" });
    const minutes = page.getByRole("spinbutton", { name: "Minutes" });
    await hours.fill("24");
    await minutes.fill("59");
    for (const input of [hours, minutes]) {
      const metrics = await input.evaluate((node: HTMLInputElement) => {
        const css = getComputedStyle(node),
          ctx = document.createElement("canvas").getContext("2d")!;
        ctx.font = css.font;
        return {
          width:
            node.clientWidth -
            parseFloat(css.paddingLeft) -
            parseFloat(css.paddingRight),
          text: ctx.measureText(node.value).width,
        };
      });
      expect(metrics.width).toBeGreaterThan(metrics.text);
    }
    await page.getByRole("button", { name: "Confirm duration" }).click();
    await expect(page.getByLabel("Callback result")).toHaveText(
      '{"hours":24,"minutes":59}',
    );
  });
}
