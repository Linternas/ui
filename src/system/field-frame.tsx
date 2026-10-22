"use client";
import * as React from "react";
import type { ReactNode } from "react";

export interface FieldPresentation {
  label: string;
  hint?: string;
  error?: string;
}

export function fieldDescription(
  id: string,
  hint?: string,
  error?: string,
  external?: string,
) {
  return (
    [external, (error || hint) && `${id}-description`]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

/** Shared label/description layout; callers keep native control props and refs. */
export function FieldFrame({
  label,
  hint,
  error,
  id,
  required,
  className = "",
  children,
}: FieldPresentation & {
  id: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mingu-field ${className}`}
      data-invalid={!!error || undefined}
    >
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {(error || hint) && (
        <p
          id={`${id}-description`}
          className={error ? "mingu-field-error" : "mingu-muted"}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

/** Leading content is decorative; trailing actions must provide their own accessible name. */
export function InputShell({
  children,
  leading,
  trailing,
  size,
  disabled,
  readOnly,
  invalid,
}: {
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  size: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}) {
  return (
    <div
      className={`mingu-input-shell mingu-input-shell-${size}`}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
    >
      {leading != null && (
        <span className="mingu-input-leading" aria-hidden="true">
          {leading}
        </span>
      )}
      {children}
      {trailing != null && (
        <span className="mingu-input-trailing">{trailing}</span>
      )}
    </div>
  );
}
