import { test, expect } from "@playwright/test";

test("cloth supports actual drag, arrow-key pull, tears, anchor changes and reset", async ({
  page,
}) => {
  await page.goto("/?experimental");
  const scene = page.getByTestId("cloth");
  await scene.scrollIntoViewIfNeeded();
  await scene.getByRole("button", { name: "Pause cloth" }).click();
  const grip = scene.getByRole("button", { name: "Pull fabric" });
  await grip.focus();
  const before = (await grip.boundingBox())!;
  await grip.press("ArrowRight");
  await expect
    .poll(async () => (await grip.boundingBox())!.x)
    .toBeGreaterThan(before.x + 5);
  const box = (await grip.boundingBox())!;
  await page.mouse.move(box.x + 22, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(box.x + 95, box.y + 52, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await grip.boundingBox())!.x)
    .toBeGreaterThan(box.x + 50);
  await scene.getByRole("button", { name: "Cut a slit" }).click();
  await expect
    .poll(async () =>
      Number(await scene.getByLabel("Torn threads").textContent()),
    )
    .toBeGreaterThan(0);
  await scene.getByRole("button", { name: "Release anchors" }).click();
  await expect(
    scene.getByRole("button", { name: "Restore anchors" }),
  ).toBeVisible();
  await scene.getByRole("button", { name: "Restore anchors" }).click();
  await expect(scene.locator("p[role=status]")).toContainText("0 threads cut");
  await scene.getByRole("button", { name: "Tear mode" }).click();
  await expect(
    scene.getByRole("button", { name: "Tear mode" }),
  ).toHaveAttribute("aria-pressed", "true");
  await scene.getByRole("button", { name: "Reset cloth" }).click();
  await expect(scene.locator("p[role=status]")).toContainText(
    "Fabric restored",
  );
});

test("fluid pour, capacity, drain and reset change the actual particle model", async ({
  page,
}) => {
  await page.goto("/?experimental");
  const scene = page.getByTestId("fluid");
  await scene.scrollIntoViewIfNeeded();
  await scene.getByRole("button", { name: "Pause fluid" }).click();
  await scene.getByRole("button", { name: "Pour", exact: true }).click();
  await expect(scene.getByLabel("Fluid count")).toHaveText("212");
  for (let i = 0; i < 9; i++)
    await scene.getByRole("button", { name: "Pour", exact: true }).click();
  await expect(scene.getByLabel("Fluid count")).toHaveText("420");
  const pixels = () =>
    scene.locator("canvas").evaluate((c) => {
      const a = (c as HTMLCanvasElement)
        .getContext("2d")!
        .getImageData(
          0,
          0,
          (c as HTMLCanvasElement).width,
          (c as HTMLCanvasElement).height,
        ).data;
      let count = 0;
      for (let i = 3; i < a.length; i += 4) if (a[i]) count++;
      return count;
    });
  await expect.poll(pixels).toBeGreaterThan(500);
  await scene.getByLabel("Fluid appearance").selectOption("particles");
  await scene.getByRole("button", { name: "Drain", exact: true }).click();
  await expect(scene.getByLabel("Fluid count")).toHaveText("0");
  await expect(
    scene.getByText("An empty vessel. Pour something in."),
  ).toBeVisible();
  await expect(scene.getByRole("button", { name: "Spin left" })).toBeDisabled();
  await scene.getByRole("button", { name: "Reset fluid" }).click();
  await expect(scene.getByLabel("Fluid count")).toHaveText("180");
  await scene.getByRole("button", { name: "Resume fluid" }).click();
  await scene.getByRole("button", { name: "Spin right" }).click();
  await expect(scene.locator("p[role=status]")).toContainText("clockwise");
});

