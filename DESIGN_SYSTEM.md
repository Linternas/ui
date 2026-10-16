# Mingu UI

Mingu 웹의 공통 디자인 시스템. 차분한 기본 화면 위에 목적이 분명한 인터랙션을 조합한다.

## 구성

| 계층 | 역할 | 진입점 |
| --- | --- | --- |
| Foundation | 색상, 폰트, 간격, 반경, 모션, 레이어 | `tokens.css` |
| Core | 액션, 폼, 레이아웃, 상태, 탐색, 대화상자 | `/system`, `/system.css` |
| Interaction | 읽기 도구, 탐색 모션, 시각 효과, 피드백 | 패키지 루트, `/styles.css` |
| Product | 인증, API, 비즈니스 규칙, 도메인 화면 | 각 소비 앱 |

기존 패키지 이름과 루트 exports는 호환성을 위해 유지한다. Core만 필요한 앱은 `/system`을 사용한다. Core는 Tailwind, Next.js, 서버 API, 워크스페이스 패키지에 의존하지 않는다.

## 원칙

- 기본 화면은 읽기 쉽고 차분하게 구성한다. 모션은 위치, 상태 변화, 사용자 피드백에 사용한다.
- 색상은 `--mingu-accent`, `--mingu-danger`처럼 역할로 사용한다. 제품의 브랜드 차이는 테마에서 정의한다.
- 간격은 4px 기반 스케일을 사용한다. 일반 컨트롤은 최소 44px 높이이며 작은 버튼은 36px이다.
- 네이티브 HTML의 폼 동작, 키보드 조작, 접근성 이름을 유지한다.
- 로딩·비활성·오류·빈 상태를 화면 설계에 포함한다. 상태를 색으로만 전달하지 않는다.
- 시스템은 화면을 제공한다. 인증·삭제·주문·데이터 저장은 소비 앱이 처리한다.
- 사용자가 모션 감소를 설정하면 반복 애니메이션을 중지한다.

## 설치와 시작

이 저장소의 `package.json`이 패키지 루트다. React 19 이상이 필요하다.

```sh
# Git 의존성: 검증한 실제 커밋 SHA로 고정한다.
npm install 'git+https://github.com/Linternas/ui.git#<commit-sha>'
```

또는 monorepo의 workspace 디렉터리에 submodule로 추가한다.

```sh
git submodule add https://github.com/Linternas/ui.git packages/interaction-ui
git submodule update --init --recursive
npm install
```

```tsx
import { DesignSystemProvider, Button, Card, Stack, TextField } from '@mingu/interaction-ui/system';
import '@mingu/interaction-ui/system.css';

export default function App() {
  return (
    <DesignSystemProvider theme="system">
      <Card>
        <Stack>
          <TextField label="프로젝트 이름" placeholder="My website" />
          <Button>시작하기</Button>
        </Stack>
      </Card>
    </DesignSystemProvider>
  );
}
```

Next.js는 `transpilePackages: ['@mingu/interaction-ui']`를 설정하고 CSS를 루트 layout에서 불러온다. Vite 등 TSX를 처리하는 React 번들러에서도 같은 exports를 사용한다. CSS 초기화나 폰트 다운로드를 전역에 강제하지 않는다. 앱은 viewport와 기본 body 여백을 설정한다.

`examples/next-layout.tsx`, `examples/next-page.tsx`, `examples/next.config.ts`가 새 웹의 시작점이다. 앱이 이미 자체 테마 Provider를 사용하면 중복으로 감싸지 말고 해당 테마 값을 `DesignSystemProvider`에 전달한다.

## 테마

`theme="light" | "dark" | "system"`은 Provider 범위에 적용된다. `system`은 OS 설정을 CSS에서 따르며 초기 HTML과 hydration의 테마 값이 다르지 않다. Provider는 localStorage나 document 테마를 변경하지 않는다. 중첩된 Provider도 각자의 테마를 유지한다.

페이지 전체 테마는 앱이 관리한다. 기존 `.dark` 방식과 호환된다. Provider 없이 토큰만 사용하려면 `tokens.css`를 가져온다.

```tsx
<DesignSystemProvider
  theme="dark"
  style={{ '--mingu-font-sans': 'Pretendard, system-ui, sans-serif', '--mingu-radius-md': '8px' }}
>
  <App />
</DesignSystemProvider>
```

브랜드 색을 변경할 때 `accent`, `on-accent`, `accent-soft`를 함께 검토한다. 밝은·어두운 모드 각각에서 본문 대비와 키보드 포커스를 확인한다. 임의 테마 값의 대비를 시스템이 자동 보장하지는 않는다.

## 토큰

