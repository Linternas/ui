import { mediaCatalog, mediaExamples } from "../collections/media.catalog";
import {
  navigationCatalog,
  navigationExamples,
} from "../collections/navigation.catalog";
import { labCatalog, labExamples } from "../collections/lab.catalog";
export const interactionCatalog = [
  ...mediaCatalog,
  ...navigationCatalog,
  ...labCatalog,
  {
    id: "cloth-playground",
    name: "Cloth playground",
    group: "Visual effects",
    component: "ClothPlayground",
    addedAt: "2026-10-23",
    tags: ["experimental", "playground", "physics", "실험"],
    description:
      "천을 잡아당기고 실을 끊습니다. 바람·중력·고정점을 바꾸며 부드러운 움직임을 만듭니다.",
  },
  {
    id: "fluid-sandbox",
    name: "Fluid sandbox",
    group: "Visual effects",
    component: "FluidSandbox",
    addedAt: "2026-10-23",
    tags: ["experimental", "playground", "physics", "실험"],
    description:
      "입자를 붓고 휘저으며 소용돌이를 만듭니다. 중력과 점도를 조절하는 작은 유체 놀이터.",
  },
  {
    id: "orbit-composer",
    name: "Orbit composer",
    group: "Visual effects",
    component: "OrbitComposer",
    addedAt: "2026-10-23",
    tags: ["experimental", "playground", "generative", "실험"],
    description:
      "세 궤도의 속도와 반경을 바꾸면 새로운 선이 그려집니다. 손으로 편집하는 움직이는 드로잉.",
  },
  {
    id: "particle-text",
    name: "Particle text",
    group: "Visual effects",
    component: "ParticleText",
    addedAt: "2026-10-23",
    tags: ["experimental", "playground", "canvas", "실험"],
    description:
      "글자가 입자가 됩니다. 포인터로 밀어내고 흩뜨리면 다시 제자리로 돌아옵니다.",
  },
  {
    id: "spatial-board",
    name: "Spatial board",
    group: "Data display",
    component: "SpatialBoard",
    addedAt: "2026-10-23",
    tags: ["experimental", "playground", "canvas", "실험"],
    description:
      "생각을 공간에 놓고 연결합니다. 드래그·편집·확대·이동을 지원하는 작은 무한 보드.",
  },
  {
    id: "sound-pad",
    name: "Sound pad",
    group: "Actions",
    component: "SoundPad",
    addedAt: "2026-10-23",
    tags: ["experimental", "playground", "audio", "실험"],
    description:
      "빛으로 연주하는 여덟 개의 패드. 직접 음을 쌓고 반복 패턴을 만듭니다.",
  },
  {
    id: "swipe-actions",
    tags: ["mobile", "touch", "모바일", "터치"],
    name: "Swipe actions",
    group: "Actions",
    component: "SwipeActions",
    addedAt: "2026-10-22",
    description:
      "목록을 좌우로 밀어 액션을 꺼냅니다. 버튼으로도 열고 비동기 실패 시 다시 시도합니다.",
  },
  {
    id: "pull-to-refresh",
    tags: ["mobile", "touch", "모바일", "터치"],
    name: "Pull to refresh",
    group: "Feedback",
    component: "PullToRefresh",
    addedAt: "2026-10-22",
    description:
      "목록 맨 위에서 당겨 새로고침합니다. 중복 실행·취소·실패 상태와 Refresh 버튼을 제공합니다.",
  },
  {
    id: "long-press-menu",
    tags: ["mobile", "touch", "모바일", "터치"],
    name: "Long press menu",
    group: "Overlays",
    component: "LongPressMenu",
    addedAt: "2026-10-22",
    description:
      "카드를 길게 누르면 하단 액션 시트가 열립니다. 이동·스크롤 시 취소하고 버튼 대안을 유지합니다.",
  },
  {
    id: "selection-bar",
    tags: ["mobile", "touch", "모바일", "터치"],
    name: "Selection bar",
    group: "Actions",
    component: "SelectionBar",
    addedAt: "2026-10-22",
    description:
      "선택한 항목 수와 일괄 액션을 하단에 모읍니다. safe area·실행 중·오류·선택 해제를 지원합니다.",
  },
  {
    id: "hover-gallery",
    name: "Hover gallery",
    group: "Data display",
    component: "HoverGallery",
    addedAt: "2026-10-22",
    description:
      "포인터·포커스·터치 선택으로 이미지 패널이 넓어집니다. 방향키로도 살펴볼 수 있습니다.",
  },
  {
    id: "text-reveal",
    name: "Text reveal",
    group: "Visual effects",
    component: "TextReveal",
    addedAt: "2026-10-22",
    description:
      "스크롤을 따라 단어가 또렷해지는 문장. 중첩 스크롤과 모션 감소를 지원합니다.",
  },
  {
    id: "cursor-trail",
    name: "Cursor trail",
    group: "Visual effects",
    component: "CursorTrail",
    addedAt: "2026-10-22",
    description:
      "커서의 자취를 따라 짧게 남는 이미지. 터치·모션 감소에서는 정적인 컬렉션을 보여줍니다.",
  },
  {
    id: "avatar-cluster",
    name: "Avatar cluster",
    group: "Data display",
    component: "AvatarCluster",
    addedAt: "2026-10-22",
    description:
      "겹쳐진 아바타가 펼쳐지고 프로필 카드로 이어집니다. 키보드와 터치에서도 접근합니다.",
  },
  {
    id: "hold-to-confirm",
    name: "Hold to confirm",
    group: "Actions",
    component: "HoldToConfirm",
    addedAt: "2026-10-22",
    description:
      "누르는 동안 차오르는 확인 버튼. 일반 클릭·키보드 확인과 비동기 실패 재시도를 제공합니다.",
  },
  {
    id: "number-scrubber",
    name: "Number scrubber",
    group: "Forms",
    component: "NumberScrubber",
    addedAt: "2026-10-22",
    description:
      "핸들을 드래그해 수치를 미세 조정합니다. 네이티브 숫자 입력·키보드·폼 동작을 유지합니다.",
  },
  {
    id: "image-lens",
    name: "Image lens",
    group: "Data display",
    component: "ImageLens",
    addedAt: "2026-10-22",
    description:
      "이미지 위를 움직이는 확대 렌즈. 터치 고정과 방향키로도 세부를 살펴볼 수 있습니다.",
  },
  {
    id: "directional-card",
    name: "Directional card",
    group: "Layout",
    component: "DirectionalCard",
    addedAt: "2026-10-22",
    description:
      "포인터가 들어온 방향에서 표면이 펼쳐지는 링크 카드. 제목과 링크는 항상 유지합니다.",
  },
  {
    id: "looping-ticker",
    name: "Looping ticker",
    group: "Data display",
    component: "LoopingTicker",
    addedAt: "2026-10-22",
    description:
      "일정한 속도로 이어지는 콘텐츠 스트립. 재생·일시정지와 포커스·모션 감소를 지원합니다.",
  },
  {
    id: "rotating-text",
    name: "Rotating text",
    group: "Visual effects",
    component: "RotatingText",
    addedAt: "2026-10-22",
    description:
      "단어가 짧게 흐려졌다 다음 표현으로 이어지는 타이포그래피. 폭을 유지하고 재생을 제어합니다.",
  },

  {
    id: "image-lightbox",
    name: "Image lightbox",
    group: "Overlays",
    component: "ImageLightbox",
    addedAt: "2026-10-22",
    description:
      "클릭한 이미지가 원래 자리에서 확대됩니다. 확대·이동·핀치·사진 넘기기를 지원합니다.",
  },
  {
    id: "expandable-card",
    name: "Expandable card",
    group: "Layout",
    component: "ExpandableCard",
    addedAt: "2026-10-22",
    description:
      "작은 카드가 상세 대화상자로 이어지고 닫으면 원래 자리로 돌아옵니다.",
  },
  {
    id: "animated-filter-bar",
    name: "Animated filter bar",
    group: "Navigation",
    component: "AnimatedFilterBar",
    addedAt: "2026-10-22",
    description:
      "필터 선택과 결과 카드 재배치를 연결합니다. 개수·빈 결과·키보드 선택을 함께 제공합니다.",
  },
  {
    id: "resizable-panels",
    name: "Resizable panels",
    group: "Layout",
    component: "ResizablePanels",
    addedAt: "2026-10-22",
    description:
      "경계선을 잡아 두 영역의 크기를 바꿉니다. 키보드 조절·접기·복원을 지원합니다.",
  },
  {
    id: "sortable-list",
    name: "Sortable list",
    group: "Data display",
    component: "SortableList",
    addedAt: "2026-10-22",
    description:
      "핸들을 잡아 항목 순서를 바꿉니다. 방향키·Home·End로도 같은 결과를 만듭니다.",
  },
  {
    id: "inline-edit",
    name: "Inline edit",
    group: "Forms",
    component: "InlineEdit",
    addedAt: "2026-10-22",
    description:
      "텍스트가 같은 자리의 입력으로 전환됩니다. 저장·취소·검증·실패 재시도까지 연결합니다.",
  },
  {
    id: "selection-toolbar",
    name: "Selection toolbar",
    group: "Actions",
    component: "SelectionToolbar",
    addedAt: "2026-10-22",
    description:
      "선택한 문장 옆에 복사·인용 액션이 나타납니다. 실제 선택 범위와 텍스트를 전달합니다.",
  },
  {
    id: "smart-header",
    name: "Smart header",
    group: "Navigation",
    component: "SmartHeader",
    addedAt: "2026-10-22",
    description:
      "아래로 읽을 때 접히고 위로 움직이면 돌아오는 헤더. 포커스가 들어오면 항상 표시합니다.",
  },
  {
    id: "code-tabs",
    name: "Code tabs",
    group: "Data display",
    component: "CodeTabs",
    addedAt: "2026-10-22",
    description:
      "파일·언어·명령어 탭과 코드 블록을 조합합니다. 선택 표시·높이 전환·실제 복사를 지원합니다.",
  },
  {
    id: "bottom-sheet",
    name: "Bottom sheet",
    group: "Overlays",
    component: "BottomSheet",
    addedAt: "2026-10-22",
    description:
      "아래에서 펼쳐지는 모달 시트. 손잡이로 높이를 조절하고 지정한 위치에 멈춥니다.",
  },
  {
    id: "action-toast",
    name: "Action toast",
    group: "Feedback",
    component: "ActionToast",
    addedAt: "2026-10-22",
    description:
      "자리를 양보하며 쌓이는 알림. 실행 취소 액션·진행률·실패 재시도를 연결합니다.",
  },
  {
    id: "file-dropzone",
    name: "File dropzone",
    group: "Forms",
    component: "FileDropzone",
    addedAt: "2026-10-22",
    description:
      "파일 드롭·이미지 미리보기·진행률·재시도. 실제 파일 입력과 업로드 콜백을 사용합니다.",
  },
  {
    id: "radial-menu",
    name: "Radial menu",
    group: "Actions",
    component: "RadialMenu",
    addedAt: "2026-10-22",
    description:
      "한 번의 클릭으로 원형으로 펼쳐지는 액션 메뉴. 방향키와 Escape로도 가볍게 조작합니다.",
  },
  {
    id: "preview-link",
    name: "Preview link",
    group: "Display",
    component: "PreviewLink",
    addedAt: "2026-10-22",
    description:
      "링크 위로 커서를 옮기면 이미지가 따라옵니다. 키보드 포커스에서도 같은 미리보기를 제공합니다.",
  },
  {
    id: "morphing-search",
    name: "Morphing search",
    group: "Forms",
    component: "MorphingSearch",
    addedAt: "2026-10-22",
    description:
      "작은 검색 버튼이 입력창으로 펼쳐집니다. 검색·지우기·접기를 하나의 흐름으로 연결합니다.",
  },
  {
    id: "elastic-slider",
    name: "Elastic slider",
    group: "Forms",
    component: "ElasticSlider",
    addedAt: "2026-10-22",
    description:
      "잡아당긴 방향으로 휘어지고 놓으면 돌아오는 탄성 슬라이더. 값 조절은 네이티브 range를 사용합니다.",
  },
  {
    id: "swipe-deck",
    name: "Swipe deck",
    group: "Display",
    component: "SwipeDeck",
    addedAt: "2026-10-22",
    description:
      "카드를 잡아 넘기면 다음 장이 올라오는 스프링 스택. 터치·버튼 탐색을 함께 지원합니다.",
  },
  {
    id: "image-compare",
    name: "Image compare",
    group: "Display",
    component: "ImageCompare",
    addedAt: "2026-10-22",
    description:
      "같은 프레임 안에서 두 이미지를 드래그로 비교합니다. 키보드로도 정밀하게 조절할 수 있습니다.",
  },
  {
    id: "focus-dock",
    name: "Focus dock",
    group: "Navigation",
    component: "FocusDock",
    addedAt: "2026-10-22",
    description:
      "포인터와의 거리에 따라 아이콘이 부드럽게 확대되고 떠오르는 액션 Dock.",
  },
  {
    id: "command-palette",
    name: "Command palette",
    group: "Overlays",
    component: "CommandPalette",
    addedAt: "2026-10-22",
    description:
      "검색과 방향키로 액션을 찾는 커맨드 창. 선택적으로 Cmd/Ctrl+K를 연결합니다.",
  },
  {
    id: "scramble-text",
    name: "Scramble text",
    group: "Visual effects",
    component: "ScrambleText",
    addedAt: "2026-10-22",
    description:
      "흩어진 글자가 원문으로 차례로 정렬되는 짧은 타이포그래피 인터랙션.",
  },
  {
    id: "folder",
    name: "Folder",
    group: "Display",
    description:
      "A little space for the things you collect. Hover to fan out, click to open.",
    component: "Folder",
  },
  {
    id: "code-block",
    name: "Code block",
    group: "Display",
    description:
      "Readable syntax, deliberate highlights, and code you can take with you.",
    component: "CodeBlock",
  },
  {
    id: "gravity-letters",
    name: "Gravity letters",
    group: "Display",
    description:
      "Letters with a little weight. Click, hold, and let them find their place.",
    component: "GravityLetters",
  },
  {
    id: "github-activity",
    name: "GitHub activity",
    group: "Display",
    description:
      "A year of small steps, with a closer look at where they happened.",
    component: "GithubActivity",
  },
  {
    id: "step-player",
    name: "Step player",
    group: "Display",
    description: "Play, pause, jump ahead. A sequence that moves at your pace.",
    component: "StepPlayer",
  },
  {
    id: "animated-counter",
    name: "Animated counter",
    group: "Display",
    description:
      "Numbers that roll into their next place, one digit at a time.",
    component: "AnimatedCounter",
  },
  {
    id: "voice-note",
    name: "Voice note",
    group: "Display",
    description:
      "A quiet waveform. Press play, scrub through, or change the pace.",
    component: "VoiceNote",
  },
  {
    id: "faq",
    name: "FAQ",
    group: "Display",
    description: "Questions and answers, with the ease of a conversation.",
    component: "Faq",
  },
  {
    id: "fluid-orb",
    name: "Fluid orb",
    group: "AI",
    description:
      "Color in constant conversation. A flowing, softly shaded WebGL sphere.",
    component: "FluidOrb",
  },
  {
    id: "grid-reveal",
    name: "Grid reveal",
    group: "AI",
    description:
      "From possibility to picture. A grid resolves into the finished image.",
    component: "GridReveal",
  },
  {
    id: "matrix-orb",
    name: "Matrix orb",
    group: "AI",
    description:
      "A constellation of dots, listening, thinking, or simply being.",
    component: "MatrixOrb",
  },
  {
    id: "web-search",
    name: "Web search",
    group: "AI",
    description:
      "Sources in view. Open the cards and follow an answer back to its origin.",
    component: "WebSearch",
  },
  {
    id: "ai-status",
    name: "Inline AI status",
    group: "AI",
    description:
      "A small signal for the work in progress, from first thought to final word.",
    component: "AiStatus",
  },
  {
    id: "bounce-sidebar",
    name: "Bounce sidebar",
    group: "Navigation",
    description:
      "A familiar list, with an indicator that lands with a little spring.",
    component: "BounceSidebar",
  },
  {
    id: "hook-sidebar",
    name: "Hook sidebar",
    group: "Navigation",
    description: "A dashed rail that bends toward the place you have chosen.",
    component: "HookSidebar",
  },
  {
    id: "proximity-sidebar",
    name: "Proximity sidebar",
    group: "Navigation",
    description:
      "A navigation rail that responds before you click. Move a little closer.",
    component: "ProximitySidebar",
  },
  {
    id: "scroll-progress",
    name: "Scroll progress",
    group: "Navigation",
    description:
      "How far you have come, and somewhere to go next. Scroll, open, jump.",
    component: "ScrollProgress",
  },
  {
    id: "rail-toc",
    name: "Rail TOC",
    group: "Navigation",
    description: "A small paper guide following the shape of a longer story.",
    component: "RailToc",
  },
  {
    id: "gooey-nav",
    name: "Gooey nav",
    group: "Navigation",
    description:
      "A soft, stretching selection that finds its own place in the group.",
    component: "GooeyNav",
  },
  {
    id: "duration-picker",
    name: "Duration picker",
    group: "Inputs",
    description:
      "A compact stretch of time. Open the segments, edit, and bring them together.",
    component: "DurationPicker",
  },
  {
    id: "otp-input",
    name: "OTP input",
    group: "Inputs",
    description:
      "One code, one input. Type, paste, or autofill into a row of animated slots.",
    component: "OtpInput",
  },
  {
    id: "delete-button",
    name: "Delete button",
    group: "Inputs",
    description:
      "A moment to reconsider. Confirmation happens right where you clicked.",
    component: "DeleteButton",
  },
  {
    id: "task-list",
    name: "Task list",
    group: "Inputs",
    description:
      "Make a little progress. Finished tasks move gently out of the way.",
    component: "TaskList",
  },
  {
    id: "emoji-reaction",
    name: "Emoji reaction",
    group: "Feedback",
    description:
      "Sometimes a small reaction says enough. Pick one and send it on its way.",
    component: "EmojiReaction",
  },
  {
    id: "notification-bell",
    name: "Notification bell",
    group: "Feedback",
    description: "A little nudge, a tiny badge. Something new is waiting.",
    component: "NotificationBell",
  },
] as const;
export type InteractionComponentId = (typeof interactionCatalog)[number]["id"];
export const interactionExamples: Record<InteractionComponentId, string> = {
  ...mediaExamples,
  ...navigationExamples,
  ...labExamples,
  "cloth-playground": `<ClothPlayground defaultWind={0.4} defaultGravity={0.7} />`,
  "fluid-sandbox": `<FluidSandbox defaultCount={180} />`,
  "orbit-composer": `<OrbitComposer defaultPreset="petal" />`,
  "particle-text": `<ParticleText defaultText="PLAY" />`,
  "spatial-board": `<SpatialBoard />`,
  "sound-pad": `<SoundPad onNote={(note) => console.log(note.label)} />\n// Audio starts only after the user chooses Enable sound.`,
  "swipe-actions":
    '<SwipeActions label="Note actions" endActions={[{id:"archive",label:"Archive",onAction:archiveNote}]}><p>Field notes</p></SwipeActions>',
  "pull-to-refresh":
    '<PullToRefresh label="Reading list" onRefresh={async ({signal}) => { await reloadNotes(signal); }}><p>Your reading list</p></PullToRefresh>',
  "long-press-menu":
    '<LongPressMenu label="Note actions" actions={[{id:"pin",label:"Pin note",onAction:pinNote},{id:"archive",label:"Archive note",onAction:archiveNote}]}><p>Hold this note to open actions.</p></LongPressMenu>',
  "selection-bar":
    '<SelectionBar count={selectedIds.length} onClear={() => setSelectedIds([])} actions={[{id:"archive",label:"Archive",onAction:() => archiveNotes(selectedIds)}]} />',

  "hover-gallery":
    '<HoverGallery label="Perspectives" items={[{id:"day",src:"/day.jpg",alt:"Mountains in daylight",title:"Daylight"},{id:"night",src:"/night.jpg",alt:"Mountains at night",title:"After hours"}]} />',
  "text-reveal":
    '<TextReveal text="Less noise. More meaning. Make room for the details." />',
  "cursor-trail":
    '<CursorTrail label="Inspiration" images={[{src:"/day.jpg",alt:"Mountains in daylight"},{src:"/night.jpg",alt:"Mountains at night"}]}><p>Leave a little inspiration.</p></CursorTrail>',
  "avatar-cluster":
    '<AvatarCluster label="Team" people={[{id:"min",name:"Min",role:"Design engineer",bio:"Building thoughtful interfaces.",href:"/people/min"},{id:"ari",name:"Ari",role:"Product designer"}]} />',
  "hold-to-confirm":
    '<HoldToConfirm label="Hold to publish" confirmationTitle="Publish this page?" onConfirm={async () => { await publishPage(); }} />',
  "number-scrubber":
    '<NumberScrubber label="Type size" name="fontSize" defaultValue={32} min={16} max={72} step={1} hint="Drag the handle or type a value." />',

  "image-lens":
    '<ImageLens src="/project.jpg" alt="Project details" zoom={2.5} />',
  "directional-card":
    '<DirectionalCard href="/projects/field-notes" title="Field notes" description="A closer look at the project" image={{src:"/project.jpg",alt:"Project landscape"}} />',
  "looping-ticker":
    '<LoopingTicker label="Built with" speed={36} items={[{id:"react",content:"React"},{id:"typescript",content:"TypeScript"},{id:"motion",content:"Motion"}]} />',
  "rotating-text":
    '<RotatingText words={["people.","clarity.","tomorrow."]} label="Build for people, clarity and tomorrow." interval={2400} />',

  "image-lightbox":
    '<ImageLightbox images={[{id:"day",src:"/day.jpg",alt:"Mountains in daylight"},{id:"night",src:"/night.jpg",alt:"Mountains at night"}]} />',
  "expandable-card":
    '<ExpandableCard title="Field notes" description="A closer look at the project" image={{src:"/project.jpg",alt:"Project preview"}}><p>Project details and links go here.</p></ExpandableCard>',
  "animated-filter-bar":
    '<AnimatedFilterBar label="Project category" filters={[{value:"all",label:"All"},{value:"web",label:"Web"}]} items={[{id:"one",category:"web",name:"Field notes"}]} getKey={item => item.id} getFilter={item => item.category} renderItem={item => <p>{item.name}</p>} />',
  "resizable-panels":
    '<ResizablePanels label="Preview width" defaultValue={45} first={<p>Editor</p>} second={<p>Preview</p>} />',
  "sortable-list":
    '<SortableList label="Links" items={items} onReorder={setItems} />',
  "inline-edit":
    '<InlineEdit label="Project name" value={name} onSave={async next => { await saveName(next); setName(next); }} required maxLength={80} />',
  "selection-toolbar":
    '<SelectionToolbar actions={[{id:"quote",label:"Quote",onSelect:text => setQuote(text)}]}><p>Select a sentence to copy or quote it.</p></SelectionToolbar>',
  "smart-header":
    '<SmartHeader><strong>Field notes</strong><a href="/about">About</a></SmartHeader>',
  "code-tabs":
    '<CodeTabs items={[{id:"npm",label:"npm",language:"bash",code:"npm run build"},{id:"pnpm",label:"pnpm",language:"bash",code:"pnpm build"}]} />',
  "bottom-sheet":
    '<BottomSheet open={open} onOpenChange={setOpen} title="Filters" snapPoints={[0.4,0.7,0.92]}><Checkbox>Published only</Checkbox></BottomSheet>',
  "action-toast":
    '<ActionToast messages={[{id:"removed",title:"Note removed",action:{label:"Undo",onAction:restoreNote}}]} onDismiss={id => dismissToast(id)} />',
  "file-dropzone":
    '<FileDropzone label="Images" name="images" accept="image/*" maxFiles={4} maxSize={10485760} onUpload={(file, {signal,onProgress}) => uploadFile(file, {signal,onProgress})} />',
  "radial-menu":
    '<RadialMenu label="Create" onSelect={id => console.log(id)} items={[{id:"note",label:"New note",icon:"+"},{id:"image",label:"Add image",icon:"▧"},{id:"link",label:"Add link",icon:"↗"},{id:"folder",label:"New folder",icon:"□"}]} />',
  "preview-link":
    '<p>Explore <PreviewLink href="/projects" preview={{src:"/project.jpg",title:"Selected work",description:"A closer look at the details."}}>selected work</PreviewLink>.</p>',
  "morphing-search":
    '<MorphingSearch label="Find projects" placeholder="Search projects…" onSearch={query => console.log(query)} />',
  "elastic-slider":
    '<ElasticSlider label="Intensity" name="intensity" defaultValue={60} min={0} max={100} step={1} formatValue={value => `${value}%`} onValueChange={value => console.log(value)} />',
  "swipe-deck":
    '<SwipeDeck label="Projects" items={[{ id: "one", label: "First project", content: <h3>First project</h3> }, { id: "two", label: "Second project", content: <h3>Second project</h3> }]} />',
  "image-compare":
    '<ImageCompare before={{src:"/before.jpg",alt:"Original image"}} after={{src:"/after.jpg",alt:"Edited image"}} />',
  "focus-dock":
    '<FocusDock defaultValue="home" onValueChange={id => console.log(id)} items={[{id:"home",label:"Home",icon:"⌂"},{id:"work",label:"Work",icon:"▧"},{id:"settings",label:"Settings",icon:"⚙"}]} />',
  "command-palette":
    '<CommandPalette open={open} onOpenChange={setOpen} onSelect={id => console.log(id)} shortcut items={[{id:"new",label:"New project",keywords:["create"]},{id:"search",label:"Search files"}]} />',
  "scramble-text":
    '<ScrambleText text="MAKE SOMETHING GOOD." duration={700} />',
  folder: '<Folder color="#4388ed" label="Project files" />',
  "code-block":
    '<CodeBlock code={"const answer = 42;"} language="typescript" filename="answer.ts" highlightLines={[1]} />',
  "gravity-letters": '<GravityLetters type="both" maxGlyphs={80} />',
  "github-activity":
    '<GithubActivity\n  contributions={[{ date: "2026-10-16", count: 5 }]}\n  repos={[{ name: "my-project", count: 5 }]}\n/>',
  "step-player": "<StepPlayer steps={5} duration={2000} />",
  "animated-counter": '<AnimatedCounter value={12849} separator="," />',
  "voice-note": '<VoiceNote src="/audio/note.mp3" />',
  faq: '<Faq items={[{ id: "intro", question: "How does it work?", answer: "Click a question to open its answer." }]} />',
  "fluid-orb": '<FluidOrb size={240} color="#4388ed" />',
  "grid-reveal": '<GridReveal src="/image.jpg" alt="Describe your image" />',
  "matrix-orb": '<MatrixOrb size={240} state="listening" />',
  "web-search":
    '<WebSearch sources={[{ id: "docs", title: "React documentation", url: "https://react.dev", snippet: "Learn about React." }]} />',
  "ai-status": '<AiStatus state="researching" detail="3 sources" timer />',
  "bounce-sidebar":
    '<BounceSidebar items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "hook-sidebar":
    '<HookSidebar items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "proximity-sidebar":
    '<ProximitySidebar items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "scroll-progress":
    '<ScrollProgress sections={[{ id: "intro", label: "Introduction" }, { id: "details", label: "Details" }]} />\n// Add matching IDs to headings in your page.\n// Pass containerRef to track a nested scroll container.',
  "rail-toc":
    '<RailToc sections={[{ id: "intro", label: "Introduction" }, { id: "details", label: "Details", depth: 1 }]} />\n// Add matching IDs to headings in your page.\n// Pass containerRef to track a nested scroll container.',
  "gooey-nav":
    '<GooeyNav items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "duration-picker":
    "<DurationPicker defaultValue={{ hours: 1, minutes: 30 }} />",
  "otp-input": '<OtpInput length={6} type="numbers" />',
  "delete-button":
    "<DeleteButton onConfirm={async () => {\n  // Remove the selected item in your application.\n}} />",
  "task-list":
    '<TaskList defaultItems={[{ id: "first", label: "Make something useful", completed: false }]} />',
  "emoji-reaction": "<EmojiReaction />",
  "notification-bell": "<NotificationBell count={3} />",
};
