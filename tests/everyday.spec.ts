import { test, expect } from "@playwright/test";
const ids = [
  "image-lightbox",
  "expandable-card",
  "animated-filter-bar",
  "resizable-panels",
  "sortable-list",
  "inline-edit",
  "selection-toolbar",
  "smart-header",
  "code-tabs",
  "bottom-sheet",
  "action-toast",
  "file-dropzone",
];
test.beforeEach(async ({ page }) => {
  await page.goto("/?everyday");
});

test("all twelve render without runtime errors and fit mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  for (const id of ids) await expect(page.getByTestId(id)).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Locked card" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("separator", { name: "Locked panels" }),
  ).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText("No images", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("lightbox opens from its thumbnail, zooms, navigates from the close button and returns focus", async ({
  page,
}) => {
  const trigger = page
    .getByTestId("image-lightbox")
    .getByRole("button", { name: "Open Mountains in daylight" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Mountains in daylight" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: "Mountains in daylight" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(dialog.locator(".mingu-lightbox-stage")).toHaveAttribute(
    "data-zoomed",
    "true",
  );
  await expect(dialog.getByRole("button", { name: "Reset zoom" })).toHaveText(
    "150%",
  );
  await dialog.getByRole("button", { name: "Reset zoom" }).click();
  await dialog.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("dialog", { name: "Mountains after hours" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("expanded card contains working content and restores its trigger", async ({
  page,
}) => {
  const trigger = page
    .getByTestId("expandable-card")
    .getByRole("button")
    .first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Field notes", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Save to collection" }).click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Saved to your preview collection.",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("filters update real results and counts with native radio keyboard controls", async ({
  page,
}) => {
  const stage = page.getByTestId("animated-filter-bar");
  await expect(stage.getByRole("listitem")).toHaveCount(4);
  await stage.getByText("Web · 2", { exact: true }).click();
  await expect(
    stage.getByRole("listitem").filter({ visible: true }),
  ).toHaveCount(2);
  await expect(stage.getByRole("status")).toHaveText("2 results");
  await stage.getByRole("radio", { name: "Web · 2" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(stage.getByRole("radio", { name: "Design · 2" })).toBeChecked();
  await expect(stage.getByText("Objects", { exact: true })).toBeVisible();
});

test("split panels clamp drag and keyboard changes and collapse without exposing hidden content", async ({
  page,
}) => {
  const stage = page.getByTestId("resizable-panels"),
    handle = stage.getByRole("separator");
  await handle.focus();
  await page.keyboard.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "20");
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "21");
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "80");
  await page.keyboard.press("Enter");
  await expect(handle).toHaveAttribute("aria-valuenow", "0");
  await expect(stage.locator(".mingu-resizable-panel").first()).toHaveAttribute(
    "inert",
    "",
  );
  await page.keyboard.press("Enter");
  await expect(handle).toHaveAttribute("aria-valuenow", "80");
  await handle.hover();
  const box = (await handle.boundingBox())!;
  const root = (await stage.locator(".mingu-resizable").boundingBox())!;
  await page.mouse.move(box.x + 8, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(root.x - 40, box.y + 40, { steps: 8 });
  await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-valuenow", "20");
});

test("sortable items retain focus during keyboard moves and actual drag reorders", async ({
  page,
}) => {
  const stage = page.getByTestId("sortable-list");
  const handle = stage.getByRole("button", { name: "Move Field notes" });
  await handle.focus();
  await page.keyboard.press("End");
  await expect(stage.getByRole("listitem").last()).toHaveText("Field notes");
  await expect(handle).toBeFocused();
  await page.keyboard.press("Home");
  await handle.hover();
  const first = (await handle.boundingBox())!,
    last = (await stage.getByRole("listitem").last().boundingBox())!;
  await page.mouse.move(first.x + 20, first.y + 20);
  await page.mouse.down();
  await page.mouse.move(first.x + 20, last.y + last.height - 5, { steps: 18 });
  await page.mouse.up();
  await expect(stage.getByRole("listitem").last()).toHaveText("Field notes");
});

test("inline edit cancels, validates, reports a rejected save and retries actual changes", async ({
  page,
}) => {
  const stage = page.getByTestId("inline-edit");
  await stage.getByRole("button", { name: /Edit Project name/ }).click();
  const input = stage.getByRole("textbox", { name: "Project name" });
  await input.fill("Discard this");
  await input.press("Escape");
  await expect(
    stage.getByRole("button", { name: /Edit Project name/ }),
  ).toContainText("Untitled project");
  await stage.getByText("Simulate save failure", { exact: true }).click();
  await stage.getByRole("button", { name: /Edit Project name/ }).click();
  await input.fill("New project");
  await input.press("Enter");
  await expect(stage.getByRole("alert")).toContainText("Could not save");
  await expect(input).toHaveValue("New project");
  await stage.getByText("Simulate save failure", { exact: true }).click();
  await stage.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    stage.getByRole("button", { name: /Edit Project name/ }),
  ).toContainText("New project");
  await expect(
    stage.getByRole("button", { name: /Edit Project name/ }),
  ).toBeFocused();
});

test("selection toolbar uses actual text selection and Quote receives the selected text", async ({
  page,
}) => {
  const stage = page.getByTestId("selection-toolbar");
  await stage.scrollIntoViewIfNeeded();
  const copy = stage.locator(".ui-selection-copy p");
  await copy.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  const toolbar = page.getByRole("toolbar", { name: "Selected text actions" });
  await expect(toolbar).toBeVisible();
  await toolbar.getByRole("button", { name: "Copy", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    toolbar.getByRole("button", { name: "Quote", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(stage.locator("blockquote")).toContainText(
    "Good design makes room",
  );
  await page.keyboard.press("Escape");
  await expect(toolbar).toBeHidden();
});

test("selection copy reports clipboard success and failure honestly", async ({
  page,
}) => {
  const stage = page.getByTestId("selection-toolbar");
  await stage.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copiedSelection = text;
        },
      },
    });
  });
  await stage.locator(".ui-selection-copy p").evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  const toolbar = page.getByRole("toolbar", { name: "Selected text actions" });
  await toolbar.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(toolbar.getByRole("status")).toHaveText("Text copied");
  expect(await page.evaluate(() => (window as any).copiedSelection)).toContain(
    "Good design",
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw Error("Denied");
        },
      },
    });
  });
  await toolbar.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(toolbar.getByRole("status")).toContainText("Action failed");
});

