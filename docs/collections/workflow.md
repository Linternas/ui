# Workflow controls (0.23)

Import from `@mingu/interaction-ui`, load `system.css` and `styles.css` inside `DesignSystemProvider`. These twelve public components are also the actual gallery and Docs demos. Added 2026-10-23 UTC; New badges expire after 30 days. Common props: `label`, `disabled`, `className`, `style`. No requests, persistence or business mutations are performed.

Controlled `value` props remain owned by the caller: commit `onValueChange` to accept an edit. Uncontrolled named controls restore their `defaultValue` on native form reset. Use unique IDs for nodes, columns, notifications and rules.

## DateRangePicker

`value/defaultValue: {start:string,end:string}`, `onValueChange(DateRange)`, `name?`, `min?`, `max?`, `presets?: {label,start,end}[]`.

Uses native date inputs and ISO `YYYY-MM-DD` values. Names are `<name>.start` and `<name>.end`. Inclusive day count uses UTC midnight to avoid daylight-saving changes. Reversed dates expose an error on End date and set native custom validity to block form submission. Presets and Clear update the same state. Native min/max validation applies; caller-supplied presets and controlled values must be valid and within its constraints. Empty strings represent unselected dates. Disabled fieldset omits fields from submission.

## TimePicker

`value/defaultValue="09:30"`, `onValueChange(string)`, `stepMinutes=5` (1–60), `name?`, `timezoneLabel?`.

Native time input, 24-hour `HH:mm` state, plus/minus minute buttons bounded at 00:00 and 23:59. Empty time disables increment controls. `timezoneLabel` is a display label; no timezone conversion or scheduling occurs. Disabled native input is omitted from form data.

## RangeSlider

`value/defaultValue=[20,80]`, `onValueChange([number,number])`, `min=0`, `max=100`, `step=1`, `minGap=0`, `unit?`, `name?`.

Two native range inputs support keyboard and pointer editing. Lower and upper handles cannot cross the configured gap. Named hidden inputs submit `<name>.min` and `<name>.max`. Provide finite increasing bounds and a positive step that aligns your desired values. Numeric output is bounded and ordered; disabled values are omitted.

## TreeSelect

`nodes: SelectionNode[]`, `value/defaultValue: readonly string[]`, `onValueChange(string[])`, `defaultExpandedIds?`, `name?`. `SelectionNode` is `{id,label,disabled?,children?}`.

Native checkboxes select leaf IDs; parents show partial selection and toggle enabled descendant leaves. Disabled ancestry prevents changes. Separate Expand/Collapse buttons keep checkbox and expansion actions distinct. Search retains matching paths. Named hidden inputs submit each selected leaf. This is a nested checkbox list rather than an ARIA tree widget; native Tab and Space behavior applies. Selected IDs should reference existing leaves.

## Cascader

`nodes: SelectionNode[]`, `value/defaultValue: readonly string[]`, `onValueChange(string[])`, `name?`.

Each level is a native radio group. Selecting an ancestor truncates later choices. The selected path is emitted as IDs and submitted as one slash-separated hidden value. At most twelve levels are displayed. Disabled nodes cannot be chosen. Empty nodes show an empty state; narrow screens wrap columns.

## MentionInput

`options: {id,label,handle?,description?,disabled?}[]`, `value/defaultValue:string`, `onValueChange(string)`, `onMention(option)`, `name?`, `placeholder?`, `maxLength=2000`.

Typing @ followed by letters/numbers/underscore opens up to six matching enabled people. Arrow keys change the active suggestion, Enter/Tab insert `@handle ` and restore the caret, Escape closes suggestions without closing an outer dialog. Clicking a suggestion preserves textarea focus. Suggestions use a listbox and active descendant. Text is plain text; the component does not render mention HTML or notify people. Use handles appropriate to your application's text syntax. Native textarea forms and reset are retained.

## Stepper

`steps: {id,title,description?,content:ReactNode,disabled?,canContinue?}[]`, `value/defaultValue?:string`, `onValueChange(id)`, `onComplete()`, `completedIds?`, `allowJump=false`.

Only the active content is mounted. The consumer owns any form data that must survive a step change. Back/Continue skip disabled steps. `canContinue=false` blocks the forward action; Finish calls `onComplete` without inventing a successful request. Future steps are locked unless `allowJump` or `completedIds` permit them. Current step uses `aria-current="step"`. Empty steps show an empty state.

## FilterBuilder

`fields: {id,label,type?:"text"|"number"}[]`, `value/defaultValue: FilterModel`, `onValueChange(FilterModel)`, `maxRules=6` (1–12), `name?`.

`FilterModel={mode:"and"|"or",rules:{id,field,operator,value}[]}`. Text operators: contains/is; numeric operators: gt/lt/is. Add, remove and clear rules; changing field selects a suitable operator. A named hidden input submits JSON. `matchesFilter(record,model)` is a pure local comparator; numeric comparisons reject non-finite values. Zero rules match all records. No expression evaluation, SQL or network query is generated. The demo filters actual local rows.

## ColumnManager

`value/defaultValue: {id,label,visible,locked?}[]`, `onValueChange(ManagedColumn[])`, `minVisible=1`, `name?`.

Native checkboxes change visibility. Up/down controls reorder the actual emitted array; they also work without dragging. Locked columns retain visibility, but may be reordered. The minimum prevents hiding the last required visible columns. Named hidden inputs submit visible IDs in display order. Rendering the resulting table is the consumer's responsibility; the demo does so.

## SchedulePicker

`days?:{id,label}[]`, `hours?:number[]`, `value/defaultValue: readonly string[]`, `onValueChange(string[])`, `blocked?:readonly string[]`, `name?`.

Default weekdays Mon–Fri. Slot keys are `<day-id>:<hour>`. Up to seven days and twenty-four unique whole hours 0–23 are shown. Click or paint mouse/pen strokes; touch taps toggle cells while preserving page scroll, and Paint with touch explicitly enables captured touch strokes. Pointer cancellation/lost capture ends painting. The grid has roving Tab focus, arrow/Home/End navigation and native Enter/Space toggling; blocked cells are skipped. Select all/Clear operate on enabled slots. Named hidden inputs submit each selected key. This is an availability editor, without timezone conversion or bookings; supply valid keys.

## DraggableWindow

`title`, `children`, `position/defaultPosition:{x,y}`, `onPositionChange(WindowPosition)`.

A relative stage contains a movable window, with no portal or global hotkeys. Drag the title handle; arrows move 10px, Shift+arrows 1px, Home and Center window return to the center. Pointer movement is clamped to stage bounds. Minimize hides and retains the body, while Maximize/Restore changes its size. Supply a valid relative position when controlled. Native children retain their own focus and form state. No OS window is created.

## NotificationInbox

`value/defaultValue: {id,title,description?,time?,read?}[]`, `onValueChange(InboxNotification[])`.

All/Unread native segmented filters, individual read/unread, Mark all read, archive and one-level Undo. Undo restores the archived item at its original index. Bounded list and empty state. The consumer owns delivery, timestamps, persistence and ordering; no notification permission or background subscription is requested.
