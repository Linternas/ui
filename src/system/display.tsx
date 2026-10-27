"use client";
import { Icon as VectorIcon } from "../icons";

import * as React from "react";
import {
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { Button, type Tone } from "./base";

export function Heading({
  level = 2,
  size,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Tag
      {...props}
      className={`mingu-heading mingu-text-${size ?? (level === 1 ? "2xl" : level === 2 ? "xl" : "lg")} ${className}`}
    />
  );
}
export function Text({
  as = "p",
  muted,
  size = "md",
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "div";
  muted?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const Tag = as;
  return (
    <Tag
      {...props}
      className={`mingu-text mingu-text-${size} ${muted ? "mingu-muted" : ""} ${className}`}
    />
  );
}
export function LinkButton({
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  onClick,
  tabIndex,
  ...props
}: ComponentProps<"a"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  return (
    <a
      {...props}
      href={disabled ? undefined : props.href}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      className={`mingu-button mingu-button-${variant} mingu-control-${size} ${className}`}
    />
  );
}
export function IconButton({
  label,
  children,
  ...props
}: Omit<ComponentProps<typeof Button>, "aria-label"> & { label: string }) {
  return (
    <Button
      {...props}
      aria-label={label}
      className={`mingu-icon-button ${props.className ?? ""}`}
    >
      {children}
    </Button>
  );
}
export function ButtonGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="mingu-button-group">
      {children}
    </div>
  );
}
export function Spinner({
  label = "Loading",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { label?: string }) {
  return (
    <span {...props} role="status" className={`mingu-loading ${className}`}>
      <span className="mingu-spinner" aria-hidden="true" />
      <span className="mingu-visually-hidden">{label}</span>
    </span>
  );
}
export function Progress({
  label,
  value,
  max = 100,
  animated = true,
  ...props
}: Omit<ComponentProps<"progress">, "value" | "max" | "aria-label"> & {
  label: string;
  value?: number;
  max?: number;
  animated?: boolean;
}) {
  const id = useId();
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const bounded =
    value === undefined
      ? undefined
      : Math.min(limit, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div className="mingu-field">
      <div className="mingu-field-heading">
        <label htmlFor={id}>{label}</label>
        {bounded !== undefined && (
          <span>{Math.round((bounded / limit) * 100)}%</span>
        )}
      </div>
      <div
        className="mingu-progress-track"
        data-animated={animated || undefined}
        data-indeterminate={bounded === undefined || undefined}
        data-complete={bounded === limit || undefined}
      >
        <progress
          {...props}
          id={id}
          className={`mingu-progress-bar ${props.className ?? ""}`}
          max={limit}
          value={bounded}
        />
        {animated && (
          <span className="mingu-progress-visual" aria-hidden="true">
            <span
              className="mingu-progress-fill"
              style={{
                width:
                  bounded === undefined ? "40%" : `${(bounded / limit) * 100}%`,
              }}
            />
          </span>
        )}
      </div>
    </div>
  );
}
export function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState<string>();
  return (
    <span
      className={`mingu-avatar mingu-avatar-${size}`}
      role="img"
      aria-label={name}
    >
      {src && failed !== src ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        <span aria-hidden="true">
          {name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => Array.from(part)[0])
            .join("")
            .toLocaleUpperCase()}
        </span>
      )}
    </span>
  );
}
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mingu-empty">
      {icon && <div aria-hidden="true">{icon}</div>}
      <Heading level={3} size="md">
        {title}
      </Heading>
      {description && (
        <Text muted size="sm">
          {description}
        </Text>
      )}
      {action}
    </div>
  );
}
export function Table({
  caption,
  children,
  className = "",
  ...props
}: ComponentProps<"table"> & { caption: string }) {
  return (
    <div
      className="mingu-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table {...props} className={`mingu-table ${className}`}>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
export interface DataColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}
export function DataTable<T>({
  label,
  rows,
  columns,
  rowKey,
  emptyLabel = "No records",
  loading = false,
}: {
  label: string;
  rows: readonly T[];
  columns: readonly DataColumn<T>[];
  rowKey: (row: T) => string;
  emptyLabel?: string;
  loading?: boolean;
}) {
  const [sort, setSort] = useState<{
    key: string;
    direction: "ascending" | "descending";
  }>();
  const column = columns.find((item) => item.key === sort?.key);
  const sorted = column?.sortValue
    ? [...rows].sort((a, b) => {
        const av = column.sortValue!(a),
          bv = column.sortValue!(b);
        const result =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, {
                numeric: true,
              });
        return sort?.direction === "descending" ? -result : result;
      })
    : rows;
  return (
    <Table caption={label} aria-busy={loading || undefined}>
      <thead>
        <tr>
          {columns.map((item) => (
            <th
              key={item.key}
              scope="col"
              aria-sort={
                item.sortValue
                  ? sort?.key === item.key
                    ? sort.direction
                    : "none"
                  : undefined
              }
            >
              {item.sortValue ? (
                <button
                  type="button"
                  onClick={() =>
                    setSort({
                      key: item.key,
                      direction:
                        sort?.key === item.key && sort.direction === "ascending"
                          ? "descending"
                          : "ascending",
                    })
                  }
                >
                  {item.header}
                  <span aria-hidden="true">
                    {" "}
                    {sort?.key === item.key ? (
                      sort.direction === "ascending" ? (
                        <VectorIcon name="arrow-up" size="1em" />
                      ) : (
                        <VectorIcon name="arrow-down" size="1em" />
                      )
                    ) : (
                      <VectorIcon name="sort" size="1em" />
                    )}
                  </span>
                </button>
              ) : (
                item.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={columns.length}>
              <Spinner />
            </td>
          </tr>
        ) : sorted.length ? (
          sorted.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((item) => (
                <td key={item.key}>{item.cell(row)}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length}>
              <EmptyState title={emptyLabel} />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
export function Accordion({
  items,
  label = "Frequently asked questions",
}: {
  items: readonly {
    id: string;
    title: string;
    content: ReactNode;
    disabled?: boolean;
  }[];
  label?: string;
}) {
  const id = useId();
  return (
    <section className="mingu-accordion" aria-label={label}>
      {items.map((item) => (
        <details
          key={item.id}
          name={id}
          {...(item.disabled
            ? { onClick: (e: React.MouseEvent) => e.preventDefault() }
            : {})}
        >
          <summary
            aria-disabled={item.disabled || undefined}
            tabIndex={item.disabled ? -1 : undefined}
          >
            {item.title}
            <span aria-hidden="true">+</span>
          </summary>
          <div>{item.content}</div>
        </details>
      ))}
    </section>
  );
}
export function StatusDot({
  tone = "neutral",
  label,
}: {
  tone?: Tone;
  label: string;
}) {
  return (
    <span className={`mingu-status mingu-tone-${tone}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
}
