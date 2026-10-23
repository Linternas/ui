import { test, expect } from "@playwright/test";
const visit = (id: string) => `/?collection=media&id=${id}`;

test("split flap keeps one accessible message and supports edited content", async ({
  page,
}) => {
  await page.goto(visit("split-flap-display"));
  const display = page.getByRole("group", { name: "Split flap display" });
  await expect(display).toContainText("MAKE ROOM");
  await page.getByRole("textbox", { name: "Display text" }).fill("HELLO");
  await expect(display.locator(".mingu-flap-cell")).toHaveCount(5);
  await expect(display.locator(".mingu-visually-hidden")).toHaveText("HELLO");
  await page.getByRole("button", { name: "Flip again" }).click();
  await expect(display.locator(".mingu-flap-cell")).toHaveCount(5);
  await page.getByRole("textbox", { name: "Display text" }).fill("");
  await expect(display).toContainText("Empty display");
});

test("proximity type responds to keyboard and resets without losing readable text", async ({
  page,
}) => {
  await page.goto(visit("variable-font-proximity"));
  const type = page.getByRole("group", { name: "Proximity typography" });
  await type.focus();
  await type.press("Home");
  await expect
    .poll(() =>
      type
        .locator(".mingu-proximity-letters > span")
        .first()
        .evaluate((el) => Number((el as HTMLElement).style.fontWeight)),
    )
    .toBeGreaterThan(800);
  await type.press("Escape");
  await expect(
    type.locator(".mingu-proximity-letters > span").first(),
  ).toHaveCSS("font-weight", "350");
  await expect(type.locator(".mingu-visually-hidden").first()).toHaveText(
    "A little closer.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await type.focus();
  await type.press("End");
  const weights = await type
    .locator(".mingu-proximity-letters > span")
    .evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).style.fontWeight),
    );
  expect(weights.every((weight) => weight === "350")).toBe(true);
});

test("vertical reel reaches distant frames and follows native scroll", async ({
  page,
}) => {
  await page.goto(visit("vertical-reel"));
  const scroll = page.getByLabel("Scroll through reel", { exact: true });
  await scroll.focus();
  await scroll.press("End");
  await expect(page.getByRole("status")).toHaveText("3 / 3");
  await expect
    .poll(() =>
      scroll.evaluate((el) => Math.abs(el.scrollTop - el.clientHeight * 2)),
    )
    .toBeLessThan(2);
  await expect(page.getByRole("button", { name: "Next reel" })).toBeDisabled();
  await scroll.evaluate((el) => el.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.getByRole("status")).toHaveText("1 / 3");
  await page.getByRole("button", { name: "Next reel" }).click();
  await expect(page.getByRole("status")).toHaveText("2 / 3");
});

test("stories advance only after opt-in, pause on hover and respect reduced motion", async ({
  page,
}) => {
  await page.goto(visit("story-viewer"));
  await expect(page.getByRole("status")).toContainText("Manual navigation");
  await page.getByRole("button", { name: "Next story" }).click();
  await expect(page.getByRole("status")).toContainText("Story 2 of 3");
  await page.clock.install();
  await page.getByRole("button", { name: "Play stories" }).click();
  await page.clock.runFor(5200);
  await expect(page.getByRole("status")).toContainText("Story 3 of 3");
  await page.locator(".mingu-story-frame").hover();
  await page.clock.runFor(6000);
  await expect(page.getByRole("status")).toContainText("Paused while hovering");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Pause stories" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Story 1: Take the long way home." })
    .click();
  await expect(page.getByRole("status")).toContainText("Story 1 of 3");
});

test("video accepts a real local recording, plays, changes native controls and clears its source", async ({
  page,
}) => {
  await page.goto(visit("video-player"));
  await expect(page.getByRole("button", { name: "Play video" })).toBeDisabled();
  const recording = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const context = canvas.getContext("2d")!,
      stream = canvas.captureStream(12),
      recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      }),
      chunks: Blob[] = [];
    const done = new Promise<Blob>((resolve) => {
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });
    recorder.start();
    let frame = 0;
    const timer = setInterval(() => {
      context.fillStyle = frame++ % 2 ? "#447788" : "#bb9966";
      context.fillRect(0, 0, 160, 90);
    }, 60);
    await new Promise((resolve) => setTimeout(resolve, 900));
    recorder.stop();
    clearInterval(timer);
    stream.getTracks().forEach((track) => track.stop());
    const blob = await done;
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await page.getByLabel("Choose a video", { exact: true }).setInputFiles({
    name: "sample.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(recording),
  });
  await expect(page.getByRole("button", { name: "Play video" })).toBeEnabled();
  await page.getByRole("button", { name: "Play video" }).click();
  await expect
    .poll(() => page.locator("video").evaluate((node) => node.currentTime))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Mute video" }).click();
  await expect
    .poll(() => page.locator("video").evaluate((node) => node.muted))
    .toBe(true);
  await page
    .getByRole("combobox", { name: "Playback speed" })
    .selectOption("0.5");
  await expect
    .poll(() => page.locator("video").evaluate((node) => node.playbackRate))
    .toBe(0.5);
  await page.getByRole("button", { name: "Clear selected file" }).click();
  await expect(page.getByRole("button", { name: "Play video" })).toBeDisabled();
  await expect(page.locator("video")).not.toHaveAttribute("src");
});

