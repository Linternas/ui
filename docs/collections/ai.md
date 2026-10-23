# AI workbench collection

These ten UI components display caller-owned data and invoke explicit callbacks. They contain no model client, API credentials, network request, fabricated tool result, or automatic approval. The VoiceInput exception uses the browser's speech service only after an explicit Start action. Import components from the package root and load `system.css` and `styles.css`. All components support `className`, `style`, and an appropriate accessible `label`. IDs in arrays must be unique and stable. Components inherit semantic theme tokens and reduce decorative animation when the user requests reduced motion.

## PromptComposer

`onSubmit(submission, { signal })` is required and can return a promise. `PromptSubmission` contains `text: string` (trimmed), `files: readonly File[]`, and optional `model: string`. These are actual browser Files, not file names or fake upload results. `value`, `defaultValue` (empty), `onValueChange` control the text. Enter submits; Shift+Enter adds a newline; IME composition does not submit. Empty text may submit when files are attached. Inputs lock while awaiting the callback; a fulfilled, non-aborted submission clears text and files. A rejected callback displays its error and preserves the draft.

`onStop?()` handles a consumer-owned stream. Stop also aborts the pending submit signal, unlocks the draft, and prevents a late completion from clearing it. The consumer must honor AbortSignal to stop actual external work. `busy?: boolean` can represent streaming after the submit promise settles; provide `onStop` for that external state. Without an internal request or `onStop`, the external Stop control is disabled. Duplicate submit calls are guarded. Unmount aborts the pending request.

Other props: `label` (default `Message`), `placeholder`, `disabled`, `accept` (native file picker hint), `maxFiles` (default 5; clamped 0–20), `maxFileSize` (default 10 MiB per file), `models?: readonly AiModel[]`, `model`, `onModelChange`. File count and size are checked locally and removable before submit. The native accept filter is a picker hint, not a security boundary; perform actual content validation, authorization and upload on the server. This component does not upload automatically, execute file content, save drafts, or infer an AI response.

## ToolExecutionPanel

Required props: `name: string`, `status: pending | running | success | error`. Optional `input?: unknown`, `output?: unknown`, `error?: string`, `duration?: number` in milliseconds, `open`, `defaultOpen`, `onOpenChange`. The native disclosure contains serialized input/output; strings are shown verbatim as React text and never interpreted as HTML. Cyclic values produce a readable fallback. Keep input/output reasonably sized; this is not a virtualized payload inspector.

`onRetry?({ signal })` is available for error state. It prevents duplicate retries, reports callback failures, and aborts on unmount. The consumer updates `status`, `output` and `error` after real work; returning successfully does not manufacture tool success. Copy output uses the actual Clipboard API and reports failure. `duration` is caller-supplied; the component does not invent timings.

## PlanReview

`steps: readonly PlanStep[]` is required. A step has `id`, `title`, optional `description: ReactNode`, `status: pending | running | complete | error` (default pending), and `disabled`. `title` defaults to `A plan before the work`. Selection uses `selected?: readonly string[]`, `defaultSelected` (all enabled steps), and `onSelectedChange?(ids: string[])`. Removed and disabled IDs are excluded from execution.

With `onRun?(ids, { signal })`, each enabled step has a native checkbox and a Run selected steps button. No selection disables Run. Duplicate runs are prevented, callback errors display inline, and unmount aborts the signal. Without `onRun`, the plan is a read-only ordered review. `disabled` locks selection and execution. Completion is caller data; the component does not automatically mark steps complete or perform AI planning. Empty arrays have a readable empty state.

## ApprovalCard

Required: `title`, `onApprove({ signal, reason })`, `onReject({ signal, reason })`. Both callbacks may return promises. `description?: ReactNode`, `children?: ReactNode` let the consumer present the exact proposed change. `decision?: pending | approved | rejected`, `defaultDecision` (pending), and `onDecisionChange` support caller control. Successful callbacks update the decision; failures keep it pending for retry and show the error. A pending operation disables both decisions and prevents duplicate activation. Unmount aborts its signal.

`requireReason` defaults false. When true, a nonempty reason is required to decline; approval remains possible without it. `disabled` locks pending controls. The note is passed verbatim after trimming. The component is a UI confirmation, not an authorization check: the consumer must verify the current user and change on the server. Never place hidden extra actions behind a summary that describes something narrower. The demo changes a local draft title and can genuinely reject the operation when that draft is locked.

## ContextUsageMeter

Required number props: `inputTokens`, `outputTokens`, `maxTokens`; `cachedTokens` defaults 0. Total used is input + output. Cached input is a subset of input and is not added twice; it is clamped to input. Nonfinite or negative values normalize to zero; invalid/zero max uses a one-token native meter bound. Provide a positive real context budget. The visible percentage may exceed 100% to explain an over-budget state while the native meter value is clamped to its max. Token display rounds to whole numbers.

`open`, `defaultOpen`, `onOpenChange` manage detail expansion. Input, cached input, output and remaining tokens appear in the detail table. A native meter retains an accessible value and the SVG ring is decorative. This is token accounting only: no provider model limits, prices or billable cost are assumed.

