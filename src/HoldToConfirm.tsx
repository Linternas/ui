"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Button, Dialog } from "./system/base";
import { playgroundMotion } from "./system/motion-tokens";
export interface HoldToConfirmProps {
  label: string;
  onConfirm: () => void | Promise<void>;
  duration?: number;
  disabled?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  successLabel?: string;
  errorMessage?: string;
  className?: string;
}
export function HoldToConfirm({
  label,
  onConfirm,
  duration = 1200,
  disabled = false,
  confirmationTitle = "Confirm this action?",
  confirmationDescription = "Continue when you are ready.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  successLabel = "Confirmed",
  errorMessage = "Something went wrong. Try again.",
  className = "",
}: HoldToConfirmProps) {
  const [progress, setProgress] = useState(0),
    [open, setOpen] = useState(false),
    [state, setState] = useState<"idle" | "busy" | "success" | "error">("idle");
  const frame = useRef(0),
    pointer = useRef<number | null>(null),
    suppressClick = useRef(false),
    busy = useRef(false),
    mounted = useRef(false),
    id = useId();
  const cancel = () => {
    cancelAnimationFrame(frame.current);
    pointer.current = null;
    setProgress(0);
  };
  useEffect(() => {
    mounted.current = true;
    const stop = () => {
      cancelAnimationFrame(frame.current);
      pointer.current = null;
      setProgress(0);
    };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      mounted.current = false;
      cancelAnimationFrame(frame.current);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);
  useEffect(() => {
    if (disabled) cancel();
  }, [disabled]);
  const confirm = async () => {
    if (disabled || busy.current) return;
    busy.current = true;
    cancel();
    setOpen(false);
    setState("busy");
    try {
      await onConfirm();
      if (mounted.current) setState("success");
    } catch {
      if (mounted.current) setState("error");
    } finally {
      busy.current = false;
    }
  };
  return (
    <div className={`mingu-hold ${className}`}>
      <Button
        className="mingu-hold-button"
        variant="secondary"
        disabled={disabled}
        loading={state === "busy"}
        aria-describedby={`${id}-hint ${id}-status`}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (
            !event.isPrimary ||
            event.button !== 0 ||
            disabled ||
            busy.current
          )
            return;
          suppressClick.current = false;
          pointer.current = event.pointerId;
          const start = performance.now();
          const length = Math.max(
            playgroundMotion.holdMinimum,
            Math.min(
              playgroundMotion.holdMaximum,
              Number.isFinite(duration) ? duration : 1200,
            ),
          );
          const tick = (now: number) => {
            if (pointer.current === null) return;
            const value = Math.min(1, (now - start) / length);
            setProgress(value);
            if (value >= 1) {
              suppressClick.current = true;
              void confirm();
            } else frame.current = requestAnimationFrame(tick);
          };
          frame.current = requestAnimationFrame(tick);
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onBlur={cancel}
        onKeyDown={(event) => {
          if (event.key === "Escape") cancel();
        }}
        onClick={(event) => {
          if (event.detail > 0 && suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          if (!busy.current && !disabled) setOpen(true);
        }}
        style={{ "--mingu-hold-progress": progress } as React.CSSProperties}
      >
        <span className="mingu-hold-fill" aria-hidden="true" />
        <span className="mingu-hold-label">
          {state === "success" ? successLabel : label}
        </span>
      </Button>
      <span id={`${id}-hint`} className="mingu-hold-hint">
        Hold to confirm, or click for confirmation.
      </span>
      <span
        id={`${id}-status`}
        role="status"
        className={
          state === "error" ? "mingu-field-error" : "mingu-visually-hidden"
        }
      >
        {state === "error"
          ? errorMessage
          : state === "success"
            ? successLabel
            : state === "busy"
              ? "Working"
              : ""}
      </span>
      <Dialog
        className="mingu-hold-dialog"
        open={open}
        onOpenChange={setOpen}
        role="alertdialog"
        title={confirmationTitle}
        description={confirmationDescription}
      >
        <div className="mingu-hold-actions">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {cancelLabel}
          </Button>
          <Button disabled={disabled} onClick={() => void confirm()}>
            {confirmLabel}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