| 범주 | 변수 |
| --- | --- |
| 배경 | `--mingu-bg`, `--mingu-surface`, `--mingu-raised` |
| 텍스트 | `--mingu-text`, `--mingu-muted` |
| 강조 | `--mingu-accent`, `--mingu-on-accent`, `--mingu-accent-soft` |
| 상태 | `--mingu-success`, `--mingu-warning`, `--mingu-danger`, 각 `-soft` |
| 구분 | `--mingu-border`, `--mingu-shadow` |
| 간격 | `--mingu-space-{1,2,3,4,5,6,8,12,16}` |
| 타입 | `--mingu-text-{xs,sm,md,lg,xl,2xl}`, `--mingu-font-{sans,mono}` |
| 형태 | `--mingu-radius-{sm,md,lg,full}` |
| 모션 | `--mingu-duration-{fast,normal}`, `--mingu-ease` |
| 레이아웃 | `--mingu-content`, `--mingu-reading`, `--mingu-z-{sticky,popover}` |

Interaction 컴포넌트의 기존 `--mru-*` 색상은 Provider 안에서 공통 토큰으로 연결된다. 컴포넌트별 시각 효과 조절 props는 그대로 사용할 수 있다.

## Core API

전체 기본 UI 카탈로그와 상태 기준은 [COMPONENTS.md](./COMPONENTS.md)를 따른다. 각 항목의 라이브 미리보기·사용 코드가 연결되어 있다.


컴포넌트는 네이티브 props와 React 19의 `ref` prop을 전달한다. 조합 컴포넌트는 아래 별도 API를 사용한다.

| 컴포넌트 | 주요 props / 사용 규칙 |
| --- | --- |
| `Button` | `variant`, `size`, `loading`, `status`, `icon`, `interaction`; 기본 `type="button"`, 폼 제출은 명시적으로 `submit` |
| `Input`, `Textarea`, `Select` | native props; 독립 사용 시 label/aria-label 필수 |
| `TextField` | `label`, `hint`, `error`; 자동 ID·설명 연결, required/invalid 지원 |
| `Checkbox`, `Switch` | children이 label; native checked/defaultChecked/onChange |
| `Badge`, `Alert` | `tone=neutral/accent/success/warning/danger`; 동적 알림에 필요한 role은 호출자가 지정 |
| `Card`, `Container` | native div props; `Container reading`은 읽기 폭 사용 |
| `Stack` | `direction`, `gap`, `align`; 행 레이아웃은 좁은 화면에서 줄바꿈 |
| `Grid` | `min`, `gap`; 컨테이너 폭에 따라 자동 열 구성 |
| `Separator`, `Skeleton` | 장식용 skeleton은 스크린리더에서 숨김; 로딩 설명은 호출자가 별도로 제공 |
| `Tabs` | `items`, `value`, `onValueChange`, `label`; value는 고유하게 지정 |
| `Dialog` | `open`, `onOpenChange`, `title`, `description`, `closeLabel`; controlled modal |

Tabs는 방향키·Home·End를 지원하고 비활성 항목을 건너뛴다. 패널 전환은 자동 활성화 방식이다. 무거운 패널은 소비 앱에서 미리 로드하거나 별도 패턴으로 구성한다.

Dialog는 네이티브 `<dialog>`의 모달 포커스 범위를 사용한다. Escape와 닫기 버튼이 `onOpenChange(false)`를 호출하며 호출자는 open을 갱신한다. 닫힌 뒤 열기 버튼으로 포커스가 돌아간다. 특정 요소로 초기 포커스를 보내려면 `initialFocus` ref를 전달한다. dialog 제목은 항상 제공한다. backdrop 클릭으로 파괴적 동작이 자동 승인되지 않는다.

## 새 웹 도입 체크

1. 검증한 UI 커밋을 고정한다. submodule이면 gitlink와 배포 소스 pin을 함께 갱신한다.
2. CSS를 루트에 한 번 불러오고 앱의 테마·폰트만 연결한다.
3. 기본 액션·입력·상태·레이아웃은 Core에서 가져온다.
4. 읽기·탐색·시각 효과는 Interaction에서 조합한다.
5. 좁은 화면, 키보드, 오류 상태, 모션 감소를 확인한다.
6. 앱 전용 API 로직은 앱에 둔다. 여러 앱에서 필요한 시각 패턴만 시스템으로 승격한다.

기존 앱은 토큰 → 기본 컨트롤 → 화면 패턴 순서로 전환한다. 다른 서비스의 인증·거래·API 동작은 디자인 시스템 도입 범위에 포함하지 않는다.

## 변경과 검증

