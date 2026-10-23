# Media and workspace collection

These components are exported from `@mingu/interaction-ui`. Import `system.css` and `styles.css`, and provide the existing `DesignSystemProvider`. All ten use the same implementations in the catalog and consumers. They support `label`, `className`, and `style` for the root surface.

## SplitFlapDisplay

`text: string`, `maxLength=24` (1–80 code points), `replayKey?: string | number`. Changing a character or the replay key runs one short mechanical flip. Spaces occupy cells. Text wraps on narrow screens. The accessible text is exposed once, rather than one announcement per letter. Reduced motion displays the final text immediately. This is a display; its catalog editor is a normal `TextField`.

## VariableFontProximity

`text: string`, `minWeight=350` (100–900), `maxWeight=850` (minimum weight–1000), `radius=180` (30–500 px). Pointer distance changes letter weight. The chosen consumer font supplies the actual available weights; the package does not download a variable font. Up to 240 visual characters are rendered, and the full accessible text is preserved. The focusable surface offers Left/Right, Home/End and Escape. Touch highlights the tapped location without capturing page scrolling. Leaving or blurring resets the type. Reduced motion keeps its minimum weight. Pending animation frames are cancelled on unmount.

## VerticalReel

`items: readonly ReelItem[]`, `index/defaultIndex=0`, `onIndexChange(index)`. A `ReelItem` is `{id,title,src,alt,kind?:'image'|'video',poster?,caption?}`. Index is clamped to the item count. Native vertical scroll snap and Previous/Next controls share selection. Up/Down/Home/End work when the scroll area is focused; media controls inside keep their own keys. `--mingu-reel-height` sets the viewport height. Programmatic navigation settles before observing the next scroll selection. Video items use `VideoPlayer` and pause when inactive. No media autoplays. Empty items show an empty state, and failed images preserve their accessible description.

## StoryViewer

`items: readonly StoryItem[]`, `index/defaultIndex=0`, `onIndexChange(index)`, `duration=5000` (2000–30000 ms), `loop=false`. `StoryItem` is `{id,title,src,alt,caption?,duration?}`. All items are images. Previous/Next and labeled progress segments offer manual navigation. Automatic advance requires Play stories, pauses on image hover, background tabs and offscreen surfaces, and stops at the end unless loop is enabled. Reduced motion disables automatic advance while preserving navigation. Timer cleanup runs on state change and unmount.

## VideoPlayer

`src?: string`, `poster?: string`, `tracks?: readonly VideoTrack[]`, `active=true`, `ref?: Ref<HTMLVideoElement>`, `onTimeChange(seconds)`, `onPlaybackError(message)`. Tracks are `{src,label,srcLang,default?}` caption tracks. Real native video controls are preserved alongside named Play/Pause, Mute, seek, volume and playback speed controls. Native media events are authoritative; no fake duration, progress or success is shown. Promise rejection and media errors are visible. A missing source disables playback. Playback pauses on source change, inactive reel selection, offscreen surfaces, hidden documents and unmount; it never resumes automatically. Sources must use a browser-supported codec. Consumers host media and captions. The catalog uses a local file input and performs no upload.

## ImageCropper

`src: string`, `alt: string`, `aspect=1` (0.2–5), `crop/defaultCrop?: CropRect`, `onCropChange(crop)`, `onCropComplete(blob,crop): void | Promise<void>`. `CropRect` is `{x,y,width,height}` in percentages of the original pixels. Width, x and y are clamped; height is derived from the requested physical aspect ratio, so caller-provided height does not override aspect. The image is not stretched. Drag the crop to move it or the corner to resize; all positions also have native sliders, and the corner supports arrows/Shift+arrows. Export draws the selected original pixels to an actual PNG with both dimensions capped at 2048. CORS-tainted remote images produce a visible export error. A successful export shows a real download and preview. Results are revoked when replaced, edited or unmounted; source/aspect changes invalidate in-flight exports. Consumer callbacks should persist the Blob themselves if needed; there is no server upload. The catalog file input accepts images up to 10 MB and cleans its own Object URLs.

## CalendarBoard

`events/defaultEvents: CalendarEvent[]`, `onEventsChange(events)`, `month/defaultMonth`, `onMonthChange(month)`, `date/defaultDate`, `onDateChange(date)`. Event shape: `{id,title,date}`. Months use `YYYY-MM`; dates use `YYYY-MM-DD`, validated and calculated in UTC with no local timezone shifts. Supported years: 1900–2100. Defaults use the current UTC day; pass explicit defaults for deterministic server output and examples. Month navigation, roving day arrows/Home/End, selected-day event titles, date edits, removal and adding an event all edit the same array. Desktop drag/drop moves an event onto a day; its native date input provides the keyboard/touch alternative. Empty days are explicit. Controlled users must apply the callbacks. IDs must be unique.

## GanttTimeline

`tasks/defaultTasks: GanttTask[]`, `onTasksChange(tasks)`, `rangeStart: string`, `rangeDays=21` (2–62). Task shape: `{id,title,start,end}`; end dates are inclusive. Dates use the same validated UTC format. An invalid range start shows an error. Ranges stop at 2100-12-31. Visible tasks are normalized to the range and at least one day long. Moving a bar preserves its duration and clamps it to both ends. The end handle changes duration. Each handle supports Left/Right, or Shift for a week; editable native date inputs and titles are also available. The timeline scrolls internally on narrow screens. Empty arrays show an empty state. Callbacks carry a new array and perform no persistence.

## KanbanBoard

`columns: readonly KanbanColumn[]`, `cards/defaultCards: KanbanCard[]`, `onCardsChange(cards)`. Column shape: `{id,title}`; card shape: `{id,title,column}`. Array order is the order within each column. Native desktop drag/drop, handle Left/Right (column), Up/Down/Home/End (order), and a labeled destination select all update the same data. Titles are editable; Add and Remove are real state changes. Unknown column IDs display in the first existing column until moved. No columns disables adding and shows an empty state. IDs must be unique. Card storage and synchronization belong to consumers.

## FileTree

`nodes: readonly FileTreeNode[]`, `expandedIds/defaultExpandedIds`, `onExpandedChange(ids)`, `selectedId/defaultSelectedId`, `onSelect(id,node)`. Node shape: `{id,name,children?: readonly FileTreeNode[],disabled?}`. Providing `children`, including an empty array, makes a folder. A flat visible tree exposes levels, positions, selection, expansion and one roving tab stop. Up/Down/Home/End navigate; Right expands or enters; Left closes or goes to the parent; Enter/Space selects and toggles folders. Type-ahead matches visible names. Disabled rows are skipped. Duplicate IDs/cycles, depth beyond 20 and over 1000 visible rows are guarded. File opening and content fetching are the caller's responsibility; selecting a row does not claim to have opened a real filesystem file.
