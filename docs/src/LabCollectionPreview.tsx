import * as React from "react";
import {
  StickerPeel,
  ElasticMesh,
  ImageParticleMorph,
  DitherReveal,
  FluidGlassLens,
  Lanyard,
  DomeGallery,
  FoldablePaper,
  WebcamPixelGrid,
  ImageRelighting,
} from "../../src/collections/lab";
const works = [
  {
    id: "day",
    src: "/ui-lab/landscape.svg",
    alt: "Terraced landscape in daylight",
    title: "Daylight",
  },
  {
    id: "night",
    src: "/ui-lab/landscape-night.svg",
    alt: "Terraced landscape at night",
    title: "Nightfall",
  },
  {
    id: "form",
    src: "/ui-lab/form.svg",
    alt: "A circle on an ivory poster",
    title: "Form",
  },
  {
    id: "echo",
    src: "/ui-lab/echo.svg",
    alt: "Concentric arches on a muted green poster",
    title: "Echo",
  },
  {
    id: "fold",
    src: "/ui-lab/fold.svg",
    alt: "Folded geometric paper on a blue poster",
    title: "Fold",
  },
];
export default function LabCollectionPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const image = "/ui-lab/landscape.svg";
  return (
    <div
      className={compact ? "mingu-lab-preview is-compact" : "mingu-lab-preview"}
    >
      {id === "sticker-peel" ? (
        <StickerPeel />
      ) : id === "elastic-mesh" ? (
        <ElasticMesh />
      ) : id === "image-particle-morph" ? (
        <ImageParticleMorph src={image} />
      ) : id === "dither-reveal" ? (
        <DitherReveal src={image} />
      ) : id === "fluid-glass-lens" ? (
        <FluidGlassLens src={image} />
      ) : id === "lanyard" ? (
        <Lanyard />
      ) : id === "dome-gallery" ? (
        <DomeGallery items={works} />
      ) : id === "foldable-paper" ? (
        <FoldablePaper />
      ) : id === "webcam-pixel-grid" ? (
        <WebcamPixelGrid />
      ) : id === "image-relighting" ? (
        <ImageRelighting src={image} />
      ) : null}
    </div>
  );
}