기존 props, exports, 토큰 이름을 없애거나 의미를 바꿀 때는 major 버전 변경과 이전 경로를 문서화한다. 컴포넌트·토큰을 추가하면 minor, 수정은 patch로 구분한다. 현재 0.x에서도 기존 소비 앱의 호환성을 확인한다.

```sh
npm ci
npm run typecheck
npx playwright install chromium
npm run test:browser
```

브라우저 테스트는 폼 의미·키보드 탭 탐색·대화상자 포커스·테마 격리·반응형·모션 감소와 기존 인터랙션 동작을 검사한다. 지원 대상은 React 19와 CSS 변수·ResizeObserver·네이티브 dialog·Popover API를 제공하는 현대 브라우저다. 자동 검사는 전체 접근성 인증을 뜻하지 않으며, 제품 화면의 접근성 이름과 데이터 상태는 소비 앱에서도 확인한다.

## Unified catalog

[웹 카탈로그](https://blog.mingu.xyz/lab/ui)는 토큰·기본 UI·인터랙션·패턴을 하나의 검색, 탐색, 테마, 코드 미리보기로 제공한다. 기본 UI와 인터랙션은 기능별로 같은 그룹에 배치한다. Sidebar와 BounceSidebar처럼 관련된 항목은 같은 화면의 variant 탐색으로 연결한다.

카탈로그 데이터는 `@mingu/interaction-ui/catalog`의 `uiCatalog`, `uiGroups`, `uiFamilies`가 단일 기준이다. 서버와 클라이언트에서 모두 불러올 수 있는 정적 데이터다. 기존 `systemCatalog`는 기본 컴포넌트 목록으로 유지한다.

문서의 통합 import 예제는 패키지 루트에서 가져온다. 코드 내부의 `/system` 진입점도 호환성을 유지한다. 시각 효과와 폼이 같은 테마를 공유하도록 Provider 범위에 `system.css`와 `styles.css`를 함께 불러온다.

## Interaction language

기본 컨트롤은 빠르게 눌리고 부드럽게 복귀한다. 체크박스·스위치·입력은 상태 변화에 짧게 반응한다. 큰 움직임은 opt-in으로 선택한다.

- `Button interaction="press"`가 기본이다. `magnetic`은 포인터에 최대 5px / 4px 반응하고, `ripple`은 누른 위치에서 퍼지며, `shine`은 hover/focus 시 빛이 한 번 지나간다. `none`으로 이동 효과를 끈다.
- `Button loading`과 `status="idle" | "success" | "error"`는 앱 상태를 표현한다. 실제 비동기 작업과 성공 여부는 호출자가 결정한다. `icon`을 전달하면 아이콘·스피너·완료 표시가 같은 슬롯을 사용한다.
- `CopyButton`은 실제 Clipboard API 결과에 따라 라벨과 체크를 전환한다. 라벨은 겹친 그리드로 폭을 유지하며 실패 시 다시 시도를 안내한다.
- `FloatingField`는 네이티브 Input의 label/hint/error/ref/폼 값을 유지하며 포커스와 입력 여부에 따라 라벨과 강조선을 전환한다.
- `SegmentedControl`은 네이티브 라디오다. `label`, `options`, `value/defaultValue`, `onValueChange`, `name`, `disabled`를 받는다. 선택 표시는 같은 스프링으로 이어지고 방향키/disabled/폼 제출은 브라우저 동작을 유지한다.
- `Tabs animated`는 선택 배경을 이어 움직이고 활성 패널을 짧게 전환한다. 기본 키보드 규칙은 같다.
- `InteractiveCard effect="spotlight" | "tilt"`는 테마 색으로 표면·테두리에 반응한다. tilt는 각 축 최대 3.5도다. 카드 자체를 불필요한 버튼으로 만들지 않으며 실제 액션은 내부 링크/버튼에 둔다.

모션 토큰은 `tokens.css`, 선택 스프링은 `src/system/motion-tokens.ts`에서 관리한다. 이동과 반복 효과는 `prefers-reduced-motion`에서 중지하고, 터치에서는 자석 이동·카드 기울기를 사용하지 않는다. pressed/selected/disabled 상태는 애니메이션 없이도 구별된다.

## Docs deployment

독립 카탈로그 앱은 같은 저장소의 `docs/`에 있다. 패키지 루트의 `npm run build`는 정적 JS/CSS·미디어와 서버용 경로 목록을 생성하고, `npm start`는 Node 내장 HTTP 서버로 배포한다. 라이브러리 설치 경로와 exports는 변경하지 않는다. 기존 블로그 카탈로그는 연결 주소가 확정되기 전까지 유지한다.

배포 절차와 Railway 설정은 README의 Standalone docs / Railway를 따른다. 새 컴포넌트는 패키지의 통합 카탈로그에 등록하고 독립 docs 미리보기에도 추가한다.
