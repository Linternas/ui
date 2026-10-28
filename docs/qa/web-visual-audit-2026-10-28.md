# Web visual audit — 2026-10-28

웹 200개의 기본 미리보기를 데스크톱·모바일 × 라이트·다크 **800장으로 직접 비교**했다. 발견한 19개 항목을 보완하고 같은 네 조건에서 다시 확인했다. 38개 항목은 열린 메뉴, 팝업, 편집, 스크롤, 조작 후 결과 또는 수정 후 상세 화면도 확인했다. 신규 컴포넌트는 추가하지 않았다.

## 확인 환경과 판정 범위

- 수정 전 기준: `8f295eb` (0.27.0). 수정 후: 0.27.1 작업 트리.
- macOS 26.2, 실제 설치된 Chrome 156.0.8078.48의 headless 렌더링, Playwright 1.64.1.
- 1440×1000 및 390×1000 CSS px, DPR 1. 경계 회귀 검사는 320px도 포함한다.
- 실제 standalone 프로덕션 빌드 HTTP 응답의 `/docs/<id>`를 사용했다. 모의 마크업으로 대체하지 않았다. 카탈로그의 `motion="full"`을 유지했다.
- 비교 시트는 원본 PNG들을 브라우저 문서 안에 나란히 배치했다. 애니메이션 프레임, 콘텐츠 또는 테마를 이미지 편집으로 바꾸지 않았다.
- 이번 기준은 아래에 명시한 화면·상태에 대한 검토다. 모든 소비 앱 조합, 모든 props와 상태, 실제 Windows/Whale·Safari·모바일 기기 검증을 뜻하지 않는다. React Native는 이번 범위에서 제외했다.

## 수정

| 항목 | 발견·조치 |
| --- | --- |
| ReactionDiffusion | 전체 Euler 간격에서 확산 값이 클램프를 오가며 포화되어 단색으로 변했다. 간격을 0.5로 낮췄다. 760회 계산 후에도 공간 패턴이 유지되는 회귀 검사 추가. |
| CollaborativeCursor | 오른쪽 이름표가 한 글자 너비로 축소되고 입력칸 뒤에 가려졌다. 고정 크기 커서 앵커와 독립된 내용 너비, 방향별 위치, 콘텐츠와의 쌓임 순서를 보완했다. 실제 페인트 순서도 검사한다. |
| MultiSelect | 자식 패널의 별도 고정 너비가 부모 팝업의 내부 폭을 초과했다. 부모 내부 폭을 따르게 했다. 320px에서 검색칸·목록 폭과 선택·Escape 포커스 복귀 확인. |
| DurationPicker | number 입력의 기본 여백이 두 자리 숫자를 잘랐다. 여백·자릿수 폭·숫자 스타일과 스핀 버튼 처리를 정리하고 편집 중 disabled도 전달한다. 24/59 입력·확정 확인. |
| StepPlayer | 다크 모드에서 비활성 트랙이 배경에 묻혔다. 트랙 색과 단계 경계를 보완하고 재생 중 진행 표시를 확인했다. |
| Checkbox / Switch | 각 행이 별도로 가운데 정렬되어 컨트롤 열이 어긋났다. 그룹은 중앙에 두고 내부 행의 시작점을 맞췄다. |
| Dialog / AlertDialog / Drawer / Popover / DropdownMenu / Toast / CardNavigation | 카탈로그 실행 버튼을 중앙에 배치하고 DropdownMenu의 전체 폭 늘어남을 제거했다. 재사용 컴포넌트의 외부 레이아웃은 강제하지 않는다. |
| IconButton / Tooltip / EmptyState | 데모의 아이콘 전용 SVG를 각각 20/20/24px로 맞췄다. |
| Card | 예제 Badge를 글자 너비에 맞게 배치했다. |
| Accordion / local cursor | 남아 있던 플러스 글리프를 공유 SVG로 교체했다. Accordion의 회전·정렬도 유지한다. 문서의 설정 글리프 예제도 SVG/텍스트 버튼으로 교체했다. |

