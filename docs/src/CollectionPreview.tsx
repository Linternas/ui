import WorkflowCollectionPreview from "./WorkflowCollectionPreview";
import KineticCollectionPreview from "./KineticCollectionPreview";
import { workflowCatalog } from "../../src/collections/workflow.catalog";
import { kineticCatalog } from "../../src/collections/kinetic.catalog";
import CreativeCollectionPreview from "./CreativeCollectionPreview";
import { creativeCatalog } from "../../src/collections/creative.catalog";
import AiCollectionPreview from "./AiCollectionPreview";
import ToolsCollectionPreview from "./ToolsCollectionPreview";
import MediaCollectionPreview from "./MediaCollectionPreview";
import NavigationCollectionPreview from "./NavigationCollectionPreview";
import LabCollectionPreview from "./LabCollectionPreview";
export default function CollectionPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  if (workflowCatalog.some((entry) => entry.id === id))
    return <WorkflowCollectionPreview id={id} />;
  if (kineticCatalog.some((entry) => entry.id === id))
    return <KineticCollectionPreview id={id} />;
  if (creativeCatalog.some((entry) => entry.id === id))
    return <CreativeCollectionPreview id={id} />;
  if (
    [
      "page-transition",
      "dynamic-status-island",
      "animated-mega-menu",
      "sortable-grid",
      "card-navigation",
      "scroll-stack",
      "sticky-scroll-story",
      "footer-reveal",
      "scroll-expand-media",
      "coverflow-carousel",
    ].includes(id)
  )
    return <NavigationCollectionPreview id={id} compact={compact} />;
  if (
    [
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
    ].includes(id)
  )
    return <MediaCollectionPreview id={id} compact={compact} />;
  if (
    [
      "tag-input",
      "wheel-picker",
      "color-picker",
      "bezier-editor",
      "collaborative-cursor",
      "slash-command-editor",
      "chart-range-navigator",
      "carousel-scrubber",
      "dialog-stack",
      "live-code-sandbox",
    ].includes(id)
  )
    return <ToolsCollectionPreview id={id} compact={compact} />;
  if (
    [
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
    ].includes(id)
  )
    return <AiCollectionPreview id={id} compact={compact} />;
  return <LabCollectionPreview id={id} compact={compact} />;
}