test("orbit handles move by keyboard and drag, presets and reverse change real controls", async ({
  page,
}) => {
  await page.goto("/?experimental");
  const scene = page.getByTestId("orbit");
  await scene.scrollIntoViewIfNeeded();
  await scene.getByRole("button", { name: "Pause orbits" }).click();
  const center = scene.getByRole("button", { name: "Move orbit center" });
  await center.focus();
  const before = (await center.boundingBox())!;
  await center.press("Shift+ArrowLeft");
  await expect
    .poll(async () => (await center.boundingBox())!.x)
    .toBeLessThan(before.x - 20);
  const handle = scene.getByRole("button", {
      name: "Adjust orbit 1",
      exact: true,
    }),
    box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + 22, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(box.x + 47, box.y + 42, { steps: 6 });
  await page.mouse.up();
  await expect
    .poll(async () => (await handle.boundingBox())!.x)
    .toBeGreaterThan(box.x + 15);
  await scene.getByLabel("Orbit preset", { exact: true }).selectOption("petal");
  await expect(scene.getByLabel("Selected orbit preset")).toHaveText("petal");
  await expect(
    scene.getByRole("slider", { name: "Orbit 2 speed" }),
  ).toHaveValue("-3");
  await scene.getByRole("button", { name: "Reverse", exact: true }).click();
  await expect(
    scene.getByRole("slider", { name: "Orbit 2 speed" }),
  ).toHaveValue("3");
  await scene.getByRole("button", { name: "Hide trail" }).click();
  await expect(
    scene.getByRole("button", { name: "Show trail" }),
  ).toHaveAttribute("aria-pressed", "false");
  await scene.getByRole("button", { name: "Reset orbits" }).click();
  await expect(scene.getByLabel("Orbit preset", { exact: true })).toHaveValue(
    "loom",
  );
  await expect(
    scene.getByRole("slider", { name: "Orbit 2 speed" }),
  ).toHaveValue("-2.1");
});

test("focused orbit handles freeze movement and tabbing away resumes it", async ({
  page,
}) => {
  await page.goto("/?experimental");
  const scene = page.getByTestId("orbit");
  await scene.scrollIntoViewIfNeeded();
  const handle = scene.getByRole("button", {
    name: "Adjust orbit 1",
    exact: true,
  });
  await handle.focus();
  await expect(scene.locator("p[role=status]")).toContainText(
    "handle is focused",
  );
  await expect(async () => {
    const position = await handle.getAttribute("style");
    await page.waitForTimeout(100);
    expect(await handle.getAttribute("style")).toBe(position);
  }).toPass({ timeout: 2000 });
  await scene.getByLabel("Orbit preset", { exact: true }).focus();
  const start = await handle.getAttribute("style");
  await expect.poll(() => handle.getAttribute("style")).not.toBe(start);
});

test("reduced motion keeps manual edits usable without continuous physics", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?experimental");
  const cloth = page.getByTestId("cloth");
  await cloth.scrollIntoViewIfNeeded();
  await expect(
    cloth.getByRole("button", { name: "Gust", exact: true }),
  ).toBeDisabled();
  await cloth.getByRole("button", { name: "Cut a slit" }).click();
  await expect
    .poll(async () =>
      Number(await cloth.getByLabel("Torn threads").textContent()),
    )
    .toBeGreaterThan(0);
  const fluid = page.getByTestId("fluid");
  await fluid.scrollIntoViewIfNeeded();
  await expect(fluid.getByRole("button", { name: "Spin left" })).toBeDisabled();
  await fluid.getByRole("button", { name: "Pour", exact: true }).click();
  await expect(fluid.getByLabel("Fluid count")).toHaveText("212");
  const orbit = page.getByTestId("orbit");
  await orbit.scrollIntoViewIfNeeded();
  await expect(
    orbit.getByRole("button", { name: "Pause orbits" }),
  ).toBeDisabled();
  await orbit
    .getByLabel("Orbit preset", { exact: true })
    .selectOption("satellite");
  await expect(orbit.getByLabel("Selected orbit preset")).toHaveText(
    "satellite",
  );
  const grip = orbit.getByRole("button", { name: "Move orbit center" });
  await grip.focus();
  const x = (await grip.boundingBox())!.x;
  await grip.press("ArrowRight");
  await expect
    .poll(async () => (await grip.boundingBox())!.x)
    .toBeGreaterThan(x);
});

