import LabCollectionPreview from "./LabCollectionPreview";
import {
  ParticleText,
  SpatialBoard,
  SoundPad,
  ClothPlayground,
  FluidSandbox,
  OrbitComposer,
} from "@mingu/interaction-ui";
import type { PlaygroundExperimentId } from "../../src/system/ui-catalog";
import Link from "./routing";
export function Experiment({
  id,
  compact = false,
}: {
  id: PlaygroundExperimentId;
  compact?: boolean;
}) {
  if (
    [
      "sticker-peel",
      "elastic-mesh",
      "image-particle-morph",
      "dither-reveal",
      "fluid-glass-lens",
      "lanyard",
      "dome-gallery",
      "foldable-paper",
      "webcam-pixel-grid",
      "image-relighting",
    ].includes(id)
  )
    return <LabCollectionPreview id={id} compact={compact} />;
  switch (id) {
    case "cloth-playground":
      return <ClothPlayground />;
    case "fluid-sandbox":
      return <FluidSandbox />;
    case "orbit-composer":
      return <OrbitComposer defaultPreset="petal" />;
    case "particle-text":
      return <ParticleText />;
    case "spatial-board":
      return <SpatialBoard />;
    case "sound-pad":
      return <SoundPad />;
  }
}
export default function ExperimentalPreview({
  id,
  compact = false,
}: {
  id: PlaygroundExperimentId;
  compact?: boolean;
}) {
  return (
    <div className={`experiment-preview${compact ? " is-compact" : ""}`}>
      <Experiment id={id} compact={compact} />
      <Link className="experiment-open" href={`/playground/${id}`}>
        Open playground <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
