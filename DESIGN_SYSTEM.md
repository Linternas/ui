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

`accent="neutral"`은 현재 테마의 본문색·배경색을 강조색으로 사용한다. 밝은 모드에서는 어두운 액션, 어두운 모드에서는 밝은 액션이 된다. 기본값 `accent="brand"`는 기존 강조색을 유지한다. 중첩된 Provider마다 따로 선택할 수 있으며 상태 색(success/warning/danger)은 유지한다. 카탈로그의 [Controls](https://ui.mingu.xyz/controls)에서 두 방향을 비교한다.

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
| 컨트롤 | `--mingu-control-height-{sm,md,lg}`, `--mingu-control-padding-{sm,md,lg}`, `--mingu-control-padding-block-{sm,md,lg}`, `--mingu-control-radius` |
| 포커스 | `--mingu-focus-width`, `--mingu-focus-offset` |
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
| `TextField` | `label`, `hint`, `error`, `leading`, `trailing`; 자동 ID·설명 연결, required/invalid 지원 |
| `TextareaField`, `SelectField` | native props와 `label`, `hint`, `error`, `controlSize`; label·설명·오류 자동 연결 |
| `PasswordField` | TextField 기반 보기/숨기기; `labels`로 표시 문구·접근성 이름 변경 |
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

[웹 카탈로그](https://ui.mingu.xyz)는 토큰·기본 UI·인터랙션·패턴을 하나의 검색, 탐색, 테마, 코드 미리보기로 제공한다. 기본 UI와 인터랙션은 기능별로 같은 그룹에 배치한다. Sidebar와 BounceSidebar처럼 관련된 항목은 같은 화면의 variant 탐색으로 연결한다.

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

## Controls (0.6)

[Controls 워크벤치](https://ui.mingu.xyz/controls)는 크기·상태·강조색에 맞춰 미리보기와 코드를 함께 갱신한다. 폼 예제는 브라우저의 입력 유효성만 확인하며 서버에 저장하지 않는다.

- Button/Input/Select는 sm 36px, md 44px, lg 48px 기준을 공유한다. 높이는 최소값이며 긴 텍스트·확대·커스텀 토큰에 따라 늘어날 수 있다. 작은 컨트롤은 밀도가 필요한 화면에서만 사용하고 터치 화면은 md 이상을 우선한다.
- TextField는 장식용 `leading`과 접미사 또는 보조 액션용 `trailing`을 제공한다. leading은 접근성 트리에서 숨긴다. 값 해석에 꼭 필요한 단위·설명은 hint에도 넣는다. trailing에 넣은 버튼에는 접근성 이름을 제공한다.
- TextareaField/SelectField는 네이티브 textarea/select에 props·ref를 전달한다. readOnly는 입력·텍스트 영역에서 사용하며 네이티브 select에는 지원되지 않는다.
- PasswordField의 보기 버튼은 입력 옆 같은 줄에 배치된다. disabled 및 상위 fieldset의 disabled를 따른다. `labels={{ show: '보기', hide: '숨기기', showLabel: '비밀번호 보기', hideLabel: '비밀번호 숨기기' }}`로 바꿀 수 있다.
- 오류는 입력 테두리와 설명 문구로 표시한다. readOnly는 선택·복사·폼 제출을 유지하고 disabled 값은 네이티브 폼 제출에서 제외된다.
- 세로 Stack은 줄바꿈 없이 내용을 쌓고, 가로 Stack만 좁은 화면에서 줄바꿈한다. 긴 코드는 CodeBlock 내부에서 가로 스크롤한다.

```tsx
<DesignSystemProvider theme="system" accent="neutral">
  <Stack gap={6}>
    <TextField label="워크스페이스" name="workspace" trailing=".mingu.xyz"
      hint="주소의 .mingu.xyz 앞에 들어갈 이름입니다." required />
    <SelectField label="공개 범위" name="visibility" defaultValue="private">
      <option value="private">비공개</option>
      <option value="public">공개</option>
    </SelectField>
    <TextareaField label="설명" name="description" rows={3} maxLength={200} />
    <Button type="submit">입력 확인</Button>
  </Stack>
</DesignSystemProvider>
```


## Newest and exploration interactions (0.7)

[Newest](https://ui.mingu.xyz/newest)는 컴포넌트의 `addedAt` UTC 날짜부터 30일 동안 라이브 미리보기를 모은다. 배포 날짜나 빌드 시각을 사용하지 않으며, 열린 카탈로그도 매분 및 탭 복귀 시 만료 상태를 갱신한다. 만료 후에도 원래 카테고리와 상세 주소는 유지된다. 메타데이터가 없는 기존 컴포넌트와 미래·잘못된 날짜는 노출하지 않는다.

새 Core/Interaction 항목에는 실제 추가일 `addedAt: 'YYYY-MM-DD'`를 기록한다. 새 컴포넌트의 날짜 누락은 카탈로그 회귀 검사에서 실패한다. 레거시 ID 목록을 늘려 검사를 우회하지 않는다. `getNewestEntries(entries?, now?, windowDays?)`와 `NEWEST_WINDOW_DAYS`는 `/catalog`에서 가져올 수 있다. 서버에서도 사용할 수 있는 순수 함수이며 타이머나 브라우저 API에 의존하지 않는다.

| 컴포넌트 | 동작 / 연결 |
| --- | --- |
| `FocusDock` | 아이콘을 포인터 거리로 확대하고 스프링으로 복귀. `items`, `value/defaultValue`, `onValueChange`. 한 Tab 진입점과 좌우/Home/End 탐색, disabled 항목 건너뛰기. 탐색은 `onValueChange`에서 소비 앱이 처리한다. |
| `SwipeDeck` | 카드 드래그, 이전/다음 버튼, 현재 위치. `items: {id,label,content}[]`, `index/defaultIndex`, `onIndexChange`, `loop`. 카드 내 버튼·링크의 기본 동작은 유지한다. `--mingu-deck-height`로 높이를 바꾸며 긴 내용은 내부에서 스크롤한다. |
| `ImageCompare` | 두 이미지의 같은 영역을 드래그로 비교. `before/after: {src,alt}`, `value/defaultValue`, `onValueChange`, `disabled`. 네이티브 range의 방향키·Home·End를 유지한다. 이미지의 비율과 구도를 맞추고 alt를 제공한다. |
| `CommandPalette` | 여러 검색어·keywords 필터, 방향키·Enter 선택, Escape 닫기와 모달 포커스 복귀. `open/onOpenChange`, `items`, `onSelect`. `shortcut`은 기본 false이며 한 앱에 단일 Cmd/Ctrl+K 소유자만 둔다. item의 `shortcut` 문구는 표시용이며 개별 단축키를 등록하지 않는다. |
| `ScrambleText` | 잠깐 흩어진 글자가 원문으로 정렬. `text`, `duration`, `replayKey`, `playOnMount`. 진입/hover/재생 키 변경으로 재생하며 화면 밖과 백그라운드에서 중지한다. 접근성 트리에는 원문만 제공한다. |

새 인터랙션은 `system.css`와 `styles.css`를 함께 가져온다. 모션 감소 설정에서는 Dock 확대, 카드 회전·전환, 텍스트 스크램블을 줄이거나 생략한다. 비교 슬라이더와 카드 버튼의 조작은 유지한다. 새 스프링과 이동 범위는 `src/system/motion-tokens.ts`, 크기는 `--mingu-dock-size`, `--mingu-deck-height`로 관리한다.

## Gesture interactions (0.8)

| 컴포넌트 | API / 조작 |
| --- | --- |
| `RadialMenu` | `items: {id,label,icon,disabled?}[]`, `onSelect`, `label`, `icon`, `disabled`. 중앙 버튼에서 액션이 원형으로 펼쳐진다. 방향키·Home·End는 비활성 항목을 건너뛰고 Escape/선택은 트리거로 포커스를 돌려준다. 외부 클릭·Tab 이탈 시 닫힌다. 빈 메뉴는 비활성화한다. 4–8개 정도의 짧은 액션에 적합하며 큰 내비게이션은 DropdownMenu/CommandPalette를 사용한다. |
| `PreviewLink` | 네이티브 anchor props/ref와 `preview: {src,title?,description?,alt?}`. 소비 앱이 제공한 이미지를 포인터 옆에 보여주며 키보드 focus에서도 표시한다. 장식용 미리보기는 native Popover top layer를 사용해 부모 overflow 밖에서 표시한다. Escape·스크롤·resize·blur 시 닫힌다. 터치 hover나 외부 메타데이터 요청을 만들지 않는다. 핵심 정보와 액션은 링크 본문에도 제공한다. |
| `MorphingSearch` | `value/defaultValue`, `onValueChange`, `onSearch`, `label`, `placeholder`, `clearLabel`, `closeLabel`, `name`, `disabled`, `defaultOpen`. 독립적인 search form이며 다른 form 안에 중첩하지 않는다. Enter/검색 버튼이 `onSearch(query)`를 호출한다. Escape로 접고 검색 버튼으로 포커스를 돌린다. 값은 접어도 유지하고 지우기는 명시적으로 실행한다. |
| `ElasticSlider` | `label`, `value/defaultValue`, `onValueChange`, `min/max/step`, `formatValue`, `name/form/ref`, `disabled`, `style`. 수평 range에 실제 폼 값을 유지하고 드래그 중 선을 휘게 한다. 방향키·Home·End는 브라우저의 range 입력이다. 값은 범위와 step에 맞춰 정규화한다. `formatValue`가 화면과 접근성 값 설명에 함께 쓰인다. |

루트에서 가져오며 `system.css`와 `styles.css`를 함께 사용한다. `--mingu-radial-size`, `--mingu-preview-width`, `--mingu-search-width`로 크기를 조정한다. 포인터 스프링·탄성 범위는 `src/system/motion-tokens.ts`에 있다. 모션 감소 설정에서는 링크를 즉시 배치하고 메뉴 이동·검색창 전환·슬라이더 휨을 생략한다. 네 항목도 실제 추가일 기준의 Newest 규칙을 따른다.

## Everyday interactions (0.9)

12개 패턴은 패키지 루트에서 가져온다. `system.css`와 `styles.css`를 함께 불러오며, 카탈로그의 각각의 상세 주소에서 같은 구현을 실행한다. 새 항목은 `addedAt` UTC 날짜를 기준으로 Newest에 30일간 표시한다.

| 컴포넌트 | 주요 API / 사용 기준 |
| --- | --- |
| `ImageLightbox` | `images: {id,src,alt,thumbnail?,caption?}[]`, `label`. 썸네일 버튼이 네이티브 모달을 열고 해당 버튼으로 복귀한다. 이전/다음·좌우 방향키, 확대/축소/초기화, 더블 클릭, 드래그 이동과 터치 핀치를 지원한다. 이미지 오류·빈 목록도 표시한다. |
| `ExpandableCard` | `title`, `description?`, `image?: {src,alt}`, `children`, `open/defaultOpen/onOpenChange`, `disabled`. 트리거는 네이티브 버튼이며 상세 `children` 안에 링크·액션을 넣는다. 카드의 원래 위치와 모달 사이를 전환한다. |
| `AnimatedFilterBar<T>` | `label`, `filters: {value,label,disabled?}[]`, `items`, `getKey`, `getFilter`, `renderItem`, `value/defaultValue/onValueChange`, `allValue='all'`, `emptyLabel`, `disabled`. 단일 카테고리 또는 태그 배열을 필터링한다. 기본 SegmentedControl의 네이티브 라디오 키보드 동작을 재사용하며 결과 수를 알린다. item key는 고유하고 안정적으로 유지한다. |
| `ResizablePanels` | `first/second`, `value/defaultValue/onValueChange`(왼쪽 비율 %), `min=20/max=80`, `label`, `disabled`, `style`. 수평으로 나란한 두 영역이다. 포인터 드래그·좌우/Shift+좌우·Home/End·Enter/더블 클릭 접기와 복원. 접힌 첫 영역은 inert로 만들어 포커스와 접근성 트리에서 제외한다. 작은 화면의 패널 콘텐츠는 내부 스크롤한다. |
| `SortableList` | `items: {id,label,content?,disabled?}[]`, `onReorder`, `label`, `disabled`. controlled 순서이며 콜백의 배열을 상태에 반영한다. 핸들에서만 드래그하고 위/아래·Home·End로 이동한다. disabled 항목은 직접 잡거나 키보드로 옮길 수 없으며 다른 항목 이동에 따라 위치가 달라질 수 있다. 세로 단일 목록에 사용한다. |
| `InlineEdit` | `label`, `value`, `onSave(next): void | Promise<void>`, `validate?`, `required/maxLength`, `name`, `disabled`, `placeholder`, `labels`. controlled 값은 저장 성공 시 소비 앱이 갱신한다. Enter 또는 Save는 네이티브 유효성 검사를 거치고 Escape/Cancel은 초안을 버린다. 저장 중 중복 실행을 막고 거절된 Promise는 초안을 보존해 재시도하게 한다. `name`의 폼 값은 저장된 value다. |
| `SelectionToolbar` | `children`, `actions: {id,label,onSelect(text,range)}[]`, `label`. children 안에서 선택한 문장에 기본 Copy와 사용자 액션을 제공한다. 실제 Range의 복사본을 전달하며 저장·공유는 소비 앱 콜백에서 처리한다. Clipboard 성공/실패를 표시하고 Escape·스크롤·리사이즈로 닫힌다. iframe과 편집기 입력 영역 대신 읽기용 본문에 사용한다. |
| `SmartHeader` | native header props/ref, `containerRef?`, `threshold?`. 기본값은 window 스크롤이며 지정한 컨테이너의 스크롤도 추적한다. 아래로 읽을 때 접고 위로 움직일 때 복귀하며 헤더 내 포커스와 페이지 상단에서는 항상 표시한다. sticky가 작동하는 스크롤 컨테이너 안에 배치한다. |
| `CodeTabs` | `items: (CodeBlockProps & {id,label,disabled?})[]`, `label`, `value/defaultValue/onValueChange`. 기존 Tabs와 CodeBlock을 조합한다. 방향키·Home/End, 코드 높이 전환, 파일 이름·문법 강조·실제 복사를 유지한다. |
| `BottomSheet` | 기존 `DialogProps`와 `snapPoints`(뷰포트 비율 0.2–0.95), `defaultSnap`(정렬된 배열의 index). 손잡이를 잡아 높이를 바꾸고 놓으면 가까운 snap에 멈춘다. 최저 snap보다 충분히 아래로 끌면 닫힌다. 손잡이의 방향키·Home/End도 높이를 바꾸며 본문 스크롤과 손잡이 드래그를 분리한다. |
| `ActionToast` | `messages: ActionToastMessage[]`, `onDismiss`, `label`, `placement='bottom-right'|'inline'`. 기존 ToastMessage에 `action?: {label,onAction}`, `progress?`(0–100), `busy?`를 더한다. 액션 Promise 중 중복 실행을 막고 실패 시 다시 누를 수 있다. 알림 수명과 실행 취소의 실제 데이터 복원은 앱이 관리한다. 자동 만료하지 않는다. |
| `FileDropzone` | `label`, `files?/onFilesChange`, `accept`, `multiple=true`, `maxFiles=5`, `maxSize`(bytes, 기본 10 MB), `name/form/required/disabled`, `hint`, `onReject`, `onUpload(file,{signal,onProgress})`. 네이티브 FileUpload와 FileList를 유지한다. 드롭/선택한 파일을 검증하고 중복을 제외하며 이미지 Object URL은 해제한다. 업로드 버튼이 콜백을 호출하고 실패 시 Retry를 제공한다. 제거·unmount 시 AbortSignal을 취소한다. 서버의 파일 검증과 전송 구현은 소비 앱에 둔다. |

`Dialog`에는 선택적으로 `motionOrigin` ref와 `motion='scale'|'bottom'`을 사용할 수 있다. 기존 기본 모달 동작은 유지하며, 지정한 화면 전환은 닫기 애니메이션이 끝난 후 네이티브 dialog를 닫고 포커스를 복원한다. `onKeyDown`은 기본 Tab 처리 전에 호출된다. 모션 감소 설정에서는 화면 확대/복귀와 목록 이동을 즉시 처리한다. 드래그와 키보드 조작, 실제 값 변경은 계속 사용할 수 있다.

레이아웃 높이는 소비 앱이 `style` 또는 콘텐츠로 정한다. 화면에 없는 데이터 저장·파일 업로드 성공을 시각 효과가 대신 판단하지 않는다. docs의 저장/업로드/진행 예제는 브라우저 내부 데모이며 실제 서비스 API를 호출하지 않는다.