test("video surfaces an unsupported local source rather than reporting playback", async ({
  page,
}) => {
  await page.goto(visit("video-player"));
  await page.getByLabel("Choose a video", { exact: true }).setInputFiles({
    name: "bad.mp4",
    mimeType: "video/mp4",
    buffer: Buffer.from("not a movie"),
  });
  await expect(page.getByRole("alert")).toContainText("could not be loaded");
});

test("image crop produces bounded real PNG pixels and revokes obsolete results", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = URL.revokeObjectURL.bind(URL);
    (window as any).__revokedMedia = [];
    URL.revokeObjectURL = (url) => {
      (window as any).__revokedMedia.push(url);
      original(url);
    };
  });
  await page.goto(visit("image-cropper"));
  await expect(page.getByRole("button", { name: "Export crop" })).toBeEnabled();
  await page.getByRole("slider", { name: "Crop horizontal position" }).focus();
  await page.keyboard.press("Home");
  await page.getByRole("button", { name: "Export crop" }).click();
  const link = page.getByRole("link", { name: "Download crop.png" });
  await expect(link).toBeVisible();
  const exported = await link.getAttribute("href");
  const result = await page.evaluate(async (url) => {
    const blob = await fetch(url!).then((response) => response.blob()),
      bitmap = await createImageBitmap(blob);
    return {
      type: blob.type,
      width: bitmap.width,
      height: bitmap.height,
      bytes: blob.size,
    };
  }, exported);
  expect(result.type).toBe("image/png");
  expect(result.width).toBeGreaterThan(100);
  expect(result.width).toBe(result.height);
  expect(result.bytes).toBeGreaterThan(1000);
  await page.getByRole("button", { name: "Resize crop" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(link).not.toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        (url) => (window as any).__revokedMedia.includes(url),
        exported,
      ),
    )
    .toBe(true);
  await page
    .getByRole("combobox", { name: "Aspect ratio" })
    .selectOption("1.5");
  await page.getByRole("button", { name: "Export crop" }).click();
  await expect(link).toBeVisible();
  const ratio = await link.evaluate(async (element) => {
    const image = await createImageBitmap(
      await fetch((element as HTMLAnchorElement).href).then((response) =>
        response.blob(),
      ),
    );
    return image.width / image.height;
  });
  expect(ratio).toBeCloseTo(1.5, 1);
});

