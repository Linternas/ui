import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
const noop = () => {};
// Consumer fixtures use minimum valid props, including empty data and idle states.
const fixtures = {
  DateRangePicker: {},
  TimePicker: {},
  RangeSlider: {},
  TreeSelect: { nodes: [] },
  Cascader: { nodes: [] },
  MentionInput: { options: [] },
  Stepper: { steps: [] },
  FilterBuilder: { fields: [] },
  ColumnManager: {},
  SchedulePicker: {},
  DraggableWindow: { title: "Notes", children: "Notes" },
  NotificationInbox: {},
  FlipCard: { front: "Front", back: "Back" },
  MazeRunner: {},
  ConfettiBurst: {},
  VectorField: {},
  ReactionDiffusion: {},
  TerrainMesh: {},
  PendulumWave: {},
  ClipPathEditor: {},
  ContrastChecker: {},
  ShadowEditor: {},
  MultiSelect: { options: [] },
  TransferList: { options: [] },
  Rating: {},
  UndoHistory: { entries: [], value: "", onValueChange: noop },
  GradientEditor: {},
  PixelEditor: {},
  ScratchCard: { children: "A surprise" },
  CircularDial: {},
  StickerPeel: {},
  ElasticMesh: {},
  ImageParticleMorph: {},
  DitherReveal: {},
  FluidGlassLens: {},
  Lanyard: {},
  DomeGallery: { items: [] },
  FoldablePaper: {},
  WebcamPixelGrid: {},
  ImageRelighting: {},
  PageTransition: { pages: [] },
  DynamicStatusIsland: { title: "Idle" },
  AnimatedMegaMenu: { items: [] },
  SortableGrid: { items: [] },
  CardNavigation: { groups: [] },
  ScrollStack: { items: [] },
  StickyScrollStory: { steps: [] },
  FooterReveal: { children: "Content", footer: "Footer" },
  ScrollExpandMedia: { children: "Media" },
  CoverflowCarousel: { items: [] },
  SplitFlapDisplay: { text: "Hello" },
  VariableFontProximity: { text: "Hello" },
  VerticalReel: { items: [] },
  StoryViewer: { items: [] },
  VideoPlayer: {},
  ImageCropper: { src: "/image.png" },
  CalendarBoard: {},
  GanttTimeline: { rangeStart: "2026-10-23" },
  KanbanBoard: { columns: [] },
  FileTree: { nodes: [] },
  TagInput: {},
  WheelPicker: { options: [] },
  ColorPicker: {},
  BezierEditor: {},
  CollaborativeCursor: { peers: [] },
  SlashCommandEditor: {},
  ChartRangeNavigator: { data: [] },
  CarouselScrubber: { items: [] },
  DialogStack: { open: false, onOpenChange: noop, steps: [] },
  LiveCodeSandbox: {},
  PromptComposer: { onSubmit: noop },
  ToolExecutionPanel: { name: "Local tool", status: "pending" },
  PlanReview: { steps: [] },
  ApprovalCard: { title: "A local change", onApprove: noop, onReject: noop },
  ContextUsageMeter: { inputTokens: 0, outputTokens: 0, maxTokens: 1000 },
  ArtifactPanel: { title: "Draft", content: "" },
  Checkpoint: { title: "Saved draft", onRestore: noop },
  ModelSelector: { models: [] },
  VoiceInput: {},
  StreamingTerminal: { lines: [] },
};
test("published collection exports render without browser globals under classic JSX", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const dir = await mkdtemp(root + "node_modules/.mingu-ssr-");
  try {
    const outfile = dir + "/index.mjs";
    await build({
      absWorkingDir: root,
      entryPoints: ["src/index.ts"],
      outfile,
      bundle: true,
      platform: "node",
      format: "esm",
      packages: "external",
      jsx: "transform",
      logLevel: "silent",
    });
    const lib = await import(pathToFileURL(outfile).href);
    let count = 0;
    for (const [name, props] of Object.entries(fixtures)) {
      assert.equal(typeof lib[name], "function", name);
      const output = renderToString(createElement(lib[name], props));
      assert.ok(output.length > 0, `${name} produced no server markup`);
      count++;
    }
    assert.equal(
      count,
      Object.keys(fixtures).length,
      "Every public fixture must render",
    );
    console.log(`${count} public collection components: SSR PASS`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
