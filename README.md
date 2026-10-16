# Mingu UI

웹의 공통 토큰, 테마, 기본 컴포넌트와 인터랙션.

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
