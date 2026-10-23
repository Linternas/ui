# Component catalog

Mingu UI의 기본 컴포넌트와 상태별 사용 기준. 인터랙션도 같은 [Mingu UI 카탈로그](https://ui.mingu.xyz)에 기능별로 배치한다. [테마와 설치](./DESIGN_SYSTEM.md).

## Actions

### Button

Primary, secondary, outline, ghost, danger. 크기·로딩·비활성 상태.

[Live preview](https://ui.mingu.xyz/button)

```tsx
<Button variant="primary" size="md">Save changes</Button>
<Button variant="outline" loading>Saving</Button>
```

### IconButton

접근성 이름을 필수로 받는 아이콘 액션.

[Live preview](https://ui.mingu.xyz/icon-button)

```tsx
<IconButton label="Settings" variant="secondary">⚙</IconButton>
```

### ButtonGroup

관련 액션을 하나의 이름 아래 그룹화.

[Live preview](https://ui.mingu.xyz/button-group)

```tsx
<ButtonGroup label="Alignment"><Button>Left</Button><Button>Center</Button></ButtonGroup>
```

### LinkButton

버튼의 시각 표현을 사용하는 네이티브 링크.

[Live preview](https://ui.mingu.xyz/link-button)

```tsx
<LinkButton href="/projects" variant="secondary">Projects</LinkButton>
```

## Forms

### Input

sm·md·lg, placeholder, readOnly, disabled, invalid. 네이티브 입력 props와 ref 지원.

[Live preview](https://ui.mingu.xyz/input)

```tsx
<Label htmlFor="name">Name</Label>
<Input id="name" name="name" controlSize="md" placeholder="Project name" />
```

### TextField

label·hint·error와 입력을 자동으로 연결한다. leading은 장식용 아이콘/텍스트, trailing은 접미사나 이름이 있는 보조 액션을 받는다.

[Live preview](https://ui.mingu.xyz/text-field)

```tsx
<TextField label="Email" type="email" required hint="Work address" error="Check your email address" />
```

### Textarea

여러 줄 입력, 크기·오류·리사이즈·네이티브 제한.

[Live preview](https://ui.mingu.xyz/textarea)

```tsx
<Label htmlFor="bio">Bio</Label>
<Textarea id="bio" rows={4} maxLength={300} placeholder="Tell us about yourself" />
```

### Select

네이티브 선택 컨트롤. 키보드·모바일 선택 UI와 폼 제출 유지.

[Live preview](https://ui.mingu.xyz/select)

```tsx
<Select aria-label="Environment"><option>Production</option><option>Preview</option></Select>
```

### TextareaField / SelectField

label·hint·error와 네이티브 컨트롤을 자동으로 연결한다. native props·ref·폼 제출을 유지한다.

[TextareaField](https://ui.mingu.xyz/textarea-field) · [SelectField](https://ui.mingu.xyz/select-field) · [Controls 워크벤치](https://ui.mingu.xyz/controls)

```tsx
<TextareaField label="Description" name="description" rows={3} maxLength={200} hint="Up to 200 characters" />
<SelectField label="Visibility" name="visibility" defaultValue="private">
  <option value="private">Private</option><option value="public">Public</option>
</SelectField>
```

### Field / Label

커스텀 컨트롤용 label·도움말·오류 조합.

[Live preview](https://ui.mingu.xyz/field)

```tsx
<Field label="Notes" htmlFor="notes" hint="Optional">
  <Textarea id="notes" aria-describedby="notes-description" />
</Field>
```

### PasswordField

보기·숨기기 전환과 자동 label·오류 연결.

[Live preview](https://ui.mingu.xyz/password-field)

```tsx
<PasswordField label="Password" autoComplete="new-password" minLength={8} />
```

### SearchField

네이티브 검색 입력. controlled 필터에 사용.

[Live preview](https://ui.mingu.xyz/search-field)

```tsx
<SearchField label="Search" value={query} onChange={e => setQuery(e.target.value)} />
```

### NumberField

네이티브 숫자 입력. min·max·step 검증.

[Live preview](https://ui.mingu.xyz/number-field)

```tsx
<NumberField label="Seats" min={1} max={100} step={1} defaultValue={3} />
```

### DatePicker

브라우저의 달력과 날짜 입력. min·max와 YYYY-MM-DD 값 사용.

[Live preview](https://ui.mingu.xyz/date-picker)

```tsx
<DatePicker label="Due date" min="2026-01-01" defaultValue="2026-10-16" />
```

### Checkbox

checked·indeterminate·disabled·required. 네이티브 폼 값.

[Live preview](https://ui.mingu.xyz/checkbox)

```tsx
<Checkbox name="terms" required>Accept terms</Checkbox>
<Checkbox indeterminate>Some selected</Checkbox>
```

### RadioGroup

fieldset·legend로 묶인 네이티브 라디오. 방향키 탐색과 disabled 옵션.

[Live preview](https://ui.mingu.xyz/radio-group)

```tsx
<RadioGroup label="Plan" name="plan" defaultValue="personal" options={[{value:'personal',label:'Personal'},{value:'team',label:'Team'}]} />
```

### Switch

켜짐·꺼짐·비활성. 네이티브 체크박스의 폼 동작.

[Live preview](https://ui.mingu.xyz/switch)

```tsx
<Switch name="notifications" defaultChecked>Notifications</Switch>
```

### Slider

키보드로 조절하는 범위 입력. 값 표시·min·max·step.

[Live preview](https://ui.mingu.xyz/slider)

```tsx
<Slider label="Volume" defaultValue={40} min={0} max={100} step={5} />
```

### FileUpload

네이티브 파일 선택. accept·multiple·disabled. 전송은 앱에서 처리.

[Live preview](https://ui.mingu.xyz/file-upload)

```tsx
<FileUpload label="Attachments" name="files" accept="image/*" multiple hint="Select image files" />
```

### Combobox

검색·선택·빈 결과·비활성 옵션과 방향키·Enter·Escape.

[Live preview](https://ui.mingu.xyz/combobox)

```tsx
<Combobox label="Framework" value={framework} onValueChange={setFramework} options={options} name="framework" />
```

## Navigation

### Tabs

방향키·Home·End, 비활성 항목 건너뛰기, 패널 연결.

[Live preview](https://ui.mingu.xyz/tabs)

```tsx
<Tabs label="Project" value={tab} onValueChange={setTab} items={[{value:'overview',label:'Overview',content:<p>Overview</p>}]} />
```

### Breadcrumbs

현재 페이지와 상위 경로. 네이티브 링크.

[Live preview](https://ui.mingu.xyz/breadcrumbs)

```tsx
<Breadcrumbs items={[{label:'Home',href:'/'},{label:'Projects',href:'/projects'},{label:'Settings'}]} />
```

### Pagination

이전·다음·현재 페이지와 생략 구간. controlled 페이지 상태.

[Live preview](https://ui.mingu.xyz/pagination)

```tsx
<Pagination page={page} pageCount={12} onPageChange={setPage} />
```

### Navigation

가로·세로 탐색. 현재 경로, 아이콘, 비활성 상태.

[Live preview](https://ui.mingu.xyz/navigation)

```tsx
<Navigation activeId="overview" items={[{id:'overview',label:'Overview',href:'/overview'}]} />
```

### Sidebar

제품 탐색을 담는 사이드바 영역.

[Live preview](https://ui.mingu.xyz/sidebar)

```tsx
<Sidebar label="Workspace"><Navigation orientation="vertical" items={items} activeId="home" /></Sidebar>
```

## Overlays

### Dialog

모달 포커스·Escape·복귀, 제목·설명 연결.

[Live preview](https://ui.mingu.xyz/dialog)

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Settings" description="Manage your project"><TextField label="Name" /></Dialog>
```

### AlertDialog

명시적 확인이 필요한 동작. 취소 우선 포커스와 busy 상태.

[Live preview](https://ui.mingu.xyz/alert-dialog)

```tsx
<AlertDialog open={open} onOpenChange={setOpen} title="Delete project?" description="This cannot be undone." danger onConfirm={confirmDelete} />
```

### Drawer

좌·우 슬라이드 패널. 모달과 같은 포커스·닫기 규칙.

[Live preview](https://ui.mingu.xyz/drawer)

```tsx
<Drawer open={open} onOpenChange={setOpen} title="Filters" side="right"><Checkbox>Published</Checkbox></Drawer>
```

### Popover

버튼에 붙는 비모달 패널. 화면 경계 배치, Escape·외부 클릭 닫기.

[Live preview](https://ui.mingu.xyz/popover)

```tsx
<Popover trigger="Filters" label="Filters"><Checkbox>Published only</Checkbox></Popover>
```

### DropdownMenu

방향키·Home·End 메뉴. 비활성·위험 액션, 닫기 후 포커스 복귀.

[Live preview](https://ui.mingu.xyz/dropdown-menu)

```tsx
<DropdownMenu label="Actions" items={[{id:'edit',label:'Edit',onSelect:edit},{id:'delete',label:'Delete',danger:true,onSelect:remove}]} />
```

### Tooltip

hover·focus 설명. Escape로 닫기, trigger 설명 연결.

[Live preview](https://ui.mingu.xyz/tooltip)

```tsx
<Tooltip content="Edit settings"><IconButton label="Settings">⚙</IconButton></Tooltip>
```

## Feedback

### ToastRegion

동적 상태 알림과 수동 닫기. 메시지 수명은 앱이 관리.

[Live preview](https://ui.mingu.xyz/toast)

```tsx
<ToastRegion messages={messages} onDismiss={id => setMessages(items => items.filter(item => item.id !== id))} />
```

### Alert

neutral·accent·success·warning·danger. 제목·본문·live region 조합.

[Live preview](https://ui.mingu.xyz/alert)

```tsx
<Alert tone="success" title="Saved" role="status">Your changes are ready.</Alert>
```

### Badge

상태와 분류를 표현하는 짧은 라벨.

[Live preview](https://ui.mingu.xyz/badge)

```tsx
<Badge tone="success">Published</Badge>
```

### StatusDot

상태 색과 텍스트를 함께 표시.

[Live preview](https://ui.mingu.xyz/status-dot)

```tsx
<StatusDot tone="success" label="Online" />
```

### Spinner

접근성 이름이 있는 진행 중 표시. 모션 감소 지원.

[Live preview](https://ui.mingu.xyz/spinner)

```tsx
<Spinner label="Loading projects" />
```

### Progress

확정 진행률과 미확정 진행 상태. 네이티브 progress 값·접근성을 유지하며 표시 막대를 보간한다. `animated={false}`로 네이티브 표시를 사용한다.

[Live preview](https://ui.mingu.xyz/progress)

```tsx
<Progress label="Upload" value={65} max={100} />
```

### Skeleton

로딩 중 레이아웃 유지. 스크린리더에서 숨기는 장식.

[Live preview](https://ui.mingu.xyz/skeleton)

```tsx
<Skeleton style={{height:20,width:'60%'}} />
```

### EmptyState

빈 결과의 제목·설명·다음 액션.

[Live preview](https://ui.mingu.xyz/empty-state)

```tsx
<EmptyState title="No projects" description="Create your first project." action={<Button>Create project</Button>} />
```

## Data display

### Avatar

프로필 이미지와 이니셜 fallback. 세 가지 크기.

[Live preview](https://ui.mingu.xyz/avatar)

```tsx
<Avatar name="Mingu Kim" size="md" />
```

### Table

caption과 스크롤 영역을 가진 네이티브 테이블.

[Live preview](https://ui.mingu.xyz/table)

```tsx
<Table caption="Projects"><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr><td>Website</td></tr></tbody></Table>
```

### DataTable

제네릭 컬럼·정렬·로딩·빈 결과. 데이터 변경 없이 표시.

[Live preview](https://ui.mingu.xyz/data-table)

```tsx
<DataTable label="Projects" rows={rows} rowKey={row => row.id} columns={[{key:'name',header:'Name',cell:row=>row.name,sortValue:row=>row.name}]} />
```

### Accordion

네이티브 details·summary와 키보드 조작.

[Live preview](https://ui.mingu.xyz/accordion)

```tsx
<Accordion items={[{id:'one',title:'How does it work?',content:'Use the shared tokens.'}]} />
```

## Layout

### Heading / Text

문서 위계와 시각 크기를 분리하는 타이포그래피.

[Live preview](https://ui.mingu.xyz/typography)

```tsx
<Heading level={1} size="2xl">Page title</Heading>
<Text muted size="sm">Supporting text</Text>
```

### Card

토큰 기반 표면·테두리·여백을 제공하는 콘텐츠 영역.

[Live preview](https://ui.mingu.xyz/card)

```tsx
<Card><Heading level={3}>Project</Heading><Text>Project details</Text></Card>
```

### Container

제품 화면 폭과 읽기용 폭. 반응형 좌우 여백.

[Live preview](https://ui.mingu.xyz/container)

```tsx
<Container reading><Text>Article content</Text></Container>
```

### Stack

행·열·간격·정렬. 좁은 화면에서 줄바꿈.

[Live preview](https://ui.mingu.xyz/stack)

```tsx
<Stack direction="row" gap={3} align="center"><Button>Save</Button><Button variant="ghost">Cancel</Button></Stack>
```

### Grid

최소 컬럼 폭과 토큰 간격을 사용하는 반응형 그리드.

[Live preview](https://ui.mingu.xyz/grid)

```tsx
<Grid min="16rem" gap={4}><Card>One</Card><Card>Two</Card></Grid>
```

### Separator

콘텐츠 구획을 구분하는 네이티브 수평선.

[Live preview](https://ui.mingu.xyz/separator)

```tsx
<Separator />
```

## State checklist

| 요소 | 기본 | Hover / Focus | Disabled | Invalid / Empty | Busy | Keyboard |
| --- | --- | --- | --- | --- | --- | --- |
| Button / IconButton | 5 variants × 3 sizes | visible ring | native disabled | — | disabled + aria-busy | Enter / Space |
| Input / Textarea / Select | 3 sizes | visible ring | native disabled / readOnly | aria-invalid + Field error | app state | native |
| Checkbox | unchecked / checked / mixed | visible ring | native disabled | required | — | Space |
| RadioGroup | selected / unselected | visible ring | group / option | error + required | — | arrows |
| Switch | on / off | visible track ring | native disabled | — | — | Space |
| Combobox | selected / search | active descendant | control / option | no results | app state | arrows / Enter / Escape / Tab |
| Dialog / Drawer | closed / open | contained focus | — | app content | app state | Tab / Shift+Tab / Escape |
| AlertDialog | closed / open | cancel first | busy actions | app content | busy prop | Tab / Escape when idle |
| DropdownMenu | closed / open | roving item focus | skip item | — | app state | arrows / Home / End / Escape |
| Tabs | selected / unselected | roving focus | skip tab | — | app content | arrows / Home / End |
| DataTable | rows | sort buttons | — | empty rows | loading | sort buttons |
| Pagination | current / edges / ellipsis | visible ring | all / edge | one page | disabled prop | native buttons |

## Composition rules

- Field는 label/hint/error 컨테이너다. 자식 컨트롤의 id와 aria-describedby를 예제처럼 연결한다.
- controlled 예제의 value·onValueChange·open·rows·options는 소비 앱의 상태와 데이터로 연결한다. `DatePicker`는 네이티브 date 입력이므로 달력의 세부 표시는 OS/브라우저를 따른다.
- FileUpload는 파일 선택만 처리한다. 서버 전송·크기 제한·콘텐츠 검증은 소비 앱의 책임이다.
- Combobox의 option value와 탭·메뉴·행의 key는 고유하게 지정한다.
- Popover / Tooltip / DropdownMenu는 native Popover API를 사용하는 현대 브라우저 대상이다.
- Tooltip에는 포커스 가능한 단일 React 요소를 넣는다. children은 aria-describedby를 실제 trigger에 전달해야 한다. disabled trigger의 설명은 별도 텍스트로 제공한다.
- 확인 동작은 AlertDialog의 onConfirm에서 실행한다. 완료 후 open을 닫고 비동기 작업 중에는 busy를 전달한다.
- ToastRegion은 자동으로 메시지를 지우지 않는다. 상태·dismiss·표시 개수는 앱에서 관리한다.
- DataTable은 클라이언트 표시·정렬을 제공한다. 서버 페이지네이션은 Pagination과 외부 데이터 조회로 조합한다.
- ref는 Input·Button 같은 native wrapper가 실제 DOM으로 전달한다. 조합 컴포넌트는 해당 API로 조작한다.

## Interaction components in the same catalog

기본 UI와 같은 카테고리·테마에서 사용한다. 전체 목록의 단일 기준은 `@mingu/interaction-ui/catalog`다.

| 기능 | 컴포넌트 |
| --- | --- |
| Actions | [DeleteButton](https://ui.mingu.xyz/delete-button) |
| Forms | [DurationPicker](https://ui.mingu.xyz/duration-picker), [OtpInput](https://ui.mingu.xyz/otp-input) |
| Navigation | [BounceSidebar](https://ui.mingu.xyz/bounce-sidebar), [HookSidebar](https://ui.mingu.xyz/hook-sidebar), [ProximitySidebar](https://ui.mingu.xyz/proximity-sidebar), [ScrollProgress](https://ui.mingu.xyz/scroll-progress), [RailToc](https://ui.mingu.xyz/rail-toc), [GooeyNav](https://ui.mingu.xyz/gooey-nav) |
| Data display | [Folder](https://ui.mingu.xyz/folder), [CodeBlock](https://ui.mingu.xyz/code-block), [GithubActivity](https://ui.mingu.xyz/github-activity), [StepPlayer](https://ui.mingu.xyz/step-player), [AnimatedCounter](https://ui.mingu.xyz/animated-counter), [VoiceNote](https://ui.mingu.xyz/voice-note), [Faq](https://ui.mingu.xyz/faq), [WebSearch](https://ui.mingu.xyz/web-search), [TaskList](https://ui.mingu.xyz/task-list) |
| Feedback | [EmojiReaction](https://ui.mingu.xyz/emoji-reaction), [NotificationBell](https://ui.mingu.xyz/notification-bell), [AiStatus](https://ui.mingu.xyz/ai-status) |
| Visual effects | [GravityLetters](https://ui.mingu.xyz/gravity-letters), [FluidOrb](https://ui.mingu.xyz/fluid-orb), [MatrixOrb](https://ui.mingu.xyz/matrix-orb), [GridReveal](https://ui.mingu.xyz/grid-reveal) |

## Micro interactions

| 컴포넌트 | 반응 | 미리보기 |
| --- | --- | --- |
| Button | 눌림/복귀, magnetic, ripple, shine, loading/success/error | [Button](https://ui.mingu.xyz/button) |
| CopyButton | 실제 복사 → 라벨 전환·체크 드로잉, 실패 안내 | [CopyButton](https://ui.mingu.xyz/copy-button) |
| FloatingField | 라벨 이동·포커스 강조선, 오류 상태 | [FloatingField](https://ui.mingu.xyz/floating-field) |
| SegmentedControl | 네이티브 라디오 + 공유 스프링 표시 | [SegmentedControl](https://ui.mingu.xyz/segmented-control) |
| Tabs | `animated` 선택 배경/패널 전환 | [Tabs](https://ui.mingu.xyz/tabs) |
| InteractiveCard | 포인터 조명/테두리와 선택적 기울기 | [InteractiveCard](https://ui.mingu.xyz/interactive-card) |

```tsx
<Button interaction="magnetic">Explore ↗</Button>
<Button interaction="ripple" variant="secondary">Press anywhere</Button>
<CopyButton text="hello@mingu.xyz" label="Copy email" />
<FloatingField label="Email" type="email" required />
<SegmentedControl label="Billing" defaultValue="monthly" name="billing"
  options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} />
<InteractiveCard effect="tilt"><Heading level={3}>Project</Heading></InteractiveCard>
```

## Consumer media and localization hooks

`VoiceNote` accepts an optional `audioRef` for timestamp navigation and `onLoadedMetadata` for deep links. The ready callback also runs when metadata arrived before hydration. `labels` can override `play`, `pause`, `seek`, `speed(speed)` and `error`; existing English defaults are preserved.

`CodeBlock` accepts optional `labels.copy`, `labels.copied`, `labels.success` and `labels.error` for visible controls and live announcements. Defaults remain English.


## Exploration interactions

[Newest](https://ui.mingu.xyz/newest)에서 최근 추가된 항목을 먼저 볼 수 있다. 추가일로부터 30일 후 New 표시는 사라지며 아래 경로는 유지된다.

- [FocusDock](https://ui.mingu.xyz/focus-dock): 포인터 거리와 키보드 포커스에 반응하는 액션 Dock.
- [SwipeDeck](https://ui.mingu.xyz/swipe-deck): 드래그/버튼으로 넘기는 카드 스택. 단일·빈 목록·반복/경계 상태 지원.
- [ImageCompare](https://ui.mingu.xyz/image-compare): 드래그와 네이티브 range 키보드 입력으로 두 이미지 비교.
- [CommandPalette](https://ui.mingu.xyz/command-palette): 검색/keywords, disabled, 빈 결과, 선택과 모달 포커스 복귀.
- [ScrambleText](https://ui.mingu.xyz/scramble-text): 글자 정렬 효과, 재생 키·뷰포트·모션 감소 지원.

모든 항목은 패키지 루트에서 가져온다. typed props와 코드 예제는 각 상세 화면 및 DESIGN_SYSTEM.md에 있다.

## Gesture interactions

- [RadialMenu](https://ui.mingu.xyz/radial-menu): 원형 액션 메뉴. disabled 항목, 방향키, Escape/Tab, 외부 클릭 지원.
- [PreviewLink](https://ui.mingu.xyz/preview-link): 네이티브 링크를 유지하는 포인터 이미지 미리보기. focus·viewport 경계·모션 감소 지원.
- [MorphingSearch](https://ui.mingu.xyz/morphing-search): 검색 버튼에서 실제 검색 폼으로 전환. 입력·제출·지우기·포커스 복귀.
- [ElasticSlider](https://ui.mingu.xyz/elastic-slider): 드래그 중 휘어지고 복귀하는 range. min/max/step·폼 값·키보드·disabled 지원.

## Everyday interactions

| 미리보기 | 주요 상태 |
| --- | --- |
| [ImageLightbox](https://ui.mingu.xyz/image-lightbox) | 빈 목록, 이미지 로딩 실패, 확대/초기화, 다음/이전, 핀치/이동, 모달 포커스 복귀 |
| [ExpandableCard](https://ui.mingu.xyz/expandable-card) | 닫힘/열림, disabled, 실제 상세 액션, 모션 감소 |
| [AnimatedFilterBar](https://ui.mingu.xyz/animated-filter-bar) | 전체/필터, 결과 수, 빈 결과, disabled, 라디오 키보드 |
| [ResizablePanels](https://ui.mingu.xyz/resizable-panels) | min/max, 드래그, 키보드, 접기/복원, disabled |
| [SortableList](https://ui.mingu.xyz/sortable-list) | 드래그, 키보드 재배치와 알림, disabled, 빈 목록 |
| [InlineEdit](https://ui.mingu.xyz/inline-edit) | 읽기/편집, 검증, 저장 중, 거절/재시도, 취소/포커스 복귀 |
| [SelectionToolbar](https://ui.mingu.xyz/selection-toolbar) | 실제 본문 선택, Copy 성공/실패, 인용 콜백, Escape |
| [SmartHeader](https://ui.mingu.xyz/smart-header) | 상단/스크롤, 방향 변화, 포커스 복귀, 중첩 스크롤 |
| [CodeTabs](https://ui.mingu.xyz/code-tabs) | 파일/명령어 탭, disabled, 빈 목록, 실제 복사, 높이 변경 |
| [BottomSheet](https://ui.mingu.xyz/bottom-sheet) | 여러 snap, 드래그/키보드, 본문 스크롤, 닫기/포커스 복귀 |
| [ActionToast](https://ui.mingu.xyz/action-toast) | 쌓임/제거, Undo, 진행률, 액션 중/실패/재시도 |
| [FileDropzone](https://ui.mingu.xyz/file-dropzone) | 드롭/선택, 파일 검증, 썸네일, 업로드 진행/실패/재시도, 제거/취소, 폼/reset |

## Image and typography interactions

- [ImageLens](https://ui.mingu.xyz/image-lens): 실제 이미지 확대, hover/고정, 터치·방향키, 이미지 오류.
- [DirectionalCard](https://ui.mingu.xyz/directional-card): 네 방향 진입, native 링크/ref, focus·touch·모션 감소.
- [LoopingTicker](https://ui.mingu.xyz/looping-ticker): 길이 측정, Pause/Play, hover/focus/화면 밖 정지, 정적인 수동 스크롤.
- [RotatingText](https://ui.mingu.xyz/rotating-text): 폭 유지, 단어 전환, Pause/Play, 모션 감소와 정적 접근성 설명.

[AiStatus](https://ui.mingu.xyz/ai-status)의 아이콘·본문·detail·timer는 첫 줄을 기준으로 정렬하며 모든 6개 상태에 같은 SVG 슬롯을 사용한다.

## Playground interactions

- [HoverGallery](https://ui.mingu.xyz/hover-gallery): 확장 이미지 패널, hover/클릭/방향키, disabled·빈 목록·모션 감소.
- [TextReveal](https://ui.mingu.xyz/text-reveal): 스크롤 단어 강조, 중첩 컨테이너, 정적 원문과 모션 감소.
- [CursorTrail](https://ui.mingu.xyz/cursor-trail): 이미지 자취, 수명·개수 제한, 일시정지·화면 밖 정리, 터치의 정적 갤러리.
- [AvatarCluster](https://ui.mingu.xyz/avatar-cluster): 겹쳐진 아바타, 프로필 모달, 이미지 fallback·링크·포커스 복귀.
- [HoldToConfirm](https://ui.mingu.xyz/hold-to-confirm): 길게 누르기·취소, 클릭/키보드 확인, 비동기 진행·실패·재시도.
- [NumberScrubber](https://ui.mingu.xyz/number-scrubber): 핸들 드래그·키보드, 범위·step, 실제 숫자 입력과 폼/reset.

## Touch interactions

- [SwipeActions](https://ui.mingu.xyz/swipe-actions): 좌우 액션 공개, 세로 스크롤·네이티브 자식 유지, 실행/실패/재시도·명시적 버튼.
- [PullToRefresh](https://ui.mingu.xyz/pull-to-refresh): 맨 위 당김·임계점·취소, 새로고침/실패/재시도, 중복 방지와 AbortSignal.
- [LongPressMenu](https://ui.mingu.xyz/long-press-menu): 길게 누르기·이동 취소, BottomSheet 액션·버튼 대안·포커스 복귀.
- [SelectionBar](https://ui.mingu.xyz/selection-bar): 선택 수·일괄 액션·해제, inline/sticky/fixed·안전 영역·비동기 실패.

## Experimental

큰 실험 화면은 [Playground](https://ui.mingu.xyz/playground)에 모은다. 모든 실험 컴포넌트는 패키지 루트에서 export한다. [API와 제약](./DESIGN_SYSTEM.md#experimental-playground).

| Component | Interaction | States and alternatives |
| --- | --- | --- |
| [ParticleText](https://ui.mingu.xyz/particle-text) | 글자 입자 반발·흩뜨리기·복귀, Word/Force 편집 | 일시 정지·초기화·빈 글자·모션 감소·터치 선택 사용 |
| [SpatialBoard](https://ui.mingu.xyz/spatial-board) | 노트 이동·연결·편집, 화면 이동·확대·맞춤 | 키보드 손잡이·노트 포커스·연결 취소/삭제·빈 보드·12개 상한 |
| [SoundPad](https://ui.mingu.xyz/sound-pad) | 여덟 패드, 시각 음표·8단계 캡처/반복 | 명시적 소리 활성화·음소거·볼륨·오디오 실패·키보드·이탈 시 중지 |
| [ClothPlayground](https://ui.mingu.xyz/cloth-playground) | 천의 점 드래그·절단·바람·중력·고정점 | 키보드 손잡이·절단 버튼·앵커 복구·일시정지·정적 모션 감소 |
| [FluidSandbox](https://ui.mingu.xyz/fluid-sandbox) | 입자 붓기·젓기·소용돌이·점도 | 420개 상한·비우기/복구·키보드 소용돌이·정적 표시·모션 감소 |
| [OrbitComposer](https://ui.mingu.xyz/orbit-composer) | 상대 궤도·반경·속도·궤적 편집 | 세 프리셋·키보드/터치 손잡이·포커스 시 정지·방향 반전·모션 감소 |

## Interactive lab (0.15)

StickerPeel, ElasticMesh, ImageParticleMorph, DitherReveal, FluidGlassLens, Lanyard, DomeGallery, FoldablePaper, WebcamPixelGrid, ImageRelighting. 라이브 카탈로그와 `/playground/<id>`에서 같은 구현을 사용한다. [API와 입력·성능·권한 규칙](./docs/collections/lab.md). 새 항목은 실제 추가일로부터 30일 동안 Newest에 표시한다.

## Navigation and scroll (0.16.0)

PageTransition, DynamicStatusIsland, AnimatedMegaMenu, SortableGrid, CardNavigation, ScrollStack, StickyScrollStory, FooterReveal, ScrollExpandMedia, CoverflowCarousel. 각 항목의 라이브 데모·사용 코드·Newest를 제공한다. [API와 조작 규칙](./docs/collections/navigation.md).

## Media and workspace (0.17.0)

SplitFlapDisplay, VariableFontProximity, VerticalReel, StoryViewer, VideoPlayer, ImageCropper, CalendarBoard, GanttTimeline, KanbanBoard, FileTree. 각 항목의 라이브 데모·사용 코드·Newest를 제공한다. [API와 조작 규칙](./docs/collections/media.md).

## Interactive tools (0.18.0)

TagInput, WheelPicker, ColorPicker, BezierEditor, CollaborativeCursor, SlashCommandEditor, ChartRangeNavigator, CarouselScrubber, DialogStack, LiveCodeSandbox. 각 항목의 라이브 데모·사용 코드·Newest를 제공한다. [API와 조작 규칙](./docs/collections/tools.md).