대표 원본 비교: [확산 전](./web-visual-audit-2026-10-28/reaction-before.png) · [후](./web-visual-audit-2026-10-28/reaction-after.png), [커서 전](./web-visual-audit-2026-10-28/cursor-before.png) · [후](./web-visual-audit-2026-10-28/cursor-after.png), [다중 선택 전](./web-visual-audit-2026-10-28/multi-select-before.png) · [후](./web-visual-audit-2026-10-28/multi-select-after.png), [시간 입력 전](./web-visual-audit-2026-10-28/duration-before.png) · [후](./web-visual-audit-2026-10-28/duration-after.png), [단계 트랙 전](./web-visual-audit-2026-10-28/step-player-before.png) · [후](./web-visual-audit-2026-10-28/step-player-after.png), [체크박스 전](./web-visual-audit-2026-10-28/checkbox-before.png) · [후](./web-visual-audit-2026-10-28/checkbox-after.png).

Gravity Letters는 초기 빈 필드가 의도된 상태였다. Enter 12회 후 글자가 나타나 낙하하는 것을 확인했다. Grid Reveal은 예제의 1.9초 생성 대기 이후 이미지가 돌아왔다. 두 항목에 새 결함을 주장하거나 동작을 바꾸지 않았다.

## 사이트 화면

랜딩은 지연 로딩 영역과 각 미리보기를 실제로 스크롤해 표시한 뒤 확인했다. `/all`의 처음·중간·끝, `/docs`, `/controls`, `/playground`를 네 조건에서 보았다. 페이지 가로 넘침과 pageerror는 없었다. Playground는 01부터 표시한다.

All에는 200개 카드가 있고 처음에는 데스크톱 9개, 모바일 3개 데모가 마운트됐다. 100번째·마지막 카드로 이동한 이번 경로에서는 누적 데스크톱 32개, 모바일 11개였다. 방문 상태를 보존하므로 누적 수가 늘어나는 설계이며 이 수를 고정 상한으로 해석하지 않는다. 화면 밖 Canvas의 중단·목록의 지연 마운트는 기존 브라우저 검사에서도 확인했다.

## 검증

- 전체 브라우저 회귀 **294 PASS**. 마지막 커서 쌓임 순서 보완 후 관련 **53 PASS**.
- `npm run typecheck`, `npm run typecheck:docs` PASS. 기존 Web/Native 소비 타입 계약을 유지했다. Native 기기 검증은 수행하지 않았다.
- `npm run test:ssr`: 공개 collection 80개와 세 가지 motion 정책 PASS.
- `npm run build` PASS, `node --test docs/server.test.mjs` 2 PASS. 최초 HTTP 검사는 샌드박스의 포트 바인딩 제한으로 실패해 로컬 서버 실행 권한으로 재검증했다.
- 신규 회귀: 장시간 확산의 실제 픽셀 대비, 이름표의 폭·경계·가림, 다중 선택 팝업의 실제 내부 폭과 선택, 시간 입력의 실제 텍스트 폭과 저장 콜백.
- 재현용 캡처 도구를 4개 컴포넌트 × 네 조건으로 실행해 16개 캡처와 JSON 출력 확인. 가로 넘침·pageerror 없음.
- `git diff --check` PASS.

## 재현과 기록

```sh
npm run build
PORT=4324 npm start
# 별도 터미널: 기본 화면 200 × 네 조건, 총 800장
PLAYWRIGHT_CHANNEL=chrome node scripts/capture-web-audit.mjs
# 일부 재확인
PLAYWRIGHT_CHANNEL=chrome AUDIT_IDS=multi-select,duration-picker node scripts/capture-web-audit.mjs
```

`AUDIT_DIR`와 `AUDIT_BASE_URL`로 출력과 서버를 변경한다. `AUDIT_RESUME=1`은 같은 빌드에서 중단된 캡처를 이어갈 때만 쓴다. 빌드가 달라지면 새 디렉터리를 사용한다. 이 도구는 캡처·오류·넘침 정보를 제공하며 사람의 시각 검토를 자동 승인으로 대체하지 않는다.

전체 기본 캡처와 열린 상태 원본은 로컬 `/private/tmp/mingu-ui-audit-20261028`에 보관했다. 저장소에는 대표 비교 12장과 [200개 검토 manifest](./web-visual-audit-2026-10-28/manifest.json)를 남긴다. manifest는 800개 기본 캡처의 SHA-256과 수정 후 확인 범위를 포함한다.

## 200개 확인표

