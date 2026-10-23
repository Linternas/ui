# Creative and workflow interactions

Import the components and types from `@mingu/interaction-ui`. Load `system.css` and `styles.css` under your `DesignSystemProvider`. The catalog and consuming applications use the same implementations.

All eight entries were added on 2026-10-23 UTC. Their New badges expire after 30 days; the components and Docs remain available. They perform no network requests and persist nothing outside the caller's state.

Common presentation props: `label`, `disabled`, `className`, `style`. All editable numeric ranges and drawing surfaces have keyboard or button alternatives. Touch drawing/scratching/dialing is opt-in; the initial surface preserves vertical page scrolling. Reduced motion removes transitions.

## MultiSelect

`options: {value,label,description?,disabled?}[]`, `value/defaultValue: readonly string[]`, `onValueChange(string[])`, `name?`, `maxSelected=12` (1–100).

The trigger opens the existing Core Popover with a search input and native checkboxes. Escape closes the panel and restores the trigger, including when the search is nonempty. Outside dismissal uses native popover behavior. Selected chips remove choices. At the limit, unselected choices are disabled; already-selected and permanently disabled choices remain distinct. The same option values must be unique and external selected values should refer to options. A named hidden input is submitted for each selected value. `disabled` excludes all of them from submission. Uncontrolled native form reset restores `defaultValue` and clears the search.

## TransferList

`options`, `value/defaultValue: readonly string[]`, `onValueChange(string[])`, `name?`.

`value` contains the assigned option IDs. Search filters both lists. Check native checkboxes, then use Assign or Remove to move the visible checked choices; moved checkmarks clear. A disabled option cannot be marked or moved. Values hidden by search are preserved. The caller must provide unique option values. Named inputs submit assigned values; uncontrolled native reset restores the initial assignment and clears query/checkmarks. The two lists keep a bounded scroll area.

## Rating

`value/defaultValue=0`, `onValueChange(number)`, `max=5` (1–10), `name?`, `required?`.

Native radios provide focus, arrow-key selection, required validation and form submission. Zero means unrated and submits no radio value. Hover previews stars without changing the committed rating; Clear returns to zero. `disabled` disables the fieldset. Uncontrolled native reset restores the default. Values are rounded and bounded for display.

## UndoHistory

`entries: {id,label,description?}[]`, `value: string`, `onValueChange(id)`.

Controlled version selection, Undo and Redo emit an entry ID. The caller owns snapshots and applies the matching document state. Undo is disabled at the first entry and Redo at the last; empty or unknown selection disables both. Entry buttons remain available for direct selection. An empty array shows an empty state. Persisting, pruning or branching history is the caller's responsibility. The live demo restores actual text and drops later entries when making a change after undo.

## GradientEditor

`value/defaultValue: {angle:number,stops:{id,color,position}[]}`, `onValueChange(GradientValue)`.

Pass 2–6 stops with unique IDs, six-digit HEX colors and 0–100 positions. The default has three stops. Select/drag a stop along the track, or edit its native Position range, color input and Angle range. Add inserts a stop at 50%; Remove preserves at least two stops. Stop IDs remain stable when positions cross; CSS output sorts by position. `gradientCss(value)` is a pure helper that clamps CSS positions/angle, normalizes invalid colors to `#777777`, and supplies a neutral fallback for an empty gradient. Copy CSS uses the shared CopyButton and reports the actual clipboard result. External controlled state remains the caller's responsibility.

The compact gallery shows the gradient, draggable handles and actions. Expand the preview or open Docs to use all fields. Consumers receive the full editor.

## PixelEditor

`columns=12`, `rows=8` (each 2–24), `value/defaultValue: readonly string[]`, `onValueChange(string[])`, `defaultColor="#a599f1"`.

Colors are row-major; missing values or `transparent` mean an empty pixel. Six-digit HEX colors are supported. Click/tap a cell or draw a pointer stroke; Eraser paints transparency, and Clear emits an empty array. The drawing grid uses one tab stop and arrow/Home/End navigation; Enter/Space paints the focused cell. Touch taps paint individual cells, and Draw with touch enables captured strokes. Pointer up, cancellation and lost capture end the stroke. Copy SVG produces the current grid as plain SVG with validated HEX fills. Drawing has at most 576 cells and no external image/font dependency. When controlled, the caller must commit emitted arrays.

## ScratchCard

`children`, `revealThreshold=.55` (0.1–1), `onRevealChange(boolean)`.

An SVG mask makes real pointer holes over the child content. Coverage is estimated on a 16×10 grid; reaching the threshold reveals the card. Up to 800 mask points are retained. Reveal card provides an equivalent keyboard action and Cover again resets coverage and the mask. Children are inert and hidden from accessibility APIs while covered. A scratch card is a presentation effect: content is already in the document and must not contain secrets. A disabled card ignores scratching and disables actions. The cover uses theme tokens; the caller supplies the revealed content.

## CircularDial

`value/defaultValue=40`, `onValueChange(number)`, `min=0`, `max=100`, `step=1`, `unit="%"`, `name?`.

Drag around the 270-degree arc or use Arrow keys, PageUp/PageDown (ten steps), Home and End. The gap snaps to the nearest endpoint. Plus/minus buttons are equivalents. `role="slider"` exposes the current value/range and disabled state; only the focused dial handles its keys. Touch turning is opt-in. Pointer cancellation and lost capture stop updates. Named inputs submit the current bounded value; disabled inputs are omitted, and an uncontrolled form reset restores the default. Provide finite bounds with `max > min` and positive steps; malformed numbers are bounded for display. No audio or device setting is modified.