## ArtifactPanel

Required: `title`, `content: string`. Optional `filename` (default `artifact.txt`), `language` (display label, default `text`), `editable` (false), `onContentChange`, `preview?: ReactNode`, `onSave?(content, { signal })`, `disabled`. Source content is React text or a controlled textarea, never executable markup. An editable artifact without an update callback is read-only. If `preview` is supplied, Source/Preview buttons switch views; the consumer owns rendering that preview safely. Arbitrary HTML strings are not injected.

Copy uses Clipboard API and reports errors. Download creates a text/plain UTF-8 Blob, sanitizes path separators/control characters from the filename, clicks a temporary anchor, and revokes the object URL. Save invokes the consumer callback, locks source editing while pending and reports errors. The consumer supplies persistence and success feedback. `disabled` locks save/copy/download/edit actions; view switching remains available. Unmount aborts pending save and cleans object URLs and timers. This is not a code sandbox or a rich markdown renderer.

## Checkpoint

Required: `title`, `onRestore({ signal })`. Optional `description`, ISO `createdAt` (rendered verbatim in a time element to avoid locale/hydration changes), `preview`, `current` (false), `disabled`. An optional native disclosure shows the snapshot preview. Restore opens an inline confirmation, which can be cancelled before any callback runs. Confirm guards against duplicate calls and reports asynchronous failure; it closes after a successful callback. The consumer restores its actual data and sets `current`. Setting current closes confirmation. The component does not create snapshots or store history on its own. The demo captures up to five actual local title snapshots and restores them.

## ModelSelector

`models: readonly AiModel[]` is required. Each model has `id`, `name`, `provider`, optional `description`, `disabled`. `value`, `defaultValue`, `onValueChange` manage selection; no model is selected by default unless supplied. `placeholder` defaults to `Choose a model`; `label` defaults to `Model`; `disabled` locks the trigger.

The native Dialog owns focus containment, Escape and focus restoration. A search combobox matches name, provider and description. Arrow keys/Home/End navigate enabled options; Enter selects. Options can also be clicked. Disabled models remain visible but cannot be selected. Search focus stays in the combobox and active-descendant navigation scrolls the active option into view. Empty results are announced. Use actual model inventory from the consumer; the catalog's illustrative model names imply no service availability or capability claims.

## VoiceInput

`value`, `defaultValue`, `onValueChange` manage the editable transcript. `onTranscript?(text)` receives newly finalized recognized text, while interim text stays separate. `lang` defaults to `en-US`; `label` defaults to `Transcript`; `disabled` locks input and aborts active recognition. `serviceNotice` can localize the visible default notice that the browser's speech service may process audio online. Keep an equivalent notice when localizing it.

The implementation feature-detects `SpeechRecognition` and `webkitSpeechRecognition`. It creates and starts an instance only from the explicit Start speaking button. HTTPS/localhost is required. A session is non-continuous, supports interim results and ends when the browser finishes. Stop requests the final result; a second Cancel action can abort a delayed completion. Starting sessions can be aborted immediately. Permission denial, missing speech, other errors and unsupported browsers leave a typed transcript fallback. Errors detach and abort even if the browser omits its end event, so an explicit retry can create a new session. Disabling, hiding the document, or unmounting detaches callbacks and aborts the active recognition; returning to the visible page requires a fresh Start click. There is no automatic restart, background capture, getUserMedia call, audio upload client or audio file storage in this component.

Speech recognition support and its online service vary by browser. Chrome can send audio to its speech service; support is not an offline guarantee. [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [error events](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/error_event). Automated coverage replaces the speech constructor with a mock; it never requests a real microphone.

## StreamingTerminal

`lines: readonly TerminalLine[]` is required. A line has `id`, `text`, optional `level: info | success | warning | error`, and display `timestamp`. `title` defaults to `Activity`. Logs are appended externally; the component has no shell process, command executor, socket or polling loop. A log entry can change text while retaining its ID. `maxLines` defaults to 500 and is clamped 1–5000; the render window uses the newest entries, while the consumer remains responsible for bounding its source array. `emptyMessage` defaults to `Waiting for output…`.

`follow`, `defaultFollow` (true), `onFollowChange` control automatic bottom scrolling. Pause follow continues to receive/render logs without moving the viewport. Upward wheel, touch movement and Up/PageUp/Home pause following; Follow output resumes. Search filters displayed text without mutating data. Copy logs copies the visible filtered text. Optional `onClear` exposes a clear action, leaving actual deletion to the caller. The native focusable log is not a noisy aria-live stream; status text describes follow/copy results.

`cleanTerminalText(text)` is also exported. It removes OSC/CSI terminal escape sequences and control characters, preserving normal text/newlines/tabs. All output uses React text nodes, so HTML is shown literally. It intentionally does not emulate terminal backspace/cursor controls, render ANSI colors, generate hyperlinks, or interpret scripts. Treat this as a readable log viewer rather than a terminal emulator.
