"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, useControllable } from "./shared";

export interface DurationValue {
  hours: number;
  minutes: number;
}
export interface DurationPickerProps {
  value?: DurationValue;
  defaultValue?: DurationValue;
  onChange?: (value: DurationValue) => void;
  onConfirm?: (value: DurationValue) => void;
  maxHours?: number;
  maxMinutes?: number;
  disabled?: boolean;
}
export function DurationPicker({
  value,
  defaultValue = { hours: 1, minutes: 30 },
  onChange,
  onConfirm,
  maxHours = 24,
  maxMinutes = 59,
  disabled = false,
}: DurationPickerProps) {
  const [current, change] = useControllable(value, defaultValue, onChange);
  const [editing, setEditing] = useState(false),
    [shake, setShake] = useState(0);
  const first = useRef<HTMLInputElement>(null),
    toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (editing) first.current?.select();
  }, [editing]);
  function update(field: keyof DurationValue, raw: number) {
    const max = field === "hours" ? maxHours : maxMinutes;
    const next = Math.min(
      max,
      Math.max(0, Number.isFinite(raw) ? Math.floor(raw) : 0),
    );
    if (next !== raw) setShake((count) => count + 1);
    change({ ...current, [field]: next });
  }
  function confirm() {
    onConfirm?.(current);
    setEditing(false);
    toggle.current?.focus();
  }
  return (
    <motion.div
      layout
      className="mi-duration"
      data-editing={editing || undefined}
      data-disabled={disabled || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setEditing(false);
          toggle.current?.focus();
        }
        if (event.key === "Enter" && editing) confirm();
      }}
    >
      <motion.span
        layout
        className="mi-duration-segment"
        key={`hours-${shake}`}
        animate={{ x: shake ? [0, -4, 4, 0] : 0 }}
      >
        {editing ? (
          <input
            ref={first}
            aria-label="Hours"
            inputMode="numeric"
            type="number"
            min={0}
            max={maxHours}
            value={current.hours}
            onChange={(event) => update("hours", event.target.valueAsNumber)}
          />
        ) : (
          <span>{String(current.hours).padStart(2, "0")}</span>
        )}
        <span>hr</span>
      </motion.span>
      <motion.span layout className="mi-duration-segment">
        {editing ? (
          <input
            aria-label="Minutes"
            inputMode="numeric"
            type="number"
            min={0}
            max={maxMinutes}
            value={current.minutes}
            onChange={(event) => update("minutes", event.target.valueAsNumber)}
          />
        ) : (
          <span>{String(current.minutes).padStart(2, "0")}</span>
        )}
        <span>min</span>
      </motion.span>
      <button
        ref={toggle}
        type="button"
        disabled={disabled}
        aria-label={editing ? "Confirm duration" : "Edit duration"}
        onClick={() => (editing ? confirm() : setEditing(true))}
      >
        <Icon name={editing ? "check" : "edit"} size={18} />
      </button>
    </motion.div>
  );
}

