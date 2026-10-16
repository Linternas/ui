# Component catalog

Mingu UI의 기본 컴포넌트와 상태별 사용 기준. [테마와 설치](./DESIGN_SYSTEM.md).

## Actions

### Button

Primary, secondary, outline, ghost, danger. 크기·로딩·비활성 상태.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/button)

```tsx
<Button variant="primary" size="md">Save changes</Button>
<Button variant="outline" loading>Saving</Button>
```

### IconButton

접근성 이름을 필수로 받는 아이콘 액션.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/icon-button)

```tsx
<IconButton label="Settings" variant="secondary">⚙</IconButton>
```

### ButtonGroup

관련 액션을 하나의 이름 아래 그룹화.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/button-group)

```tsx
<ButtonGroup label="Alignment"><Button>Left</Button><Button>Center</Button></ButtonGroup>
```

### LinkButton

버튼의 시각 표현을 사용하는 네이티브 링크.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/link-button)

```tsx
<LinkButton href="/projects" variant="secondary">Projects</LinkButton>
```

## Forms

### Input

sm·md·lg, placeholder, readOnly, disabled, invalid. 네이티브 입력 props와 ref 지원.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/input)

```tsx
<Label htmlFor="name">Name</Label>
<Input id="name" name="name" controlSize="md" placeholder="Project name" />
```

### TextField

label·hint·error와 입력을 자동으로 연결하는 텍스트 필드.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/text-field)

```tsx
<TextField label="Email" type="email" required hint="Work address" error="Check your email address" />
```

### Textarea

여러 줄 입력, 크기·오류·리사이즈·네이티브 제한.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/textarea)

```tsx
<Label htmlFor="bio">Bio</Label>
<Textarea id="bio" rows={4} maxLength={300} placeholder="Tell us about yourself" />
```

### Select

네이티브 선택 컨트롤. 키보드·모바일 선택 UI와 폼 제출 유지.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/select)

```tsx
<Select aria-label="Environment"><option>Production</option><option>Preview</option></Select>
```

### Field / Label

커스텀 컨트롤용 label·도움말·오류 조합.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/field)

```tsx
<Field label="Notes" htmlFor="notes" hint="Optional">
  <Textarea id="notes" aria-describedby="notes-description" />
</Field>
```

### PasswordField

보기·숨기기 전환과 자동 label·오류 연결.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/password-field)

```tsx
<PasswordField label="Password" autoComplete="new-password" minLength={8} />
```

### SearchField

네이티브 검색 입력. controlled 필터에 사용.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/search-field)

```tsx
<SearchField label="Search" value={query} onChange={e => setQuery(e.target.value)} />
```

### NumberField

네이티브 숫자 입력. min·max·step 검증.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/number-field)

```tsx
<NumberField label="Seats" min={1} max={100} step={1} defaultValue={3} />
```

### DatePicker

브라우저의 달력과 날짜 입력. min·max와 YYYY-MM-DD 값 사용.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/date-picker)

```tsx
<DatePicker label="Due date" min="2026-01-01" defaultValue="2026-10-16" />
```

### Checkbox

checked·indeterminate·disabled·required. 네이티브 폼 값.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/checkbox)

```tsx
<Checkbox name="terms" required>Accept terms</Checkbox>
<Checkbox indeterminate>Some selected</Checkbox>
```

### RadioGroup

fieldset·legend로 묶인 네이티브 라디오. 방향키 탐색과 disabled 옵션.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/radio-group)

```tsx
<RadioGroup label="Plan" name="plan" defaultValue="personal" options={[{value:'personal',label:'Personal'},{value:'team',label:'Team'}]} />
```

### Switch

켜짐·꺼짐·비활성. 네이티브 체크박스의 폼 동작.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/switch)

```tsx
<Switch name="notifications" defaultChecked>Notifications</Switch>
```

### Slider

키보드로 조절하는 범위 입력. 값 표시·min·max·step.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/slider)

```tsx
<Slider label="Volume" defaultValue={40} min={0} max={100} step={5} />
```

### FileUpload

네이티브 파일 선택. accept·multiple·disabled. 전송은 앱에서 처리.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/file-upload)

```tsx
<FileUpload label="Attachments" name="files" accept="image/*" multiple hint="Select image files" />
```

### Combobox

검색·선택·빈 결과·비활성 옵션과 방향키·Enter·Escape.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/combobox)

```tsx
<Combobox label="Framework" value={framework} onValueChange={setFramework} options={options} name="framework" />
```

## Navigation

### Tabs

방향키·Home·End, 비활성 항목 건너뛰기, 패널 연결.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/tabs)

```tsx
<Tabs label="Project" value={tab} onValueChange={setTab} items={[{value:'overview',label:'Overview',content:<p>Overview</p>}]} />
```

### Breadcrumbs

현재 페이지와 상위 경로. 네이티브 링크.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/breadcrumbs)

```tsx
<Breadcrumbs items={[{label:'Home',href:'/'},{label:'Projects',href:'/projects'},{label:'Settings'}]} />
```

### Pagination

이전·다음·현재 페이지와 생략 구간. controlled 페이지 상태.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/pagination)

```tsx
<Pagination page={page} pageCount={12} onPageChange={setPage} />
```

### Navigation

가로·세로 탐색. 현재 경로, 아이콘, 비활성 상태.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/navigation)

```tsx
<Navigation activeId="overview" items={[{id:'overview',label:'Overview',href:'/overview'}]} />
```