test("smart header responds to its own scroll container and returns when focused", async ({
  page,
}) => {
  const stage = page.getByTestId("smart-header"),
    reader = stage.getByRole("region"),
    header = stage.locator("header");
  await reader.evaluate((element) => {
    element.scrollTop = 240;
  });
  await expect(header).toHaveAttribute("data-hidden", "true");
  await reader.evaluate((element) => {
    element.scrollTop = 180;
  });
  await expect(header).not.toHaveAttribute("data-hidden", "true");
  await reader.evaluate((element) => {
    element.scrollTop = 400;
  });
  await expect(header).toHaveAttribute("data-hidden", "true");
  await header.getByRole("button", { name: "Top" }).focus();
  await expect(header).not.toHaveAttribute("data-hidden", "true");
});

test("code tabs switch actual source, native focus and clipboard content", async ({
  page,
}) => {
  const stage = page.getByTestId("code-tabs");
  await stage.getByRole("tab", { name: "npm", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    stage.getByRole("tab", { name: "pnpm", exact: true }),
  ).toBeFocused();
  await expect(
    stage.getByRole("tabpanel", { name: "pnpm", exact: true }),
  ).toContainText("pnpm start");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copiedSource = text;
        },
      },
    });
  });
  await stage
    .getByRole("tabpanel", { name: "pnpm", exact: true })
    .getByRole("button", { name: "Copy code" })
    .click();
  expect(await page.evaluate(() => (window as any).copiedSource)).toContain(
    "pnpm start",
  );
});

test("bottom sheet changes snaps by keyboard and closes after an actual downward drag", async ({
  page,
}) => {
  const trigger = page
    .getByTestId("bottom-sheet")
    .getByRole("button", { name: "Open filters" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Make it yours" }),
    handle = dialog.getByRole("slider", { name: "Sheet height" });
  await handle.focus();
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "92");
  await page.keyboard.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "40");
  await dialog.getByRole("checkbox", { name: "Published only" }).check();
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + 40, box.y + 12);
  await page.mouse.down();
  await page.mouse.move(box.x + 40, box.y + 180, { steps: 10 });
  await page.mouse.up();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("bottom-sheet")).toContainText(
    "Showing published entries",
  );
});

