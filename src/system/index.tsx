"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type CSSProperties,
  type ComponentProps,
  type HTMLAttributes,
} from "react";
import { InteractionProvider } from "../shared";

const cx = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ");
export type Theme = "light" | "dark" | "system";
export type TokenOverrides = CSSProperties & {
  [key: `--mingu-${string}`]: string | number;
};

/** Scoped theme; does not write localStorage or change the document theme. */
export function DesignSystemProvider({
  theme = "system",
  children,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { theme?: Theme; style?: TokenOverrides }) {
  return (
    <InteractionProvider>
      <div
        {...props}
        data-mingu-theme={theme}
        className={cx("mingu-system", className)}
        style={style}
      >
        {children}
      </div>
    </InteractionProvider>
  );
}
export interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "mingu-button",
        `mingu-button-${variant}`,
        `mingu-control-${size}`,
        className,
      )}
    >
      {loading && <span className="mingu-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cx("mingu-input", className)} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cx("mingu-input", "mingu-textarea", className)}
    />
  );
}
export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={cx("mingu-input", className)} />;
}
export interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  hint?: string;
  error?: string;
}
export function TextField({
  label,
  hint,
  error,
  id,
  className,
  "aria-describedby": describedBy,
  ...props
}: TextFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const descriptionId = `${fieldId}-description`;
  return (
    <div className={cx("mingu-field", className)}>
      <label htmlFor={fieldId}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <Input
        {...props}
        id={fieldId}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [describedBy, (error || hint) && descriptionId]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {(error || hint) && (
        <p
          id={descriptionId}
          className={error ? "mingu-field-error" : "mingu-muted"}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
export function Checkbox({
  children,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type">) {
  return (
    <label className={cx("mingu-checkbox", className)}>
      <input {...props} type="checkbox" />
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
}: {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  const id = useId();
  const tabList = useRef<HTMLDivElement>(null);
  const enabled = items.filter((item) => !item.disabled);
  const selected = enabled.some((item) => item.value === value)
    ? value
    : enabled[0]?.value;
  return (
    <div className={cx("mingu-tabs", className)}>
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
              onValueChange(enabled[next].value);
              const targetIndex = items.findIndex(
                (tab) => tab.value === enabled[next].value,
              );
              tabList.current
                ?.querySelector<HTMLButtonElement>(
                  `[id="${id}-tab-${targetIndex}"]`,
                )
                ?.focus();
            }}
          >
            {item.label}
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
}
/** Native modal provides focus containment, Escape, and focus restoration. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel = "Close",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
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
        if (event.key !== "Tab") return;
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
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === dialog)
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      className="mingu-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => {
        if (open) onOpenChange(false);
      }}
    >
      <header className="mingu-dialog-header">
        <h2 id={`${id}-title`}>{title}</h2>
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          aria-label={closeLabel}
        >
          ×
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
