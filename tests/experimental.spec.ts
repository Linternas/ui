import { test, expect } from "@playwright/test";

test("particle text draws real lettering, scatters, pauses and edits without HTML injection", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (
      ...args: Parameters<typeof clear>
    ) {
      this.canvas.dataset.paints = String(
        Number(this.canvas.dataset.paints || 0) + 1,
      );
      return clear.apply(this, args);
    };
  });
  await page.goto("/?experimental");
  const scene = page.getByTestId("particle"),
    canvas = scene.locator("canvas");
  const fingerprint = () =>
    canvas.evaluate((c) => {
      const a = (c as HTMLCanvasElement)
        .getContext("2d")!
        .getImageData(
          0,
          0,
          (c as HTMLCanvasElement).width,
          (c as HTMLCanvasElement).height,
        ).data;
      let count = 0,
        hash = 0;
      for (let i = 3; i < a.length; i += 4)
        if (a[i]) {
          count++;
          hash = (hash + i * a[i]) % 2147483647;
        }
      return { count, hash };
    });
  await expect
    .poll(async () => (await fingerprint()).count)
    .toBeGreaterThan(200);
  await scene
    .getByRole("button", { name: "Pause motion", exact: true })
    .click();
  // Initial resize/intersection observers may request one last static repaint.
  // A continuous animation loop cannot satisfy a stable paint interval.
  await expect(async () => {
    const paints = await canvas.getAttribute("data-paints");
    await page.waitForTimeout(120);
    expect(await canvas.getAttribute("data-paints")).toBe(paints);
  }).toPass({ timeout: 2000, intervals: [50] });
  const still = await fingerprint();
  await scene.getByLabel("Word", { exact: true }).fill("HELLO");
  await expect
    .poll(async () => (await fingerprint()).hash)
    .not.toBe(still.hash);
  await scene.getByLabel("Word", { exact: true }).fill("</canvas>");
  await expect(scene.locator("img,script")).toHaveCount(0);
  await scene.getByLabel("Word", { exact: true }).fill("PLAY");
  await scene.getByRole("button", { name: "Resume motion" }).click();
  await scene.getByRole("button", { name: "Scatter", exact: true }).click();
  await expect(scene.locator("p[role=status]")).toContainText("Scattered");
  await scene
    .getByRole("button", { name: "Pause motion", exact: true })
    .click();
  const scattered = await fingerprint();
  await scene.getByRole("button", { name: "Reset particles" }).click();
  await expect
    .poll(async () => (await fingerprint()).hash)
    .not.toBe(scattered.hash);
});

test("controlled spatial board moves notes by drag and keyboard, connects, edits and removes", async ({
  page,
}) => {
  await page.goto("/?experimental");
  const scene = page.getByTestId("board");
  await scene.scrollIntoViewIfNeeded();
  const state = () =>
    scene.getByTestId("board-data").evaluate((e) => JSON.parse(e.textContent!));
  const grip = scene.getByRole("button", { name: "Move Alpha", exact: true });
  await grip.focus();
  await grip.press("ArrowRight");
  expect((await state()).nodes[0].x).toBe(25);
  await grip.press("Shift+ArrowDown");
  expect((await state()).nodes[0].y).toBe(55);
  const box = (await grip.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 65,
    box.y + box.height / 2 + 20,
    { steps: 6 },
  );
  await page.mouse.up();
  expect((await state()).nodes[0].x).toBeGreaterThan(80);
  await scene
    .getByRole("button", { name: "Connect Alpha", exact: true })
    .click();
  await scene
    .getByRole("button", { name: "Connect Beta", exact: true })
    .click();
  expect((await state()).edges).toHaveLength(1);
  await scene.getByLabel("Note 1 title").fill("A better idea");
  expect((await state()).nodes[0].title).toBe("A better idea");
  await scene.getByRole("button", { name: "Zoom in", exact: true }).click();
  const zoom = await scene.getByLabel("Board zoom").textContent();
  await scene.getByRole("button", { name: "Zoom out", exact: true }).click();
  expect(await scene.getByLabel("Board zoom").textContent()).not.toBe(zoom);
  await scene.getByText("1 connections", { exact: true }).click();
  await scene.getByRole("button", { name: "Remove connection a to b" }).click();
  expect((await state()).edges).toHaveLength(0);
  await scene.getByRole("button", { name: "Remove Beta", exact: true }).click();
  expect((await state()).nodes).toHaveLength(1);
  await expect(scene.getByRole("button", { name: "Add note" })).toBeFocused();
  for (let i = 0; i < 11; i++)
    await scene.getByRole("button", { name: "Add note" }).click();
  await expect(scene.getByRole("button", { name: "Add note" })).toBeDisabled();
  expect((await state()).nodes).toHaveLength(12);
});