test("action toast restores the removed item and progresses from caller updates", async ({
  page,
}) => {
  const stage = page.getByTestId("action-toast");
  await stage.getByRole("button", { name: "Remove note" }).click();
  await expect(stage.locator(".ui-note-placeholder")).toHaveText(
    "The note was removed.",
  );
  await stage.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(stage.locator(".ui-note-placeholder")).toHaveText(
    "A note worth keeping.",
  );
  await stage.getByRole("button", { name: "Preview progress" }).click();
  await expect(stage.getByRole("progressbar")).toBeVisible();
  await expect(
    stage.locator("strong").filter({ hasText: "Preview complete" }),
  ).toBeVisible();
  await expect(stage.getByRole("progressbar")).toHaveAttribute("value", "100");
});

test("toast rejected action remains retryable", async ({ page }) => {
  const region = page.getByRole("region", { name: "Retry notifications" });
  await region.getByRole("button", { name: "Try action" }).click();
  await expect(region.getByRole("alert")).toContainText("Action failed");
  await region.getByRole("button", { name: "Try action" }).click();
  await expect(region.locator(".mingu-action-toast")).toHaveCount(0);
});

test("file dropzone rejects invalid files, submits actual FileList and resets", async ({
  page,
}) => {
  const stage = page.getByTestId("edges"),
    input = stage.getByLabel("Attachments");
  await input.setInputFiles([
    { name: "one.txt", mimeType: "text/plain", buffer: Buffer.from("hello") },
    {
      name: "large.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("123456789"),
    },
    { name: "wrong.png", mimeType: "image/png", buffer: Buffer.from("x") },
  ]);
  await expect(stage.getByRole("alert")).toContainText("File is too large");
  await expect(stage.getByRole("alert")).toContainText(
    "File type is not accepted",
  );
  await expect(stage.locator(".mingu-dropzone-files li")).toHaveCount(1);
  await stage.getByRole("button", { name: "Submit files" }).click();
  await expect(
    stage.getByRole("status", { name: "Submitted files" }),
  ).toHaveText("attachments:one.txt");
  await stage.getByRole("button", { name: "Reset files" }).click();
  await expect(stage.locator(".mingu-dropzone-files li")).toHaveCount(0);
  expect(
    await input.evaluate(
      (element) => (element as HTMLInputElement).files!.length,
    ),
  ).toBe(0);
});

test("file drop receives actual browser File objects and preserves native form submission", async ({
  page,
}) => {
  const stage = page.getByTestId("edges");
  const data = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(["hello"], "dropped.txt", { type: "text/plain" }),
    );
    return transfer;
  });
  await stage
    .locator(".mingu-dropzone")
    .dispatchEvent("drop", { dataTransfer: data });
  await expect(stage.locator(".mingu-dropzone-files li")).toContainText(
    "dropped.txt",
  );
  await stage.getByRole("button", { name: "Submit files" }).click();
  await expect(
    stage.getByRole("status", { name: "Submitted files" }),
  ).toHaveText("attachments:dropped.txt");
});

