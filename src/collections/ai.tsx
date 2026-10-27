"use client";
import { Icon as VectorIcon } from "../icons";

import { ChevronDown } from "../system/icons";
import * as React from "react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button, Checkbox, Dialog, Textarea, TextField } from "../system/base";

type Shell = { className?: string; style?: CSSProperties; label?: string };
type AsyncAction = (context: { signal: AbortSignal }) => void | Promise<void>;
function cn(name: string, extra?: string) {
  return `mingu-collection-ai-${name}${extra ? ` ${extra}` : ""}`;
}
function useValue<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [local, setLocal] = useState(initial),
    live = useRef({ value, onChange });
  live.current = { value, onChange };
  return [
    value === undefined ? local : value,
    useCallback((next: T) => {
      if (live.current.value === undefined) setLocal(next);
      live.current.onChange?.(next);
    }, []),
  ];
}
function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The action could not be completed. Try again.";
}
function printable(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2) ?? "";
  } catch {
    return "This value cannot be displayed as JSON.";
  }
}
function useAction() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    controller = useRef<AbortController | null>(null),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  const run = useCallback(async (action: AsyncAction, success?: () => void) => {
    if (controller.current) return;
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError("");
    try {
      await action({ signal: current.signal });
      if (!current.signal.aborted && mounted.current) success?.();
    } catch (e) {
      if (!current.signal.aborted && mounted.current) setError(message(e));
    } finally {
      if (controller.current === current) {
        controller.current = null;
        if (mounted.current) setBusy(false);
      }
    }
  }, []);
  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setBusy(false);
  }, []);
  return { busy, error, setError, run, cancel };
}
function useCopy() {
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  return {
    status,
    copy: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        if (!mounted.current) return;
        setStatus("Copied to clipboard.");
      } catch {
        if (!mounted.current) return;
        setStatus("Copy failed. Select and copy the text manually.");
      }
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus(""), 2500);
    },
  };
}

