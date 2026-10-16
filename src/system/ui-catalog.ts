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
  ...systemCatalog.map((item) => ({
    ...item,
    group: item.group as UiGroup,
    kind: "core" as const,
  })),
  ...interactionCatalog.map((item) => ({
    ...item,
    group: interactionGroup(item.id, item.group),
    code: interactionExamples[item.id],
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
  ["card", "interactive-card"],
  ["radio-group", "segmented-control"],
  ["accordion", "faq"],
  ["progress", "scroll-progress", "rail-toc"],
  [
    "button",
    "copy-button",
    "icon-button",
    "button-group",
    "link-button",
    "delete-button",
  ],
  [
    "input",
    "floating-field",
    "text-field",
    "password-field",
    "search-field",
    "number-field",
    "date-picker",
    "combobox",
    "otp-input",
    "duration-picker",
  ],
  ["alert", "toast", "notification-bell", "ai-status"],
  ["dialog", "alert-dialog", "drawer", "popover"],
];