test("image thumbnail, upload failure and retry use the real upload callback", async ({
  page,
}) => {
  const stage = page.getByTestId("file-dropzone");
  await stage.getByText("Simulate upload failure", { exact: true }).click();
  await stage.getByLabel("Choose images").setInputFiles({
    name: "pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB1sAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(stage.locator(".mingu-dropzone-files img")).toBeVisible();
  await stage.getByRole("button", { name: "Upload", exact: true }).click();
  await expect(stage.getByRole("alert")).toContainText("Preview failure");
  await stage.getByText("Simulate upload failure", { exact: true }).click();
  await stage.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(stage.locator(".mingu-dropzone-file-copy small")).toContainText(
    "success",
  );
  await stage.getByRole("button", { name: "Remove pixel.png" }).click();
  await expect(stage.locator(".mingu-dropzone-files li")).toHaveCount(0);
});

test("reduced motion keeps interactions operational and removes shared surface animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.getByTestId("expandable-card").getByRole("button").first().click();
  const dialog = page.getByRole("dialog", { name: "Field notes", exact: true });
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((element) => element.getAnimations().length),
  ).toBe(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("mobile native touch pinch, image swipe, panel resize and sheet dismissal work", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/?everyday");
  const cdp = await context.newCDPSession(page);
  const point = (x: number, y: number, id = 1) => ({
    x,
    y,
    id,
    radiusX: 2,
    radiusY: 2,
  });
  const send = async (type: string, touchPoints: any[]) => {
    await cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  };
  await page
    .getByTestId("image-lightbox")
    .getByRole("button", { name: "Open Mountains in daylight" })
    .tap();
  let dialog = page.getByRole("dialog", { name: "Mountains in daylight" });
  await dialog.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished),
    );
  });
  const stage = dialog.locator(".mingu-lightbox-stage"),
    box = (await stage.boundingBox())!,
    cx = box.x + box.width / 2,
    cy = box.y + box.height / 2;
  await send("touchStart", [point(cx - 30, cy), point(cx + 30, cy, 2)]);
  for (let step = 1; step <= 8; step++)
    await send("touchMove", [
      point(cx - 30 - step * 5, cy),
      point(cx + 30 + step * 5, cy, 2),
    ]);
  await send("touchEnd", []);
  await expect
    .poll(async () =>
      parseInt(
        (await dialog
          .getByRole("button", { name: "Reset zoom" })
          .textContent())!,
      ),
    )
    .toBeGreaterThan(180);
  await dialog.getByRole("button", { name: "Reset zoom" }).tap();
  await send("touchStart", [point(cx + 60, cy)]);
  for (let step = 1; step <= 8; step++)
    await send("touchMove", [point(cx + 60 - step * 15, cy)]);
  await send("touchEnd", []);
  dialog = page.getByRole("dialog", { name: "Mountains after hours" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).tap();
  await expect(dialog).toBeHidden();
  const separator = page.getByTestId("resizable-panels").getByRole("separator");
  await separator.scrollIntoViewIfNeeded();
  const sep = (await separator.boundingBox())!,
    root = (await page
      .getByTestId("resizable-panels")
      .locator(".mingu-resizable")
      .boundingBox())!;
  await send("touchStart", [point(sep.x + sep.width / 2, sep.y + 40)]);
  for (let step = 1; step <= 8; step++)
    await send("touchMove", [
      point(sep.x + sep.width / 2 + step * 8, sep.y + 40),
    ]);
  await send("touchEnd", []);
  await expect
    .poll(async () => Number(await separator.getAttribute("aria-valuenow")))
    .toBeGreaterThan(60);
  await page
    .getByTestId("bottom-sheet")
    .getByRole("button", { name: "Open filters" })
    .tap();
  const sheet = page.getByRole("dialog", { name: "Make it yours" });
  await sheet.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished),
    );
  });
  const handle = (await sheet.getByRole("slider").boundingBox())!;
  await send("touchStart", [point(handle.x + 40, handle.y + 12)]);
  for (let step = 1; step <= 10; step++)
    await send("touchMove", [point(handle.x + 40, handle.y + 12 + step * 40)]);
  await send("touchEnd", []);
  await expect(sheet).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("controlled file reset clears prior upload status and removal aborts an active upload", async ({
  page,
}) => {
  const stage = page.getByTestId("controlled-upload"),
    input = stage.getByLabel("Controlled attachments");
  const file = {
    name: "one.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("one"),
  };
  await input.setInputFiles(file);
  await stage.getByRole("button", { name: "Upload", exact: true }).click();
  await expect(stage.locator(".mingu-dropzone-file-copy small")).toContainText(
    "success",
  );
  await stage.getByRole("button", { name: "Clear externally" }).click();
  await expect(stage.locator(".mingu-dropzone-files li")).toHaveCount(0);
  await input.setInputFiles(file);
  await expect(stage.locator(".mingu-dropzone-file-copy small")).toContainText(
    "idle",
  );
  await stage.getByRole("button", { name: "Clear externally" }).click();
  await input.setInputFiles({
    name: "wait.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("wait"),
  });
  await stage.getByRole("button", { name: "Upload", exact: true }).click();
  await stage.getByRole("button", { name: "Remove wait.txt" }).click();
  await expect(
    stage.getByRole("status", { name: "Aborted uploads" }),
  ).toHaveText("1");
});
