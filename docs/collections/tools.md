# Interactive tools

Reusable editors and navigation tools. Import components and types from `@mingu/interaction-ui`, and load `system.css` and `styles.css`. All ten display a New badge for 30 days from 2026-10-23 UTC. These components have no service or storage dependency.

## TagInput

`label`, `value/defaultValue: readonly string[]`, `onValueChange(string[])`, `suggestions`, `maxTags=12` (1–100), `name`, `disabled`, `error`, `className/style`.

Enter/comma or Add tag commits trimmed text (48 characters maximum). Duplicate comparisons ignore case. Suggested values are filtered and exclude selected tags. Backspace on the empty input removes the last tag; each chip also has a labelled remove button. `name` submits one hidden input per selected tag. Uncontrolled form reset restores defaults. An invalid external tag array is not silently rewritten; keep external tags unique.

## WheelPicker

`label`, `options: {value,label,disabled?}[]`, `value/defaultValue/onValueChange`, `name`, `disabled`, `className/style`.

Scroll snapping selects the nearest enabled option after a short settle interval. Tap, ArrowUp/Down, Home and End select and center an enabled option. Empty arrays show an empty state. Native scroll provides touch momentum; reduced motion removes programmatic smooth scrolling. `name` submits the chosen value, and an uncontrolled form reset restores defaults. Option values must be unique; supply a value that exists in the list.

## ColorPicker

`label`, `value/defaultValue="#5577ddff"`, `onValueChange(hex)`, `name`, `disabled`, `className/style`.

Drag the saturation/brightness plane, or use the four native keyboard ranges for hue, saturation, brightness and opacity. HEX accepts `#RRGGBB` or `#RRGGBBAA`; slider edits emit lowercase 8-digit HEX, preserving alpha. Invalid input remains editable and displays an error without replacing the committed color. Use valid full HEX for external values. A hidden named input submits the committed color. Uncontrolled reset restores defaults.

## BezierEditor

`label`, `value/defaultValue: [x1,y1,x2,y2]`, `onValueChange(points)`, `duration=1200` (200–5000 ms), `name`, `disabled`, `className/style`.

Drag SVG handles or edit four native sliders. Each coordinate is clamped to 0–1. Output is a usable `cubic-bezier(...)` string. Play motion runs a real Web Animation using that easing; replay cancels the prior animation and unmount cancels it. Reduced motion keeps the editor static. A hidden named input submits the CSS expression. This version intentionally restricts Y to 0–1; overshooting curves are outside its current API.

## CollaborativeCursor

`peers: {id,name,x,y,message?}[]`, `onPositionChange({x,y}|null)`, `children`, `label`, `disabled`, `className/style`.

Positions are normalized 0–1. Renders up to 20 supplied peers, with names and optional message bubbles; names/messages render as plain text and are visually limited to 40/100 characters. Pointer movement reports a local position; leaving reports null. Focused arrow keys move a local crosshair by 0.025. No network, identity, room membership, persistence or real-time transport is included. The catalog explicitly simulates peers locally. Wire presence updates yourself, authenticate them in your app and throttle outbound updates as appropriate. Reduced motion removes peer position transitions.

## SlashCommandEditor

`label`, `value/defaultValue: readonly EditorBlock[]`, `onValueChange(blocks)`, `name`, `disabled`, `maxLength=20000` (1–100000), `className/style`. `EditorBlock` is `{id,type,text}`; type is `paragraph | heading | quote | code`.

Actual contenteditable blocks emit structured plain-text data. Type `/` in an empty block to open the four commands, navigate with arrows/Enter, or use each block's format button. Escape closes the command menu. Enter adds a following block; Shift+Enter inserts a line break; Backspace removes an empty block when another remains. Add block also handles an empty document. New blocks are limited to 50. A hidden named input submits JSON; uncontrolled form reset restores defaults.

Controlled strings are assigned through `textContent`, not HTML. Pasting inserts only `text/plain`, and dropped HTML is rejected. This is a small plain-text block editor; it does not promise rich-text import, Markdown parsing, collaboration, undo history or a full document model. Keep IDs unique and external arrays within the documented bounds.

## ChartRangeNavigator

`data: {label,value}[]`, `value/defaultValue: [startIndex,endIndex]`, `onValueChange(range)`, `label`, `name`, `disabled`, `className/style`.

The main SVG actually redraws only the selected inclusive subset; the overview always shows the full input (first 1000 points). Drag the overview selection to pan the range, or edit the two labelled native range sliders. Selection stays in bounds. The range's endpoint labels and expandable selected-data list provide a nonvisual alternative. Zero and one data point are handled without division by zero; nonfinite values plot as zero. Input data is displayed locally and is not fetched. A hidden named input submits `start,end`; uncontrolled form reset restores defaults.

## CarouselScrubber

`items: {id,title,content: ReactNode}[]`, `value/defaultValue: number`, `onValueChange(index)`, `label`, `disabled`, `className/style`.

Swipe/scroll a real snapping horizontal track, use Previous/Next or drag the native Scrub slides range. Selection and scroll position synchronize, including resize. Inactive slides are inert, preserving the selected slide's normal interactive children. No autoplay or duplicated accessible slides. Empty/single collections disable unavailable controls. Consumer content should size itself to its slide; image assets remain caller supplied. Reduced motion uses immediate programmatic scrolling.

## DialogStack

`open/onOpenChange`, `steps: {id,title,description?,content: ReactNode}[]`, `value/defaultValue: number`, `onValueChange(index)`, `onComplete`, `completeLabel="Finish"`.

One Core native modal renders the active step, with decorative stack layers. Continue and Back navigate; Finish calls `onComplete` and closes. Core Dialog supplies Tab trapping, Escape, labelled title/description and restoration to the trigger. Controlled field state belongs outside the step's content so it persists when moving Back. Focus moves to the active content on step changes. An empty step list still provides a dismissible modal. Opening again retains the current internal index; reset your controlled index when the product flow needs to start over.

## LiveCodeSandbox

`label`, `value/defaultValue: SandboxSource`, `onValueChange(source)`, `autoRun=false`, `disabled`, `className/style`. `SandboxSource` is `{html,css,js}`. HTML/CSS/JS editors have 50000-character limits. Run preview explicitly runs the current code; `autoRun` reruns 600 ms after editing. Reset code restores the provided default source and reruns it. The catalog uses autoRun.

Execution occurs only in `iframe sandbox="allow-scripts"` with an opaque origin: **no `allow-same-origin`, host eval, parent message bridge or server process**. User HTML is encoded before embedding in the document, CSS is assigned via textContent and JS runs as an inline script inside the isolated document. CSP blocks fetch, external scripts/styles, nested frames, media and form submission; only inline styles/scripts and data images are permitted. Browser sandbox prevents access to the parent document. JavaScript exceptions and rejected promises are displayed as text inside the preview. No packages or external source URLs are resolved.

This is a local browser playground, not a hardened multi-tenant compute service. User code can modify its own preview, enter a CPU loop or navigate its own iframe; browser/CSP support varies. There is no execution time limit or host error telemetry. Do not run untrusted shared examples automatically in a product; `autoRun` is an explicit consumer choice. Preview reload/reset stops its prior timers and discards document state. Reduced-motion CSS inside user examples is the user's responsibility; the provided starter includes it.
