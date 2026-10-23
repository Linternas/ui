import { systemCatalog } from "./catalog";
import { interactionCatalog, interactionExamples } from "./interaction-catalog";
export {
  interactionCatalog,
  interactionExamples,
  type InteractionComponentId,
} from "./interaction-catalog";
export const playgroundExperiments = [
  {
    id: "particle-text",
    name: "Particle text",
    number: "01",
    description: "Letters with a life of their own.",
    hint: "Move through the word. Scatter it. Let it find its way back.",
    path: "/playground/particle-text",
  },
  {
    id: "spatial-board",
    name: "Spatial board",
    number: "02",
    description: "A little room for big ideas.",
    hint: "Drag the note grips. Join ideas. Zoom out to see the whole picture.",
    path: "/playground/spatial-board",
  },
  {
    id: "sound-pad",
    name: "Sound pad",
    number: "03",
    description: "Make a little noise. Or just light.",
    hint: "Play the pads or keys 1–8. Capture notes to make your own loop.",
    path: "/playground/sound-pad",
  },
  {
    id: "cloth-playground",
    name: "Cloth playground",
    number: "04",
    description: "Something soft. Something you can break.",
    hint: "Pull the fabric. Send a gust through it. Switch to tear mode and make a little mess.",
    path: "/playground/cloth-playground",
  },
  {
    id: "fluid-sandbox",
    name: "Fluid sandbox",
    number: "05",
    description: "A little liquid. A lot to play with.",
    hint: "Pour particles. Drag to stir. Change the viscosity and send the pool spinning.",
    path: "/playground/fluid-sandbox",
  },
  {
    id: "orbit-composer",
    name: "Orbit composer",
    number: "06",
    description: "Small circles. Unexpected paths.",
    hint: "Drag the center and orbit points. Change their speeds. Watch a new pattern unfold.",
    path: "/playground/orbit-composer",
  },
  {
    id: "sticker-peel",
    name: "Sticker peel",
    number: "07",
    description: "A little corner. A satisfying peel.",
    hint: "Peel the corner, move the sticker, and stick it back.",
    path: "/playground/sticker-peel",
  },
  {
    id: "elastic-mesh",
    name: "Elastic mesh",
    number: "08",
    description: "Letters that stretch and recover.",
    hint: "Press into the word and pull. Or stretch the center with a button.",
    path: "/playground/elastic-mesh",
  },
  {
    id: "image-particle-morph",
    name: "Image particle morph",
    number: "09",
    description: "A flat image. A small world.",
    hint: "Form a particle globe and rotate it to see the other side.",
    path: "/playground/image-particle-morph",
  },
  {
    id: "dither-reveal",
    name: "Dither reveal",
    number: "10",
    description: "Wipe the print. Find the color.",
    hint: "Brush the dots away or reveal the whole image at once.",
    path: "/playground/dither-reveal",
  },
  {
    id: "fluid-glass-lens",
    name: "Fluid glass lens",
    number: "11",
    description: "A curved view of familiar things.",
    hint: "Move the lens and tune its radius and refraction.",
    path: "/playground/fluid-glass-lens",
  },
  {
    id: "lanyard",
    name: "Lanyard",
    number: "12",
    description: "A badge with a little gravity.",
    hint: "Drag the badge, give it a swing, and flip it over.",
    path: "/playground/lanyard",
  },
  {
    id: "dome-gallery",
    name: "Dome gallery",
    number: "13",
    description: "A gallery that wraps around you.",
    hint: "Turn the gallery, choose a work, and open it for a closer look.",
    path: "/playground/dome-gallery",
  },
  {
    id: "foldable-paper",
    name: "Foldable paper",
    number: "14",
    description: "Write a thought. Fold it away.",
    hint: "Write your own note. Adjust the crease and fold the sheet.",
    path: "/playground/foldable-paper",
  },
  {
    id: "webcam-pixel-grid",
    name: "Webcam pixel grid",
    number: "15",
    description: "A different way to see yourself.",
    hint: "Try the sample, or explicitly enable your camera for a local pixel view.",
    path: "/playground/webcam-pixel-grid",
  },
  {
    id: "image-relighting",
    name: "Image relighting",
    number: "16",
    description: "Move the light. Change the image.",
    hint: "Position the light and adjust its intensity.",
    path: "/playground/image-relighting",
  },
] as const;
export type PlaygroundExperimentId =
  (typeof playgroundExperiments)[number]["id"];
