export const kineticCatalog = [
  {
    id: "flip-card",
    name: "Flip card",
    component: "FlipCard",
    group: "Data display",
    addedAt: "2026-10-23",
    description:
      "카드를 뒤집어 두 면의 내용을 탐색합니다. 숨겨진 면의 포커스를 차단합니다.",
    tags: ["kinetic", "flip card"],
  },
  {
    id: "maze-runner",
    name: "Maze runner",
    component: "MazeRunner",
    group: "Visual effects",
    addedAt: "2026-10-23",
    description:
      "방향키·버튼으로 미로를 걷습니다. 새로운 미로와 이동 기록을 제공합니다.",
    tags: ["kinetic", "maze runner"],
  },
  {
    id: "confetti-burst",
    name: "Confetti burst",
    component: "ConfettiBurst",
    group: "Feedback",
    addedAt: "2026-10-23",
    description:
      "누른 위치에서 색종이를 터뜨립니다. 입자 수를 제한하고 모션 감소를 따릅니다.",
    tags: ["kinetic", "confetti burst"],
  },
  {
    id: "vector-field",
    name: "Vector field",
    component: "VectorField",
    group: "Visual effects",
    addedAt: "2026-10-23",
    description:
      "전하를 놓고 극성을 바꾸며 벡터장이 달라지는 모습을 관찰합니다.",
    tags: ["kinetic", "vector field"],
  },
  {
    id: "reaction-diffusion",
    name: "Reaction diffusion",
    component: "ReactionDiffusion",
    group: "Visual effects",
    addedAt: "2026-10-23",
    description: "시드를 심고 반응 속도를 조절하며 생성 패턴을 발전시킵니다.",
    tags: ["kinetic", "reaction diffusion"],
  },
  {
    id: "terrain-mesh",
    name: "Terrain mesh",
    component: "TerrainMesh",
    group: "Visual effects",
    addedAt: "2026-10-23",
    description:
      "높이와 시점을 조절하며 움직이는 와이어프레임 지형을 만듭니다.",
    tags: ["kinetic", "terrain mesh"],
  },
  {
    id: "pendulum-wave",
    name: "Pendulum wave",
    component: "PendulumWave",
    group: "Visual effects",
    addedAt: "2026-10-23",
    description: "진자를 건드리고 중력·위상을 바꾸며 리듬을 조합합니다.",
    tags: ["kinetic", "pendulum wave"],
  },
  {
    id: "clip-path-editor",
    name: "Clip path editor",
    component: "ClipPathEditor",
    group: "Forms",
    addedAt: "2026-10-23",
    description: "다각형 앵커를 이동해 실제 CSS clip-path를 만들고 복사합니다.",
    tags: ["kinetic", "clip path editor"],
  },
  {
    id: "contrast-checker",
    name: "Contrast checker",
    component: "ContrastChecker",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "글자색과 배경색을 바꾸며 sRGB 명도 대비를 계산하고 비교합니다.",
    tags: ["kinetic", "contrast checker"],
  },
  {
    id: "shadow-editor",
    name: "Shadow editor",
    component: "ShadowEditor",
    group: "Forms",
    addedAt: "2026-10-23",
    description: "그림자 레이어·색·거리·흐림을 조절하고 CSS로 가져갑니다.",
    tags: ["kinetic", "shadow editor"],
  },
] as const;
export const kineticExamples = {
  "flip-card":
    "<FlipCard front={<h3>A first impression.</h3>} back={<p>A little more to discover.</p>} />",
  "maze-runner":
    '<MazeRunner seed={3} onComplete={() => console.log("Found the way")} />',
  "confetti-burst": "<ConfettiBurst count={72} burstKey={1} />",
  "vector-field":
    '<VectorField defaultValue={[{id:"positive",x:.3,y:.5,strength:1},{id:"negative",x:.7,y:.5,strength:-1}]} />',
  "reaction-diffusion":
    "<ReactionDiffusion defaultParameters={{feed:.055,kill:.062}} />",
  "terrain-mesh": "<TerrainMesh seed={3} defaultAmplitude={.55} />",
  "pendulum-wave": "<PendulumWave count={12} defaultGravity={1} />",
  "clip-path-editor":
    "<ClipPathEditor defaultValue={[{x:15,y:5},{x:95,y:20},{x:80,y:95},{x:5,y:75}]} />",
  "contrast-checker":
    '<ContrastChecker defaultValue={{foreground:"#252132",background:"#eee8f5"}} />',
  "shadow-editor": '<ShadowEditor label="A little depth" />',
} satisfies Record<string, string>;