아래 모든 행의 **기본**은 네 가지 화면 조건을 모두 직접 비교했다는 뜻이다. **추가 화면**은 선택한 한 가지 이상의 열린/변경 상태 또는 수정 후 상세 화면을 네 조건에서 추가로 본 항목이다. 그 밖의 동작 검증은 자동 회귀 검사 범위에 따른다.

| # | ID | 기본 | 추가 화면 | 결과 |
| --- | --- | --- | --- | --- |
| 1 | `copy-button` | 확인 | — | 추가 수정 없음 |
| 2 | `floating-field` | 확인 | — | 추가 수정 없음 |
| 3 | `segmented-control` | 확인 | — | 추가 수정 없음 |
| 4 | `interactive-card` | 확인 | — | 추가 수정 없음 |
| 5 | `button` | 확인 | — | 추가 수정 없음 |
| 6 | `icon-button` | 확인 | — | 아이콘 전용 데모 SVG 20px |
| 7 | `button-group` | 확인 | — | 추가 수정 없음 |
| 8 | `link-button` | 확인 | — | 추가 수정 없음 |
| 9 | `input` | 확인 | — | 추가 수정 없음 |
| 10 | `text-field` | 확인 | — | 추가 수정 없음 |
| 11 | `textarea` | 확인 | — | 추가 수정 없음 |
| 12 | `select` | 확인 | — | 추가 수정 없음 |
| 13 | `textarea-field` | 확인 | — | 추가 수정 없음 |
| 14 | `select-field` | 확인 | — | 추가 수정 없음 |
| 15 | `field` | 확인 | — | 추가 수정 없음 |
| 16 | `password-field` | 확인 | — | 추가 수정 없음 |
| 17 | `search-field` | 확인 | — | 추가 수정 없음 |
| 18 | `number-field` | 확인 | — | 추가 수정 없음 |
| 19 | `date-picker` | 확인 | — | 추가 수정 없음 |
| 20 | `checkbox` | 확인 | — | 그룹 중앙 배치 + 체크박스 열 정렬 |
| 21 | `radio-group` | 확인 | — | 추가 수정 없음 |
| 22 | `switch` | 확인 | — | 그룹 중앙 배치 + 스위치 열 정렬 |
| 23 | `slider` | 확인 | — | 추가 수정 없음 |
| 24 | `file-upload` | 확인 | — | 추가 수정 없음 |
| 25 | `combobox` | 확인 | 확인 | 추가 수정 없음 |
| 26 | `tabs` | 확인 | — | 추가 수정 없음 |
| 27 | `breadcrumbs` | 확인 | — | 추가 수정 없음 |
| 28 | `pagination` | 확인 | — | 추가 수정 없음 |
| 29 | `navigation` | 확인 | — | 추가 수정 없음 |
| 30 | `sidebar` | 확인 | — | 추가 수정 없음 |
| 31 | `dialog` | 확인 | 확인 | 실행 버튼 중앙 배치 |
| 32 | `alert-dialog` | 확인 | 확인 | 실행 버튼·결과 중앙 배치 |
| 33 | `drawer` | 확인 | 확인 | 실행 버튼 중앙 배치 |
| 34 | `popover` | 확인 | 확인 | 실행 버튼 중앙 배치 |
| 35 | `dropdown-menu` | 확인 | 확인 | 실행 버튼 늘어남 제거·중앙 배치 |
| 36 | `tooltip` | 확인 | 확인 | 설정 SVG 20px |
| 37 | `toast` | 확인 | 확인 | 실행 버튼 중앙 배치 |
| 38 | `alert` | 확인 | — | 추가 수정 없음 |
| 39 | `badge` | 확인 | — | 추가 수정 없음 |
| 40 | `status-dot` | 확인 | — | 추가 수정 없음 |
| 41 | `spinner` | 확인 | — | 추가 수정 없음 |
| 42 | `progress` | 확인 | — | 추가 수정 없음 |
| 43 | `skeleton` | 확인 | — | 추가 수정 없음 |
| 44 | `empty-state` | 확인 | — | 상태 SVG 24px |
| 45 | `avatar` | 확인 | — | 추가 수정 없음 |
| 46 | `table` | 확인 | — | 추가 수정 없음 |
| 47 | `data-table` | 확인 | — | 추가 수정 없음 |
| 48 | `accordion` | 확인 | 확인 | 플러스 글리프를 SVG로 교체·중앙 정렬 |
| 49 | `typography` | 확인 | — | 추가 수정 없음 |
| 50 | `card` | 확인 | — | Badge를 내용 너비로 배치 |
| 51 | `container` | 확인 | — | 추가 수정 없음 |
| 52 | `stack` | 확인 | — | 추가 수정 없음 |
| 53 | `grid` | 확인 | — | 추가 수정 없음 |
| 54 | `separator` | 확인 | — | 추가 수정 없음 |
| 55 | `date-range-picker` | 확인 | — | 추가 수정 없음 |
| 56 | `time-picker` | 확인 | — | 추가 수정 없음 |
| 57 | `range-slider` | 확인 | — | 추가 수정 없음 |
| 58 | `tree-select` | 확인 | — | 추가 수정 없음 |
| 59 | `cascader` | 확인 | — | 추가 수정 없음 |
| 60 | `mention-input` | 확인 | — | 추가 수정 없음 |
| 61 | `stepper` | 확인 | — | 추가 수정 없음 |
| 62 | `filter-builder` | 확인 | — | 추가 수정 없음 |
| 63 | `column-manager` | 확인 | — | 추가 수정 없음 |
| 64 | `schedule-picker` | 확인 | — | 추가 수정 없음 |
| 65 | `draggable-window` | 확인 | — | 추가 수정 없음 |
| 66 | `notification-inbox` | 확인 | — | 추가 수정 없음 |
| 67 | `flip-card` | 확인 | — | 추가 수정 없음 |
| 68 | `maze-runner` | 확인 | — | 추가 수정 없음 |
| 69 | `confetti-burst` | 확인 | — | 추가 수정 없음 |
| 70 | `vector-field` | 확인 | — | 추가 수정 없음 |
| 71 | `reaction-diffusion` | 확인 | 확인 | 확산 계산 간격 0.5로 안정화·포화 방지 |
| 72 | `terrain-mesh` | 확인 | — | 추가 수정 없음 |
| 73 | `pendulum-wave` | 확인 | — | 추가 수정 없음 |
| 74 | `clip-path-editor` | 확인 | — | 추가 수정 없음 |
| 75 | `contrast-checker` | 확인 | — | 추가 수정 없음 |
| 76 | `shadow-editor` | 확인 | — | 추가 수정 없음 |
| 77 | `gradient-editor` | 확인 | — | 추가 수정 없음 |
| 78 | `pixel-editor` | 확인 | — | 추가 수정 없음 |
| 79 | `scratch-card` | 확인 | — | 추가 수정 없음 |
| 80 | `undo-history` | 확인 | — | 추가 수정 없음 |
| 81 | `multi-select` | 확인 | 확인 | 검색·선택 목록을 부모 팝업 폭에 맞춤 |
| 82 | `transfer-list` | 확인 | — | 추가 수정 없음 |
| 83 | `rating` | 확인 | — | 추가 수정 없음 |
| 84 | `circular-dial` | 확인 | — | 추가 수정 없음 |
| 85 | `prompt-composer` | 확인 | — | 추가 수정 없음 |
| 86 | `tool-execution-panel` | 확인 | — | 추가 수정 없음 |
| 87 | `plan-review` | 확인 | — | 추가 수정 없음 |
| 88 | `approval-card` | 확인 | — | 추가 수정 없음 |
| 89 | `context-usage-meter` | 확인 | — | 추가 수정 없음 |
| 90 | `artifact-panel` | 확인 | — | 추가 수정 없음 |
| 91 | `checkpoint` | 확인 | — | 추가 수정 없음 |
| 92 | `model-selector` | 확인 | 확인 | 추가 수정 없음 |
| 93 | `voice-input` | 확인 | — | 추가 수정 없음 |
| 94 | `streaming-terminal` | 확인 | — | 추가 수정 없음 |
| 95 | `tag-input` | 확인 | — | 추가 수정 없음 |
| 96 | `wheel-picker` | 확인 | — | 추가 수정 없음 |
| 97 | `color-picker` | 확인 | — | 추가 수정 없음 |
| 98 | `bezier-editor` | 확인 | — | 추가 수정 없음 |
| 99 | `collaborative-cursor` | 확인 | 확인 | 커서 이름표 너비·방향·입력칸 위 표시 보완, 로컬 커서를 SVG로 교체 |
| 100 | `slash-command-editor` | 확인 | — | 추가 수정 없음 |
| 101 | `chart-range-navigator` | 확인 | — | 추가 수정 없음 |
| 102 | `carousel-scrubber` | 확인 | — | 추가 수정 없음 |
| 103 | `dialog-stack` | 확인 | 확인 | 추가 수정 없음 |
| 104 | `live-code-sandbox` | 확인 | — | 추가 수정 없음 |
| 105 | `split-flap-display` | 확인 | — | 추가 수정 없음 |
| 106 | `variable-font-proximity` | 확인 | — | 추가 수정 없음 |
| 107 | `vertical-reel` | 확인 | — | 추가 수정 없음 |
| 108 | `story-viewer` | 확인 | — | 추가 수정 없음 |
| 109 | `video-player` | 확인 | — | 추가 수정 없음 |
| 110 | `image-cropper` | 확인 | — | 추가 수정 없음 |
| 111 | `calendar-board` | 확인 | — | 추가 수정 없음 |
| 112 | `gantt-timeline` | 확인 | — | 추가 수정 없음 |
| 113 | `kanban-board` | 확인 | — | 추가 수정 없음 |
| 114 | `file-tree` | 확인 | — | 추가 수정 없음 |
| 115 | `page-transition` | 확인 | 확인 | 추가 수정 없음 |
| 116 | `dynamic-status-island` | 확인 | — | 추가 수정 없음 |
| 117 | `animated-mega-menu` | 확인 | 확인 | 추가 수정 없음 |
| 118 | `sortable-grid` | 확인 | — | 추가 수정 없음 |
| 119 | `card-navigation` | 확인 | 확인 | 실행 버튼 중앙 배치 |
| 120 | `scroll-stack` | 확인 | 확인 | 추가 수정 없음 |
| 121 | `sticky-scroll-story` | 확인 | 확인 | 추가 수정 없음 |
| 122 | `footer-reveal` | 확인 | 확인 | 추가 수정 없음 |
| 123 | `scroll-expand-media` | 확인 | 확인 | 추가 수정 없음 |
| 124 | `coverflow-carousel` | 확인 | — | 추가 수정 없음 |
| 125 | `sticker-peel` | 확인 | — | 추가 수정 없음 |
| 126 | `elastic-mesh` | 확인 | — | 추가 수정 없음 |
| 127 | `image-particle-morph` | 확인 | — | 추가 수정 없음 |
| 128 | `dither-reveal` | 확인 | — | 추가 수정 없음 |
| 129 | `fluid-glass-lens` | 확인 | — | 추가 수정 없음 |
| 130 | `lanyard` | 확인 | — | 추가 수정 없음 |
| 131 | `dome-gallery` | 확인 | — | 추가 수정 없음 |
| 132 | `foldable-paper` | 확인 | — | 추가 수정 없음 |
| 133 | `webcam-pixel-grid` | 확인 | 확인 | 추가 수정 없음 |
| 134 | `image-relighting` | 확인 | — | 추가 수정 없음 |
| 135 | `cloth-playground` | 확인 | — | 추가 수정 없음 |
| 136 | `fluid-sandbox` | 확인 | — | 추가 수정 없음 |
| 137 | `orbit-composer` | 확인 | — | 추가 수정 없음 |
| 138 | `particle-text` | 확인 | — | 추가 수정 없음 |
| 139 | `spatial-board` | 확인 | — | 추가 수정 없음 |
| 140 | `sound-pad` | 확인 | — | 추가 수정 없음 |
| 141 | `swipe-actions` | 확인 | — | 추가 수정 없음 |
| 142 | `pull-to-refresh` | 확인 | — | 추가 수정 없음 |
| 143 | `long-press-menu` | 확인 | 확인 | 추가 수정 없음 |
| 144 | `selection-bar` | 확인 | — | 추가 수정 없음 |
| 145 | `hover-gallery` | 확인 | — | 추가 수정 없음 |
| 146 | `text-reveal` | 확인 | — | 추가 수정 없음 |
| 147 | `cursor-trail` | 확인 | — | 추가 수정 없음 |
| 148 | `avatar-cluster` | 확인 | — | 추가 수정 없음 |
| 149 | `hold-to-confirm` | 확인 | 확인 | 추가 수정 없음 |
| 150 | `number-scrubber` | 확인 | — | 추가 수정 없음 |
| 151 | `image-lens` | 확인 | — | 추가 수정 없음 |
| 152 | `directional-card` | 확인 | — | 추가 수정 없음 |
| 153 | `looping-ticker` | 확인 | — | 추가 수정 없음 |
| 154 | `rotating-text` | 확인 | — | 추가 수정 없음 |
| 155 | `image-lightbox` | 확인 | 확인 | 추가 수정 없음 |
| 156 | `expandable-card` | 확인 | 확인 | 추가 수정 없음 |
| 157 | `animated-filter-bar` | 확인 | — | 추가 수정 없음 |
| 158 | `resizable-panels` | 확인 | — | 추가 수정 없음 |
| 159 | `sortable-list` | 확인 | — | 추가 수정 없음 |
| 160 | `inline-edit` | 확인 | — | 추가 수정 없음 |
| 161 | `selection-toolbar` | 확인 | — | 추가 수정 없음 |
| 162 | `smart-header` | 확인 | — | 추가 수정 없음 |
| 163 | `code-tabs` | 확인 | — | 추가 수정 없음 |
| 164 | `bottom-sheet` | 확인 | 확인 | 추가 수정 없음 |
| 165 | `action-toast` | 확인 | — | 추가 수정 없음 |
| 166 | `file-dropzone` | 확인 | — | 추가 수정 없음 |
| 167 | `radial-menu` | 확인 | 확인 | 추가 수정 없음 |
| 168 | `preview-link` | 확인 | — | 추가 수정 없음 |
| 169 | `morphing-search` | 확인 | — | 추가 수정 없음 |
| 170 | `elastic-slider` | 확인 | — | 추가 수정 없음 |
| 171 | `swipe-deck` | 확인 | 확인 | 추가 수정 없음 |
| 172 | `image-compare` | 확인 | — | 추가 수정 없음 |
| 173 | `focus-dock` | 확인 | 확인 | 추가 수정 없음 |
| 174 | `command-palette` | 확인 | 확인 | 추가 수정 없음 |
| 175 | `scramble-text` | 확인 | — | 추가 수정 없음 |
| 176 | `folder` | 확인 | — | 추가 수정 없음 |
| 177 | `code-block` | 확인 | — | 추가 수정 없음 |
| 178 | `gravity-letters` | 확인 | 확인 | 초기 빈 화면은 의도된 상태. Enter 12회 후 글자 표시·낙하 확인. |
| 179 | `github-activity` | 확인 | — | 추가 수정 없음 |
| 180 | `step-player` | 확인 | 확인 | 다크 테마 트랙·단계 경계 보완 |
| 181 | `animated-counter` | 확인 | — | 추가 수정 없음 |
| 182 | `voice-note` | 확인 | — | 추가 수정 없음 |
| 183 | `faq` | 확인 | — | 추가 수정 없음 |
| 184 | `fluid-orb` | 확인 | — | 추가 수정 없음 |
| 185 | `grid-reveal` | 확인 | 확인 | 샘플 생성 지연(1.9초) 이후 같은 이미지 재표시 확인. |
| 186 | `matrix-orb` | 확인 | — | 추가 수정 없음 |
| 187 | `web-search` | 확인 | — | 추가 수정 없음 |
| 188 | `ai-status` | 확인 | — | 추가 수정 없음 |
| 189 | `bounce-sidebar` | 확인 | — | 추가 수정 없음 |
| 190 | `hook-sidebar` | 확인 | 확인 | 추가 수정 없음 |
| 191 | `proximity-sidebar` | 확인 | — | 추가 수정 없음 |
| 192 | `scroll-progress` | 확인 | 확인 | 추가 수정 없음 |
| 193 | `rail-toc` | 확인 | — | 추가 수정 없음 |
| 194 | `gooey-nav` | 확인 | — | 추가 수정 없음 |
| 195 | `duration-picker` | 확인 | 확인 | 숫자 입력 여백·두 자리 폭·최댓값 자릿수·disabled 보완 |
| 196 | `otp-input` | 확인 | — | 추가 수정 없음 |
| 197 | `delete-button` | 확인 | — | 추가 수정 없음 |
| 198 | `task-list` | 확인 | — | 추가 수정 없음 |
| 199 | `emoji-reaction` | 확인 | 확인 | 추가 수정 없음 |
| 200 | `notification-bell` | 확인 | — | 추가 수정 없음 |
