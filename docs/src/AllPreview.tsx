import { uiCatalog } from "@mingu/interaction-ui/catalog";
import ComponentGallery from "./ComponentGallery";

const components = uiCatalog
  .filter((entry) => entry.kind === "core" || entry.kind === "interaction")
  .sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));

export default function AllPreview() {
  return (
    <ComponentGallery entries={components} label="All" filterable={false} />
  );
}
