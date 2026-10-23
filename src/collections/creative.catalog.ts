export const creativeCatalog = [
  {
    id: "gradient-editor",
    name: "Gradient editor",
    component: "GradientEditor",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "색상 손잡이를 옮기고 각도·위치를 조절해 실제 CSS 그라디언트를 만듭니다.",
    tags: ["creative", "gradient", "editor", "그라디언트"],
  },
  {
    id: "pixel-editor",
    name: "Pixel editor",
    component: "PixelEditor",
    group: "Visual effects",
    addedAt: "2026-10-23",
    description:
      "작은 캔버스에 픽셀을 그리고 지우고, 완성한 그림을 SVG로 가져갑니다.",
    tags: ["creative", "pixel", "draw", "픽셀"],
  },
  {
    id: "scratch-card",
    name: "Scratch card",
    component: "ScratchCard",
    group: "Visual effects",
    addedAt: "2026-10-23",
    description:
      "표면을 긁어 숨겨진 콘텐츠를 드러냅니다. 터치 선택 사용과 키보드 대안을 제공합니다.",
    tags: ["creative", "scratch", "reveal", "스크래치"],
  },
  {
    id: "undo-history",
    name: "Undo history",
    component: "UndoHistory",
    group: "Navigation",
    addedAt: "2026-10-23",
    description:
      "이전 버전으로 돌아가고 다시 진행하는 변경 내역. 선택한 상태를 호출자에게 전달합니다.",
    tags: ["creative", "history", "undo", "redo", "기록"],
  },
  {
    id: "multi-select",
    name: "Multi select",
    component: "MultiSelect",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "검색 가능한 선택 패널에서 여러 옵션을 골라 태그와 폼 값으로 관리합니다.",
    tags: ["creative", "select", "filter", "다중선택"],
  },
  {
    id: "transfer-list",
    name: "Transfer list",
    component: "TransferList",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "두 목록 사이에서 선택한 항목을 배정하고 되돌립니다. 검색·선택·비활성 상태를 유지합니다.",
    tags: ["creative", "transfer", "assign", "배정"],
  },
  {
    id: "rating",
    name: "Rating",
    component: "Rating",
    group: "Feedback",
    addedAt: "2026-10-23",
    description:
      "포인터로 미리 보고 별점을 고릅니다. 네이티브 라디오·키보드·폼 제출을 지원합니다.",
    tags: ["creative", "rating", "stars", "별점"],
  },
  {
    id: "circular-dial",
    name: "Circular dial",
    component: "CircularDial",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "원을 따라 끌거나 방향키로 수치를 조절하는 다이얼. 범위·단계·폼 값을 지원합니다.",
    tags: ["creative", "dial", "knob", "다이얼"],
  },
] as const;
export const creativeExamples = {
  "gradient-editor": '<GradientEditor label="Brand gradient" />',
  "pixel-editor":
    '<PixelEditor columns={10} rows={6} label="Make a small mark" />',
  "scratch-card":
    '<ScratchCard label="Scratch to discover"><strong>A little surprise.</strong><p>Made for curious people.</p></ScratchCard>',
  "undo-history":
    '<UndoHistory entries={[{ id: "v1", label: "First draft" }, { id: "v2", label: "Refined spacing" }]} value={version} onValueChange={setVersion} />',
  "multi-select":
    '<MultiSelect label="Project stack" name="stack" defaultValue={["react"]} options={[{value:"react",label:"React"},{value:"motion",label:"Motion"}]} maxSelected={3} />',
  "transfer-list":
    '<TransferList label="Project access" name="members" options={[{value:"mina",label:"Mina"},{value:"jun",label:"Jun"}]} defaultValue={["mina"]} />',
  rating:
    '<Rating label="How did that feel?" name="rating" defaultValue={3} />',
  "circular-dial":
    '<CircularDial label="Intensity" name="intensity" min={0} max={100} step={5} defaultValue={40} unit="%" />',
} satisfies Record<string, string>;
