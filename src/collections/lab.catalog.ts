export const labCatalog = [
  {
    id: "sticker-peel",
    name: "Sticker peel",
    component: "StickerPeel",
    description: "모서리를 접어 스티커를 벗기고 손잡이로 옮깁니다.",
  },
  {
    id: "elastic-mesh",
    name: "Elastic mesh",
    component: "ElasticMesh",
    description: "글자의 작은 면을 잡아당기고 놓으면 탄성으로 돌아옵니다.",
  },
  {
    id: "image-particle-morph",
    name: "Image particle morph",
    component: "ImageParticleMorph",
    description: "이미지의 색을 가진 입자가 3차원 구체로 모입니다.",
  },
  {
    id: "dither-reveal",
    name: "Dither reveal",
    component: "DitherReveal",
    description: "하프톤 인쇄의 점을 닦아 이미지의 원래 색을 드러냅니다.",
  },
  {
    id: "fluid-glass-lens",
    name: "Fluid glass lens",
    component: "FluidGlassLens",
    description: "곡면 렌즈를 움직이며 이미지의 굴절을 조절합니다.",
  },
  {
    id: "lanyard",
    name: "Lanyard",
    component: "Lanyard",
    description: "줄에 매달린 배지를 잡아 흔들고 뒤집습니다.",
  },
  {
    id: "dome-gallery",
    name: "Dome gallery",
    component: "DomeGallery",
    description: "곡면에 놓인 이미지를 돌려 보고 선택한 작업을 엽니다.",
  },
  {
    id: "foldable-paper",
    name: "Foldable paper",
    component: "FoldablePaper",
    description: "메모를 쓰고 원하는 접힘선을 따라 종이를 접습니다.",
  },
  {
    id: "webcam-pixel-grid",
    name: "Webcam pixel grid",
    component: "WebcamPixelGrid",
    description: "직접 켠 카메라의 영상을 로컬 픽셀 격자로 변환합니다.",
  },
  {
    id: "image-relighting",
    name: "Image relighting",
    component: "ImageRelighting",
    description: "빛의 위치와 세기를 바꿔 이미지의 표면을 탐색합니다.",
  },
].map((item) => ({
  ...item,
  group: "Visual effects",
  addedAt: "2026-10-23",
  tags: ["experimental", "playground", "canvas", "실험"],
})) as readonly {
  id:
    | "sticker-peel"
    | "elastic-mesh"
    | "image-particle-morph"
    | "dither-reveal"
    | "fluid-glass-lens"
    | "lanyard"
    | "dome-gallery"
    | "foldable-paper"
    | "webcam-pixel-grid"
    | "image-relighting";
  name: string;
  component: string;
  description: string;
  group: "Visual effects";
  addedAt: "2026-10-23";
  tags: readonly string[];
}[];
export const labExamples = {
  "sticker-peel":
    '<StickerPeel text="MADE TO PLAY" defaultPeel={0.12} onPeelChange={setPeel} />',
  "elastic-mesh": '<ElasticMesh text="SOFT" />',
  "image-particle-morph":
    '<ImageParticleMorph src="/poster.jpg" alt="Poster transformed into a globe" />',
  "dither-reveal": '<DitherReveal src="/poster.jpg" alt="Printed poster" />',
  "fluid-glass-lens":
    '<FluidGlassLens src="/poster.jpg" alt="Poster under a glass lens" />',
  lanyard: '<Lanyard name="Mingu" subtitle="DESIGN ENGINEER" />',
  "dome-gallery":
    '<DomeGallery items={[{id:"one",src:"/poster.jpg",alt:"Geometric poster",title:"Form"}]} onSelect={item => setSelected(item.id)} />',
  "foldable-paper":
    '<FoldablePaper text="Make room for a new idea." defaultFold={0} onFoldChange={setFold} />',
  "webcam-pixel-grid":
    "<WebcamPixelGrid onCameraStateChange={setCameraState} />",
  "image-relighting":
    '<ImageRelighting src="/poster.jpg" depthSrc="/poster-depth.png" alt="Poster with a movable light" />',
} satisfies Record<string, string>;
