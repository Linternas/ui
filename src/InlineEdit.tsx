"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Button, Input } from "./system/base";
export interface InlineEditProps {
  label: string;
  value: string;
  onSave: (value: string) => void | Promise<void>;
  validate?: (value: string) => string | null;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
  name?: string;
  className?: string;
  labels?: { edit?: string; save?: string; cancel?: string; error?: string };
}
export function InlineEdit({
  label,
  value,
  onSave,
  validate,
  placeholder = "Add a value",
  required,
  maxLength,
  disabled,
  name,
  className = "",
  labels = {},
}: InlineEditProps) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(value),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    restore = useRef(false),
    alive = useRef(true);
  const id = useId();
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (editing) {
      input.current?.focus();
      input.current?.select();
    } else if (restore.current) {
      trigger.current?.focus({ preventScroll: true });
      restore.current = false;
    }
  }, [editing]);
  const cancel = () => {
    if (busy) return;
    setDraft(value);
    setError("");
    restore.current = true;
    setEditing(false);
  };
  const save = async () => {
    if (busy || disabled || !input.current?.reportValidity()) return;
    const invalid = validate?.(draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSave(draft);
      if (alive.current) {
        restore.current = true;
        setEditing(false);
      }
    } catch (reason) {
      if (alive.current)
        setError(
          reason instanceof Error
            ? reason.message
            : (labels.error ?? "Could not save. Try again."),
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return (
    <div className={`mingu-inline-edit ${className}`}>
      {name && (
        <input type="hidden" name={name} value={value} disabled={disabled} />
      )}
      {editing ? (
        <div
          role="group"
          aria-label={label}
          aria-busy={busy || undefined}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              cancel();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              void save();
            }
          }}
        >
          <div className="mingu-inline-controls">
            <Input
              ref={input}
              aria-label={label}
              value={draft}
              required={required}
              maxLength={maxLength}
              disabled={disabled || busy}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => setDraft(event.currentTarget.value)}
            />
            <Button
              onClick={() => void save()}
              loading={busy}
              disabled={disabled}
            >
              {labels.save ?? "Save"}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={cancel}>
              {labels.cancel ?? "Cancel"}
            </Button>
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="mingu-inline-error">
              {error}
            </p>
          )}
        </div>
      ) : (
        <button
          ref={trigger}
          type="button"
          className="mingu-inline-trigger"
          disabled={disabled}
          aria-label={`${labels.edit ?? "Edit"} ${label}: ${value || placeholder}`}
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
        >
          <span className={!value ? "mingu-muted" : undefined}>
            {value || placeholder}
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      )}
    </div>
  );
}
