import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import ts from "typescript";

const glyph = /[✓✔✅✕✖←→↑↓↗↘↖‹›⌄⠿⋮◌⋯↥↵❞⚙▧◴▤☺−]/;
function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sources(join(directory, entry.name))
      : /\.(tsx|css)$/.test(entry.name)
        ? [join(directory, entry.name)]
        : [],
  );
}

test("library and shipped previews do not render font glyphs as control icons", () => {
  const failures: string[] = [];
  for (const directory of [
    "src",
    "packages/native/src",
    "docs/src",
    "examples/native",
  ]) {
    for (const file of sources(resolve(directory))) {
      if (file.endsWith(".css")) {
        const content = /(?:^|[;{])\s*content\s*:\s*["']([^"']*)["']/g;
        for (const match of readFileSync(file, "utf8").matchAll(content)) {
          if (glyph.test(match[1]) || /^[+×]$/.test(match[1]))
            failures.push(file);
        }
        continue;
      }
      const source = ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const inspect = (node: ts.Node) => {
        if (
          ts.isJsxText(node) &&
          (glyph.test(node.text) ||
            (node.text.includes("×") &&
              !/\d\s*×\s*\d/.test(node.text) &&
              !/\{speed\}/.test(node.parent.getText(source)) &&
              !(
                ts.isJsxElement(node.parent) &&
                node.parent.openingElement.tagName.getText(source) === "option"
              )))
        )
          failures.push(
            `${file}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}`,
          );
        if (ts.isStringLiteral(node) && glyph.test(node.text)) {
          let parent: ts.Node | undefined = node.parent;
          while (
            parent &&
            !ts.isFunctionLike(parent) &&
            !ts.isSourceFile(parent)
          ) {
            if (ts.isJsxExpression(parent) || ts.isJsxAttribute(parent)) {
              failures.push(
                `${file}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}`,
              );
              break;
            }
            parent = parent.parent;
          }
        }
        ts.forEachChild(node, inspect);
      };
      inspect(source);
    }
  }
  expect(failures).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`selection, completion and copy use SVG while retaining accessible actions at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // The visible check in a completed Stepper is decorative; its title stays readable.
    await page.goto("/?collection&id=stepper");
    await page
      .getByLabel("Project name", { exact: true })
      .fill("Vector checks");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const step = page.locator(".mingu-stepper nav button").first();
    await expect(step.locator("svg")).toHaveCount(1);
    const marker = step.locator(":scope > span");
    const bounds = await marker.boundingBox();
    expect(bounds).not.toBeNull();
    expect(Math.abs(bounds!.width - bounds!.height)).toBeLessThanOrEqual(1);
    expect(bounds!.width).toBeGreaterThanOrEqual(24);
    expect(
      (await step.locator("svg").boundingBox())!.width,
    ).toBeGreaterThanOrEqual(16);
    await expect(step).not.toContainText("✓");
    await expect(step).not.toHaveAccessibleName("");
    await page.goto("/docs/model-selector");
    await page
      .getByRole("button", { name: "Model: Studio", exact: true })
      .click();
    const selected = page
      .getByRole("listbox")
      .getByRole("option", { selected: true });
    expect(
      (await selected.locator("svg").boundingBox())!.width,
    ).toBeGreaterThanOrEqual(18);
    const close = page
      .getByRole("dialog")
      .getByRole("button", { name: "Close dialog", exact: true });
    expect(
      (await close.locator("svg").boundingBox())!.width,
    ).toBeGreaterThanOrEqual(20);
    await close.click();
    await page.goto("/");
    const copy = page
      .getByRole("button", { name: "Copy code", exact: true })
      .first();
    await copy.click();
    await expect(copy).toContainText("Copied");
    await expect(copy.locator("svg")).toHaveCount(1);
    await expect(copy.locator("svg")).toHaveAttribute("aria-hidden", "true");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });
}
