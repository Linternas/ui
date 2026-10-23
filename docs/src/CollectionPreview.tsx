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
  return <LabCollectionPreview id={id} />;
}