export interface PromptSubmission {
  text: string;
  files: readonly File[];
  model?: string;
}
export interface PromptComposerProps extends Shell {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit: (
    submission: PromptSubmission,
    context: { signal: AbortSignal },
  ) => void | Promise<void>;
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  busy?: boolean;
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  models?: readonly AiModel[];
  model?: string;
  onModelChange?: (model: string) => void;
}
export function PromptComposer({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  placeholder = "What would you like to make?",
  disabled = false,
  busy: externalBusy = false,
  accept,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024,
  models,
  model,
  onModelChange,
  label = "Message",
  className,
  style,
}: PromptComposerProps) {
  const [text, setText] = useValue(value, defaultValue, onValueChange),
    [files, setFiles] = useState<File[]>([]),
    [selectedModel, setModel] = useValue(
      model,
      models?.find((m) => !m.disabled)?.id ?? "",
      onModelChange,
    ),
    fileInput = useRef<HTMLInputElement>(null),
    id = useId(),
    action = useAction(),
    busy = externalBusy || action.busy,
    locked = disabled || busy;
  function addFiles(list: FileList | null) {
    if (!list) return;
    action.setError("");
    const count = Math.max(
        0,
        Math.min(20, Number.isFinite(maxFiles) ? Math.floor(maxFiles) : 5),
      ),
      limit = Math.max(0, maxFileSize),
      next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= count) {
        action.setError(`Attach up to ${count} files.`);
        break;
      }
      if (file.size > limit) {
        action.setError(
          `${file.name} exceeds the ${Math.round(limit / 1024 / 1024)} MB size limit.`,
        );
        continue;
      }
      if (
        !next.some(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified,
        )
      )
        next.push(file);
    }
    setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  }
  function submit() {
    if (locked || (!text.trim() && !files.length)) return;
    const submission = {
      text: text.trim(),
      files: [...files],
      model: selectedModel || undefined,
    };
    void action.run(
      (ctx) => onSubmit(submission, ctx),
      () => {
        setText("");
        setFiles([]);
      },
    );
  }
  return (
    <form
      className={cn("composer", className)}
      style={style}
      aria-label="Prompt composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor={id} className="mingu-collection-ai-eyebrow">
        {label}
      </label>
      <Textarea
        id={id}
        value={text}
        disabled={locked}
        placeholder={placeholder}
        rows={3}
        onChange={(e) => setText(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
      />
      {files.length > 0 && (
        <ul className="mingu-collection-ai-files">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.lastModified}-${i}`}>
              <span>
                {f.name}
                <small>{Math.max(1, Math.round(f.size / 1024))} KB</small>
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={locked}
                aria-label={`Remove ${f.name}`}
                onClick={() =>
                  setFiles(files.filter((_, index) => index !== i))
                }
              >
                <VectorIcon name="close" size="1em" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mingu-collection-ai-toolbar">
        <div>
          <Button
            variant="ghost"
            size="sm"
            disabled={
              locked ||
              files.length >=
                Math.max(
                  0,
                  Math.min(
                    20,
                    Number.isFinite(maxFiles) ? Math.floor(maxFiles) : 5,
                  ),
                )
            }
            onClick={() => fileInput.current?.click()}
          >
            <VectorIcon name="plus" size="1em" /> Attach files
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={accept}
            disabled={locked}
            tabIndex={-1}
            aria-label="Attach files"
            className="mingu-collection-ai-sr"
            onChange={(e) => addFiles(e.currentTarget.files)}
          />
          {models && (
            <ModelSelector
              models={models}
              value={selectedModel}
              onValueChange={setModel}
              disabled={locked}
            />
          )}
        </div>
        {busy ? (
          <Button
            variant="outline"
            disabled={!action.busy && !onStop}
            onClick={(event) => {
              // React can reuse this DOM button as the submit button when busy clears.
              // Cancel the current native activation before switching its type.
              event.preventDefault();
              action.cancel();
              try {
                onStop?.();
              } catch (error) {
                action.setError(message(error));
              }
            }}
          >
            Stop response
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={disabled || (!text.trim() && !files.length)}
          >
            Send message <VectorIcon name="external" size="1em" />
          </Button>
        )}
      </div>
      <p className="mingu-collection-ai-hint">
        Enter to send · Shift + Enter for a new line
      </p>
      {action.error && (
        <p role="alert" className="mingu-collection-ai-error">
          {action.error}
        </p>
      )}
    </form>
  );
}

export interface ToolExecutionPanelProps extends Shell {
  name: string;
  status: "pending" | "running" | "success" | "error";
  input?: unknown;
  output?: unknown;
  error?: string;
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRetry?: AsyncAction;
}
export function ToolExecutionPanel({
  name,
  status,
  input,
  output,
  error,
  duration,
  open,
  defaultOpen = false,
  onOpenChange,
  onRetry,
  className,
  style,
  label = "Tool execution",
}: ToolExecutionPanelProps) {
  const [expanded, setExpanded] = useValue(open, defaultOpen, onOpenChange),
    copy = useCopy(),
    retry = useAction();
  return (
    <section
      className={cn("tool", className)}
      data-status={status}
      style={style}
      aria-label={label}
    >
      <details
        open={expanded}
        onToggle={(e) => {
          if (e.currentTarget.open !== expanded)
            setExpanded(e.currentTarget.open);
        }}
      >
        <summary>
          <span className="mingu-collection-ai-tool-glyph" aria-hidden="true">
            {status === "success" ? (
              <VectorIcon name="check" size={18} />
            ) : status === "error" ? (
              <VectorIcon name="alert" size={18} />
            ) : status === "running" ? (
              <VectorIcon name="loader" size={18} />
            ) : (
              <VectorIcon name="command" size={18} />
            )}
          </span>
          <strong>{name}</strong>
          <span className="mingu-collection-ai-pill">{status}</span>
          {duration !== undefined && (
            <small>{Math.max(0, duration).toFixed(0)} ms</small>
          )}
          <span
            className="mingu-collection-ai-tool-disclosure"
            aria-hidden="true"
          >
            <VectorIcon name={expanded ? "minus" : "plus"} size={18} />
          </span>
        </summary>
        <div className="mingu-collection-ai-tool-body">
          {input !== undefined && (
            <div>
              <span className="mingu-collection-ai-eyebrow">INPUT</span>
              <pre>{printable(input)}</pre>
            </div>
          )}
          {output !== undefined && (
            <div>
              <div className="mingu-collection-ai-toolbar">
                <span className="mingu-collection-ai-eyebrow">OUTPUT</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void copy.copy(printable(output))}
                >
                  Copy output
                </Button>
              </div>
              <pre>{printable(output)}</pre>
            </div>
          )}
          {error && <p className="mingu-collection-ai-error">{error}</p>}
          {status === "error" && onRetry && (
            <Button
              size="sm"
              loading={retry.busy}
              onClick={() => void retry.run(onRetry)}
            >
              Retry tool
            </Button>
          )}
          {retry.error && (
            <p role="alert" className="mingu-collection-ai-error">
              {retry.error}
            </p>
          )}
          <span role="status" className="mingu-collection-ai-hint">
            {copy.status}
          </span>
          {input === undefined && output === undefined && !error && (
            <p className="mingu-collection-ai-hint">No execution data yet.</p>
          )}
        </div>
      </details>
    </section>
  );
}

export interface PlanStep {
  id: string;
  title: string;
  description?: ReactNode;
  status?: "pending" | "running" | "complete" | "error";
  disabled?: boolean;
}
export interface PlanReviewProps extends Shell {
  title?: string;
  steps: readonly PlanStep[];
  selected?: readonly string[];
  defaultSelected?: readonly string[];
  onSelectedChange?: (ids: string[]) => void;
  onRun?: (
    ids: readonly string[],
    context: { signal: AbortSignal },
  ) => void | Promise<void>;
  disabled?: boolean;
}
export function PlanReview({
  title = "A plan before the work",
  steps,
  selected,
  defaultSelected,
  onSelectedChange,
  onRun,
  disabled = false,
  label = "Plan review",
  className,
  style,
}: PlanReviewProps) {
  const [selection, setSelection] = useValue<readonly string[]>(
      selected,
      defaultSelected ?? steps.filter((s) => !s.disabled).map((s) => s.id),
      onSelectedChange as ((ids: readonly string[]) => void) | undefined,
    ),
    action = useAction(),
    ids = steps
      .filter((s) => selection.includes(s.id) && !s.disabled)
      .map((s) => s.id);
  return (
    <section className={cn("plan", className)} style={style} aria-label={label}>
      <div className="mingu-collection-ai-section-heading">
        <span className="mingu-collection-ai-eyebrow">PLAN / REVIEW</span>
        <h3>{title}</h3>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li key={step.id} data-status={step.status ?? "pending"}>
            <div className="mingu-collection-ai-plan-line">
              {onRun ? (
                <Checkbox
                  checked={ids.includes(step.id)}
                  disabled={disabled || action.busy || step.disabled}
                  onChange={(e) =>
                    setSelection(
                      e.currentTarget.checked
                        ? [...ids, step.id]
                        : ids.filter((id) => id !== step.id),
                    )
                  }
                >
                  {step.title}
                </Checkbox>
              ) : (
                <strong>
                  {String(index + 1).padStart(2, "0")} · {step.title}
                </strong>
              )}
              <span className="mingu-collection-ai-pill">
                {step.status ?? "pending"}
              </span>
            </div>
            {step.description && (
              <div className="mingu-collection-ai-step-description">
                {step.description}
              </div>
            )}
          </li>
        ))}
      </ol>
      {!steps.length && (
        <p className="mingu-collection-ai-hint">No steps to review.</p>
      )}
      {onRun && (
        <div className="mingu-collection-ai-toolbar">
          <span className="mingu-collection-ai-hint">
            {ids.length} of {steps.length} steps selected
          </span>
          <Button
            disabled={disabled || !ids.length}
            loading={action.busy}
            onClick={() => void action.run((context) => onRun(ids, context))}
          >
            Run selected steps
          </Button>
        </div>
      )}
      {action.error && (
        <p role="alert" className="mingu-collection-ai-error">
          {action.error}
        </p>
      )}
    </section>
  );
}

export type ApprovalDecision = "pending" | "approved" | "rejected";
export interface ApprovalContext {
  signal: AbortSignal;
  reason: string;
}
export interface ApprovalCardProps extends Shell {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  onApprove: (context: ApprovalContext) => void | Promise<void>;
  onReject: (context: ApprovalContext) => void | Promise<void>;
  decision?: ApprovalDecision;
  defaultDecision?: ApprovalDecision;
  onDecisionChange?: (decision: ApprovalDecision) => void;
  disabled?: boolean;
  requireReason?: boolean;
}
export function ApprovalCard({
  title,
  description,
  children,
  onApprove,
  onReject,
  decision,
  defaultDecision = "pending",
  onDecisionChange,
  disabled = false,
  requireReason = false,
  label = "Approval required",
  className,
  style,
}: ApprovalCardProps) {
  const [current, setCurrent] = useValue(
      decision,
      defaultDecision,
      onDecisionChange,
    ),
    [reason, setReason] = useState(""),
    action = useAction(),
    locked = disabled || action.busy || current !== "pending";
  function decide(next: "approved" | "rejected") {
    if (locked || (next === "rejected" && requireReason && !reason.trim()))
      return;
    void action.run(
      ({ signal }) =>
        (next === "approved" ? onApprove : onReject)({
          signal,
          reason: reason.trim(),
        }),
      () => setCurrent(next),
    );
  }
  return (
    <section
      className={cn("approval", className)}
      style={style}
      aria-label={label}
      data-decision={current}
    >
      <span className="mingu-collection-ai-eyebrow">YOUR DECISION</span>
      <h3>{title}</h3>
      {description && (
        <div className="mingu-collection-ai-hint">{description}</div>
      )}
      {children && (
        <div className="mingu-collection-ai-approval-summary">{children}</div>
      )}
      {current === "pending" ? (
        <>
          <TextField
            label={
              requireReason
                ? "Reason for declining (required)"
                : "Decision note (optional)"
            }
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            disabled={locked}
          />
          <div className="mingu-collection-ai-nav-actions">
            <Button
              variant="outline"
              disabled={locked || (requireReason && !reason.trim())}
              onClick={() => decide("rejected")}
            >
              Decline
            </Button>
            <Button
              disabled={locked}
              loading={action.busy}
              onClick={() => decide("approved")}
            >
              Approve change
            </Button>
          </div>
        </>
      ) : (
        <p role="status" className="mingu-collection-ai-decision">
          {current === "approved" ? (
            <>
              <VectorIcon name="check" size={18} /> Change approved
            </>
          ) : (
            <>
              <VectorIcon name="minus" size="1em" /> Change declined
            </>
          )}
        </p>
      )}
      {action.error && (
        <p role="alert" className="mingu-collection-ai-error">
          {action.error}
        </p>
      )}
    </section>
  );
}

export interface ContextUsageMeterProps extends Shell {
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  maxTokens: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
function finitePositive(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
export function ContextUsageMeter({
  inputTokens,
  outputTokens,
  cachedTokens = 0,
  maxTokens,
  open,
  defaultOpen = false,
  onOpenChange,
  label = "Context usage",
  className,
  style,
}: ContextUsageMeterProps) {
  const [expanded, setExpanded] = useValue(open, defaultOpen, onOpenChange),
    input = finitePositive(inputTokens),
    output = finitePositive(outputTokens),
    cached = Math.min(input, finitePositive(cachedTokens)),
    used = input + output,
    max = Math.max(1, finitePositive(maxTokens)),
    percent = Math.min(100, (used / max) * 100),
    id = useId(),
    format = (n: number) => Math.round(n).toLocaleString("en-US");
  return (
    <section
      className={cn("context", className)}
      style={style}
      aria-label={label}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="none"
            stroke="var(--mingu-border)"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="none"
            stroke="var(--mingu-accent)"
            strokeWidth="4"
            pathLength="100"
            strokeDasharray={`${percent} 100`}
            transform="rotate(-90 24 24)"
          />
        </svg>
        <span>
          <strong>{Math.round((used / max) * 100)}% context used</strong>
          <small>
            {format(used)} / {format(max)} tokens
          </small>
        </span>
        <span aria-hidden="true">
          {expanded ? (
            <VectorIcon name="minus" size="1em" />
          ) : (
            <VectorIcon name="plus" size="1em" />
          )}
        </span>
      </button>
      <meter
        min={0}
        max={max}
        value={Math.min(used, max)}
        aria-label={label}
        className="mingu-collection-ai-sr"
      />
      <div id={id} hidden={!expanded}>
        <dl>
          <div>
            <dt>Input</dt>
            <dd>{format(input)}</dd>
          </div>
          <div>
            <dt>Cached input</dt>
            <dd>{format(cached)}</dd>
          </div>
          <div>
            <dt>Output</dt>
            <dd>{format(output)}</dd>
          </div>
          <div>
            <dt>Remaining</dt>
            <dd>{format(Math.max(0, max - used))}</dd>
          </div>
        </dl>
        <p className="mingu-collection-ai-hint">
          Cached tokens are included in input.
          {used > max ? " The supplied usage exceeds this context limit." : ""}
        </p>
      </div>
    </section>
  );
}

export interface ArtifactPanelProps extends Shell {
  title: string;
  content: string;
  onContentChange?: (content: string) => void;
  filename?: string;
  language?: string;
  preview?: ReactNode;
  editable?: boolean;
  onSave?: (
    content: string,
    context: { signal: AbortSignal },
  ) => void | Promise<void>;
  disabled?: boolean;
}
export function ArtifactPanel({
  title,
  content,
  onContentChange,
  filename = "artifact.txt",
  language = "text",
  preview,
  editable = false,
  onSave,
  disabled = false,
  label = "Artifact",
  className,
  style,
}: ArtifactPanelProps) {
  const [tab, setTab] = useState<"source" | "preview">("source"),
    copy = useCopy(),
    action = useAction(),
    downloads = useRef(new Set<string>()),
    timer = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => {
      downloads.current.forEach((url) => URL.revokeObjectURL(url));
      timer.current.forEach(clearTimeout);
    },
    [],
  );
  function download() {
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    downloads.current.add(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/[\\/\u0000-\u001f]/g, "_");
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    a.remove();
    timer.current.push(
      setTimeout(() => {
        URL.revokeObjectURL(url);
        downloads.current.delete(url);
      }, 1000),
    );
  }
  return (
    <section
      className={cn("artifact", className)}
      style={style}
      aria-label={label}
    >
      <header>
        <div>
          <span className="mingu-collection-ai-eyebrow">
            ARTIFACT / {language}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="mingu-collection-ai-nav-actions">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void copy.copy(content)}
            disabled={disabled}
          >
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={download}
            disabled={disabled}
          >
            Download
          </Button>
        </div>
      </header>
      {preview !== undefined && (
        <div
          className="mingu-collection-ai-artifact-tabs"
          role="group"
          aria-label="Artifact view"
        >
          <Button
            size="sm"
            variant={tab === "source" ? "secondary" : "ghost"}
            aria-pressed={tab === "source"}
            onClick={() => setTab("source")}
          >
            Source
          </Button>
          <Button
            size="sm"
            variant={tab === "preview" ? "secondary" : "ghost"}
            aria-pressed={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            Preview
          </Button>
        </div>
      )}
      {tab === "preview" && preview !== undefined ? (
        <div className="mingu-collection-ai-artifact-preview">{preview}</div>
      ) : editable ? (
        <Textarea
          aria-label={`${title} content`}
          value={content}
          onChange={(e) => onContentChange?.(e.currentTarget.value)}
          readOnly={!onContentChange}
          disabled={disabled || action.busy}
          rows={10}
        />
      ) : (
        <pre>
          <code>{content}</code>
        </pre>
      )}
      <footer>
        <span className="mingu-collection-ai-hint" role="status">
          {copy.status ||
            `${content.split("\n").length} lines · ${content.length} characters`}
        </span>
        {onSave && editable && (
          <Button
            size="sm"
            loading={action.busy}
            disabled={disabled}
            onClick={() => void action.run((ctx) => onSave(content, ctx))}
          >
            Save artifact
          </Button>
        )}
      </footer>
      {action.error && (
        <p role="alert" className="mingu-collection-ai-error">
          {action.error}
        </p>
      )}
    </section>
  );
}

export interface CheckpointProps extends Shell {
  title: string;
  description?: ReactNode;
  createdAt?: string;
  preview?: ReactNode;
  onRestore: AsyncAction;
  current?: boolean;
  disabled?: boolean;
}
export function Checkpoint({
  title,
  description,
  createdAt,
  preview,
  onRestore,
  current = false,
  disabled = false,
  label = "Checkpoint",
  className,
  style,
}: CheckpointProps) {
  const [confirm, setConfirm] = useState(false),
    action = useAction();
  useEffect(() => {
    if (current) setConfirm(false);
  }, [current]);
  return (
    <section
      className={cn("checkpoint", className)}
      style={style}
      aria-label={label}
      data-current={current}
    >
      <div className="mingu-collection-ai-checkpoint-marker" aria-hidden="true">
        {current ? (
          <VectorIcon name="dot" size="1em" />
        ) : (
          <VectorIcon name="circle" size="1em" />
        )}
      </div>
      <div className="mingu-collection-ai-checkpoint-main">
        <div className="mingu-collection-ai-toolbar">
          <h3>{title}</h3>
          {current ? (
            <span className="mingu-collection-ai-pill">Current</span>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled || action.busy}
              onClick={() => setConfirm(!confirm)}
            >
              Restore
            </Button>
          )}
        </div>
        {description && (
          <div className="mingu-collection-ai-hint">{description}</div>
        )}
        {createdAt && (
          <time dateTime={createdAt} className="mingu-collection-ai-hint">
            {createdAt}
          </time>
        )}
        {preview && (
          <details>
            <summary>View snapshot</summary>
            <div>{preview}</div>
          </details>
        )}
        {confirm && !current && (
          <div className="mingu-collection-ai-checkpoint-confirm">
            <p>Restore this point? Later changes may be replaced.</p>
            <div className="mingu-collection-ai-nav-actions">
              <Button
                size="sm"
                variant="ghost"
                disabled={action.busy}
                onClick={() => setConfirm(false)}
              >
                Keep current state
              </Button>
              <Button
                size="sm"
                loading={action.busy}
                disabled={disabled}
                onClick={() =>
                  void action.run(onRestore, () => setConfirm(false))
                }
              >
                Confirm restore
              </Button>
            </div>
          </div>
        )}
        {action.error && (
          <p role="alert" className="mingu-collection-ai-error">
            {action.error}
          </p>
        )}
      </div>
    </section>
  );
}

export interface AiModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  disabled?: boolean;
}
export interface ModelSelectorProps extends Shell {
  models: readonly AiModel[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
  labels?: {
    title?: string;
    description?: string;
    search?: string;
    options?: string;
    empty?: string;
    close?: string;
    unavailable?: string;
  };
}
export function ModelSelector({
  models,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  placeholder = "Choose a model",
  label = "Model",
  labels,
  className,
  style,
}: ModelSelectorProps) {
  const [selected, setSelected] = useValue(
      value,
      defaultValue ?? "",
      onValueChange,
    ),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [active, setActive] = useState(0),
    search = useRef<HTMLInputElement>(null),
    id = useId(),
    filtered = models.filter((m) =>
      `${m.name} ${m.provider} ${m.description ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    options = filtered.filter((m) => !m.disabled),
    chosen = models.find((m) => m.id === selected),
    current = options[Math.min(active, options.length - 1)];
  useEffect(() => {
    if (open && current)
      document
        .getElementById(`${id}-${models.indexOf(current)}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, current?.id, id]);
  function choose(model: AiModel) {
    if (model.disabled || disabled) return;
    setSelected(model.id);
    setOpen(false);
    setQuery("");
  }
  return (
    <div className={cn("model", className)} style={style}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-label={`${label}: ${chosen?.name ?? placeholder}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setQuery("");
          setActive(0);
          setOpen(true);
        }}
      >
        {chosen?.name ?? placeholder}
        <ChevronDown />
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={labels?.title ?? "Choose a model"}
        description={labels?.description ?? "Search by model name or provider."}
        closeLabel={labels?.close ?? "Close dialog"}
        initialFocus={search}
      >
        <TextField
          ref={search}
          label={labels?.search ?? "Search models"}
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setActive(0);
          }}
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls={id}
          aria-activedescendant={
            current ? `${id}-${models.indexOf(current)}` : undefined
          }
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
              e.preventDefault();
              setActive((i) =>
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? Math.max(0, options.length - 1)
                    : Math.max(
                        0,
                        Math.min(
                          options.length - 1,
                          i + (e.key === "ArrowDown" ? 1 : -1),
                        ),
                      ),
              );
            }
            if (e.key === "Enter") {
              // A selector can live inside a composer form. Empty search must
              // never activate that form's default submit button.
              e.preventDefault();
              if (current) choose(current);
            }
          }}
        />
        <div
          id={id}
          role="listbox"
          aria-label={labels?.options ?? "Available models"}
          className="mingu-collection-ai-model-list"
        >
          {filtered.map((model) => (
            <button
              type="button"
              role="option"
              id={`${id}-${models.indexOf(model)}`}
              key={model.id}
              aria-selected={selected === model.id}
              disabled={model.disabled}
              data-active={current?.id === model.id}
              tabIndex={-1}
              onPointerMove={() => {
                const i = options.findIndex((m) => m.id === model.id);
                if (i >= 0) setActive(i);
              }}
              onClick={() => choose(model)}
            >
              <span className="mingu-collection-ai-model-provider">
                {model.provider.slice(0, 1)}
              </span>
              <span>
                <strong>{model.name}</strong>
                <small>
                  {model.provider}
                  {model.description ? ` · ${model.description}` : ""}
                </small>
              </span>
              <span aria-hidden="true">
                {selected === model.id ? (
                  <VectorIcon name="check" size={18} />
                ) : model.disabled ? (
                  (labels?.unavailable ?? "Unavailable")
                ) : (
                  ""
                )}
              </span>
            </button>
          ))}
        </div>
        {!filtered.length && (
          <p role="status" className="mingu-collection-ai-hint">
            {labels?.empty ?? "No models match your search."}
          </p>
        )}
      </Dialog>
    </div>
  );
}

type RecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
};
type RecognitionEvent = {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
};
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
function disposeRecognition(instance: Recognition, abort = true) {
  instance.onstart =
    instance.onend =
    instance.onresult =
    instance.onerror =
      null;
  if (abort) {
    try {
      instance.abort();
    } catch {}
  }
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export interface VoiceInputProps extends Shell {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onTranscript?: (text: string) => void;
  lang?: string;
  disabled?: boolean;
  serviceNotice?: string;
}
export function VoiceInput({
  value,
  defaultValue = "",
  onValueChange,
  onTranscript,
  lang = "en-US",
  disabled = false,
  serviceNotice = "Your browser’s speech service may process audio online. Start only when you are ready.",
  label = "Transcript",
  className,
  style,
}: VoiceInputProps) {
  const [text, setText] = useValue(value, defaultValue, onValueChange),
    [supported, setSupported] = useState<boolean | null>(null),
    [status, setStatus] = useState<
      "idle" | "starting" | "listening" | "processing" | "error"
    >("idle"),
    [error, setError] = useState(""),
    [interim, setInterim] = useState(""),
    recognition = useRef<Recognition | null>(null),
    live = useRef({ text, setText, onTranscript }),
    sessionBase = useRef(""),
    lastFinal = useRef("");
  live.current = { text, setText, onTranscript };
  useEffect(() => {
    const w = window as SpeechWindow;
    setSupported(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
    const hidden = () => {
      if (!document.hidden) return;
      const r = recognition.current;
      recognition.current = null;
      if (r) disposeRecognition(r);
      setInterim("");
      setStatus("idle");
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      const r = recognition.current;
      recognition.current = null;
      if (r) disposeRecognition(r);
    };
  }, []);
  useEffect(() => {
    if (disabled) {
      const r = recognition.current;
      recognition.current = null;
      if (r) disposeRecognition(r);
      setInterim("");
      setStatus("idle");
    }
  }, [disabled]);
  function start() {
    if (disabled || document.hidden || recognition.current) return;
    const Constructor =
      (window as SpeechWindow).SpeechRecognition ??
      (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor) {
      setSupported(false);
      return;
    }
    if (!window.isSecureContext) {
      setError("Speech input requires HTTPS or localhost. You can type below.");
      setStatus("error");
      return;
    }
    setError("");
    setInterim("");
    setStatus("starting");
    sessionBase.current = live.current.text.trim();
    lastFinal.current = "";
    let r: Recognition;
    try {
      r = new Constructor();
      recognition.current = r;
      r.lang = lang;
      r.continuous = false;
      r.interimResults = true;
      r.onstart = () => {
        if (recognition.current === r) setStatus("listening");
      };
      r.onresult = (event) => {
        if (recognition.current !== r) return;
        let final = "",
          partial = "";
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) final += `${result[0].transcript} `;
          else partial += result[0].transcript;
        }
        if (final.trim() && final.trim() !== lastFinal.current) {
          const next = [sessionBase.current, final.trim()]
            .filter(Boolean)
            .join(" ");
          const addition = final.trim().slice(lastFinal.current.length).trim();
          lastFinal.current = final.trim();
          live.current.setText(next);
          if (addition) live.current.onTranscript?.(addition);
        }
        setInterim(partial);
      };
      r.onerror = (event) => {
        if (recognition.current !== r) return;
        recognition.current = null;
        disposeRecognition(r);
        setInterim("");
        if (event.error === "aborted") {
          setStatus("idle");
          return;
        }
        setError(
          event.error === "not-allowed" || event.error === "service-not-allowed"
            ? "Microphone permission was denied. You can type below, or enable speech access in your browser."
            : event.error === "no-speech"
              ? "No speech was detected. Try again or type below."
              : `Speech input failed (${event.error}). You can type below.`,
        );
        setStatus("error");
      };
      r.onend = () => {
        if (recognition.current !== r) return;
        recognition.current = null;
        disposeRecognition(r, false);
        setInterim("");
        setStatus((s) => (s === "error" ? "error" : "idle"));
      };
      r.start();
    } catch (e) {
      const session = recognition.current;
      recognition.current = null;
      if (session) disposeRecognition(session);
      setStatus("error");
      setError(message(e));
    }
  }
  const recording =
    status === "starting" || status === "listening" || status === "processing";
  return (
    <section
      className={cn("voice", className)}
      style={style}
      aria-label="Voice input"
    >
      <div className="mingu-collection-ai-voice-top">
        <span
          className="mingu-collection-ai-voice-wave"
          aria-hidden="true"
          data-listening={status === "listening"}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </span>
        <div>
          <strong>
            {status === "listening"
              ? "Listening…"
              : status === "starting"
                ? "Starting speech input…"
                : status === "processing"
                  ? "Finishing transcript…"
                  : "Your voice, in words."}
          </strong>
          <p className="mingu-collection-ai-hint">{serviceNotice}</p>
        </div>
      </div>
      <Textarea
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        disabled={disabled || recording}
        rows={4}
        placeholder="Start speaking, or type here."
      />
      {interim && (
        <p aria-live="off" className="mingu-collection-ai-interim">
          {interim}
        </p>
      )}
      <div className="mingu-collection-ai-toolbar">
        <span className="mingu-collection-ai-hint" role="status">
          {supported === false
            ? "Speech recognition is unavailable in this browser. Typing is always available."
            : recording
              ? "Microphone active only for this speech session."
              : `${lang} · Ready when you are`}
        </span>
        {recording ? (
          <Button
            variant="outline"
            onClick={() => {
              const session = recognition.current;
              if (
                !session ||
                status === "starting" ||
                status === "processing"
              ) {
                recognition.current = null;
                if (session) disposeRecognition(session);
                setInterim("");
                setStatus("idle");
                return;
              }
              setStatus("processing");
              try {
                session.stop();
              } catch (error) {
                recognition.current = null;
                disposeRecognition(session);
                setStatus("error");
                setError(message(error));
              }
            }}
          >
            {status === "processing" ? "Cancel speech input" : "Stop listening"}
          </Button>
        ) : (
          <Button disabled={disabled || supported !== true} onClick={start}>
            Start speaking
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mingu-collection-ai-error">
          {error}
        </p>
      )}
    </section>
  );
}

