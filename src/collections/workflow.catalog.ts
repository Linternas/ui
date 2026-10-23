export const workflowCatalog = [
  {
    id: "date-range-picker",
    name: "Date range picker",
    component: "DateRangePicker",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "시작일과 종료일을 고르고 프리셋·선택 일수·날짜 순서 검증을 함께 확인합니다.",
    tags: ["workflow", "date range picker"],
  },
  {
    id: "time-picker",
    name: "Time picker",
    component: "TimePicker",
    group: "Forms",
    addedAt: "2026-10-23",
    description: "시간을 직접 입력하거나 분 단위로 조절하는 시간 선택기.",
    tags: ["workflow", "time picker"],
  },
  {
    id: "range-slider",
    name: "Range slider",
    component: "RangeSlider",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "두 개의 네이티브 슬라이더로 최소·최대 구간과 간격을 조절합니다.",
    tags: ["workflow", "range slider"],
  },
  {
    id: "tree-select",
    name: "Tree select",
    component: "TreeSelect",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "트리를 펼쳐 항목을 선택합니다. 부모의 부분 선택·검색·비활성 항목을 유지합니다.",
    tags: ["workflow", "tree select"],
  },
  {
    id: "cascader",
    name: "Cascader",
    component: "Cascader",
    group: "Forms",
    addedAt: "2026-10-23",
    description: "분류를 단계별로 고르며 실제 선택 경로를 구성합니다.",
    tags: ["workflow", "cascader"],
  },
  {
    id: "mention-input",
    name: "Mention input",
    component: "MentionInput",
    group: "Forms",
    addedAt: "2026-10-23",
    description: "@로 사람을 찾아 입력하고 방향키·Enter로 멘션을 삽입합니다.",
    tags: ["workflow", "mention input"],
  },
  {
    id: "stepper",
    name: "Stepper",
    component: "Stepper",
    group: "Navigation",
    addedAt: "2026-10-23",
    description: "내용과 완료 조건에 따라 앞뒤로 이동하는 단계별 입력 흐름.",
    tags: ["workflow", "stepper"],
  },
  {
    id: "filter-builder",
    name: "Filter builder",
    component: "FilterBuilder",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "필드·비교 연산·값을 조합해 실제 데이터에 적용할 필터를 만듭니다.",
    tags: ["workflow", "filter builder"],
  },
  {
    id: "column-manager",
    name: "Column manager",
    component: "ColumnManager",
    group: "Data display",
    addedAt: "2026-10-23",
    description:
      "테이블 열의 표시 여부와 순서를 조절하고 변경을 즉시 반영합니다.",
    tags: ["workflow", "column manager"],
  },
  {
    id: "schedule-picker",
    name: "Schedule picker",
    component: "SchedulePicker",
    group: "Forms",
    addedAt: "2026-10-23",
    description:
      "요일·시간 격자를 칠하거나 키보드로 선택하는 주간 가능 시간표.",
    tags: ["workflow", "schedule picker"],
  },
  {
    id: "draggable-window",
    name: "Draggable window",
    component: "DraggableWindow",
    group: "Overlays",
    addedAt: "2026-10-23",
    description:
      "제목 표시줄을 끌고 최소화·최대화·키보드 이동으로 다루는 작은 작업 창.",
    tags: ["workflow", "draggable window"],
  },
  {
    id: "notification-inbox",
    name: "Notification inbox",
    component: "NotificationInbox",
    group: "Feedback",
    addedAt: "2026-10-23",
    description: "읽음·안 읽음 필터, 보관, 되돌리기가 연결된 알림함.",
    tags: ["workflow", "notification inbox"],
  },
] as const;
export const workflowExamples = {
  "date-range-picker":
    '<DateRangePicker name="dates" defaultValue={{start:"2026-10-23",end:"2026-10-29"}} />',
  "time-picker":
    '<TimePicker label="Start time" name="time" defaultValue="09:30" stepMinutes={5} />',
  "range-slider":
    '<RangeSlider label="Width" name="width" min={240} max={1440} step={40} minGap={160} defaultValue={[320,960]} unit="px" />',
  "tree-select":
    '<TreeSelect name="topics" nodes={[{id:"design",label:"Design",children:[{id:"tokens",label:"Tokens"},{id:"motion",label:"Motion"}]}]} defaultExpandedIds={["design"]} />',
  cascader:
    '<Cascader name="path" nodes={[{id:"design",label:"Design",children:[{id:"tokens",label:"Tokens"}]}]} />',
  "mention-input":
    '<MentionInput name="message" options={[{id:"mina",label:"Mina Park",handle:"mina"},{id:"mingu",label:"Mingu Kim",handle:"mingu"}]} />',
  stepper:
    '<Stepper steps={[{id:"details",title:"Details",content:<TextField label="Project name" />},{id:"ready",title:"Ready",content:<p>Review your project.</p>}]} onComplete={() => console.log("Complete")} />',
  "filter-builder":
    '<FilterBuilder fields={[{id:"name",label:"Name"},{id:"visits",label:"Visits",type:"number"}]} name="filters" />',
  "column-manager":
    '<ColumnManager name="columns" defaultValue={[{id:"name",label:"Name",visible:true,locked:true},{id:"status",label:"Status",visible:true}]} />',
  "schedule-picker":
    '<SchedulePicker label="Availability" name="slots" hours={[9,10,11,12]} defaultValue={["mon:9","wed:11"]} />',
  "draggable-window":
    '<DraggableWindow title="Draft notes"><TextareaField label="Quick note" defaultValue="A place for the next idea." /></DraggableWindow>',
  "notification-inbox":
    '<NotificationInbox defaultValue={[{id:"comment",title:"A new comment",description:"Someone left a thought.",read:false},{id:"ready",title:"Preview ready",read:true}]} />',
} satisfies Record<string, string>;
