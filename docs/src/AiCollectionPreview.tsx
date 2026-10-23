import { useRef, useState } from "react";
import { Button, Checkbox, TextField } from "../../src/system/base";
import { Slider } from "../../src/system/forms";
import {
  PromptComposer,
  ToolExecutionPanel,
  PlanReview,
  ApprovalCard,
  ContextUsageMeter,
  ArtifactPanel,
  Checkpoint,
  ModelSelector,
  VoiceInput,
  StreamingTerminal,
  type AiModel,
  type TerminalLine,
  type PlanStep,
} from "../../src/collections/ai";
const models: AiModel[] = [
  {
    id: "swift",
    name: "Swift",
    provider: "Mingu",
    description: "An illustrative everyday model",
  },
  {
    id: "studio",
    name: "Studio",
    provider: "Mingu",
    description: "An illustrative creative model",
  },
  {
    id: "deep",
    name: "Deep",
    provider: "Workshop",
    description: "An illustrative reasoning model",
  },
  {
    id: "offline",
    name: "Offline",
    provider: "Workshop",
    description: "Unavailable in this demo",
    disabled: true,
  },
];
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const done = () => {
        signal.removeEventListener("abort", cancel);
        resolve();
      },
      timer = setTimeout(done, ms);
    function cancel() {
      clearTimeout(timer);
      reject(new DOMException("Stopped", "AbortError"));
    }
    if (signal.aborted) cancel();
    else signal.addEventListener("abort", cancel, { once: true });
  });
}
function ComposerDemo() {
  const [drafts, setDrafts] = useState<{ text: string; files: string[] }[]>([]),
    [fail, setFail] = useState(false),
    [stopped, setStopped] = useState(false);
  return (
    <div className="mingu-collection-ai-demo">
      <span className="mingu-collection-ai-eyebrow">
        A PLACE FOR THE NEXT IDEA
      </span>
      <PromptComposer
        models={models}
        onStop={() => setStopped(true)}
        onSubmit={async (submission, { signal }) => {
          setStopped(false);
          await wait(650, signal);
          if (fail)
            throw new Error(
              "The local draft queue is locked. Unlock it and try again.",
            );
          if (!signal.aborted)
            setDrafts((prev) => [
              ...prev,
              {
                text: submission.text,
                files: submission.files.map((f) => f.name),
              },
            ]);
        }}
      />
      <Checkbox
        checked={fail}
        onChange={(e) => setFail(e.currentTarget.checked)}
      >
        Lock the local draft queue
      </Checkbox>
      <p className="mingu-collection-ai-hint">
        Submissions are added to this page’s local draft queue. No AI request is
        made.
      </p>
      {stopped && <p role="status">Draft queue stopped.</p>}
      <div
        className="mingu-collection-ai-demo-drafts"
        aria-label="Local draft queue"
      >
        {drafts.map((d, i) => (
          <article key={i}>
            <span className="mingu-collection-ai-eyebrow">DRAFT {i + 1}</span>
            <p>{d.text || "Attachment only"}</p>
            {d.files.map((name, index) => (
              <small key={index}>{name}</small>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
function ToolDemo() {
  const [input, setInput] = useState('{"project":"Field notes","pieces":3}'),
    [status, setStatus] = useState<"pending" | "success" | "error">("pending"),
    [output, setOutput] = useState<unknown>(undefined),
    [error, setError] = useState(""),
    [duration, setDuration] = useState<number | undefined>();
  function parse() {
    const start = performance.now();
    try {
      const result = JSON.parse(input);
      setOutput(result);
      setError("");
      setStatus("success");
    } catch (e) {
      setOutput(undefined);
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setStatus("error");
      throw e;
    } finally {
      setDuration(performance.now() - start);
    }
  }
  return (
    <div className="mingu-collection-ai-demo">
      <TextField
        label="JSON input"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
      />
      <Button
        variant="outline"
        onClick={() => {
          try {
            parse();
          } catch {}
        }}
      >
        Run local parser
      </Button>
      <ToolExecutionPanel
        name="parse_json"
        status={status}
        input={input}
        output={output}
        error={error}
        duration={duration}
        defaultOpen
        onRetry={() => parse()}
      />
      <p className="mingu-collection-ai-hint">
        This tool runs JSON.parse locally. Try invalid JSON to see the real
        error and retry.
      </p>
    </div>
  );
}
function PlanDemo() {
  const [steps, setSteps] = useState<PlanStep[]>([
      {
        id: "outline",
        title: "Create an outline",
        description: "Save three section names in a local outline.",
      },
      {
        id: "colors",
        title: "Choose the foundation",
        description: "Record the neutral theme in a local manifest.",
      },
      {
        id: "review",
        title: "Review the details",
        description: "Add a review reminder to the manifest.",
      },
    ]),
    [manifest, setManifest] = useState<string[]>([]);
  return (
    <div className="mingu-collection-ai-demo">
      <PlanReview
        steps={steps}
        onRun={async (ids, { signal }) => {
          for (const id of ids) {
            await wait(180, signal);
            if (signal.aborted) return;
            const line =
              id === "outline"
                ? "Sections: Introduction, Process, Result"
                : id === "colors"
                  ? "Theme: Neutral"
                  : "Reminder: Review keyboard and mobile states";
            setManifest((prev) => [...prev.filter((v) => v !== line), line]);
            setSteps((prev) =>
              prev.map((step) =>
                step.id === id ? { ...step, status: "complete" } : step,
              ),
            );
          }
        }}
      />
      {manifest.length > 0 && (
        <pre
          className="mingu-collection-ai-demo-output"
          aria-label="Local manifest"
        >
          {manifest.join("\n")}
        </pre>
      )}
      <p className="mingu-collection-ai-hint">
        Selected steps update the local manifest below. No agent or external
        service runs.
      </p>
    </div>
  );
}
function ApprovalDemo() {
  const [title, setTitle] = useState("A small idea"),
    [decision, setDecision] = useState<"pending" | "approved" | "rejected">(
      "pending",
    ),
    [locked, setLocked] = useState(false);
  return (
    <div className="mingu-collection-ai-demo">
      <p className="mingu-collection-ai-hint">
        Working title: <strong data-testid="approved-title">{title}</strong>
      </p>
      <ApprovalCard
        title="Replace the working title?"
        description="Review the exact change before it is applied to this local draft."
        decision={decision}
        onDecisionChange={setDecision}
        onApprove={() => {
          if (locked)
            throw new Error(
              "This local draft is locked. Unlock it before approving.",
            );
          setTitle("Room to think");
        }}
        onReject={() => {}}
      >
        <del>A small idea</del>
        <ins>Room to think</ins>
      </ApprovalCard>
      <Checkbox
        checked={locked}
        onChange={(e) => setLocked(e.currentTarget.checked)}
      >
        Lock this local draft
      </Checkbox>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setTitle("A small idea");
          setDecision("pending");
        }}
      >
        Reset decision
      </Button>
    </div>
  );
}
function ContextDemo() {
  const [input, setInput] = useState(12400),
    [output, setOutput] = useState(3200);
  return (
    <div className="mingu-collection-ai-demo">
      <ContextUsageMeter
        inputTokens={input}
        outputTokens={output}
        cachedTokens={Math.min(4800, input)}
        maxTokens={64000}
      />
      <Slider
        label="Input tokens"
        min={0}
        max={60000}
        step={100}
        value={input}
        onValueChange={setInput}
      />
      <Slider
        label="Output tokens"
        min={0}
        max={16000}
        step={100}
        value={output}
        onValueChange={setOutput}
      />
      <p className="mingu-collection-ai-hint">
        An illustrative 64,000-token budget. Cached input is part of the input
        total.
      </p>
    </div>
  );
}
function ArtifactDemo() {
  const [content, setContent] = useState(
      "# Field notes\n\nKeep the useful things.\nLeave room for the next idea.\n\n- A small beginning\n- A little more space\n- A reason to move",
    ),
    [saved, setSaved] = useState("");
  return (
    <div className="mingu-collection-ai-demo">
      <ArtifactPanel
        title="Field notes"
        filename="field-notes.md"
        language="markdown"
        content={content}
        onContentChange={setContent}
        editable
        preview={
          <div className="mingu-collection-ai-demo-document">
            {content
              .split("\n")
              .map((line, i) =>
                line.startsWith("# ") ? (
                  <h3 key={i}>{line.slice(2)}</h3>
                ) : (
                  <p key={i}>{line || "\u00a0"}</p>
                ),
              )}
          </div>
        }
        onSave={(text) => {
          setSaved(text);
        }}
      />
      <p className="mingu-collection-ai-hint" role="status">
        {saved
          ? `Local copy saved · ${saved.length} characters`
          : "Edit the source, see the preview, or download the plain text file."}
      </p>
    </div>
  );
}
function CheckpointDemo() {
  const counter = useRef(3),
    [snapshots, setSnapshots] = useState([
      { id: "one", title: "A small idea" },
      { id: "two", title: "Room to think" },
    ]),
    [title, setTitle] = useState("Room to think"),
    [current, setCurrent] = useState<string | null>("two");
  return (
    <div className="mingu-collection-ai-demo">
      <TextField
        label="Working title"
        value={title}
        onChange={(e) => {
          setTitle(e.currentTarget.value);
          setCurrent(null);
        }}
      />
      <Button
        variant="outline"
        disabled={!title.trim()}
        onClick={() => {
          const id = String(counter.current++);
          setSnapshots((prev) => [...prev, { id, title }].slice(-5));
          setCurrent(id);
        }}
      >
        Save checkpoint
      </Button>
      <p className="mingu-collection-ai-hint">
        Up to five local snapshots. Restoring changes the working title above.
      </p>
      <div>
        {snapshots.map((snapshot, i) => (
          <Checkpoint
            key={snapshot.id}
            title={`Checkpoint ${i + 1}`}
            description={snapshot.title}
            preview={<p>{snapshot.title}</p>}
            current={current === snapshot.id}
            onRestore={() => {
              setTitle(snapshot.title);
              setCurrent(snapshot.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
function ModelDemo() {
  const [model, setModel] = useState("studio");
  return (
    <div className="mingu-collection-ai-demo-centered">
      <span className="mingu-collection-ai-eyebrow">
        THE RIGHT TOOL FOR THE NEXT IDEA
      </span>
      <ModelSelector models={models} value={model} onValueChange={setModel} />
      <p className="mingu-collection-ai-hint" data-testid="selected-model">
        Selected model: {models.find((m) => m.id === model)?.name}
      </p>
      <p className="mingu-collection-ai-hint">
        These are illustrative names, supplied as ordinary component data.
      </p>
    </div>
  );
}
function TerminalDemo() {
  const counter = useRef(3),
    [lines, setLines] = useState<TerminalLine[]>([
      {
        id: "1",
        text: "Local workspace opened.",
        level: "info",
        timestamp: "10:24:01",
      },
      {
        id: "2",
        text: "Ready for your next command.",
        level: "success",
        timestamp: "10:24:02",
      },
    ]),
    [entry, setEntry] = useState("A new line from the local workspace.");
  function append() {
    const id = String(counter.current++);
    setLines((prev) => [
      ...prev,
      {
        id,
        text: entry,
        level: "info",
        timestamp: new Date().toLocaleTimeString("en-GB"),
      },
    ]);
  }
  return (
    <div className="mingu-collection-ai-demo">
      <StreamingTerminal
        lines={lines}
        title="Local workspace"
        onClear={() => setLines([])}
      />
      <div className="mingu-collection-ai-demo-terminal-controls">
        <TextField
          label="Next log line"
          value={entry}
          onChange={(e) => setEntry(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") append();
          }}
        />
        <Button variant="outline" disabled={!entry} onClick={append}>
          Append line
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            setLines((prev) => [
              ...prev,
              ...Array.from({ length: 25 }, (_, i) => ({
                id: String(counter.current++),
                text: `Local item ${i + 1} inspected.`,
                level: "info" as const,
              })),
            ])
          }
        >
          Append 25 lines
        </Button>
      </div>
      <p className="mingu-collection-ai-hint">
        Logs come from the controls above. Search, pause following, copy, or
        clear them.
      </p>
    </div>
  );
}
function VoiceDemo() {
  const [visible, setVisible] = useState(true),
    [disabled, setDisabled] = useState(false);
  return (
    <div className="mingu-collection-ai-demo">
      {visible ? (
        <VoiceInput disabled={disabled} />
      ) : (
        <p className="mingu-collection-ai-hint">Voice input is hidden.</p>
      )}
      <div className="mingu-collection-ai-nav-actions">
        <Checkbox
          checked={disabled}
          onChange={(e) => setDisabled(e.currentTarget.checked)}
        >
          Disable voice input
        </Checkbox>
        <Button variant="ghost" size="sm" onClick={() => setVisible(!visible)}>
          {visible ? "Hide voice input" : "Show voice input"}
        </Button>
      </div>
    </div>
  );
}
export default function AiCollectionPreview({
  id,
}: {
  id: string;
  compact?: boolean;
}) {
  switch (id) {
    case "prompt-composer":
      return <ComposerDemo />;
    case "tool-execution-panel":
      return <ToolDemo />;
    case "plan-review":
      return <PlanDemo />;
    case "approval-card":
      return <ApprovalDemo />;
    case "context-usage-meter":
      return <ContextDemo />;
    case "artifact-panel":
      return <ArtifactDemo />;
    case "checkpoint":
      return <CheckpointDemo />;
    case "model-selector":
      return <ModelDemo />;
    case "voice-input":
      return <VoiceDemo />;
    case "streaming-terminal":
      return <TerminalDemo />;
    default:
      return null;
  }
}
