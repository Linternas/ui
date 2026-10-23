export const toolsCatalog = [
  {
    id: "tag-input",
    name: "Tag input",
    group: "Forms",
    component: "TagInput",
    addedAt: "2026-10-23",
    description:
      "태그를 입력하고 추천에서 고릅니다. 중복·개수 제한과 키보드 삭제를 제공합니다.",
    tags: ["tools", "tags", "editor", "태그"],
  },
  {
    id: "wheel-picker",
    name: "Wheel picker",
    group: "Forms",
    component: "WheelPicker",
    addedAt: "2026-10-23",
    description:
      "스크롤 스냅과 방향키로 값을 고르는 휠. 터치와 폼 값을 유지합니다.",
    tags: ["tools", "mobile", "picker", "휠"],
  },
  {
    id: "color-picker",
    name: "Color picker",
    group: "Forms",
    component: "ColorPicker",
    addedAt: "2026-10-23",
    description: "색상 평면·색조·투명도·HEX 값을 실시간으로 편집합니다.",
    tags: ["tools", "color", "editor", "색상"],
  },
  {
    id: "bezier-editor",
    name: "Bezier editor",
    group: "Forms",
    component: "BezierEditor",
    addedAt: "2026-10-23",
    description:
      "곡선의 손잡이를 끌고 실제 움직임을 재생하며 CSS easing을 만듭니다.",
    tags: ["tools", "motion", "curve", "editor", "곡선"],
  },
  {
    id: "collaborative-cursor",
    name: "Collaborative cursor",
    group: "Data display",
    component: "CollaborativeCursor",
    addedAt: "2026-10-23",
    description:
      "호출자가 제공한 동료 위치와 메시지를 표시하는 공유 커서 표면.",
    tags: ["tools", "cursor", "collaboration", "커서"],
  },
  {
    id: "slash-command-editor",
    name: "Slash command editor",
    group: "Forms",
    component: "SlashCommandEditor",
    addedAt: "2026-10-23",
    description: "/ 명령으로 제목·인용·코드 블록을 고르는 텍스트 편집기.",
    tags: ["tools", "editor", "document", "편집"],
  },
  {
    id: "chart-range-navigator",
    name: "Chart range navigator",
    group: "Data display",
    component: "ChartRangeNavigator",
    addedAt: "2026-10-23",
    description:
      "미니 차트의 선택 구간을 이동하며 실제 데이터 부분집합을 확대합니다.",
    tags: ["tools", "chart", "range", "차트"],
  },
  {
    id: "carousel-scrubber",
    name: "Carousel scrubber",
    group: "Navigation",
    component: "CarouselScrubber",
    addedAt: "2026-10-23",
    description:
      "터치·이전/다음 버튼·진행 막대로 콘텐츠 위치를 빠르게 탐색합니다.",
    tags: ["tools", "carousel", "media", "슬라이드"],
  },
  {
    id: "dialog-stack",
    name: "Dialog stack",
    group: "Overlays",
    component: "DialogStack",
    addedAt: "2026-10-23",
    description: "한 모달의 포커스 범위 안에서 여러 단계를 앞뒤로 이동합니다.",
    tags: ["tools", "dialog", "steps", "단계"],
  },
  {
    id: "live-code-sandbox",
    name: "Live code sandbox",
    group: "Patterns",
    component: "LiveCodeSandbox",
    addedAt: "2026-10-23",
    description:
      "HTML·CSS·JavaScript를 편집하고 격리된 iframe에서 실제로 실행합니다.",
    tags: ["tools", "code", "editor", "sandbox", "코드"],
  },
] as const;
export const toolsExamples = {
  "tag-input":
    '<TagInput label="Topics" name="topics" defaultValue={["Design"]} suggestions={["React", "Motion"]} />',
  "wheel-picker":
    '<WheelPicker label="Duration" name="duration" options={[{ value: "15", label: "15 minutes" }, { value: "30", label: "30 minutes" }]} />',
  "color-picker":
    '<ColorPicker label="Accent" name="accent" defaultValue="#5577ddff" />',
  "bezier-editor":
    '<BezierEditor label="Motion curve" defaultValue={[.22, .75, .3, 1]} onValueChange={setCurve} />',
  "collaborative-cursor":
    "<CollaborativeCursor peers={peers} onPositionChange={sendPosition}>Shared document</CollaborativeCursor>",
  "slash-command-editor":
    '<SlashCommandEditor label="Draft" name="document" value={blocks} onValueChange={setBlocks} />',
  "chart-range-navigator":
    '<ChartRangeNavigator data={points} value={range} onValueChange={setRange} label="Weekly visits" />',
  "carousel-scrubber":
    '<CarouselScrubber items={[{ id: "one", title: "First project", content: <img src="/project.webp" alt="Project screenshot" /> }]} />',
  "dialog-stack":
    '<DialogStack open={open} onOpenChange={setOpen} steps={[{ id: "name", title: "Project name", content: <TextField label="Name" /> }, { id: "ready", title: "Ready", content: <p>Review your choices.</p> }]} />',
  "live-code-sandbox":
    '<LiveCodeSandbox autoRun defaultValue={{ html: "<button>Try me</button>", css: "button { padding: 16px; }", js: "document.querySelector(\'button\').onclick = () => document.body.style.background = \'#eee\';" }} />',
} satisfies Record<string, string>;
