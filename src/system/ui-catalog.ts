import { systemCatalog } from "./catalog";
import { interactionCatalog, interactionExamples } from "./interaction-catalog";
export {
  interactionCatalog,
  interactionExamples,
  type InteractionComponentId,
} from "./interaction-catalog";
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
    id: "newest",
    name: "Newest",
    group: "Foundations",
    kind: "foundation",
    description:
      "최근 30일 동안 추가된 인터랙션. 기간이 지나도 각 카테고리에서 계속 사용할 수 있습니다.",
    code: `import { getNewestEntries } from '@mingu/interaction-ui/catalog';\n\nconst newest = getNewestEntries();\n// Add an addedAt: 'YYYY-MM-DD' UTC date to new catalog entries.\n// Entries automatically leave Newest after 30 days.`,
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