test("sound pads require explicit audio, keyboard plays once, capture edits a real loop and unmount closes context", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    let created = 0;
    Object.defineProperty(window, "audioContexts", { value: [] });
    window.AudioContext = class extends Original {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        created++;
        (window as any).audioContexts.push(this);
      }
    };
    Object.defineProperty(window, "createdAudio", { get: () => created });
  });
  await page.goto("/?experimental");
  const scene = page.getByTestId("sound");
  await scene.scrollIntoViewIfNeeded();
  await scene.getByRole("button", { name: "Play C4", exact: true }).click();
  await expect(scene.getByLabel("Played notes")).toHaveText("1");
  expect(await page.evaluate(() => (window as any).createdAudio)).toBe(0);
  await scene.getByRole("button", { name: "Play D4", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(scene.getByLabel("Played notes")).toHaveText("2");
  await page.keyboard.press("3");
  await expect(scene.getByLabel("Played notes")).toHaveText("3");
  await scene.getByRole("button", { name: "Clear loop" }).click();
  await scene.getByRole("button", { name: "Capture notes" }).click();
  await scene.getByRole("button", { name: "Play A4", exact: true }).click();
  await scene.getByRole("button", { name: "Play C4", exact: true }).click();
  await expect(
    scene.getByRole("button", { name: "Step 1: A4" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    scene.getByRole("button", { name: "Step 2: C4" }),
  ).toHaveAttribute("aria-pressed", "true");
  await scene.getByRole("button", { name: "Enable sound" }).click();
  await expect(scene.getByRole("button", { name: "Mute sound" })).toBeVisible();
  expect(await page.evaluate(() => (window as any).createdAudio)).toBe(1);
  await scene.getByRole("button", { name: "Play loop", exact: true }).click();
  const count = Number(await scene.getByLabel("Played notes").textContent());
  await expect
    .poll(async () =>
      Number(await scene.getByLabel("Played notes").textContent()),
    )
    .toBeGreaterThan(count);
  await scene.getByRole("button", { name: "Stop loop", exact: true }).click();
  await scene.getByRole("button", { name: "Mute sound" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).audioContexts[0].state))
    .toBe("suspended");
  await scene.getByRole("button", { name: "Enable sound" }).click();
  expect(await page.evaluate(() => (window as any).createdAudio)).toBe(1);
  await scene.getByRole("button", { name: "Toggle sound scene" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).audioContexts[0].state))
    .toBe("closed");
});

test("audio failure leaves visual pads usable and leaving view stops a loop", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "AudioContext", { value: undefined }),
  );
  await page.goto("/?experimental");
  const scene = page.getByTestId("sound");
  await scene.scrollIntoViewIfNeeded();
  await scene.getByRole("button", { name: "Enable sound" }).click();
  await expect(scene.getByRole("alert")).toContainText("unavailable");
  await scene.getByRole("button", { name: "Play C4", exact: true }).click();
  await expect(scene.getByLabel("Played notes")).toHaveText("1");
  await scene.getByRole("button", { name: "Play loop", exact: true }).click();
  await expect(
    scene.getByRole("button", { name: "Stop loop", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(
    scene.getByRole("button", { name: "Play loop", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("reduced motion keeps lettering still while editing and keyboard board controls remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?experimental");
  const scene = page.getByTestId("particle");
  await expect(
    scene.getByRole("button", { name: "Scatter", exact: true }),
  ).toBeDisabled();
  await scene.getByLabel("Word", { exact: true }).fill("CALM");
  await expect(scene.locator("p[role=status]")).toContainText("Motion reduced");
  await expect(scene.getByText("CALM", { exact: true })).toBeAttached();
  const color = () =>
    scene.locator("canvas").evaluate((c) => {
      const a = (c as HTMLCanvasElement)
        .getContext("2d")!
        .getImageData(
          0,
          0,
          (c as HTMLCanvasElement).width,
          (c as HTMLCanvasElement).height,
        ).data;
      let sum = 0;
      for (let i = 0; i < a.length; i += 4) sum += a[i];
      return sum;
    });
  await expect.poll(color).toBeGreaterThan(0);
  const before = await color();
  await page.getByRole("button", { name: "Toggle scene theme" }).click();
  await expect.poll(color).not.toBe(before);
  const board = page.getByTestId("board");
  await board.getByRole("button", { name: "Move Alpha", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(board.getByTestId("board-data")).toContainText('"x":25');
});

test("touch scroll stays available until opted in, sound tap fires once and narrow scenes fit", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/?experimental");
  const particle = page.getByTestId("particle");
  await expect(particle.locator("canvas")).toHaveCSS(
    "touch-action",
    "pan-y pinch-zoom",
  );
  await particle.getByRole("button", { name: "Touch interaction" }).tap();
  await expect(particle.locator("canvas")).toHaveCSS("touch-action", "none");
  const scene = page.getByTestId("sound");
  await scene.scrollIntoViewIfNeeded();
  await scene.getByRole("button", { name: "Play C4", exact: true }).tap();
  await expect(scene.getByLabel("Played notes")).toHaveText("1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("touch can drag a focused note without moving the page", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/?experimental");
  const scene = page.getByTestId("board");
  await scene.scrollIntoViewIfNeeded();
  await scene.getByLabel("Focus note").selectOption("a");
  await expect(scene.getByLabel("Board zoom")).toHaveText("100%");
  const grip = scene.getByRole("button", { name: "Move Alpha", exact: true }),
    box = (await grip.boundingBox())!,
    x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  const session = await context.newCDPSession(page);
  const before = await page.evaluate(() => scrollY);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1 }],
  });
  for (let n = 1; n <= 5; n++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + (40 * n) / 5, y: y + (25 * n) / 5, id: 1 }],
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  const state = await scene
    .getByTestId("board-data")
    .evaluate((e) => JSON.parse(e.textContent!));
  expect(state.nodes[0].x).toBeGreaterThan(45);
  expect(state.nodes[0].y).toBeGreaterThan(45);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await context.close();
});
