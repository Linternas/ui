import { test, expect } from "@playwright/test";
const visit = (ids: string[]) => `/?newest-gallery&ids=${ids.join(",")}`;
const card = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`.ui-newest-card[data-preview-id="${id}"]`);
test("Newest gives scenes full width, hides tuning and keeps a working primary action", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(
    visit([
      "image-particle-morph",
      "cloth-playground",
      "tag-input",
      "wheel-picker",
    ]),
  );
  const scene = card(page, "image-particle-morph");
  expect((await scene.boundingBox())!.width).toBeGreaterThan(1000);
  await expect(
    scene.getByRole("slider", { name: "Globe amount" }),
  ).toBeHidden();
  await expect(
    scene.getByRole("button", { name: "Pause motion" }),
  ).toBeVisible();
  await scene.getByRole("button", { name: "Form globe" }).click();
  await expect(scene.getByRole("button", { name: "Form image" })).toBeVisible();
  expect((await scene.boundingBox())!.height).toBeLessThan(540);
  const small = card(page, "tag-input");
  expect((await small.boundingBox())!.width).toBeLessThan(
    (await scene.boundingBox())!.width * 0.6,
  );
  await page.getByText(/^컴포넌트 \d+$/).click();
  await expect(page.getByRole("radio", { name: /컴포넌트/ })).toBeChecked();
  await expect(scene).toHaveCount(0);
  await expect(small).toBeVisible();
  await page.getByRole("radio", { name: /컴포넌트/ }).press("ArrowLeft");
  await expect(page.getByRole("radio", { name: /인터랙션/ })).toBeChecked();
  await expect(small).toHaveCount(0);
  await expect(scene).toBeVisible();
});
test("large preview restores full controls, edits the actual component and returns to the same card", async ({
  page,
}) => {
  await page.goto(
    visit(["image-particle-morph", "cloth-playground", "foldable-paper"]),
  );
  const trigger = page.getByRole("button", {
    name: "Foldable paper 크게 보기",
  });
  await trigger.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  await trigger.click();
  const modal = page.getByRole("dialog", { name: "Foldable paper" });
  await expect(modal).toBeVisible();
  await expect(
    modal.getByRole("textbox", { name: "Paper text" }),
  ).toBeVisible();
  await modal.getByRole("textbox", { name: "Paper text" }).fill("Write here.");
  await modal.getByRole("button", { name: "Fold paper", exact: true }).click();
  await expect(
    modal.getByRole("slider", { name: "Paper fold", exact: true }),
  ).toHaveValue("1");
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThan(
    4,
  );
  await trigger.click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("slider", { name: "Paper fold", exact: true }),
  ).toHaveValue("0");
});
test("a component dialog inside expanded preview closes without dismissing the outer preview", async ({
  page,
}) => {
  await page.goto(visit(["dome-gallery"]));
  await page.getByRole("button", { name: "Dome gallery 크게 보기" }).click();
  const outer = page.getByRole("dialog", { name: "Dome gallery", exact: true });
  await outer.getByRole("button", { name: "Open selected work" }).click();
  const inner = page.getByRole("dialog", { name: "Daylight", exact: true });
  await expect(inner).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(inner).toBeHidden();
  await expect(outer).toBeVisible();
  await expect(
    outer.getByRole("button", { name: "Open selected work" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(outer).toBeHidden();
});
test("closing expanded camera unmounts the demo and stops a late permission response", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).requests = 0;
    (window as any).stops = 0;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: () => {
          (window as any).requests++;
          return new Promise((resolve) => {
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
          });
        },
      },
      configurable: true,
    });
  });
  await page.goto(visit(["webcam-pixel-grid"]));
  expect(await page.evaluate(() => (window as any).requests)).toBe(0);
  await card(page, "webcam-pixel-grid")
    .getByRole("button", { name: "Use sample" })
    .click();
  expect(await page.evaluate(() => (window as any).requests)).toBe(0);
  await page
    .getByRole("button", { name: "Webcam pixel grid 크게 보기" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start camera" })
    .click();
  await page.getByRole("button", { name: "미리보기 닫기" }).click();
  await page.evaluate(() => (window as any).resolveCamera());
  await expect.poll(() => page.evaluate(() => (window as any).stops)).toBe(1);
});
test("narrow dark Newest keeps scenes short and reveals full controls in a bounded modal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    visit([
      "sticker-peel",
      "image-particle-morph",
      "cloth-playground",
      "sound-pad",
      "live-code-sandbox",
      "tag-input",
    ]) + "&theme=dark",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  for (const id of ["sticker-peel", "image-particle-morph", "cloth-playground"])
    expect((await card(page, id).boundingBox())!.height, id).toBeLessThan(600);
  const sandbox = card(page, "live-code-sandbox");
  await expect(
    sandbox.getByRole("textbox", { name: "HTML source" }),
  ).toBeHidden();
  await sandbox
    .getByRole("button", { name: "Live code sandbox 크게 보기" })
    .click();
  const modal = page.getByRole("dialog", {
    name: "Live code sandbox",
    exact: true,
  });
  await expect(
    modal.getByRole("textbox", { name: "HTML source" }),
  ).toBeVisible();
  expect((await modal.boundingBox())!.width).toBeLessThanOrEqual(320);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Live code sandbox 크게 보기" }),
  ).toBeFocused();
});

test("Newest exposes the full inventory while mounting only nearby demos and preserving visited state", async ({
  page,
}) => {
  await page.goto("/?newest-gallery");
  const cards = page.locator(".ui-newest-card");
  await expect(cards).toHaveCount(91);
  const ids = await cards.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-preview-id")),
  );
  expect(new Set(ids).size).toBe(ids.length);
  await expect(
    page.locator('[data-preview-ready="true"]').first(),
  ).toBeVisible();
  expect(
    await page.locator('[data-preview-ready="true"]').count(),
  ).toBeLessThan(12);
  const prompt = card(page, "prompt-composer");
  const message = prompt.getByRole("textbox", { name: "Message", exact: true });
  await message.fill("Keep my draft");
  const last = cards.last();
  await last.locator("header a").scrollIntoViewIfNeeded();
  await expect(last.locator("[data-preview-ready]")).toHaveAttribute(
    "data-preview-ready",
    "true",
  );
  expect(
    await page.locator('[data-preview-ready="true"]').count(),
  ).toBeLessThan(20);
  await prompt.locator("header a").scrollIntoViewIfNeeded();
  await expect(message).toHaveValue("Keep my draft");
  await page.getByText(/^컴포넌트 \d+$/).click();
  await expect(cards).toHaveCount(50);
  await expect(page.locator('[data-preview-kind="scene"]')).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Newest results" }),
  ).toBeFocused();
});
