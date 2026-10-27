"use client";
import { Icon as VectorIcon } from "../icons";

import * as React from "react";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type CSSProperties,
  type ComponentProps,
  type HTMLAttributes,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { selectionSpring, pointerMotion } from "./motion-tokens";
import { InteractionProvider } from "../shared";
import { FieldFrame, InputShell, fieldDescription } from "./field-frame";

const cx = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ");
export type Theme = "light" | "dark" | "system";
export type TokenOverrides = CSSProperties & {
  [key: `--mingu-${string}`]: string | number;
};

/** Scoped theme; does not write localStorage or change the document theme. */
export function DesignSystemProvider({
  theme = "system",
  accent = "brand",
  children,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  theme?: Theme;
  accent?: "brand" | "neutral";
  style?: TokenOverrides;
}) {
  return (
    <InteractionProvider>
      <div
        {...props}
        data-mingu-theme={theme}
        data-mingu-accent={accent}
        className={cx("mingu-system", className)}
        style={style}
      >
        {children}
      </div>
    </InteractionProvider>
  );
}
export interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  interaction?: "press" | "magnetic" | "ripple" | "shine" | "none";
  status?: "idle" | "success" | "error";
  icon?: ReactNode;
}
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  interaction = "press",
  status = "idle",
  icon,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onKeyDown,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number; size: number }[]
  >([]);
  const sequence = useRef(0);
  const addRipple = (
    element: HTMLButtonElement,
    clientX?: number,
    clientY?: number,
  ) => {
    if (
      interaction !== "ripple" ||
      disabled ||
      loading ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const rect = element.getBoundingClientRect();
    const size = Math.hypot(rect.width, rect.height) * 2;
    setRipples((items) => [
      ...items.slice(-3),
      {
        id: ++sequence.current,
        x: clientX === undefined ? rect.width / 2 : clientX - rect.left,
        y: clientY === undefined ? rect.height / 2 : clientY - rect.top,
        size,
      },
    ]);
  };
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-interaction={interaction}
      data-status={loading ? "loading" : status}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (
          event.defaultPrevented ||
          interaction !== "magnetic" ||
          disabled ||
          loading ||
          event.pointerType === "touch" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--mingu-magnet-x",
          `${Math.max(-pointerMotion.magnetX, Math.min(pointerMotion.magnetX, (event.clientX - rect.left - rect.width / 2) * pointerMotion.pull))}px`,
        );
        event.currentTarget.style.setProperty(
          "--mingu-magnet-y",
          `${Math.max(-pointerMotion.magnetY, Math.min(pointerMotion.magnetY, (event.clientY - rect.top - rect.height / 2) * pointerMotion.pull))}px`,
        );
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        event.currentTarget.style.setProperty("--mingu-magnet-x", "0px");
        event.currentTarget.style.setProperty("--mingu-magnet-y", "0px");
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented && event.button === 0)
          addRipple(event.currentTarget, event.clientX, event.clientY);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          !event.repeat &&
          (event.key === "Enter" || event.key === " ")
        )
          addRipple(event.currentTarget);
      }}
      className={cx(
        "mingu-button",
        `mingu-button-${variant}`,
        `mingu-control-${size}`,
        className,
      )}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="mingu-button-ripple"
          aria-hidden="true"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
          onAnimationEnd={() =>
            setRipples((items) => items.filter((item) => item.id !== ripple.id))
          }
        />
      ))}
      {(loading || status !== "idle" || icon != null) && (
        <span className="mingu-button-state" aria-hidden="true">
          {loading ? (
            <span className="mingu-spinner" />
          ) : status === "idle" ? (
            icon
          ) : (
            <svg key={status} viewBox="0 0 20 20" fill="none">
              <path
                className="mingu-state-path"
                pathLength="1"
                d={
                  status === "success" ? "M4 10l4 4 8-8" : "M6 6l8 8M14 6l-8 8"
                }
              />
            </svg>
          )}
        </span>
      )}
      <span className="mingu-button-content">{children}</span>
    </button>
  );
}
export function Input({
  className,
  controlSize = "md",
  ...props
}: ComponentProps<"input"> & { controlSize?: "sm" | "md" | "lg" }) {
  return (
    <input
      {...props}
      className={cx("mingu-input", `mingu-input-${controlSize}`, className)}
    />
  );
}
export function Textarea({
  className,
  controlSize = "md",
  ...props
}: ComponentProps<"textarea"> & { controlSize?: "sm" | "md" | "lg" }) {
  return (
    <textarea
      {...props}
      className={cx(
        "mingu-input",
        "mingu-textarea",
        `mingu-input-${controlSize}`,
        className,
      )}
    />
  );
}
export function Select({
  className,
  controlSize = "md",
  ...props
}: ComponentProps<"select"> & { controlSize?: "sm" | "md" | "lg" }) {
  return (
    <select
      {...props}
      className={cx(
        "mingu-input",
        "mingu-select",
        `mingu-input-${controlSize}`,
        className,
      )}
    />
  );
}
export interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  hint?: string;
  controlSize?: "sm" | "md" | "lg";
  error?: string;
  /** Decorative leading icon or text. Use hint for information required to understand the value. */
  leading?: ReactNode;
  /** Suffix text or an action with its own accessible name. */
  trailing?: ReactNode;
}
export function TextField({
  label,
  hint,
  error,
  id,
  className,
  leading,
  trailing,
  controlSize = "md",
  "aria-describedby": describedBy,
  ...props
}: TextFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const invalid = error ? true : props["aria-invalid"];
  return (
    <FieldFrame
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      className={className}
    >
      <InputShell
        size={controlSize}
        leading={leading}
        trailing={trailing}
        disabled={props.disabled}
        readOnly={props.readOnly}
        invalid={invalid === true || invalid === "true"}
      >
        <Input
          {...props}
          controlSize={controlSize}
          id={fieldId}
          aria-invalid={invalid}
          aria-describedby={fieldDescription(fieldId, hint, error, describedBy)}
        />
      </InputShell>
    </FieldFrame>
  );
}
export function Checkbox({
  children,
  className,
  indeterminate = false,
  ref,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { indeterminate?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={cx("mingu-checkbox", className)}>
      <input {...props} type="checkbox" ref={inputRef} />
      <span>{children}</span>
    </label>
  );
}
export function Switch({
  children,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type" | "role">) {
  return (
    <label className={cx("mingu-switch", className)}>
      <input {...props} type="checkbox" role="switch" />
      <span aria-hidden="true" className="mingu-switch-track" />
      <span>{children}</span>
    </label>
  );
}
export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";
export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      {...props}
      className={cx("mingu-badge", `mingu-tone-${tone}`, className)}
    />
  );
}
export function Alert({
  tone = "neutral",
  title,
  children,
  className,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  tone?: Tone;
  title?: ReactNode;
}) {
  return (
    <div
      {...props}
      className={cx("mingu-alert", `mingu-tone-${tone}`, className)}
    >
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </div>
  );
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("mingu-card", className)} />;
}
export function Container({
  reading,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { reading?: boolean }) {
  return (
    <div
      {...props}
      className={cx(
        "mingu-container",
        reading && "mingu-container-reading",
        className,
      )}
    />
  );
}
export type Space = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12 | 16;
export function Stack({
  direction = "column",
  gap = 4,
  align = "stretch",
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  direction?: "row" | "column";
  gap?: Space;
  align?: "start" | "center" | "end" | "stretch";
}) {
  return (
    <div
      {...props}
      className={cx("mingu-stack", className)}
      style={{
        flexDirection: direction,
        flexWrap: direction === "row" ? "wrap" : "nowrap",
        gap: `var(--mingu-space-${gap})`,
        alignItems:
          align === "start"
            ? "flex-start"
            : align === "end"
              ? "flex-end"
              : align,
        ...style,
      }}
    />
  );
}
export function Grid({
  min = "16rem",
  gap = 4,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { min?: string; gap?: Space }) {
  return (
    <div
      {...props}
      className={cx("mingu-grid", className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}), 1fr))`,
        gap: `var(--mingu-space-${gap})`,
        ...style,
      }}
    />
  );
}
export function Separator({ className, ...props }: ComponentProps<"hr">) {
  return <hr {...props} className={cx("mingu-separator", className)} />;
}
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cx("mingu-skeleton", className)}
    />
  );
}

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}
export function Tabs({
  items,
  value,
  onValueChange,
  label,
  className,
  animated = false,
}: {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  className?: string;
  animated?: boolean;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const tabList = useRef<HTMLDivElement>(null);
  const enabled = items.filter((item) => !item.disabled);
  const selected = enabled.some((item) => item.value === value)
    ? value
    : enabled[0]?.value;
  return (
    <div
      className={cx("mingu-tabs", className)}
      data-animated={animated || undefined}
    >
      <div
        ref={tabList}
        role="tablist"
        aria-label={label}
        className="mingu-tablist"
      >
        {items.map((item, index) => (
          <button
            type="button"
            key={item.value}
            id={`${id}-tab-${index}`}
            role="tab"
            aria-selected={item.value === selected}
            aria-controls={`${id}-panel-${index}`}
            disabled={item.disabled}
            tabIndex={item.value === selected ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => {
              const current = enabled.findIndex(
                (tab) => tab.value === item.value,
              );
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? enabled.length - 1
                    : event.key === "ArrowRight"
                      ? (current + 1) % enabled.length
                      : event.key === "ArrowLeft"
                        ? (current - 1 + enabled.length) % enabled.length
                        : -1;
              if (next < 0 || !enabled[next]) return;
              event.preventDefault();
              const nextTab = enabled[next];
              if (!nextTab) return;
              onValueChange(nextTab.value);
              const targetIndex = items.findIndex(
                (tab) => tab.value === nextTab.value,
              );
              tabList.current
                ?.querySelector<HTMLButtonElement>(
                  `[id="${id}-tab-${targetIndex}"]`,
                )
                ?.focus();
            }}
          >
            {animated && item.value === selected && (
              <motion.span
                className="mingu-tab-indicator"
                layoutId={`tab-${id}`}
                transition={reduced ? { duration: 0 } : selectionSpring}
              />
            )}
            <span className="mingu-tab-label">{item.label}</span>
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={item.value !== selected}
          tabIndex={0}
          className="mingu-tabpanel"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  closeLabel?: string;
  className?: string;
  role?: "dialog" | "alertdialog";
  initialFocus?: RefObject<HTMLElement | null>;
  motionOrigin?: RefObject<HTMLElement | null>;
  motion?: "scale" | "bottom";
  onKeyDown?: React.KeyboardEventHandler<HTMLDialogElement>;
}
/** Native modal provides focus containment, Escape, and focus restoration. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel = "Close",
  className = "",
  role = "dialog",
  initialFocus,
  motionOrigin,
  motion: surfaceMotion,
  onKeyDown,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    let animation: Animation | undefined;
    const transform = () => {
      const origin = motionOrigin?.current?.getBoundingClientRect();
      const destination = dialog.getBoundingClientRect();
      if (origin && origin.width && destination.width)
        return `translate(${origin.left + origin.width / 2 - destination.left - destination.width / 2}px, ${origin.top + origin.height / 2 - destination.top - destination.height / 2}px) scale(${origin.width / destination.width}, ${origin.height / destination.height})`;
      return surfaceMotion === "bottom" ? "translateY(100%)" : "scale(.96)";
    };
    const animated = !reduced && (motionOrigin || surfaceMotion);
    const options = {
      duration:
        parseFloat(
          getComputedStyle(dialog).getPropertyValue("--mingu-duration-panel"),
        ) || 220,
      easing: "cubic-bezier(.2,.7,.2,1)",
    };
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocus?.current?.focus();
      if (animated)
        animation = dialog.animate(
          [
            { transform: transform(), opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          options,
        );
    }
    if (!open && dialog.open) {
      if (animated) {
        animation = dialog.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: transform(), opacity: 0 },
          ],
          options,
        );
        animation.finished.then(
          () => dialog.close(),
          () => {},
        );
      } else dialog.close();
    }
    return () => animation?.cancel();
  }, [open, initialFocus, motionOrigin, surfaceMotion, reduced]);
  useEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      onKeyDown={(event) => {
        if ((event.target as Element).closest("dialog") !== event.currentTarget)
          return;
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== "Tab") return;
        const dialog = event.currentTarget;
        const targets = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            "button, a[href], input, select, textarea, [tabindex]",
          ),
        ).filter(
          (el) =>
            !el.matches(":disabled") &&
            el.tabIndex >= 0 &&
            el.getClientRects().length > 0,
        );
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (!first) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === dialog)
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      className={`mingu-dialog ${className}`}
      role={role}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={(event) => {
        if (event.target !== event.currentTarget) return;
        // A queued close event can arrive after a rapid reopen.
        if (open && !event.currentTarget.open) onOpenChange(false);
      }}
    >
      <header className="mingu-dialog-header">
        <h2 id={`${id}-title`}>{title}</h2>
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          aria-label={closeLabel}
        >
          <VectorIcon name="close" size={20} />
        </Button>
      </header>
      {description && (
        <p id={`${id}-description`} className="mingu-muted">
          {description}
        </p>
      )}
      <div className="mingu-dialog-body">{children}</div>
    </dialog>
  );
}