test("calendar edits actual UTC dates and preserves keyboard day navigation", async ({
  page,
}) => {
  await page.goto(visit("calendar-board"));
  const day = page.getByRole("button", {
    name: "2026-10-23, 1 events",
    exact: true,
  });
  await day.focus();
  await day.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "2026-10-24", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("textbox", { name: "New event", exact: true })
    .fill("Lunch outside");
  await page.getByRole("button", { name: "Add event", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Event title", exact: true }),
  ).toHaveValue("Lunch outside");
  await page
    .getByLabel("Date for Lunch outside", { exact: true })
    .fill("2026-10-27");
  await expect(page.getByText("No events on this day.")).toBeVisible();
  await page
    .getByRole("button", { name: "2026-10-27, 1 events", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Event title", exact: true }),
  ).toHaveValue("Lunch outside");
  await page
    .getByRole("button", { name: "Remove Lunch outside", exact: true })
    .click();
  await expect(page.getByText("No events on this day.")).toBeVisible();
  await page.getByRole("button", { name: "Next month", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "November 2026" }),
  ).toBeVisible();
});

test("Gantt move and resize change task dates with keyboard and bounded drag", async ({
  page,
}) => {
  await page.goto(visit("gantt-timeline"));
  await page.getByRole("button", { name: "Move Explore", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await page.getByText("Edit task dates", { exact: true }).click();
  await expect(
    page.getByLabel("Start of Explore", { exact: true }),
  ).toHaveValue("2026-10-20");
  await expect(page.getByLabel("End of Explore", { exact: true })).toHaveValue(
    "2026-10-24",
  );
  await page
    .getByRole("button", { name: "Resize Explore", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("End of Explore", { exact: true })).toHaveValue(
    "2026-10-25",
  );
  await page.getByRole("button", { name: "Move Explore", exact: true }).focus();
  await page.keyboard.press("Shift+ArrowLeft");
  await expect(
    page.getByLabel("Start of Explore", { exact: true }),
  ).toHaveValue("2026-10-19");
  const handle = page.getByRole("button", {
      name: "Move Explore",
      exact: true,
    }),
    box = await handle.boundingBox();
  await page.mouse.move(box!.x + 20, box!.y + 22);
  await page.mouse.down();
  await page.mouse.move(box!.x + 80, box!.y + 22, { steps: 5 });
  await page.mouse.up();
  await expect(
    page.getByLabel("Start of Explore", { exact: true }),
  ).not.toHaveValue("2026-10-19");
});

test("Kanban keyboard, mobile select, reorder and add all update the same cards", async ({
  page,
}) => {
  await page.goto(visit("kanban-board"));
  const ideas = page.getByRole("region", { name: "Ideas", exact: true }),
    making = page.getByRole("region", { name: "Making", exact: true }),
    ready = page.getByRole("region", { name: "Ready", exact: true });
  const move = page.getByRole("button", {
    name: "Move A small idea",
    exact: true,
  });
  await move.focus();
  await move.press("ArrowRight");
  await expect(
    making.getByRole("button", { name: "Move A small idea", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Column for A small idea", exact: true })
    .selectOption("ready");
  await expect(
    ready.getByRole("button", { name: "Move A small idea", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "New card", exact: true })
    .fill("Ship it gently");
  await page.getByRole("button", { name: "Add card", exact: true }).click();
  const added = ideas.getByRole("button", {
    name: "Move Ship it gently",
    exact: true,
  });
  await added.focus();
  await added.press("Home");
  await expect(
    ideas.locator(".mingu-kanban-grip").first(),
  ).toHaveAccessibleName("Move Ship it gently");
  await page
    .getByRole("button", { name: "Remove Ship it gently", exact: true })
    .click();
  await expect(added).not.toBeVisible();
});

test("file tree supports expansion, roving keys, typeahead, selection and disabled items", async ({
  page,
}) => {
  await page.goto(visit("file-tree"));
  const src = page.getByRole("treeitem", { name: "src", exact: true });
  await src.focus();
  await src.press("ArrowRight");
  await expect(
    page.getByRole("treeitem", { name: "components", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("treeitem", { name: "Button.tsx", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Button.tsx");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("treeitem", { name: "components", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("treeitem", { name: "Button.tsx", exact: true }),
  ).not.toBeVisible();
  await page.keyboard.press("d");
  await expect(
    page.getByRole("treeitem", { name: "docs", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("treeitem", { name: "README.md", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("treeitem", { name: "private.env", exact: true }),
  ).toBeDisabled();
});

test("all ten media demos fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  for (const id of [
    "split-flap-display",
    "variable-font-proximity",
    "vertical-reel",
    "story-viewer",
    "video-player",
    "image-cropper",
    "calendar-board",
    "gantt-timeline",
    "kanban-board",
    "file-tree",
  ]) {
    await page.goto(visit(id));
    await expect(page.locator(".ui-media-demo")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
      id,
    ).toBeLessThanOrEqual(1);
  }
});

// This harness uses the published components, with actual server-style markup
// present and native metadata loaded before React attaches its event handlers.
async function mediaReviewHarness(page: import("@playwright/test").Page) {
  const { build } = await import("esbuild");
  const result = await build({
    stdin: {
      resolveDir: process.cwd(),
      loader: "tsx",
      contents: `
      import * as React from 'react';
      import {createRoot,hydrateRoot} from 'react-dom/client';
      import {renderToString} from 'react-dom/server';
      import {DesignSystemProvider} from './src/system/base';
      import {VideoPlayer,ImageCropper} from './src/collections/media';
      const surface=()=>{const root=document.createElement('div');root.style.cssText='width:min(600px,calc(100vw - 32px));margin:16px auto';document.body.append(root);return root;};
      window.__mountCachedVideo=async src=>{const root=surface(),content=<DesignSystemProvider theme="light"><VideoPlayer src={src}/></DesignSystemProvider>;root.innerHTML=renderToString(content);const video=root.querySelector('video');await new Promise((resolve,reject)=>{if(video.readyState>=1)resolve();else{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',()=>reject(Error('Invalid test recording')),{once:true});}});window.__cachedVideo=video;window.__cachedDuration=video.duration;hydrateRoot(root,content);};
      window.__mountCrop=src=>{const root=surface();window.__cropChanges=[];createRoot(root).render(<DesignSystemProvider theme="light"><ImageCropper src={src} alt="Pointer crop regression" onCropChange={value=>window.__cropChanges.push(value)}/></DesignSystemProvider>);};
    `,
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  await page.route("**/media-review", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"></head><body></body></html>',
    }),
  );
  await page.goto("/media-review");
  await page.addScriptTag({ content: result.outputFiles[0].text });
}

async function finiteRecording(page: import("@playwright/test").Page) {
  return page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const context = canvas.getContext("2d")!,
      stream = canvas.captureStream(10),
      recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      }),
      chunks: Blob[] = [];
    const done = new Promise<Blob>((resolve) => {
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });
    recorder.start();
    const timer = setInterval(() => {
      context.fillStyle = "#446688";
      context.fillRect(0, 0, 160, 90);
    }, 60);
    await new Promise((resolve) => setTimeout(resolve, 500));
    recorder.stop();
    clearInterval(timer);
    stream.getTracks().forEach((track) => track.stop());
    const bytes = new Uint8Array(await (await done).arrayBuffer());
    // MediaRecorder writes a live WebM header. Add a real Duration element to
    // Segment Info so this short local video has finite, seekable metadata.
    const marker = [0x15, 0x49, 0xa9, 0x66];
    let offset = -1;
    for (let i = 0; i < bytes.length - 4; i++)
      if (marker.every((value, j) => bytes[i + j] === value)) {
        offset = i + 4;
        break;
      }
    if (offset < 0) throw Error("Missing WebM Segment Info");
    let width = 1,
      mask = 0x80;
    while (!(bytes[offset] & mask)) {
      width++;
      mask >>= 1;
    }
    let length = bytes[offset] & (mask - 1);
    for (let i = 1; i < width; i++) length = length * 256 + bytes[offset + i];
    const duration = new Uint8Array(11);
    duration.set([0x44, 0x89, 0x88]);
    new DataView(duration.buffer).setFloat64(3, 1000, false);
    const nextLength = length + duration.length;
    let nextWidth = width;
    while (nextLength >= 2 ** (7 * nextWidth) - 1) nextWidth++;
    const size = new Uint8Array(nextWidth);
    let encoded = BigInt(nextLength) | (1n << BigInt(7 * nextWidth));
    for (let i = nextWidth - 1; i >= 0; i--) {
      size[i] = Number(encoded & 255n);
      encoded >>= 8n;
    }
    const output = new Uint8Array(
      bytes.length + duration.length + nextWidth - width,
    );
    let at = 0;
    for (const chunk of [
      bytes.slice(0, offset),
      size,
      bytes.slice(offset + width, offset + width + length),
      duration,
      bytes.slice(offset + width + length),
    ]) {
      output.set(chunk, at);
      at += chunk.length;
    }
    return URL.createObjectURL(new Blob([output], { type: "video/webm" }));
  });
}

test("video recovers metadata that loaded before hydration without replacing the native node", async ({
  page,
}) => {
  await mediaReviewHarness(page);
  const url = await finiteRecording(page);
  await page.evaluate((src) => (window as any).__mountCachedVideo(src), url);
  expect(
    await page.evaluate(() =>
      Number.isFinite((window as any).__cachedDuration),
    ),
  ).toBe(true);
  await expect(
    page.getByRole("slider", { name: "Seek video", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => (window as any).__cachedVideo === document.querySelector("video"),
    ),
  ).toBe(true);
  await expect(
    page.locator(".mingu-video-player .mingu-media-status"),
  ).toHaveText("Ready to play.");
  await page.evaluate((src) => URL.revokeObjectURL(src), url);
});

test("one resize pointer move emits exactly one crop callback", async ({
  page,
}) => {
  await mediaReviewHarness(page);
  // Inline, same-document image keeps this pointer test independent of CORS.
  const svg =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#557788"/></svg>',
    );
  await page.evaluate((src) => (window as any).__mountCrop(src), svg);
  const resize = page.getByRole("button", { name: "Resize crop", exact: true });
  await expect(resize).toBeVisible();
  const box = await resize.boundingBox();
  await page.mouse.move(box!.x + 22, box!.y + 22);
  await page.mouse.down();
  const before = await page.evaluate(
    () => (window as any).__cropChanges.length,
  );
  await page.mouse.move(box!.x + 10, box!.y + 10);
  await expect
    .poll(() =>
      page.evaluate(
        (previous) => (window as any).__cropChanges.length - previous,
        before,
      ),
    )
    .toBe(1);
  await page.mouse.up();
});
