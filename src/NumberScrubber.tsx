"use client";
import * as React from "react";
import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { Input } from "./system/base";
import { FieldFrame, fieldDescription } from "./system/field-frame";
import { useControllable } from "./shared";
import { playgroundMotion } from "./system/motion-tokens";
export interface NumberScrubberProps
  extends Omit<
    ComponentProps<typeof Input>,
    "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
  > {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  error?: string;
  scrubLabel?: string;
}
export function NumberScrubber({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min,
  max,
  step = 1,
  hint,
  error,
  scrubLabel = "Drag to adjust",
  id: providedId,
  ref,
  disabled,
  readOnly,
  className = "",
  onFocus,
  onBlur,
  "aria-describedby": describedBy,
  ...props
}: NumberScrubberProps) {
  const generated = useId(),
    id = providedId ?? generated,
    input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const low =
    min !== undefined && Number.isFinite(min) ? min : -Number.MAX_SAFE_INTEGER;
  const high =
    max !== undefined && Number.isFinite(max)
      ? Math.max(low, max)
      : Number.MAX_SAFE_INTEGER;
  const origin = min !== undefined && Number.isFinite(min) ? min : 0;
  const normalize = (n: number) => {
    const snapped =
      origin +
      Math.round(((Number.isFinite(n) ? n : 0) - origin) / increment) *
        increment;
    const first =
      origin + Math.ceil((low - origin) / increment - 1e-10) * increment;
    const last =
      origin + Math.floor((high - origin) / increment + 1e-10) * increment;
    return Number(
      Math.min(Math.max(first, last), Math.max(first, snapped)).toPrecision(15),
    );
  };
  const [current, change] = useControllable(
    value,
    normalize(defaultValue),
    onValueChange,
  );
  const [draft, setDraft] = useState<string | null>(null),
    [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; value: number; id: number } | null>(null);
  useEffect(() => {
    const form = input.current?.form;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        setDraft(null);
        if (value === undefined) change(normalize(defaultValue));
      });
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue, value, min, max, step, props.form]);
  useEffect(() => {
    if (disabled || readOnly) {
      drag.current = null;
      setDragging(false);
    }
  }, [disabled, readOnly]);
  const adjust = (n: number) => {
    setDraft(null);
    change(normalize(n));
  };
  return (
    <FieldFrame
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      className={className}
    >
      <div
        className={`mingu-scrubber mingu-scrubber-${props.controlSize ?? "md"}`}
        data-dragging={dragging || undefined}
      >
        <button
          type="button"
          className="mingu-scrubber-handle"
          aria-label={`${scrubLabel}: ${label}`}
          aria-describedby={fieldDescription(id, hint, error)}
          disabled={disabled || readOnly}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0 || disabled || readOnly)
              return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = {
              x: event.clientX,
              value: normalize(current),
              id: event.pointerId,
            };
            setDragging(true);
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (start && event.pointerId === start.id)
              adjust(
                start.value +
                  Math.round(
                    (event.clientX - start.x) / playgroundMotion.scrubPixels,
                  ) *
                    increment *
                    (event.shiftKey ? 10 : 1),
              );
          }}
          onPointerUp={(event) => {
            drag.current = null;
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragging(false);
          }}
          onLostPointerCapture={() => {
            drag.current = null;
            setDragging(false);
          }}
          onKeyDown={(event) => {
            const delta = ["ArrowRight", "ArrowUp"].includes(event.key)
              ? 1
              : ["ArrowLeft", "ArrowDown"].includes(event.key)
                ? -1
                : 0;
            if (delta) {
              event.preventDefault();
              adjust(
                normalize(current) +
                  delta * increment * (event.shiftKey ? 10 : 1),
              );
            }
            if (event.key === "Escape") {
              if (drag.current) adjust(drag.current.value);
              drag.current = null;
              setDragging(false);
            }
            if (event.key === "Home" && min !== undefined) {
              event.preventDefault();
              adjust(low);
            }
            if (event.key === "End" && max !== undefined) {
              event.preventDefault();
              adjust(high);
            }
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m7 8-4 4 4 4m10-8 4 4-4 4M3 12h18" />
          </svg>
        </button>
        <Input
          {...props}
          id={id}
          ref={input}
          type="number"
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={increment}
          value={draft ?? normalize(current)}
          aria-invalid={!!error || props["aria-invalid"]}
          aria-describedby={fieldDescription(id, hint, error, describedBy)}
          onFocus={(event) => onFocus?.(event)}
          onChange={(event) => {
            const raw = event.currentTarget.value;
            setDraft(raw);
            if (
              raw !== "" &&
              Number.isFinite(event.currentTarget.valueAsNumber)
            )
              change(normalize(event.currentTarget.valueAsNumber));
          }}
          onBlur={(event) => {
            if (draft !== null) {
              adjust(
                draft.trim() && Number.isFinite(Number(draft))
                  ? Number(draft)
                  : current,
              );
            }
            onBlur?.(event);
          }}
        />
      </div>
    </FieldFrame>
  );
}