test("native mobile touch drags cloth and orbit handles while surfaces preserve scroll by default", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage(),
    session = await context.newCDPSession(page);
  await page.goto("/?experimental");
  const drag = async (x: number, y: number, dx: number, dy: number) => {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y, id: 1 }],
    });
    for (let n = 1; n <= 6; n++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x + (dx * n) / 6, y: y + (dy * n) / 6, id: 1 }],
      });
      await page.evaluate(() => new Promise(requestAnimationFrame));
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  };
  const cloth = page.getByTestId("cloth");
  await cloth.scrollIntoViewIfNeeded();
  await cloth.getByRole("button", { name: "Pause cloth" }).tap();
  await expect(cloth.locator(".mingu-simulation-surface")).toHaveCSS(
    "touch-action",
    "pan-y pinch-zoom",
  );
  const grip = cloth.getByRole("button", { name: "Pull fabric" }),
    box = (await grip.boundingBox())!,
    scroll = await page.evaluate(() => scrollY);
  await drag(box.x + 22, box.y + 22, 40, 20);
  await expect
    .poll(async () => (await grip.boundingBox())!.x)
    .toBeGreaterThan(box.x + 25);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  const orbit = page.getByTestId("orbit");
  await orbit.scrollIntoViewIfNeeded();
  const center = orbit.getByRole("button", { name: "Move orbit center" }),
    start = (await center.boundingBox())!;
  await drag(start.x + 22, start.y + 22, -35, 10);
  await expect
    .poll(async () => (await center.boundingBox())!.x)
    .toBeLessThan(start.x - 25);
  const fluid = page.getByTestId("fluid");
  await fluid.scrollIntoViewIfNeeded();
  await expect(fluid.locator(".mingu-simulation-surface")).toHaveCSS(
    "touch-action",
    "pan-y pinch-zoom",
  );
  await fluid.getByRole("button", { name: "Touch interaction" }).tap();
  await expect(fluid.locator(".mingu-simulation-surface")).toHaveCSS(
    "touch-action",
    "none",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("offscreen controls initialize their models and static orbit drawing works", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?experimental");
  const fluid = page.getByTestId("fluid");
  await fluid
    .getByRole("button", { name: "Pour", exact: true })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect(fluid.getByLabel("Fluid count")).toHaveText("212");
  await fluid.scrollIntoViewIfNeeded();
  await expect(fluid.locator("p[role=status]")).toContainText("212 / 420");
  const cloth = page.getByTestId("cloth");
  await cloth
    .getByRole("button", { name: "Cut a slit" })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect
    .poll(async () =>
      Number(await cloth.getByLabel("Torn threads").textContent()),
    )
    .toBeGreaterThan(0);
  const orbit = page.getByTestId("orbit");
  await orbit.scrollIntoViewIfNeeded();
  const pixels = () =>
    orbit.locator("canvas").evaluate((c) => {
      const a = (c as HTMLCanvasElement)
        .getContext("2d")!
        .getImageData(
          0,
          0,
          (c as HTMLCanvasElement).width,
          (c as HTMLCanvasElement).height,
        ).data;
      let n = 0;
      for (let i = 3; i < a.length; i += 4) if (a[i]) n++;
      return n;
    });
  await expect.poll(pixels).toBeGreaterThan(100);
  const before = await pixels();
  await orbit.getByRole("button", { name: "Draw a cycle" }).click();
  await expect.poll(pixels).toBeGreaterThan(before + 500);
});

test("pointer release resumes orbit motion while manual pause is preserved", async ({
  page,
}) => {
  await page.goto("/?experimental");
  const scene = page.getByTestId("orbit");
  await scene.scrollIntoViewIfNeeded();
  const moving = scene.getByRole("button", {
    name: "Adjust orbit 1",
    exact: true,
  });
  await expect(moving).toHaveAttribute("style", /left/);
  const center = scene.getByRole("button", { name: "Move orbit center" }),
    box = (await center.boundingBox())!;
  await page.mouse.move(box.x + 22, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(box.x + 42, box.y + 32, { steps: 4 });
  await page.mouse.up();
  await expect(center).not.toBeFocused();
  const before = await moving.getAttribute("style");
  await expect.poll(() => moving.getAttribute("style")).not.toBe(before);
  await scene.getByRole("button", { name: "Pause orbits" }).click();
  await expect(
    scene.getByRole("button", { name: "Resume orbits" }),
  ).toHaveAttribute("aria-pressed", "true");
});
