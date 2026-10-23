# Mingu UI

웹의 공통 토큰, 테마, 기본 컴포넌트와 인터랙션.

에이전트 작업 안내: [AGENTS.md](./AGENTS.md) — 소스 위치, 수정 기준, 검증·배포 명령.

[홈](https://ui.mingu.xyz): 실제 컴포넌트로 만든 인터랙티브 랜딩. 입자 조형물을 바꾸고, 토큰·버튼 반응을 조절하며 코드와 결과를 함께 확인합니다. 문서와 아래쪽 작업대는 필요한 시점에 불러옵니다.

[All](https://ui.mingu.xyz/all): 전체 컴포넌트를 검색·카테고리 필터로 찾습니다. 미리보기가 기본이며 화면 근처의 데모부터 렌더링합니다. All과 Newest는 3열(큰 화면 4열, 모바일 1열) 라이브 타일 갤러리를 사용합니다. 카드 이름을 누르면 전체 미리보기와 사용 코드를 열 수 있습니다. 가벼운 텍스트 목록으로도 전환할 수 있습니다.

[Newest](https://ui.mingu.xyz/newest): 새 인터랙션을 추가일로부터 30일 동안 먼저 볼 수 있습니다. 전체 목록을 한 페이지에서 탐색하며 화면 가까이의 데모부터 렌더링합니다. 미리보기 타일에서 핵심 동작을 체험하고 카드 이름을 눌러 전체 설정과 사용 코드를 확인합니다.

[통합 카탈로그](https://ui.mingu.xyz): 기능별 탐색·테마·미리보기·사용 코드.

[Controls 워크벤치](https://ui.mingu.xyz/controls): 크기·상태·강조색을 바꾸며 실제 컨트롤과 코드를 확인합니다.

모바일 인터랙션: [Swipe actions](https://ui.mingu.xyz/swipe-actions) · [Pull to refresh](https://ui.mingu.xyz/pull-to-refresh) · [Long press menu](https://ui.mingu.xyz/long-press-menu) · [Selection bar](https://ui.mingu.xyz/selection-bar).

설치·설계 원칙·Core API·테마·새 웹 도입 방법: [Design system](./DESIGN_SYSTEM.md).

```tsx
import { DesignSystemProvider, Button, Card } from '@mingu/interaction-ui/system';
import '@mingu/interaction-ui/system.css';
```

기본 UI 전체 목록과 상태별 예제: [Components](./COMPONENTS.md).

## Interaction components

```tsx
import { CodeBlock, RailToc, ScrollProgress } from '@mingu/interaction-ui';
import '@mingu/interaction-ui/styles.css';
```

React 19+, TypeScript source exports. A consumer must transpile this package
(Next.js: `transpilePackages: ['@mingu/interaction-ui']`). No Next.js, Tailwind,
blog API, or sibling workspace dependencies. The package has its own tsconfig.
Syntax highlighting uses highlight.js (BSD-3-Clause).

`CodeBlock` accepts `code`, `language`, `filename`, `lineNumbers` and
`highlightLines` (1-based). Registered languages: TypeScript/TSX, JavaScript,
JSON, CSS, Bash and HTML/XML; unsupported languages render as escaped plain text.
Code stays selectable; copying failures are announced to screen readers.

Navigation components accept `sections: { id, label, depth? }[]`, `offset`
and an optional `containerRef`. IDs must be unique in the document. Without a
container ref they track the window. Sections must appear in reading order.
Progress measures the scrollable range of the container or document, including
its padding. The scroll-progress popover is a disclosure, not a modal or menu:
use Tab to reach its links, Escape or an outside click to dismiss it.

Override `--mru-bg`, `--mru-surface`, `--mru-text`, `--mru-muted`,
`--mru-border`, `--mru-accent`, `--mru-highlight`, `--mru-keyword`,
`--mru-string`, `--mru-number`, `--mru-mono` on an ancestor for theming.
Defaults provide a light theme; the demo maps these variables to blog tokens.
Motion follows `prefers-reduced-motion`.

## Verification

`npm run typecheck` checks the standalone package. `npx playwright install chromium`
installs the test browser; `npm run test:browser` runs the isolated browser fixture
without a blog server. To use an installed Google Chrome instead, run
`PLAYWRIGHT_CHANNEL=chrome npm run test:browser`. The tests cover escaped code,
raw-code copying and failure feedback, nested scrolling, section navigation,
disclosure focus, reduced motion, and narrow viewports.

## Repository and consumers

Source repository: https://github.com/Linternas/ui

This repository is the standalone package root. Install with `npm ci` and run
`npm run typecheck`.

A consuming monorepo can keep this repository as a submodule:

```sh
git submodule add https://github.com/Linternas/ui.git packages/interaction-ui
git submodule update --init --recursive
npm install
```

For a fresh clone of a consumer, use `git clone --recurse-submodules` or run
`git submodule update --init --recursive` before installing dependencies.
The package name and source exports stay the same. Consumers need to transpile
TypeScript, import the stylesheet, and provide their own theme variables.

## Collection

Display: Folder, CodeBlock, GravityLetters, GithubActivity, StepPlayer,
AnimatedCounter, VoiceNote, Faq. AI: FluidOrb, GridReveal, MatrixOrb, WebSearch
(with WebSearchAnswer and WebSearchCitation), AiStatus. Navigation:
BounceSidebar, HookSidebar, ProximitySidebar, ScrollProgress, RailToc, GooeyNav.
Inputs: DurationPicker, OtpInput, DeleteButton, TaskList. Feedback:
EmojiReaction, NotificationBell.

Components expose typed data/callback props; none authenticate, delete server
data, call AI services, fetch GitHub accounts, or request notification permissions.
VoiceNote supports a real audio source and a timer-based preview without one.
GravityLetters accepts optional orientation events when the environment already
permits them; it does not request sensor permissions. FluidOrb falls back to a
CSS gradient if WebGL is unavailable. Canvas loops pause outside the viewport
and in background tabs. Use InteractionProvider to apply the system's reduced
motion preference to all Motion transitions.

## Standalone docs / Railway

이 저장소의 루트에서 카탈로그를 독립적으로 배포할 수 있다.

```sh
npm ci
npm run build
npm start
```

- Railway Root Directory: `/`
- Build Command: `npm run build`
- Start Command: `npm start`
- Healthcheck Path: `/healthz`
- `PORT`는 Railway가 제공하며 서버는 `0.0.0.0`에 바인딩한다.

`railpack.json`에 Node provider와 빌드·시작 명령을 명시했다. npm 버전은 packageManager, Node 범위는 engines로 고정한다. 데모 소스·스타일·미디어는 `docs/`에 있으며 블로그나 Next.js가 없어도 동작한다. 패키지의 기존 exports는 유지한다. 컴포넌트 URL은 `/button`, `/floating-field`처럼 루트 아래에 있으며 직접 접속·새로고침을 지원한다. 기존 `/lab/ui/...` 링크도 대응 주소로 연결한다.

```sh
npm run typecheck:docs
npm run test:docs
```

### Playground

[Playground](https://ui.mingu.xyz/playground)는 화면 전체를 쓰는 실험 공간이다. 글자를 입자로 밀어내는 **ParticleText**, 생각을 움직이고 연결하는 **SpatialBoard**, 빛과 소리로 루프를 만드는 **SoundPad**를 제공한다. 개별 컴포넌트 페이지와 Newest에서도 같은 구현을 사용한다. 패키지 루트 exports와 [API 문서](./DESIGN_SYSTEM.md#experimental-playground)를 통해 다른 앱에도 조합할 수 있다.

**ClothPlayground**, **FluidSandbox**, **OrbitComposer**에서는 천을 잡아당기고 찢거나, 입자에 소용돌이를 만들거나, 궤도를 편집해 선을 그릴 수 있다. Playground의 실험 목록에서 이동하며 기존 컴포넌트처럼 패키지 루트에서 가져온다.

## Interactive lab (0.15)

StickerPeel, ElasticMesh, ImageParticleMorph, DitherReveal, FluidGlassLens, Lanyard, DomeGallery, FoldablePaper, WebcamPixelGrid, ImageRelighting. 라이브 카탈로그와 `/playground/<id>`에서 같은 구현을 사용한다. [API와 입력·성능·권한 규칙](./docs/collections/lab.md). 새 항목은 실제 추가일로부터 30일 동안 Newest에 표시한다.

## Navigation and scroll (0.16.0)

PageTransition, DynamicStatusIsland, AnimatedMegaMenu, SortableGrid, CardNavigation, ScrollStack, StickyScrollStory, FooterReveal, ScrollExpandMedia, CoverflowCarousel. 각 항목의 라이브 데모·사용 코드·Newest를 제공한다. [API와 조작 규칙](./docs/collections/navigation.md).

## Media and workspace (0.17.0)

SplitFlapDisplay, VariableFontProximity, VerticalReel, StoryViewer, VideoPlayer, ImageCropper, CalendarBoard, GanttTimeline, KanbanBoard, FileTree. 각 항목의 라이브 데모·사용 코드·Newest를 제공한다. [API와 조작 규칙](./docs/collections/media.md).

## Interactive tools (0.18.0)

TagInput, WheelPicker, ColorPicker, BezierEditor, CollaborativeCursor, SlashCommandEditor, ChartRangeNavigator, CarouselScrubber, DialogStack, LiveCodeSandbox. 각 항목의 라이브 데모·사용 코드·Newest를 제공한다. [API와 조작 규칙](./docs/collections/tools.md).

## AI workbench (0.19.0)

PromptComposer, ToolExecutionPanel, PlanReview, ApprovalCard, ContextUsageMeter, ArtifactPanel, Checkpoint, ModelSelector, VoiceInput, StreamingTerminal. 각 항목의 라이브 데모·사용 코드·Newest를 제공한다. [API와 조작 규칙](./docs/collections/ai.md).