export interface TerminalLine {
  id: string;
  text: string;
  level?: "info" | "success" | "warning" | "error";
  timestamp?: string;
}
export interface StreamingTerminalProps extends Shell {
  lines: readonly TerminalLine[];
  title?: string;
  maxLines?: number;
  onClear?: () => void;
  follow?: boolean;
  defaultFollow?: boolean;
  onFollowChange?: (follow: boolean) => void;
  emptyMessage?: string;
}
/** Strip terminal control sequences; every log is rendered as text, never HTML. */
export function cleanTerminalText(text: string) {
  return text
    .replace(/(?:\u001b\]|\u009d)[\s\S]*?(?:\u0007|\u001b\\|\u009c)/g, "")
    .replace(/(?:\u001b\[|\u009b)[0-?]*[ -/]*[@-~]/g, "")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, "");
}
export function StreamingTerminal({
  lines,
  title = "Activity",
  maxLines = 500,
  onClear,
  follow,
  defaultFollow = true,
  onFollowChange,
  emptyMessage = "Waiting for output…",
  label = "Terminal output",
  className,
  style,
}: StreamingTerminalProps) {
  const [following, setFollowing] = useValue(
      follow,
      defaultFollow,
      onFollowChange,
    ),
    [query, setQuery] = useState(""),
    copy = useCopy(),
    viewport = useRef<HTMLDivElement>(null),
    visible = lines
      .slice(
        -Math.max(
          1,
          Math.min(
            5000,
            Number.isFinite(maxLines) ? Math.floor(maxLines) : 500,
          ),
        ),
      )
      .map((line) => ({ ...line, text: cleanTerminalText(line.text) }))
      .filter((line) => line.text.toLowerCase().includes(query.toLowerCase())),
    last = lines[lines.length - 1]?.text ?? "";
  useEffect(() => {
    const el = viewport.current;
    if (following && el) el.scrollTop = el.scrollHeight;
  }, [lines.length, last, following, query]);
  return (
    <section
      className={cn("terminal", className)}
      style={style}
      aria-label={label}
    >
      <header>
        <strong>
          <span aria-hidden="true">
            <VectorIcon name="command" size="1em" />
          </span>{" "}
          {title}
        </strong>
        <div className="mingu-collection-ai-nav-actions">
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={following}
            onClick={() => setFollowing(!following)}
          >
            {following ? "Pause follow" : "Follow output"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!visible.length}
            onClick={() =>
              void copy.copy(visible.map((l) => l.text).join("\n"))
            }
          >
            Copy logs
          </Button>
          {onClear && (
            <Button
              size="sm"
              variant="ghost"
              disabled={!lines.length}
              onClick={onClear}
            >
              Clear logs
            </Button>
          )}
        </div>
      </header>
      <div className="mingu-collection-ai-terminal-search">
        <TextField
          label="Search logs"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Find in output…"
        />
      </div>
      <div
        ref={viewport}
        className="mingu-collection-ai-terminal-output"
        role="log"
        aria-live="off"
        aria-label="Log lines"
        tabIndex={0}
        onWheel={(e) => {
          if (e.deltaY < 0) setFollowing(false);
        }}
        onTouchMove={() => setFollowing(false)}
        onKeyDown={(e) => {
          if (["ArrowUp", "PageUp", "Home"].includes(e.key))
            setFollowing(false);
        }}
      >
        {visible.map((line) => (
          <div
            key={line.id}
            data-level={line.level ?? "info"}
            className="mingu-collection-ai-terminal-line"
          >
            {line.timestamp && <time>{cleanTerminalText(line.timestamp)}</time>}
            <span className="mingu-collection-ai-terminal-level">
              {line.level ?? "info"}
            </span>
            <pre>{line.text}</pre>
          </div>
        ))}
        {!visible.length && (
          <p className="mingu-collection-ai-hint">
            {query ? "No matching log lines." : emptyMessage}
          </p>
        )}
      </div>
      <footer>
        <span>
          {visible.length} shown / {lines.length} received
        </span>
        <span role="status">
          {copy.status || (!following ? "Follow paused" : "Following output")}
        </span>
      </footer>
    </section>
  );
}
