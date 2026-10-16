"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type HTMLAttributes,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { selectionSpring, pointerMotion } from "./motion-tokens";
import { Button, Input, type TextFieldProps } from "./base";
import { useControllable } from "../shared";

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "children" | "status"> & {
  text: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "success" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      clearTimeout(timer.current);
    },
    [],
  );
  return (
    <Button
      {...props}
      status={state}
      icon={
        props.icon ?? (
          <svg viewBox="0 0 20 20" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2" />
            <path d="M12 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2h2" />
          </svg>
        )
      }
      onClick={async () => {
        const run = ++generation.current;
        clearTimeout(timer.current);
        try {
          await navigator.clipboard.writeText(text);
          if (run !== generation.current) return;
          setState("success");
        } catch {
          if (run !== generation.current) return;
          setState("error");
        }
        timer.current = setTimeout(() => setState("idle"), 1800);
      }}
    >
      <span
        className="mingu-copy-label"
        data-copied={state === "success" || undefined}
      >
        <span aria-hidden={state === "success"}>
          {state === "error" ? "Try again" : label}
        </span>
        <span aria-hidden={state !== "success"}>{copiedLabel}</span>
      </span>
      <span className="mingu-visually-hidden" role="status">
        {state === "success"
          ? "Copied to clipboard"
          : state === "error"
            ? "Unable to copy. Try again."
            : ""}
      </span>
    </Button>
  );
}
export function FloatingField({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generated = useId(),
    fieldId = id ?? generated;
  return (
    <div
      className={`mingu-field mingu-floating-field ${className ?? ""}`}
      data-invalid={!!error || undefined}
    >
      <div className="mingu-floating-control">
        <Input
          {...props}
          placeholder={props.placeholder ?? " "}
          id={fieldId}
          aria-invalid={!!error || props["aria-invalid"]}
          aria-describedby={
            [props["aria-describedby"], (error || hint) && `${fieldId}-help`]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        <label htmlFor={fieldId}>
          {label}
          {props.required && <span aria-hidden="true"> *</span>}
        </label>
        <span className="mingu-focus-line" aria-hidden="true" />
      </div>
      {(hint || error) && (
        <p
          className={error ? "mingu-field-error" : "mingu-muted"}
          id={`${fieldId}-help`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
export interface SegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export function SegmentedControl({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  name,
  disabled,
}: {
  label: string;
  options: readonly SegmentOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}) {
  const id = useId(),
    reduced = useReducedMotion();
  const [selected, setSelected] = useControllable(
    value,
    defaultValue || options.find((item) => !item.disabled)?.value || "",
    onValueChange,
  );
  return (
    <fieldset className="mingu-segmented-field" disabled={disabled}>
      <legend className="mingu-visually-hidden">{label}</legend>
      <div className="mingu-segmented">
        {options.map((option) => (
          <label
            key={option.value}
            className="mingu-segment"
            data-selected={selected === option.value || undefined}
          >
            <input
              className="mingu-visually-hidden"
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
              disabled={option.disabled}
            />
            {selected === option.value && (
              <motion.span
                layoutId={`segment-${id}`}
                className="mingu-segment-indicator"
                transition={reduced ? { duration: 0 } : selectionSpring}
              />
            )}
            <span className="mingu-segment-label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function InteractiveCard({
  effect = "spotlight",
  className = "",
  onPointerMove,
  onPointerLeave,
  ...props
}: HTMLAttributes<HTMLDivElement> & { effect?: "spotlight" | "tilt" }) {
  return (
    <div
      {...props}
      className={`mingu-card mingu-interactive-card ${className}`}
      data-effect={effect}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (
          event.defaultPrevented ||
          event.pointerType === "touch" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(
            0,
            Math.min(1, (event.clientX - rect.left) / rect.width),
          ),
          y = Math.max(
            0,
            Math.min(1, (event.clientY - rect.top) / rect.height),
          );
        const style = event.currentTarget.style;
        style.setProperty("--mingu-pointer-x", `${x * 100}%`);
        style.setProperty("--mingu-pointer-y", `${y * 100}%`);
        style.setProperty(
          "--mingu-tilt-x",
          `${(y - 0.5) * -2 * pointerMotion.tilt}deg`,
        );
        style.setProperty(
          "--mingu-tilt-y",
          `${(x - 0.5) * 2 * pointerMotion.tilt}deg`,
        );
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        event.currentTarget.style.setProperty("--mingu-tilt-x", "0deg");
        event.currentTarget.style.setProperty("--mingu-tilt-y", "0deg");
      }}
    />
  );
}
