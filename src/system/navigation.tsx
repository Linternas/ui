"use client";
import type { ReactNode, ComponentProps } from "react";
import { Button } from "./base";
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
}: {
  items: readonly BreadcrumbItem[];
  label?: string;
}) {
  return (
    <nav aria-label={label} className="mingu-breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href && index < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Pagination({
  page,
  pageCount,
  onPageChange,
  label = "Pagination",
  disabled = false,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
  disabled?: boolean;
}) {
  const count = Number.isFinite(pageCount)
    ? Math.max(1, Math.floor(pageCount))
    : 1;
  const current = Math.min(
    count,
    Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1,
  );
  const candidates = [1, current - 1, current, current + 1, count].filter(
    (n) => n >= 1 && n <= count,
  );
  const pages = Array.from(new Set(candidates)).sort((a, b) => a - b);
  return (
    <nav aria-label={label} className="mingu-pagination">
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || current === 1}
        aria-label="Previous page"
        onClick={() => onPageChange(current - 1)}
      >
        ←
      </Button>
      {pages.map((n, index) => (
        <span key={n}>
          {index > 0 && n - (pages[index - 1] ?? n) > 1 && (
            <span aria-hidden="true" className="mingu-pagination-gap">
              …
            </span>
          )}
          <Button
            variant={n === current ? "primary" : "ghost"}
            size="sm"
            disabled={disabled}
            aria-label={`Page ${n}`}
            aria-current={n === current ? "page" : undefined}
            onClick={() => onPageChange(n)}
          >
            {n}
          </Button>
        </span>
      ))}
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || current === count}
        aria-label="Next page"
        onClick={() => onPageChange(current + 1)}
      >
        →
      </Button>
    </nav>
  );
}
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  disabled?: boolean;
}
export function Navigation({
  items,
  activeId,
  label = "Main navigation",
  orientation = "horizontal",
}: {
  items: readonly NavItem[];
  activeId?: string;
  label?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <nav
      aria-label={label}
      className={`mingu-navigation mingu-navigation-${orientation}`}
    >
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.disabled ? undefined : item.href}
              tabIndex={item.disabled ? -1 : undefined}
              aria-disabled={item.disabled || undefined}
              aria-current={item.id === activeId ? "page" : undefined}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
export function Sidebar({
  label = "Sidebar",
  children,
  className = "",
  ...props
}: ComponentProps<"aside"> & { label?: string }) {
  return (
    <aside
      {...props}
      aria-label={label}
      className={`mingu-sidebar ${className}`}
    >
      {children}
    </aside>
  );
}