export const uiGroups = [
  "Foundations",
  "Layout",
  "Actions",
  "Forms",
  "Navigation",
  "Overlays",
  "Data display",
  "Feedback",
  "Visual effects",
  "Patterns",
] as const;
export type UiGroup = (typeof uiGroups)[number];
export interface UiCatalogEntry {
  id: string;
  name: string;
  group: UiGroup;
  description: string;
  code: string;
  addedAt?: string;
  tags?: readonly string[];
  kind: "foundation" | "core" | "interaction" | "pattern";
}
const interactionGroup = (id: string, group: string): UiGroup => {
  if (id === "delete-button") return "Actions";
  if (id === "task-list") return "Data display";
  if (
    ["gravity-letters", "fluid-orb", "matrix-orb", "grid-reveal"].includes(id)
  )
    return "Visual effects";
  if (id === "web-search") return "Data display";
  if (id === "ai-status") return "Feedback";
  return group === "Display"
    ? "Data display"
    : group === "Inputs"
      ? "Forms"
      : (group as UiGroup);
};
export const uiCatalog: readonly UiCatalogEntry[] = [
  {
    id: "playground",
    name: "Playground",
    group: "Foundations",
    kind: "foundation",
    description: "화면 전체를 쓰는 실험. 글자·공간·소리와 직접 놀아보세요.",
    code: `import { ParticleText, SpatialBoard, SoundPad } from '@mingu/interaction-ui';\nimport '@mingu/interaction-ui/system.css';\nimport '@mingu/interaction-ui/styles.css';`,
  },
  {
    id: "foundations",
    name: "Foundations",
    group: "Foundations",
    description: "공통 색상, 타이포그래피, 간격, 형태와 테마.",
    kind: "foundation",
    code: `import { DesignSystemProvider, Button } from '@mingu/interaction-ui';\nimport '@mingu/interaction-ui/system.css';\nimport '@mingu/interaction-ui/styles.css';\n\n<DesignSystemProvider theme="system">\n  <Button>Start building</Button>\n</DesignSystemProvider>`,
  },
  {
    id: "controls",
    name: "Controls",
    group: "Foundations",
    description:
      "크기·상태·강조색을 직접 조절하고 실제 폼에서 확인하는 컨트롤 워크벤치.",
    kind: "foundation",
    code: `import { DesignSystemProvider, TextField, SelectField, TextareaField, Button } from '@mingu/interaction-ui/system';\nimport '@mingu/interaction-ui/system.css';\n\n<DesignSystemProvider theme="system" accent="neutral">\n  <TextField label="프로젝트 이름" required />\n  <SelectField label="공개 범위"><option>비공개</option></SelectField>\n  <TextareaField label="설명" rows={3} />\n  <Button type="submit">확인</Button>\n</DesignSystemProvider>`,
  },
  {
    id: "all",
    name: "All",
    group: "Foundations",
    kind: "foundation",
    description:
      "모든 기본 컴포넌트와 인터랙션을 라이브 미리보기로 둘러보세요. 사용법과 코드는 Docs에서 확인할 수 있습니다.",
    code: `import { uiCatalog } from '@mingu/interaction-ui/catalog';\n\nconst components = uiCatalog.filter(({ kind }) => kind === 'core' || kind === 'interaction');`,
  },
  ...systemCatalog.map((item) => ({
    ...item,
    group: item.group as UiGroup,
    kind: "core" as const,
  })),
  ...interactionCatalog.map((item) => ({
    ...item,
    group: interactionGroup(item.id, item.group),
    code: interactionExamples[item.id],
    addedAt: "addedAt" in item ? item.addedAt : undefined,
    kind: "interaction" as const,
  })),
  {
    id: "patterns",
    name: "Product patterns",
    group: "Patterns",
    description: "기본 UI와 인터랙션을 조합한 제품 화면.",
    kind: "pattern",
    code: `import { Card, Stack, Button, AnimatedCounter, NotificationBell } from '@mingu/interaction-ui';\nimport '@mingu/interaction-ui/system.css';\nimport '@mingu/interaction-ui/styles.css';\n\n<Card><Stack gap={4}>\n  <NotificationBell count={3} />\n  <AnimatedCounter value={12} />\n  <Button>Complete task</Button>\n</Stack></Card>`,
  },
];
/** Related components share one page shell and one functional category. */
export const uiFamilies: readonly (readonly string[])[] = [
  ["sidebar", "bounce-sidebar", "hook-sidebar", "proximity-sidebar"],
  ["navigation", "gooey-nav"],
  ["card", "interactive-card", "expandable-card", "directional-card"],
  ["radio-group", "segmented-control"],
  ["accordion", "faq"],
  ["avatar", "avatar-cluster"],
  ["code-block", "code-tabs"],
  ["file-upload", "file-dropzone"],
  ["image-compare", "image-lightbox", "image-lens", "hover-gallery"],
  ["progress", "scroll-progress", "rail-toc"],
  [
    "button",
    "copy-button",
    "icon-button",
    "button-group",
    "link-button",
    "delete-button",
    "hold-to-confirm",
  ],
  [
    "input",
    "floating-field",
    "text-field",
    "textarea-field",
    "select-field",
    "password-field",
    "search-field",
    "number-field",
    "number-scrubber",
    "date-picker",
    "combobox",
    "otp-input",
    "duration-picker",
  ],
  ["alert", "toast", "action-toast", "notification-bell", "ai-status"],
  ["dialog", "alert-dialog", "drawer", "bottom-sheet", "popover"],
];

export const NEWEST_WINDOW_DAYS = 30;
const day = 86_400_000;
/** UTC release dates; future, invalid and expired entries never appear as newest. */
export function getNewestEntries(
  entries: readonly UiCatalogEntry[] = uiCatalog,
  now = Date.now(),
  windowDays = NEWEST_WINDOW_DAYS,
): UiCatalogEntry[] {
  if (!Number.isFinite(now) || !Number.isFinite(windowDays) || windowDays <= 0)
    return [];
  return entries
    .filter((entry) => {
      if (entry.kind !== "core" && entry.kind !== "interaction") return false;
      if (!entry.addedAt || !/^\d{4}-\d{2}-\d{2}$/.test(entry.addedAt))
        return false;
      const start = Date.parse(`${entry.addedAt}T00:00:00.000Z`);
      return (
        Number.isFinite(start) &&
        new Date(start).toISOString().slice(0, 10) === entry.addedAt &&
        now >= start &&
        now < start + windowDays * day
      );
    })
    .sort((a, b) => b.addedAt!.localeCompare(a.addedAt!));
}