export interface OtpInputProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  status?: "idle" | "success" | "error";
  type?: "numbers" | "letters" | "both";
  mask?: boolean;
  disabled?: boolean;
  label?: string;
}
export function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  status = "idle",
  type = "numbers",
  mask = false,
  disabled,
  label = "One-time code",
}: OtpInputProps) {
  const count = Math.max(1, Math.min(12, length));
  const [code, change] = useControllable(value, defaultValue, onChange);
  const [caret, setCaret] = useState(0),
    [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null),
    last = useRef("");
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const id = useId();
  useEffect(() => {
    if (code.length === count && last.current !== code)
      callback.current?.(code);
    last.current = code;
  }, [code, count]);
  const normalize = (raw: string) =>
    raw
      .replace(
        type === "numbers"
          ? /[^0-9]/g
          : type === "letters"
            ? /[^a-z]/gi
            : /[^a-z0-9]/gi,
        "",
      )
      .slice(0, count);
  return (
    <motion.div
      className="mi-otp"
      data-status={status}
      data-disabled={disabled || undefined}
      animate={{ x: status === "error" ? [0, -6, 6, -3, 3, 0] : 0 }}
    >
      <input
        ref={input}
        aria-label={label}
        aria-invalid={status === "error"}
        aria-describedby={`${id}-status`}
        type={mask ? "password" : "text"}
        autoComplete="one-time-code"
        inputMode={type === "numbers" ? "numeric" : "text"}
        pattern={type === "numbers" ? "[0-9]*" : undefined}
        maxLength={count}
        value={code}
        disabled={disabled}
        onChange={(event) => {
          const next = normalize(event.target.value);
          change(next);
          setCaret(
            Math.min(count - 1, event.target.selectionStart ?? next.length),
          );
        }}
        onPaste={(event) => {
          event.preventDefault();
          const next = normalize(event.clipboardData.getData("text"));
          change(next);
          setCaret(Math.min(count - 1, next.length));
          requestAnimationFrame(() =>
            input.current?.setSelectionRange(next.length, next.length),
          );
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSelect={(event) =>
          setCaret(
            Math.min(
              count - 1,
              event.currentTarget.selectionStart ?? code.length,
            ),
          )
        }
      />
      <span className="mi-otp-slots" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className="mi-otp-slot"
            data-focused={(focused && caret === index) || undefined}
            onPointerDown={(event) => {
              event.preventDefault();
              input.current?.focus();
              const at = Math.min(index, code.length);
              input.current?.setSelectionRange(
                at,
                Math.min(at + 1, code.length),
              );
              setCaret(at);
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={code[index] ?? "empty"}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
              >
                {code[index] ? (
                  mask ? (
                    "•"
                  ) : (
                    code[index]
                  )
                ) : focused && caret === index ? (
                  <span className="mi-otp-caret" />
                ) : (
                  ""
                )}
              </motion.span>
            </AnimatePresence>
          </span>
        ))}
      </span>
      <span className="mru-sr-only" id={`${id}-status`} role="status">
        {status === "success"
          ? "Code accepted"
          : status === "error"
            ? "Invalid code"
            : ""}
      </span>
    </motion.div>
  );
}

export interface DeleteButtonProps {
  onConfirm: () => void | Promise<void>;
  label?: string;
  confirmationLabel?: string;
  disabled?: boolean;
}
export function DeleteButton({
  onConfirm,
  label = "Delete",
  confirmationLabel = "Confirm delete",
  disabled,
}: DeleteButtonProps) {
  const [state, setState] = useState<
    "idle" | "confirm" | "pending" | "done" | "error"
  >("idle");
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    confirmRef = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  useEffect(() => {
    if (state !== "confirm") return;
    confirmRef.current?.focus();
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setState("idle");
    };
    const timer = setTimeout(() => setState("idle"), 6000);
    document.addEventListener("pointerdown", close);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", close);
    };
  }, [state]);
  async function remove() {
    if (pending.current) return;
    pending.current = true;
    setState("pending");
    try {
      await onConfirm();
      setState("done");
    } catch {
      pending.current = false;
      setState("error");
    }
  }
  return (
    <motion.div
      layout
      ref={root}
      className="mi-delete"
      onKeyDown={(event) => {
        if (event.key === "Escape" && state === "confirm") {
          setState("idle");
          trigger.current?.focus();
        }
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "confirm" ? (
          <motion.div
            className="mi-delete-confirm"
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button ref={confirmRef} type="button" onClick={remove}>
              {confirmationLabel}
            </button>
            <button
              type="button"
              aria-label="Cancel delete"
              onClick={() => {
                setState("idle");
                trigger.current?.focus();
              }}
            >
              <Icon name="close" size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            ref={trigger}
            key="trigger"
            type="button"
            disabled={disabled || state === "pending" || state === "done"}
            onClick={() => setState("confirm")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Icon name={state === "done" ? "check" : "trash"} size={17} />
            {state === "pending"
              ? "Deleting…"
              : state === "done"
                ? "Deleted"
                : state === "error"
                  ? "Retry delete"
                  : label}
          </motion.button>
        )}
      </AnimatePresence>
      <span className="mru-sr-only" role="status">
        {state === "error"
          ? "Deletion failed. Try again."
          : state === "done"
            ? "Item deleted"
            : ""}
      </span>
    </motion.div>
  );
}

export interface TaskItem {
  id: string;
  label: string;
  completed: boolean;
  detail?: ReactNode;
}
export interface TaskListProps {
  items?: readonly TaskItem[];
  defaultItems?: readonly TaskItem[];
  onChange?: (items: readonly TaskItem[]) => void;
}
export function TaskList({
  items,
  defaultItems = [],
  onChange,
}: TaskListProps) {
  const [tasks, change] = useControllable(items, defaultItems, onChange);
  const sorted = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed),
  );
  return (
    <div className="mi-tasks">
      <header>
        <span>Checklist</span>
        <span>
          {tasks.filter((task) => task.completed).length} / {tasks.length}
        </span>
      </header>
      <ul>
        {sorted.map((task) => (
          <motion.li
            layout
            key={task.id}
            transition={{ type: "spring", stiffness: 220, damping: 27 }}
            data-completed={task.completed || undefined}
          >
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() =>
                  change(
                    tasks.map((entry) =>
                      entry.id === task.id
                        ? { ...entry, completed: !entry.completed }
                        : entry,
                    ),
                  )
                }
              />
              <span className="mi-task-check" aria-hidden="true">
                {task.completed && <Icon name="check" size={12} />}
              </span>
              <span className="mi-task-label">{task.label}</span>
            </label>
            {task.detail && (
              <span className="mi-task-detail">{task.detail}</span>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
