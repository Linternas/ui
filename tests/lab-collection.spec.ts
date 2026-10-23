import { test, expect, type Page } from "@playwright/test";
const visit = (id: string) => `/?collection=lab&id=${id}`;
async function hash(page: Page) {
  return page
    .locator("canvas")
    .first()
    .evaluate((c) => {
      const canvas = c as HTMLCanvasElement;
      const p = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let hash = 0;
      for (let i = 0; i < p.length; i += 16)
        hash = (hash * 31 + p[i] + p[i + 1] * 3 + p[i + 2] * 7 + p[i + 3]) | 0;
      return hash;
    });
}
async function ready(page: Page) {
  await expect
    .poll(() =>
      page
        .locator("canvas")
        .first()
        .evaluate((c) => (c as HTMLCanvasElement).width),
    )
    .toBeGreaterThan(300);
  await page.waitForTimeout(100);
}
async function range(page: Page, name: string, value: number) {
  await page.getByRole("slider", { name, exact: true }).evaluate((input, v) => {
    const e = input as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(e, String(v));
    e.dispatchEvent(new Event("input", { bubbles: true }));
    e.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
test("sticker corner and native controls peel, move and reset the actual sticker", async ({
  page,
}) => {
  await page.goto(visit("sticker-peel"));
  const corner = page.getByRole("button", { name: "Peel corner" }),
    slider = page.getByRole("slider", { name: "Peel amount" });
  await corner.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveValue("0.17");
  const move = page.getByRole("button", { name: "Move sticker" }),
    before = await move.boundingBox();
  await move.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => (await move.boundingBox())!.x)
    .toBeGreaterThan(before!.x + 8);
  await page.getByRole("button", { name: "Peel away", exact: true }).click();
  await expect(slider).toHaveValue("1");
  await expect(page.locator(".mingu-experiment-status")).toContainText(
    "Peeled away",
  );
  await page.getByRole("button", { name: "Reset sticker" }).click();
  await expect(slider).toHaveValue("0.12");
});
test("elastic mesh changes real letter geometry and preserves a reduced motion manual stretch", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(visit("elastic-mesh"));
  await ready(page);
  const before = await hash(page);
  await page.getByRole("button", { name: "Stretch center" }).click();
  await expect.poll(() => hash(page)).not.toBe(before);
  await page.getByRole("textbox", { name: "Mesh text" }).fill("MINGU");
  await expect(page.getByRole("textbox", { name: "Mesh text" })).toHaveValue(
    "MINGU",
  );
  await expect(
    page.getByRole("button", { name: "Pause motion" }),
  ).toBeDisabled();
});
test("particle image forms a globe, rotates and returns to its image", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(visit("image-particle-morph"));
  await ready(page);
  const before = await hash(page);
  await page.getByRole("button", { name: "Form globe" }).click();
  await expect(page.getByRole("slider", { name: "Globe amount" })).toHaveValue(
    "1",
  );
  await expect.poll(() => hash(page)).not.toBe(before);
  const globe = await hash(page);
  await range(page, "Globe rotation", 1.5);
  await expect.poll(() => hash(page)).not.toBe(globe);
  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect(page.getByRole("slider", { name: "Globe amount" })).toHaveValue(
    "0",
  );
});
test("halftone reveal and reset change image pixels without automatic motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(visit("dither-reveal"));
  await ready(page);
  const printed = await hash(page);
  await page.getByRole("button", { name: "Reveal image" }).click();
  await expect.poll(() => hash(page)).not.toBe(printed);
  const revealed = await hash(page);
  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect.poll(() => hash(page)).not.toBe(revealed);
});
test("glass lens samples different image positions and refraction strengths", async ({
  page,
}) => {
  await page.goto(visit("fluid-glass-lens"));
  await ready(page);
  const before = await hash(page);
  await range(page, "Lens horizontal position", 0.75);
  await expect.poll(() => hash(page)).not.toBe(before);
  const moved = await hash(page);
  await range(page, "Refraction", 0);
  await expect.poll(() => hash(page)).not.toBe(moved);
  await page.getByRole("button", { name: "Reset lens" }).click();
  await expect(
    page.getByRole("slider", { name: "Lens horizontal position" }),
  ).toHaveValue("0.5");
});
test("badge keyboard placement, live text, flip and reset operate in reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(visit("lanyard"));
  await ready(page);
  const badge = page.getByRole("button", { name: "Move lanyard badge" }),
    before = await badge.boundingBox();
  await badge.focus();
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(async () => (await badge.boundingBox())!.x)
    .toBeLessThan(before!.x - 10);
  await page.getByRole("textbox", { name: "Badge name" }).fill("MIN");
  const front = await hash(page);
  await page.getByRole("button", { name: "Flip badge" }).click();
  await expect(
    page.getByRole("button", { name: "Flip badge" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => hash(page)).not.toBe(front);
  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect(
    page.getByRole("button", { name: "Flip badge" }),
  ).toHaveAttribute("aria-pressed", "false");
});
test("dome selection rotates the gallery and opens the selected original image", async ({
  page,
}) => {
  await page.goto(visit("dome-gallery"));
  await ready(page);
  await page.getByRole("button", { name: "Echo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Echo", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Open selected work" }).click();
  await expect(page.getByRole("dialog", { name: "Echo" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("img")).toHaveAttribute(
    "src",
    "/ui-lab/echo.svg",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Open selected work" }),
  ).toBeFocused();
});
test("paper texture, fold projection and crease are edited through accessible controls", async ({
  page,
}) => {
  await page.goto(visit("foldable-paper"));
  await ready(page);
  const before = await hash(page);
  await page
    .getByRole("textbox", { name: "Paper text" })
    .fill("A new thought.");
  await expect.poll(() => hash(page)).not.toBe(before);
  const flat = await hash(page);
  await page.getByRole("button", { name: "Fold paper", exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "Paper fold", exact: true }),
  ).toHaveValue("1");
  await expect.poll(() => hash(page)).not.toBe(flat);
  await range(page, "Crease position", 0.7);
  await page.getByRole("button", { name: "Reset paper" }).click();
  await expect(
    page.getByRole("slider", { name: "Paper fold", exact: true }),
  ).toHaveValue("0");
});
test("camera never starts on mount or sample; denial is visible and cancellable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).cameraRequests = 0;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: async () => {
          (window as any).cameraRequests++;
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
      configurable: true,
    });
  });
  await page.goto(visit("webcam-pixel-grid"));
  await ready(page);
  expect(await page.evaluate(() => (window as any).cameraRequests)).toBe(0);
  await page.getByRole("button", { name: "Use sample" }).click();
  await expect(page.locator(".mingu-experiment-status")).toContainText(
    "Sample image",
  );
  expect(await page.evaluate(() => (window as any).cameraRequests)).toBe(0);
  await page.getByRole("button", { name: "Start camera" }).click();
  await expect(page.locator(".mingu-experiment-status")).toContainText(
    "permission denied",
  );
  expect(await page.evaluate(() => (window as any).cameraRequests)).toBe(1);
});
test("late camera permissions stop tracks after cancellation without enabling a stream", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).stops = 0;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: () =>
          new Promise((resolve) => {
            (window as any).resolveCamera = () =>
              resolve({
                getTracks: () => [
                  {
                    stop: () => {
                      (window as any).stops++;
                    },
                  },
                ],
              });
          }),
      },
      configurable: true,
    });
  });
  await page.goto(visit("webcam-pixel-grid"));
  await ready(page);
  await page.getByRole("button", { name: "Start camera" }).click();
  await page.getByRole("button", { name: "Stop camera" }).click();
  await page.evaluate(() => (window as any).resolveCamera());
  await expect.poll(() => page.evaluate(() => (window as any).stops)).toBe(1);
  await expect(page.locator(".mingu-experiment-status")).toContainText(
    "Camera stopped",
  );
});
test("relighting alters actual sampled pixels with light movement and intensity", async ({
  page,
}) => {
  await page.goto(visit("image-relighting"));
  await ready(page);
  const before = await hash(page);
  await range(page, "Light horizontal position", 0.9);
  await range(page, "Light intensity", 1.5);
  await expect.poll(() => hash(page)).not.toBe(before);
  await expect(page.locator(".mingu-experiment-status")).toContainText(
    "brightness",
  );
});
test("all lab controls fit a 320px viewport in dark reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of [
    "sticker-peel",
    "elastic-mesh",
    "image-particle-morph",
    "dither-reveal",
    "fluid-glass-lens",
    "lanyard",
    "dome-gallery",
    "foldable-paper",
    "webcam-pixel-grid",
    "image-relighting",
  ]) {
    await page.goto(visit(id) + "&theme=dark");
    await expect(page.getByRole("group").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
