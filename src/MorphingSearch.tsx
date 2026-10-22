"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useControllable } from "./shared";
import { selectionSpring } from "./system/motion-tokens";

export interface MorphingSearchProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  label?: string;
  placeholder?: string;
  clearLabel?: string;
  closeLabel?: string;
  name?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
  className?: string;
}
const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    aria-hidden="true"
  >
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);
export function MorphingSearch({
  value,
  defaultValue = "",
  onValueChange,
  onSearch,
  label = "Search",
  placeholder = "Search anything…",
  clearLabel = "Clear search",
  closeLabel = "Close search",
  name = "q",
  disabled,
  defaultOpen = false,
  className = "",
}: MorphingSearchProps) {
  const [query, setQuery] = useControllable(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(defaultOpen);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const shouldFocus = useRef(false);
  const reduced = useReducedMotion();
  const id = useId();
  useEffect(() => {
    if (open && shouldFocus.current) {
      input.current?.focus({ preventScroll: true });
      shouldFocus.current = false;
    }
    if (!open && shouldFocus.current) {
      trigger.current?.focus({ preventScroll: true });
      shouldFocus.current = false;
    }
  }, [open]);
  const close = () => {
    shouldFocus.current = true;
    setOpen(false);
  };
  return (
    <motion.form
      role="search"
      aria-label={label}
      className={`mingu-morph-search ${className}`}
      data-open={open || undefined}
      initial={false}
      animate={{ width: open ? "100%" : "var(--mingu-control-height-md)" }}
      transition={reduced ? { duration: 0 } : selectionSpring}
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled) onSearch?.(query);
      }}
      onKeyDown={(event) => {
        if (open && event.key === "Escape" && !event.nativeEvent.isComposing) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      {open ? (
        <>
          <button
            type="submit"
            className="mingu-morph-icon"
            aria-label={label}
            disabled={disabled}
          >
            <SearchIcon />
          </button>
          <input
            ref={input}
            id={id}
            type="search"
            name={name}
            value={query}
            disabled={disabled}
            aria-label={label}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          {query && (
            <button
              type="button"
              className="mingu-morph-icon"
              aria-label={clearLabel}
              disabled={disabled}
              onClick={() => {
                setQuery("");
                input.current?.focus();
              }}
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="mingu-morph-icon"
            aria-label={closeLabel}
            disabled={disabled}
            onClick={close}
          >
            −
          </button>
        </>
      ) : (
        <>
          <button
            ref={trigger}
            type="button"
            className="mingu-morph-icon"
            aria-label={label}
            aria-expanded={false}
            disabled={disabled}
            onClick={() => {
              shouldFocus.current = true;
              setOpen(true);
            }}
          >
            <SearchIcon />
          </button>
          <input type="hidden" name={name} value={query} disabled={disabled} />
        </>
      )}
    </motion.form>
  );
}
