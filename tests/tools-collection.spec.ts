import { test, expect } from "@playwright/test";

const open = async (page: import("@playwright/test").Page, id: string) => {
  await page.goto(`/?collection=tools&id=${id}`);
  return page.locator(`[data-tool-demo="${id}"]`);
};

test("tag input adds, rejects duplicate tags and removes with native keys", async ({
  page,
}) => {
  const demo = await open(page, "tag-input");
  const input = demo.getByLabel("Project topics");
  await input.fill("Motion");
  await input.press("Enter");
  await expect(
    demo.getByRole("button", { name: "Remove Motion", exact: true }),
  ).toBeVisible();
  await input.fill("motion");
  await input.press("Enter");
  await expect(demo.getByRole("status")).toHaveText(
    "This tag is already selected.",
  );
  await input.fill("");
  await input.press("Backspace");
  await expect(
    demo.getByRole("button", { name: "Remove Motion", exact: true }),
  ).toHaveCount(0);
  await demo.getByRole("button", { name: "+ React", exact: true }).click();
  await expect(
    demo.getByRole("button", { name: "Remove React", exact: true }),
  ).toBeVisible();
});

test("wheel picker selects with arrows and scrolls to the real snap position", async ({
  page,
}) => {
  const demo = await open(page, "wheel-picker");
  const thirty = demo.getByRole("option", { name: "30 minutes" });
  await expect(thirty).toHaveAttribute("aria-selected", "true");
  await thirty.focus();
  await thirty.press("ArrowDown");
  await expect(
    demo.getByRole("option", { name: "45 minutes" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(demo.getByRole("option", { name: "45 minutes" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    demo.getByRole("option", { name: "15 minutes" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() =>
      demo.getByRole("listbox").evaluate((el) => Math.abs(el.scrollTop)),
    )
    .toBeLessThanOrEqual(2);
});

test("color picker edits HEX and alpha with actual selected color", async ({
  page,
}) => {
  const demo = await open(page, "color-picker");
  const input = demo.getByLabel("Hex color");
  await input.fill("#ff000080");
  await expect(demo.getByLabel("Opacity", { exact: true })).toHaveValue("50");
  await expect(demo.getByLabel("Hue", { exact: true })).toHaveValue("0");
  await demo.getByLabel("Opacity", { exact: true }).focus();
  await page.keyboard.press("Home");
  await expect(input).toHaveValue("#ff000000");
  await input.fill("broken");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(demo.getByText("Use #RRGGBB or #RRGGBBAA.")).toBeVisible();
});

test("bezier editor changes CSS output, drags handles and plays an actual animation", async ({
  page,
}) => {
  const demo = await open(page, "bezier-editor");
  const output = demo.locator("code");
  await expect(output).toHaveText("cubic-bezier(0.22, 0.75, 0.30, 1.00)");
  await demo.getByLabel("Start X", { exact: true }).focus();
  await page.keyboard.press("End");
  await expect(output).toContainText("cubic-bezier(1.00");
  await demo.getByRole("button", { name: "Play motion", exact: true }).click();
  await expect
    .poll(() =>
      demo
        .locator(".mingu-bezier-ball")
        .evaluate((el) => el.getAnimations().length),
    )
    .toBeGreaterThan(0);
  const handle = demo.locator(".mingu-bezier-handle").first(),
    box = await handle.boundingBox();
  if (!box) throw new Error("Missing bezier handle");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 45, box.y + 30, { steps: 6 });
  await page.mouse.up();
  await expect(demo.getByLabel("Start X", { exact: true })).not.toHaveValue(
    "1",
  );
});

test("collaborative cursor uses supplied local peers and keyboard reporting", async ({
  page,
}) => {
  const demo = await open(page, "collaborative-cursor");
  await expect(demo.getByText("LOCAL PEER SIMULATION")).toBeVisible();
  await demo.getByRole("button", { name: "Follow my cursor" }).click();
  const canvas = demo.getByRole("region", { name: "Shared canvas" });
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(demo.locator(".mingu-local-cross")).toBeVisible();
  await expect(demo.locator(".mingu-peer").first()).toHaveAttribute(
    "style",
    /left: 62.5%/,
  );
  await demo.getByRole("button", { name: "Remove peers" }).click();
  await expect(demo.locator(".mingu-peer")).toHaveCount(0);
});

test("slash editor creates actual editable blocks and keyboard commands", async ({
  page,
}) => {
  const demo = await open(page, "slash-command-editor");
  await demo.getByRole("button", { name: "Add block", exact: true }).click();
  const blocks = demo.getByRole("textbox");
  await expect(blocks).toHaveCount(3);
  await blocks.nth(2).pressSequentially("/");
  await expect(demo.getByRole("menu", { name: "Block format" })).toBeVisible();
  await blocks.nth(2).press("ArrowDown");
  await blocks.nth(2).press("Enter");
  await expect(
    demo.getByRole("textbox", { name: "heading block" }),
  ).toHaveCount(2);
  const last = blocks.nth(2);
  await last.fill("A real heading");
  await demo.getByText("Document data", { exact: true }).click();
  await expect(demo.locator("pre")).toContainText('"text": "A real heading"');
  // Native End is platform-dependent on macOS; place the caret explicitly.
  await last.evaluate((el) => {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await last.press("Shift+Enter");
  await last.pressSequentially("A second line");
  // Assert the actual document model instead of an escaped JSON substring.
  await expect
    .poll(async () => JSON.parse(await demo.locator("pre").innerText())[2].text)
    .toBe("A real heading\nA second line");
  await last.press("Enter");
  await expect(blocks).toHaveCount(4);
  await blocks.nth(3).press("Backspace");
  await expect(blocks).toHaveCount(3);
});

test("chart navigator changes the plotted subset and exposes actual selected data", async ({
  page,
}) => {
  const demo = await open(page, "chart-range-navigator"),
    chart = demo.getByRole("img");
  await expect(chart).toHaveAttribute(
    "aria-label",
    "Daily visits: Day 13 to Day 33",
  );
  const before = await chart.locator("path").getAttribute("d");
  await demo.getByLabel("Range start", { exact: true }).focus();
  await page.keyboard.press("Home");
  await expect(chart).toHaveAttribute(
    "aria-label",
    "Daily visits: Day 1 to Day 33",
  );
  await expect(chart.locator("path")).not.toHaveAttribute("d", before!);
  await demo.getByText("View selected data", { exact: true }).click();
  await expect(demo.locator(".mingu-chart-data li")).toHaveCount(33);
});

test("carousel scrubber synchronizes native buttons, range and scroll position", async ({
  page,
}) => {
  const demo = await open(page, "carousel-scrubber");
  await demo.getByRole("button", { name: "Next", exact: true }).click();
  await expect(demo.getByLabel("Scrub slides", { exact: true })).toHaveValue(
    "1",
  );
  await demo.getByLabel("Scrub slides", { exact: true }).focus();
  await page.keyboard.press("End");
  await expect(
    demo.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await expect
    .poll(() =>
      demo
        .locator(".mingu-scrubber-track")
        .evaluate((el) => Math.abs(el.scrollLeft - el.clientWidth * 2)),
    )
    .toBeLessThan(2);
  await expect(
    demo.getByRole("heading", { name: "Stay curious." }),
  ).toBeVisible();
});

test("dialog stack keeps one modal, persistent input, dismissal and return focus", async ({
  page,
}) => {
  const demo = await open(page, "dialog-stack"),
    trigger = demo.getByRole("button", { name: "Create a project" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Project name").fill("A new study");
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(dialog).toHaveAccessibleName("Give it room.");
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await dialog.getByRole("button", { name: "Back", exact: true }).click();
  await expect(dialog.getByLabel("Project name")).toHaveValue("A new study");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("code sandbox actually executes edits, isolates host access and shows JavaScript errors", async ({
  page,
}) => {
  const demo = await open(page, "live-code-sandbox"),
    frame = demo.frameLocator("iframe");
  await expect(demo.locator("iframe")).toHaveAttribute(
    "sandbox",
    "allow-scripts",
  );
  await frame.getByRole("button", { name: "A small interaction" }).click();
  await expect(frame.locator("#count")).toHaveText("Pressed 1 times");
  await demo.getByRole("button", { name: "JS", exact: true }).click();
  await demo
    .getByLabel("JS source")
    .fill(
      'try { parent.document.body.dataset.hacked = "yes"; } catch { document.getElementById("count").textContent = "Host access blocked"; }',
    );
  await demo.getByRole("button", { name: "Run preview", exact: true }).click();
  await expect(frame.locator("#count")).toHaveText("Host access blocked");
  await expect(page.locator("body")).not.toHaveAttribute("data-hacked", "yes");
  await demo
    .getByLabel("JS source")
    .fill('throw new Error("Visible sandbox failure")');
  await demo.getByRole("button", { name: "Run preview", exact: true }).click();
  await expect(frame.getByRole("alert")).toContainText(
    "Visible sandbox failure",
  );
});

test("wheel picker retains an enabled keyboard entry after its controlled option disappears", async ({
  page,
}) => {
  const demo = await open(page, "wheel-picker");
  await demo.getByRole("button", { name: "Remove selected option" }).click();
  await expect(demo.getByRole("option", { name: "30 minutes" })).toHaveCount(0);
  await expect(demo.getByRole("option", { name: "15 minutes" })).toBeDisabled();
  const firstEnabled = demo.getByRole("option", { name: "20 minutes" });
  await expect(firstEnabled).toHaveAttribute("tabindex", "0");
  await firstEnabled.focus();
  await firstEnabled.press("Enter");
  await expect(firstEnabled).toHaveAttribute("aria-selected", "true");
  await firstEnabled.press("ArrowDown");
  await expect(demo.getByRole("option", { name: "25 minutes" })).toBeFocused();
});

test("cursor surface preserves its child's native text caret and local reporting", async ({
  page,
}) => {
  const demo = await open(page, "collaborative-cursor"),
    input = demo.getByRole("textbox", { name: "Canvas note" });
  await input.fill("abc");
  await input.evaluate((node) =>
    (node as HTMLInputElement).setSelectionRange(2, 2),
  );
  await input.press("ArrowLeft");
  expect(
    await input.evaluate((node) => (node as HTMLInputElement).selectionStart),
  ).toBe(1);
  await expect(demo.locator(".mingu-local-cross")).toHaveCount(0);
  await demo.getByRole("region", { name: "Shared canvas" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(demo.locator(".mingu-local-cross")).toBeVisible();
});

test("editor refuses a paste and newline selection that crosses another block or host content", async ({
  page,
}) => {
  const demo = await open(page, "slash-command-editor"),
    blocks = demo.getByRole("textbox"),
    before = await blocks.allTextContents();
  for (const destination of ["block", "host"]) {
    await demo.evaluate((root, destination) => {
      const blocks = root.querySelectorAll<HTMLElement>(
          '[contenteditable="true"]',
        ),
        first = blocks[0],
        last =
          destination === "block" ? blocks[1] : root.querySelector("summary")!;
      first.focus();
      const range = document.createRange();
      range.setStart(first.firstChild!, 1);
      range.setEnd(
        last.firstChild!,
        Math.min(5, last.firstChild!.textContent!.length),
      );
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      const data = new DataTransfer();
      data.setData("text/plain", "Do not replace host DOM");
      first.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: data,
        }),
      );
      first.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
      selection.removeAllRanges();
    }, destination);
    await expect(blocks).toHaveText(before);
    await expect(
      demo.getByText("Document data", { exact: true }),
    ).toBeVisible();
    await expect(
      demo.getByRole("button", { name: "Add block", exact: true }),
    ).toBeVisible();
  }
});

test("deleting the first empty editor block focuses the next surviving block", async ({
  page,
}) => {
  const demo = await open(page, "slash-command-editor"),
    blocks = demo.getByRole("textbox");
  await blocks.first().fill("");
  await blocks.first().press("Backspace");
  await expect(blocks).toHaveCount(1);
  await expect(blocks.first()).toBeFocused();
  await expect(blocks.first()).toContainText("Make a new block with Enter.");
});

test("bezier cancels a running Web Animation when reduced motion turns on", async ({
  page,
}) => {
  const demo = await open(page, "bezier-editor"),
    ball = demo.locator(".mingu-bezier-ball");
  await demo.getByRole("button", { name: "Play motion", exact: true }).click();
  await expect
    .poll(() =>
      ball.evaluate((node) =>
        node
          .getAnimations()
          .some((animation) => animation.playState === "running"),
      ),
    )
    .toBe(true);
  await ball.evaluate((node) => {
    (window as any).__curveAnimation = node.getAnimations()[0];
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => page.evaluate(() => (window as any).__curveAnimation.playState))
    .toBe("idle");
  await expect(
    demo.getByText("Motion reduction is on. The curve remains editable."),
  ).toBeVisible();
  await expect(
    demo.getByRole("button", { name: "Play motion", exact: true }),
  ).toBeVisible();
});

test("slash editor preserves real IME composition nodes and commits Korean text once", async ({
  page,
}) => {
  const demo = await open(page, "slash-command-editor");
  await demo.getByText("Document data", { exact: true }).click();
  await demo.getByRole("button", { name: "Add block", exact: true }).click();
  const block = demo.getByRole("textbox").nth(2);
  await expect(block).toBeFocused();
  const session = await page.context().newCDPSession(page);
  const documentText = async () =>
    JSON.parse(await demo.locator("pre").innerText())[2].text;
  try {
    await session.send("Input.imeSetComposition", {
      text: "ㅎ",
      selectionStart: 1,
      selectionEnd: 1,
    });
    await expect.poll(documentText).toBe("ㅎ");
    const compositionNode = await block.evaluateHandle((el) => el.firstChild);
    try {
      await session.send("Input.imeSetComposition", {
        text: "한",
        selectionStart: 1,
        selectionEnd: 1,
      });
      await expect.poll(documentText).toBe("한");
      await session.send("Input.imeSetComposition", {
        text: "한글",
        selectionStart: 2,
        selectionEnd: 2,
      });
      await expect.poll(documentText).toBe("한글");
      // Replacing the editable DOM during composition would invalidate this node.
      expect(
        await block.evaluate(
          (el, node) => el.firstChild === node,
          compositionNode,
        ),
      ).toBe(true);
    } finally {
      await compositionNode.dispose();
    }
    await session.send("Input.insertText", { text: "한글" });
    await expect.poll(documentText).toBe("한글");
    await page.keyboard.type(" works");
    await expect.poll(documentText).toBe("한글 works");
    await expect(block).toHaveText("한글 works");
  } finally {
    await session.detach();
  }
});
