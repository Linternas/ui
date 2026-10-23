import { test, expect } from "@playwright/test";
const visit = (id: string) => `/?collection=ai&id=${id}`;

test("prompt composer preserves newline, attaches a real File and sends only to the local queue", async ({
  page,
}) => {
  await page.goto(visit("prompt-composer"));
  const input = page.getByRole("textbox", { name: "Message" });
  await input.fill("Keep this");
  await input.press("Shift+Enter");
  await input.press("End");
  await input.press("x");
  await expect(input).toHaveValue("Keep this\nx");
  await page.getByRole("button", { name: "Model: Swift" }).click();
  const modelSearch = page.getByRole("combobox", { name: "Search models" });
  await modelSearch.dispatchEvent("keydown", {
    key: "Enter",
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  await expect(
    page.getByRole("dialog", { name: "Choose a model" }),
  ).toBeVisible();
  await modelSearch.fill("no-such-model");
  await modelSearch.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Choose a model" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Local draft queue", { exact: true }).locator("article"),
  ).toHaveCount(0);
  await expect(input).toHaveValue("Keep this\nx");
  await modelSearch.press("Escape");
  await page.getByLabel("Attach files", { exact: true }).setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("A real local file"),
  });
  await expect(
    page.getByRole("button", { name: "Remove notes.txt" }),
  ).toBeVisible();
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: "Stop response" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Local draft queue", { exact: true }),
  ).toContainText("Keep this");
  await expect(
    page.getByLabel("Local draft queue", { exact: true }),
  ).toContainText("notes.txt");
  await expect(input).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Remove notes.txt" }),
  ).toHaveCount(0);
});

test("prompt composer cancels actual queued work and preserves a rejected draft for retry", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(visit("prompt-composer"));
  await page.clock.install();
  const input = page.getByRole("textbox", { name: "Message" });
  const queue = page
    .getByLabel("Local draft queue", { exact: true })
    .locator("article");
  await input.fill("A stopped draft");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("button", { name: "Stop response" }).click();
  // The stopped button becomes Send in the same render. Its native click must
  // not submit again, and the old asynchronous operation must stay cancelled.
  await page.clock.runFor(800);
  await expect(input).toHaveValue("A stopped draft");
  await expect(queue).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeEnabled();
  await page.getByText("Lock the local draft queue", { exact: true }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await page.clock.runFor(800);
  await expect(page.getByRole("alert")).toContainText("draft queue is locked");
  await expect(input).toHaveValue("A stopped draft");
  await expect(queue).toHaveCount(0);
  await page.getByText("Lock the local draft queue", { exact: true }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await page.clock.runFor(800);
  await expect(queue).toHaveCount(1);
  await expect(queue).toContainText("A stopped draft");
  await expect(input).toHaveValue("");
});

test("tool panel shows actual parser success, failure and retry with changed input", async ({
  page,
}) => {
  await page.goto(visit("tool-execution-panel"));
  await page.getByRole("button", { name: "Run local parser" }).click();
  await expect(page.locator(".mingu-collection-ai-tool")).toHaveAttribute(
    "data-status",
    "success",
  );
  await expect(
    page.locator(".mingu-collection-ai-tool pre").last(),
  ).toContainText('"Field notes"');
  await page.getByRole("textbox", { name: "JSON input" }).fill("{invalid");
  await page.getByRole("button", { name: "Run local parser" }).click();
  await expect(page.locator(".mingu-collection-ai-tool")).toHaveAttribute(
    "data-status",
    "error",
  );
  await page
    .getByRole("textbox", { name: "JSON input" })
    .fill('{"recovered":true}');
  await page.getByRole("button", { name: "Retry tool" }).click();
  await expect(page.locator(".mingu-collection-ai-tool")).toHaveAttribute(
    "data-status",
    "success",
  );
  await expect(
    page.locator(".mingu-collection-ai-tool pre").last(),
  ).toContainText('"recovered": true');
});

test("plan review executes selected steps and updates its real local manifest", async ({
  page,
}) => {
  await page.goto(visit("plan-review"));
  await page.getByText("Choose the foundation", { exact: true }).click();
  await page.getByRole("button", { name: "Run selected steps" }).click();
  await expect(page.getByLabel("Local manifest")).toContainText(
    "Sections: Introduction",
  );
  await expect(page.getByLabel("Local manifest")).toContainText("Reminder:");
  await expect(page.getByLabel("Local manifest")).not.toContainText("Theme:");
  await expect(
    page.locator('.mingu-collection-ai-plan li[data-status="complete"]'),
  ).toHaveCount(2);
});

test("approval applies the exact local change only after callback success and supports decline", async ({
  page,
}) => {
  await page.goto(visit("approval-card"));
  await page.getByText("Lock this local draft", { exact: true }).click();
  await page.getByRole("button", { name: "Approve change" }).click();
  await expect(page.getByRole("alert")).toContainText("draft is locked");
  await expect(page.getByTestId("approved-title")).toHaveText("A small idea");
  await page.getByText("Lock this local draft", { exact: true }).click();
  await page.getByRole("button", { name: "Approve change" }).click();
  await expect(page.getByTestId("approved-title")).toHaveText("Room to think");
  await expect(page.getByRole("status")).toContainText("Change approved");
  await page.getByRole("button", { name: "Reset decision" }).click();
  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page.getByTestId("approved-title")).toHaveText("A small idea");
  await expect(page.getByRole("status")).toContainText("Change declined");
});

