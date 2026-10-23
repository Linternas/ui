import AiCollectionPreview from "./AiCollectionPreview";
import ToolsCollectionPreview from "./ToolsCollectionPreview";
import MediaCollectionPreview from "./MediaCollectionPreview";
import NavigationCollectionPreview from "./NavigationCollectionPreview";
import LabCollectionPreview from "./LabCollectionPreview";
export default function CollectionPreview({ id }: { id: string }) {
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
    return <NavigationCollectionPreview id={id} />;
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
    return <MediaCollectionPreview id={id} />;
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
    return <ToolsCollectionPreview id={id} />;
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
    return <AiCollectionPreview id={id} />;
  return <LabCollectionPreview id={id} />;
}
