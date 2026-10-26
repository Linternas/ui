import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
const root = fileURLToPath(new URL("../", import.meta.url));
test("strict Native consumer compiles declarations and full example without DOM or web entry", async () => {
  const pkg = JSON.parse(readFileSync(root + "package.json", "utf8"));
  for (const name of [
    "react-native",
    "react-native-safe-area-context",
    "@react-native-community/datetimepicker",
    "@react-native-community/slider",
  ]) {
    assert(pkg.peerDependencies[name]);
    assert.equal(pkg.peerDependenciesMeta[name].optional, true);
  }
  const dir = mkdtempSync(root + "tests/.consumer-native-");
  try {
    writeFileSync(
      dir + "/App.tsx",
      readFileSync(root + "examples/native/App.tsx"),
    );
    writeFileSync(
      dir + "/types.tsx",
      `import {Button,TextField,DatePicker,Slider,Select,NativeProvider} from '@mingu/interaction-ui/native';
 import {tokens,getColors} from '@mingu/interaction-ui/tokens';
 const forms=<NativeProvider><TextField label="Name" onChangeText={v=>v.toUpperCase()}/><DatePicker label="Date" onValueChange={v=>v.toISOString()}/><Slider label="Volume" onValueChange={v=>v.toFixed()}/><Select label="Plan" options={[]} onValueChange={v=>v.toUpperCase()}/></NativeProvider>;
 const color:string=getColors('dark').text;const space:number=tokens.space[4];
 // @ts-expect-error Native action variants remain constrained
 const invalid=<Button variant="invented">Save</Button>;
 export {forms,color,space,invalid};`,
    );
    writeFileSync(
      dir + "/tsconfig.json",
      JSON.stringify({
        compilerOptions: {
          target: "ES2023",
          lib: ["ES2023"],
          types: ["react-native"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          noUncheckedIndexedAccess: true,
          exactOptionalPropertyTypes: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ["*.tsx"],
      }),
    );
    const tsc = root + "node_modules/typescript/bin/tsc";
    execFileSync(process.execPath, [tsc, "-p", dir + "/tsconfig.json"], {
      stdio: "inherit",
      cwd: root,
    });
    const files = execFileSync(
      process.execPath,
      [tsc, "-p", dir + "/tsconfig.json", "--listFilesOnly"],
      { encoding: "utf8", cwd: root },
    );
    assert.match(files, /dist\/types\/platforms\/native\/src\/index.d.ts/);
    assert.doesNotMatch(files, /typescript\/lib\/lib.dom.d.ts/);
    assert.doesNotMatch(files, new RegExp(root + "packages/native/src"));
    assert.doesNotMatch(files, /dist\/types\/index.d.ts/);
    // Resolve the explicit entry and only externalize native platform dependencies.
    const graph = await build({
      entryPoints: ["packages/native/src/index.ts"],
      absWorkingDir: root,
      bundle: true,
      write: false,
      metafile: true,
      platform: "neutral",
      packages: "external",
      jsx: "automatic",
      logLevel: "silent",
    });
    const inputs = Object.keys(graph.metafile.inputs);
    assert(inputs.some((p) => p.includes("packages/tokens")));
    assert(!inputs.some((p) => p.startsWith("src/") || p.endsWith(".css")));
    assert(
      !graph.outputFiles[0].text.match(
        /from ["']react-dom|document\.|window\.|HTML[A-Z]/,
      ),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
