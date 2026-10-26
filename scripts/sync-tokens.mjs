import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
const { outputFiles } = await build({
  entryPoints: ["packages/tokens/src/index.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
});
const { tokens } = await import(
  "data:text/javascript;base64," +
    Buffer.from(outputFiles[0].text).toString("base64")
);
const file = new URL("../tokens.css", import.meta.url),
  original = await readFile(file, "utf8");
let output = original;
const replace = (name, value) => {
  output = output.replace(
    new RegExp(`(--mingu-${name}:\\s*)[^;]+;`, "g"),
    (_, prefix) => prefix + value + ";",
  );
};
for (const [key, n] of Object.entries(tokens.space))
  replace("space-" + key, n / 16 + "rem");
for (const [key, n] of Object.entries(tokens.radii))
  replace("radius-" + key, n + "px");
for (const [key, n] of Object.entries(tokens.fontSizes))
  if (key !== "2xl") replace("text-" + key, n / 16 + "rem");
for (const [key, value] of Object.entries(tokens.control)) {
  replace("control-height-" + key, value.height + "px");
  replace("control-padding-" + key, value.padding + "px");
}
// Reduced-motion duration overrides remain authored in CSS.
for (const [key, value] of Object.entries(tokens.motion))
  output = output.replace(
    new RegExp(`(--mingu-duration-${key}:\\s*)[1-9][0-9]*ms;`),
    (_, prefix) => prefix + value + "ms;",
  );
const palette = (selector, mode) => {
  output = output.replace(
    selector,
    (full, prefix, body, end) =>
      prefix +
      body.replace(
        /(--mingu-([\w-]+):\s*)[^;]+;/g,
        (declaration, start, key) =>
          Object.hasOwn(tokens[mode], key)
            ? start + tokens[mode][key] + ";"
            : declaration,
      ) +
      end,
  );
};
palette(/(:root,\s*\[data-mingu-theme="light"\]\s*\{)([^}]*)(\})/, "light");
palette(/(\.dark,\s*\[data-mingu-theme="dark"\]\s*\{)([^}]*)(\})/, "dark");
for (const mode of ["dark", "light"])
  palette(
    new RegExp(
      `(@media \\(prefers-color-scheme: ${mode}\\)\\s*\\{\\s*\\[data-mingu-theme="system"\\]\\s*\\{)([^}]*)(\\})`,
    ),
    mode,
  );
if (process.argv.includes("--check")) {
  if (output !== original)
    throw Error(
      "Shared tokens differ from tokens.css; run npm run tokens:sync.",
    );
  console.log("Web / Native token parity PASS");
} else {
  await writeFile(file, output);
  console.log("tokens.css synced from packages/tokens/src/index.ts");
}