### Sidebar

제품 탐색을 담는 사이드바 영역.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/sidebar)

```tsx
<Sidebar label="Workspace"><Navigation orientation="vertical" items={items} activeId="home" /></Sidebar>
```

## Overlays

### Dialog

모달 포커스·Escape·복귀, 제목·설명 연결.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/dialog)

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Settings" description="Manage your project"><TextField label="Name" /></Dialog>
```

### AlertDialog

명시적 확인이 필요한 동작. 취소 우선 포커스와 busy 상태.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/alert-dialog)

```tsx
<AlertDialog open={open} onOpenChange={setOpen} title="Delete project?" description="This cannot be undone." danger onConfirm={confirmDelete} />
```

### Drawer

좌·우 슬라이드 패널. 모달과 같은 포커스·닫기 규칙.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/drawer)

```tsx
<Drawer open={open} onOpenChange={setOpen} title="Filters" side="right"><Checkbox>Published</Checkbox></Drawer>
```

### Popover

버튼에 붙는 비모달 패널. 화면 경계 배치, Escape·외부 클릭 닫기.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/popover)

```tsx
<Popover trigger="Filters" label="Filters"><Checkbox>Published only</Checkbox></Popover>
```

### DropdownMenu

방향키·Home·End 메뉴. 비활성·위험 액션, 닫기 후 포커스 복귀.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/dropdown-menu)

```tsx
<DropdownMenu label="Actions" items={[{id:'edit',label:'Edit',onSelect:edit},{id:'delete',label:'Delete',danger:true,onSelect:remove}]} />
```

### Tooltip

hover·focus 설명. Escape로 닫기, trigger 설명 연결.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/tooltip)

```tsx
<Tooltip content="Edit settings"><IconButton label="Settings">⚙</IconButton></Tooltip>
```

## Feedback

### ToastRegion

동적 상태 알림과 수동 닫기. 메시지 수명은 앱이 관리.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/toast)

```tsx
<ToastRegion messages={messages} onDismiss={id => setMessages(items => items.filter(item => item.id !== id))} />
```

### Alert

neutral·accent·success·warning·danger. 제목·본문·live region 조합.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/alert)

```tsx
<Alert tone="success" title="Saved" role="status">Your changes are ready.</Alert>
```

### Badge

상태와 분류를 표현하는 짧은 라벨.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/badge)

```tsx
<Badge tone="success">Published</Badge>
```

### StatusDot

상태 색과 텍스트를 함께 표시.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/status-dot)

```tsx
<StatusDot tone="success" label="Online" />
```

### Spinner

접근성 이름이 있는 진행 중 표시. 모션 감소 지원.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/spinner)

```tsx
<Spinner label="Loading projects" />
```

### Progress

확정 진행률과 미확정 진행 상태. 네이티브 progress.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/progress)

```tsx
<Progress label="Upload" value={65} max={100} />
```

### Skeleton

로딩 중 레이아웃 유지. 스크린리더에서 숨기는 장식.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/skeleton)

```tsx
<Skeleton style={{height:20,width:'60%'}} />
```

### EmptyState

빈 결과의 제목·설명·다음 액션.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/empty-state)

```tsx
<EmptyState title="No projects" description="Create your first project." action={<Button>Create project</Button>} />
```

## Data display

### Avatar

프로필 이미지와 이니셜 fallback. 세 가지 크기.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/avatar)

```tsx
<Avatar name="Mingu Kim" size="md" />
```

### Table

caption과 스크롤 영역을 가진 네이티브 테이블.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/table)

```tsx
<Table caption="Projects"><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr><td>Website</td></tr></tbody></Table>
```

### DataTable

제네릭 컬럼·정렬·로딩·빈 결과. 데이터 변경 없이 표시.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/data-table)

```tsx
<DataTable label="Projects" rows={rows} rowKey={row => row.id} columns={[{key:'name',header:'Name',cell:row=>row.name,sortValue:row=>row.name}]} />
```

### Accordion

네이티브 details·summary와 키보드 조작.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/accordion)

```tsx
<Accordion items={[{id:'one',title:'How does it work?',content:'Use the shared tokens.'}]} />
```

## Layout

### Heading / Text

문서 위계와 시각 크기를 분리하는 타이포그래피.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/typography)

```tsx
<Heading level={1} size="2xl">Page title</Heading>
<Text muted size="sm">Supporting text</Text>
```

### Card

토큰 기반 표면·테두리·여백을 제공하는 콘텐츠 영역.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/card)

```tsx
<Card><Heading level={3}>Project</Heading><Text>Project details</Text></Card>
```

### Container

제품 화면 폭과 읽기용 폭. 반응형 좌우 여백.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/container)

```tsx
<Container reading><Text>Article content</Text></Container>
```

### Stack

행·열·간격·정렬. 좁은 화면에서 줄바꿈.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/stack)

```tsx
<Stack direction="row" gap={3} align="center"><Button>Save</Button><Button variant="ghost">Cancel</Button></Stack>
```

### Grid

최소 컬럼 폭과 토큰 간격을 사용하는 반응형 그리드.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/grid)

```tsx
<Grid min="16rem" gap={4}><Card>One</Card><Card>Two</Card></Grid>
```

### Separator

콘텐츠 구획을 구분하는 네이티브 수평선.

[Live preview](https://blog.mingu.xyz/lab/ui/system/components/separator)

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