test("context meter excludes cached input from the total and follows real controls", async ({
  page,
}) => {
  await page.goto(visit("context-usage-meter"));
  await expect(page.getByRole("meter")).toHaveAttribute("value", "15600");
  await page.getByRole("button", { name: /24% context used/ }).click();
  await expect(page.getByText("Cached input", { exact: true })).toBeVisible();
  await expect(page.getByText("4,800", { exact: true })).toBeVisible();
  await page.getByRole("slider", { name: "Input tokens" }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("meter")).toHaveAttribute("value", "3200");
});

test("artifact edits feed its actual preview and downloadable plain text", async ({
  page,
}) => {
  await page.goto(visit("artifact-panel"));
  const source = page.getByRole("textbox", { name: "Field notes content" });
  await source.fill("# A new note\n\nWritten here.");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A new note" })).toBeVisible();
  await page.getByRole("button", { name: "Save artifact" }).click();
  await expect(page.getByRole("status").last()).toContainText(
    "Local copy saved",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("field-notes.md");
  await expect(download.failure()).resolves.toBeNull();
});

test("checkpoint confirmation restores real state and cancellation preserves it", async ({
  page,
}) => {
  await page.goto(visit("checkpoint"));
  const title = page.getByRole("textbox", { name: "Working title" });
  await title.fill("A final draft");
  await page.getByRole("button", { name: "Save checkpoint" }).click();
  const first = page.locator(".mingu-collection-ai-checkpoint").first();
  await first.getByRole("button", { name: "Restore", exact: true }).click();
  await first.getByRole("button", { name: "Keep current state" }).click();
  await expect(title).toHaveValue("A final draft");
  await first.getByRole("button", { name: "Restore", exact: true }).click();
  await first.getByRole("button", { name: "Confirm restore" }).click();
  await expect(title).toHaveValue("A small idea");
  await expect(first).toHaveAttribute("data-current", "true");
});

test("composer model chevron stays centered across fonts and narrow viewports", async ({
  page,
}) => {
  await page.goto(visit("prompt-composer"));
  const trigger = page.getByRole("button", { name: "Model: Swift" });
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 850 });
    for (const font of ["system-ui", "serif", '"Segoe UI", sans-serif']) {
      await trigger.evaluate((element, font) => {
        element.style.fontFamily = font;
      }, font);
      const geometry = await trigger.evaluate((button) => {
        const icon = button.querySelector("svg")!,
          outer = button.getBoundingClientRect(),
          box = icon.getBoundingClientRect();
        return {
          offset: box.y + box.height / 2 - outer.y - outer.height / 2,
          width: box.width,
          height: box.height,
          shrink: getComputedStyle(icon).flexShrink,
        };
      });
      expect(Math.abs(geometry.offset)).toBeLessThan(0.6);
      expect(geometry.width).toBe(geometry.height);
      expect(geometry.shrink).toBe("0");
    }
  }
  await trigger.click();
  await expect(
    page.getByRole("combobox", { name: "Search models" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("model selector searches names and providers, skips disabled and returns focus", async ({
  page,
}) => {
  await page.goto(visit("model-selector"));
  const trigger = page.getByRole("button", { name: "Model: Studio" });
  await trigger.click();
  const search = page.getByRole("combobox", { name: "Search models" });
  await expect(search).toBeFocused();
  await search.fill("Workshop");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(page.getByRole("option", { name: /Offline/ })).toBeDisabled();
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(page.getByTestId("selected-model")).toHaveText(
    "Selected model: Deep",
  );
  await expect(page.getByRole("button", { name: "Model: Deep" })).toBeFocused();
  await page.getByRole("button", { name: "Model: Deep" }).click();
  await search.fill("does-not-exist");
  await expect(page.getByRole("status")).toContainText("No models match");
  await search.press("Escape");
  await expect(page.getByRole("button", { name: "Model: Deep" })).toBeFocused();
});

test("voice input stays usable without a speech API and never starts on mount", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechRecognition", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto(visit("voice-input"));
  await expect(
    page.getByRole("button", { name: "Start speaking" }),
  ).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("unavailable");
  await page
    .getByRole("textbox", { name: "Transcript" })
    .fill("Typed without a microphone.");
  await expect(page.getByRole("textbox", { name: "Transcript" })).toHaveValue(
    "Typed without a microphone.",
  );
});

test("voice API mock requires explicit action and handles permission denial without real mic access", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.__speechStarts = 0;
    class MockRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onerror: any;
      onend: any;
      onstart: any;
      onresult: any;
      start() {
        w.__speechStarts++;
        queueMicrotask(() => {
          this.onerror?.({ error: "not-allowed" });
          this.onend?.();
        });
      }
      stop() {
        this.onend?.();
      }
      abort() {
        w.__speechAborted = true;
      }
    }
    Object.defineProperty(window, "SpeechRecognition", {
      value: MockRecognition,
      configurable: true,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto(visit("voice-input"));
  expect(await page.evaluate(() => (window as any).__speechStarts)).toBe(0);
  await page.getByRole("button", { name: "Start speaking" }).click();
  await expect(page.getByRole("alert")).toContainText("permission was denied");
  expect(await page.evaluate(() => (window as any).__speechStarts)).toBe(1);
  await page
    .getByRole("textbox", { name: "Transcript" })
    .fill("The fallback still works.");
});

test("streaming terminal appends data, pauses following, searches safely and clears", async ({
  page,
}) => {
  await page.goto(visit("streaming-terminal"));
  await page.getByRole("button", { name: "Append 25 lines" }).click();
  await expect(page.locator(".mingu-collection-ai-terminal-line")).toHaveCount(
    27,
  );
  const log = page.getByRole("log");
  await expect
    .poll(() =>
      log.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop),
    )
    .toBeLessThan(2);
  await page.getByRole("button", { name: "Pause follow" }).click();
  await log.evaluate((el) => (el.scrollTop = 0));
  await page
    .getByRole("textbox", { name: "Next log line" })
    .fill("<script>window.__unsafe=true</script>\u001b[31m red");
  await page.getByRole("button", { name: "Append line", exact: true }).click();
  expect(await log.evaluate((el) => el.scrollTop)).toBe(0);
  await page.getByRole("textbox", { name: "Search logs" }).fill("script");
  await expect(page.locator(".mingu-collection-ai-terminal-line")).toHaveCount(
    1,
  );
  await expect(log).toContainText("<script>window.__unsafe=true</script> red");
  expect(await page.evaluate(() => (window as any).__unsafe)).toBeUndefined();
  await expect(log.locator("script")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear logs" }).click();
  await expect(page.locator(".mingu-collection-ai-terminal-line")).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Copy logs" })).toBeDisabled();
});

test("speech errors without end events dispose the session and permit an explicit retry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.__speechInstances = [];
    class MockRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onerror: any;
      onend: any;
      onstart: any;
      onresult: any;
      aborts = 0;
      constructor() {
        w.__speechInstances.push(this);
      }
      start() {
        this.onstart?.();
      }
      stop() {}
      abort() {
        this.aborts++;
      }
    }
    Object.defineProperty(window, "SpeechRecognition", {
      value: MockRecognition,
      configurable: true,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto(visit("voice-input"));
  await page.getByRole("button", { name: "Start speaking" }).click();
  await page.evaluate(() =>
    (window as any).__speechInstances[0].onerror({ error: "network" }),
  );
  await expect(page.getByRole("alert")).toContainText("network");
  expect(
    await page.evaluate(() => {
      const r = (window as any).__speechInstances[0];
      return [r.aborts, r.onerror, r.onend, r.onresult, r.onstart];
    }),
  ).toEqual([1, null, null, null, null]);
  await page.getByRole("button", { name: "Start speaking" }).click();
  await expect(page.getByText("Listening…", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => (window as any).__speechInstances.length),
  ).toBe(2);
});

test("speech mock aborts and detaches on hidden, disabled and unmounted states without restarting", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.__speechInstances = [];
    class MockRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onerror: any;
      onend: any;
      onstart: any;
      onresult: any;
      aborts = 0;
      constructor() {
        w.__speechInstances.push(this);
      }
      start() {
        this.onstart?.();
      }
      stop() {}
      abort() {
        this.aborts++;
      }
    }
    Object.defineProperty(window, "SpeechRecognition", {
      value: MockRecognition,
      configurable: true,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto(visit("voice-input"));
  await page.getByRole("button", { name: "Start speaking" }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Start speaking" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => (window as any).__speechInstances[0].aborts),
  ).toBe(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(
    await page.evaluate(() => (window as any).__speechInstances.length),
  ).toBe(1);
  await page.getByRole("button", { name: "Start speaking" }).click();
  await page.getByText("Disable voice input", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start speaking" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() => (window as any).__speechInstances[1].aborts),
  ).toBe(1);
  await page.getByText("Disable voice input", { exact: true }).click();
  expect(
    await page.evaluate(() => (window as any).__speechInstances.length),
  ).toBe(2);
  await page.getByRole("button", { name: "Start speaking" }).click();
  await page.getByRole("button", { name: "Hide voice input" }).click();
  await expect(page.getByRole("textbox", { name: "Transcript" })).toHaveCount(
    0,
  );
  expect(
    await page.evaluate(() => {
      const r = (window as any).__speechInstances[2];
      return [r.aborts, r.onerror, r.onend, r.onresult, r.onstart];
    }),
  ).toEqual([1, null, null, null, null]);
  await page.getByRole("button", { name: "Show voice input" }).click();
  expect(
    await page.evaluate(() => (window as any).__speechInstances.length),
  ).toBe(3);
  await expect(
    page.getByRole("button", { name: "Start speaking" }),
  ).toBeEnabled();
});

test("all ten AI previews fit a 254px host on a 320px mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  const ids = [
    "prompt-composer",
    "tool-execution-panel",
    "plan-review",
    "approval-card",
    "context-usage-meter",
    "artifact-panel",
    "checkpoint",
    "model-selector",
    "voice-input",
    "streaming-terminal",
  ];
  for (const id of ids) {
    await page.goto(visit(id));
    const host = page.locator("main");
    await host.evaluate((el) => {
      el.style.width = "254px";
      el.style.padding = "0";
      el.style.minWidth = "0";
    });
    await expect(
      page.locator('[class*="mingu-collection-ai-"]').first(),
    ).toBeVisible();
    const geometry = await host.evaluate((el) => ({
      host: el.clientWidth,
      content: el.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(geometry.host, id).toBe(254);
    expect(
      geometry.content,
      `${id} overflows its narrow host`,
    ).toBeLessThanOrEqual(255);
    expect(
      geometry.document,
      `${id} overflows the viewport`,
    ).toBeLessThanOrEqual(geometry.viewport);
  }
});
