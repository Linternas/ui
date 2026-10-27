import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

test("public exports retain typed props without inheriting stricter consumer compiler flags", () => {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const fixture = mkdtempSync(join(root, "tests", ".consumer-"));
  const tsc = join(root, "node_modules/typescript/bin/tsc");
  try {
    writeFileSync(
      join(fixture, "consumer.tsx"),
      `
import {DateRangePicker,TimePicker,RangeSlider,TreeSelect,Cascader,MentionInput,Stepper,FilterBuilder,ColumnManager,SchedulePicker,DraggableWindow,NotificationInbox,FlipCard,MazeRunner,ConfettiBurst,VectorField,ReactionDiffusion,TerrainMesh,PendulumWave,ClipPathEditor,ContrastChecker,ShadowEditor,ModelSelector,FileDropzone,MultiSelect,TransferList,Rating,UndoHistory,GradientEditor,PixelEditor,ScratchCard,CircularDial,NotificationBell} from '@mingu/interaction-ui';
import {Button,Input,Dialog,DesignSystemProvider,InteractionProvider,useMotionSettings,type MotionPreference} from '@mingu/interaction-ui/system';
import {uiCatalog} from '@mingu/interaction-ui/catalog';
const models=[{id:'local:test',name:'Test',provider:'Local'}];
const picker=<ModelSelector models={models} labels={{search:'모델 검색'}} onValueChange={id=>id.toUpperCase()}/>;
const upload=<FileDropzone label="Upload" maxSize={Infinity} onFilesChange={files=>files[0]?.name}/>;
const creative=<>
 <MultiSelect options={[{value:'react',label:'React'}]} onValueChange={values=>values[0]?.toUpperCase()}/>
 <TransferList options={[]} onValueChange={values=>values[0]?.toUpperCase()}/>
 <Rating onValueChange={value=>value.toFixed(0)}/>
 <UndoHistory entries={[]} value="" onValueChange={id=>id.toUpperCase()}/>
 <GradientEditor onValueChange={gradient=>gradient.stops[0]?.color}/>
 <PixelEditor onValueChange={pixels=>pixels[0]?.toUpperCase()}/>
 <ScratchCard><strong>Surprise</strong></ScratchCard>
 <CircularDial onValueChange={value=>value.toFixed(2)}/>
 </>;
const additions=<>
<DateRangePicker onValueChange={v=>v.start.toUpperCase()}/><TimePicker onValueChange={v=>v.toUpperCase()}/><RangeSlider onValueChange={v=>v[0].toFixed()}/>
<TreeSelect nodes={[]} onValueChange={v=>v[0]?.toUpperCase()}/><Cascader nodes={[]} onValueChange={v=>v[0]?.toUpperCase()}/><MentionInput options={[]} onMention={v=>v.id.toUpperCase()}/><Stepper steps={[]} onValueChange={v=>v.toUpperCase()}/>
<FilterBuilder fields={[]} onValueChange={v=>v.rules[0]?.value}/><ColumnManager onValueChange={v=>v[0]?.visible}/><SchedulePicker onValueChange={v=>v[0]?.toUpperCase()}/><DraggableWindow title="Notes" onPositionChange={v=>v.x.toFixed()}>Notes</DraggableWindow><NotificationInbox onValueChange={v=>v[0]?.title}/>
<FlipCard front="Front" back="Back" onFlippedChange={v=>!v}/><MazeRunner onPositionChange={v=>v.row.toFixed()}/><ConfettiBurst/><VectorField onValueChange={v=>v[0]?.strength}/><ReactionDiffusion onParametersChange={v=>v.feed.toFixed()}/><TerrainMesh onAmplitudeChange={v=>v.toFixed()}/><PendulumWave onGravityChange={v=>v.toFixed()}/><ClipPathEditor onValueChange={v=>v[0]?.x}/><ContrastChecker onValueChange={v=>v.foreground.toUpperCase()}/><ShadowEditor onValueChange={v=>v[0]?.blur}/>
</>;
const bell=<NotificationBell count={2} size="compact" indicator="dot" aria-label="알림" aria-expanded={false} aria-controls="alerts" disabled={false} onClick={event=>event.currentTarget.focus()}/>;
const policy: MotionPreference="full";
const provider=<InteractionProvider motion={policy}><DesignSystemProvider motion="reduced"><Button>Save</Button></DesignSystemProvider></InteractionProvider>;
// @ts-expect-error motion policy is a closed set
const invalidMotion=<DesignSystemProvider motion="off"/>;
const controls=<><Button type="submit"/><Input aria-label="Name"/><Dialog title="Details" open={false} onOpenChange={()=>{}}>Details</Dialog></>;
const catalog: string | undefined=uiCatalog[0]?.name;
// @ts-expect-error models remain required in the public API
const missing=<ModelSelector/>;
// @ts-expect-error native input props remain typed
const invalid=<Input type="number" min={{bad:true}}/>;
export {additions,picker,upload,creative,bell,controls,catalog,missing,invalid,provider,invalidMotion};
`,
    );
    const project = join(fixture, "tsconfig.json");
    writeFileSync(
      project,
      JSON.stringify({
        compilerOptions: {
          target: "ES2023",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          noUncheckedIndexedAccess: true,
          exactOptionalPropertyTypes: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ["consumer.tsx"],
      }),
    );
    execFileSync(process.execPath, [tsc, "--project", project], {
      cwd: root,
      encoding: "utf8",
      stdio: "inherit",
    });
    const files = execFileSync(
      process.execPath,
      [tsc, "--project", project, "--listFilesOnly"],
      { cwd: root, encoding: "utf8" },
    ).split("\n");
    assert(files.some((file) => file === join(root, "dist/types/index.d.ts")));
    assert(!files.some((file) => file.startsWith(join(root, "src") + "/")));
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
