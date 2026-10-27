import { test, expect, type Page } from "@playwright/test";
import {
  generateMaze,
  contrastRatio,
  clipPathCss,
  shadowCss,
} from "../src/collections/kinetic";
const visit = (id: string) => `/?collection&id=${id}`;
const pixels = (page: Page) =>
  page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const data = canvas
      .getContext("2d")!
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (let i = 0; i < data.length; i += 17)
      hash = Math.imul(hash ^ data[i], 16777619);
    return hash;
  });
test("pure design helpers bound output and compute known color ratios", () => {
  expect(contrastRatio("#000000", "#ffffff")).toBe(21);
  expect(contrastRatio("#777777", "#777777")).toBe(1);
  expect(
    clipPathCss([
      { x: -10, y: 200 },
      { x: 50, y: 0 },
      { x: 100, y: 100 },
    ]),
  ).toContain("0% 100%");
  expect(clipPathCss([])).toBe("none");
  expect(shadowCss([])).toBe("none");
  expect(
    shadowCss([
      { id: "x", x: 0, y: 2, blur: 10, spread: 0, color: "bad", opacity: 1 },
    ]),
  ).not.toContain("bad");
  expect(generateMaze(3)).toEqual(generateMaze(3));
  expect(generateMaze(4)).not.toEqual(generateMaze(3));
});
test("flip card keeps inactive face inert and restores toggle on Escape", async ({
  page,
}) => {
  await page.goto(visit("flip-card"));
  await expect(page.locator(".mingu-flip-back")).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Show back", exact: true }).click();
  await expect(page.locator(".mingu-flip-face").first()).toHaveAttribute(
    "inert",
    "",
  );
  await page
    .getByRole("button", { name: "Keep the thought", exact: true })
    .focus();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Show back", exact: true }),
  ).toBeFocused();
});
test("generated maze can actually be solved by focused arrow controls and reset", async ({
  page,
}) => {
  const maze = generateMaze(3),
    queue = [{ r: 1, c: 1, path: [] as string[] }],
    seen = new Set(["1:1"]);
  let path: string[] = [];
  while (queue.length) {
    const p = queue.shift()!;
    if (maze[p.r][p.c] === "G") {
      path = p.path;
      break;
    }
    for (const [dr, dc, key] of [
      [0, 1, "ArrowRight"],
      [0, -1, "ArrowLeft"],
      [1, 0, "ArrowDown"],
      [-1, 0, "ArrowUp"],
    ] as const) {
      const r = p.r + dr,
        c = p.c + dc,
        id = `${r}:${c}`;
      if (maze[r]?.[c] && maze[r][c] !== "#" && !seen.has(id)) {
        seen.add(id);
        queue.push({ r, c, path: [...p.path, key] });
      }
    }
  }
  expect(path.length).toBeGreaterThan(0);
  await page.goto(visit("maze-runner"));
  const controls = page.getByLabel(
    "Maze controls. Use arrow keys to reach the goal.",
    { exact: true },
  );
  await controls.focus();
  for (const key of path) await page.keyboard.press(key);
  await expect(page.getByRole("status")).toContainText("Goal reached");
  await page.getByRole("button", { name: "Reset maze", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Back at the start.");
});
test("clip editor handles and actual copied CSS; contrast updates actual sample", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(visit("clip-path-editor"));
  const anchor = page.getByRole("button", {
    name: "Select anchor 1",
    exact: true,
  });
  await anchor.focus();
  await anchor.press("ArrowRight");
  await page.getByRole("slider", { name: "Anchor X", exact: true }).fill("30");
  await page
    .getByRole("button", { name: "Copy clip path", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "30%",
  );
  expect(
    await page
      .locator(".mingu-clip-art")
      .evaluate((e) => getComputedStyle(e).clipPath),
  ).toContain("30%");
  await page.goto(visit("contrast-checker"));
  await page.getByLabel("Text color", { exact: true }).fill("#000000");
  await page.getByLabel("Background color", { exact: true }).fill("#ffffff");
  await expect(page.locator(".mingu-contrast-sample b")).toHaveText(
    "21.00 : 1",
  );
  await expect(
    page.locator(".mingu-contrast-results [data-pass='true']"),
  ).toHaveCount(3);
  await page.getByLabel("Background color", { exact: true }).fill("#000000");
  await expect(
    page.locator(".mingu-contrast-results [data-pass='true']"),
  ).toHaveCount(0);
});
test("shadow presets, layers and actual copied styles stay consistent", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(visit("shadow-editor"));
  await page
    .getByRole("slider", { name: "Shadow blur", exact: true })
    .fill("35");
  await page
    .getByRole("button", { name: "Copy shadow CSS", exact: true })
    .click();
  const css = await page.evaluate(() => navigator.clipboard.readText());
  expect(css).toContain("35px");
  await expect
    .poll(() =>
      page
        .locator(".mingu-shadow-stage > div")
        .evaluate((e) => getComputedStyle(e).boxShadow),
    )
    .toContain("35px");
  await page.getByRole("button", { name: "Add layer", exact: true }).click();
  await expect(
    page.getByLabel("Shadow layer", { exact: true }).locator("option"),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "Remove layer", exact: true }).click();
  await expect(
    page.getByLabel("Shadow layer", { exact: true }).locator("option"),
  ).toHaveCount(2);
});
for (const [id, action] of [
  ["confetti-burst", "Launch confetti"],
  ["vector-field", "Add center charge"],
  ["reaction-diffusion", "Step pattern"],
  ["terrain-mesh", "New terrain"],
  ["pendulum-wave", "Step wave"],
])
  test(`${id} manual action changes rendered pixels in reduced motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(visit(id));
    await expect.poll(() => pixels(page)).not.toBe(0);
    const before = await pixels(page);
    await page.getByRole("button", { name: action, exact: true }).click();
    await expect.poll(() => pixels(page)).not.toBe(before);
    if (id !== "confetti-burst")
      await expect(
        page.getByRole("button", { name: "Reduced motion", exact: true }),
      ).toBeDisabled();
  });
test("normal animation changes pixels, pause stabilizes and offscreen work suspends", async ({
  page,
}) => {
  await page.goto(visit("terrain-mesh"));
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  let hash = await pixels(page);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  hash = await pixels(page);
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  expect(await pixels(page)).toBe(hash);
  await page
    .getByRole("button", { name: "Resume animation", exact: true })
    .click();
  await expect.poll(() => pixels(page)).not.toBe(hash);
  await page.evaluate(() => {
    document.body.style.paddingBottom = "2000px";
    scrollTo(0, 1500);
  });
  await expect(page.locator("canvas")).not.toBeInViewport();
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  hash = await pixels(page);
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  expect(await pixels(page)).toBe(hash);
});

test("touch anchor drag edits polygon while blank canvas preserves page scroll", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 850 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(visit("clip-path-editor"));
  await expect(page.locator(".mingu-clip-stage > svg")).toHaveCSS(
    "touch-action",
    "pan-y",
  );
  const anchor = page.getByRole("button", {
    name: "Select anchor 1",
    exact: true,
  });
  await expect(anchor).toHaveCSS("touch-action", "none");
  const handle = (await anchor.boundingBox())!,
    stage = (await page.locator(".mingu-clip-stage").boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = handle.x + handle.width / 2,
    y = handle.y + handle.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: stage.x + stage.width * 0.4, y: stage.y + stage.height * 0.3 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(
    page.getByRole("slider", { name: "Anchor X", exact: true }),
  ).toHaveValue("40");
  await expect(
    page.getByRole("slider", { name: "Anchor Y", exact: true }),
  ).toHaveValue("30");
  await context.close();
});
