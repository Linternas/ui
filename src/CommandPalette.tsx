"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Dialog, Input } from "./system/base";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  keywords?: readonly string[];
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
}
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly CommandItem[];
  onSelect: (id: string) => void;
  title?: string;
  placeholder?: string;
  emptyLabel?: string;
  closeLabel?: string;
  /** Opt-in Cmd/Ctrl+K shortcut. Mount one shortcut owner per application. */
  shortcut?: boolean;
}
const normalize = (text: string) => text.normalize("NFKD").toLocaleLowerCase();
export function CommandPalette({
  open,
  onOpenChange,
  items,
  onSelect,
  title = "Commands",
  placeholder = "Search commands…",
  emptyLabel = "No commands found",
  closeLabel = "Close commands",
  shortcut = false,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const filtered = items.filter((item) =>
    terms.every((term) =>
      normalize(
        [item.label, item.description, ...(item.keywords ?? [])].join(" "),
      ).includes(term),
    ),
  );
  const enabled = filtered.filter((item) => !item.disabled);
  const chosen = enabled.find((item) => item.id === active) ?? enabled[0];
  const optionId = (item: CommandItem) => `${id}-option-${items.indexOf(item)}`;
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive("");
    }
  }, [open]);
  useEffect(() => {
    if (!shortcut) return;
    const keydown = (event: KeyboardEvent) => {
      if (
        event.isComposing ||
        event.repeat ||
        event.altKey ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      )
        return;
      if (!open && document.querySelector("dialog[open]")) return;
      event.preventDefault();
      onOpenChange(!open);
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [shortcut, open, onOpenChange]);
  useEffect(() => {
    if (!open || !chosen || !list.current) return;
    const item = document.getElementById(optionId(chosen));
    const ul = list.current;
    if (item && item.offsetTop < ul.scrollTop) ul.scrollTop = item.offsetTop;
    else if (
      item &&
      item.offsetTop + item.offsetHeight > ul.scrollTop + ul.clientHeight
    )
      ul.scrollTop = item.offsetTop + item.offsetHeight - ul.clientHeight;
  }, [open, chosen, id, items]);
  const choose = (item: CommandItem) => {
    if (item.disabled) return;
    onOpenChange(false);
    onSelect(item.id);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      closeLabel={closeLabel}
      initialFocus={input}
      className="mingu-command"
    >
      <Input
        ref={input}
        role="combobox"
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && chosen ? optionId(chosen) : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive("");
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Enter") {
            event.preventDefault();
            if (chosen) choose(chosen);
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (enabled.length)
              setActive(
                enabled[
                  (enabled.indexOf(chosen) +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    enabled.length) %
                    enabled.length
                ].id,
              );
          }
        }}
      />
      <ul
        ref={list}
        role="listbox"
        id={`${id}-list`}
        aria-label={title}
        className="mingu-command-list"
      >
        {filtered.map((item) => (
          <li
            key={item.id}
            id={optionId(item)}
            role="option"
            aria-selected={item === chosen}
            aria-disabled={item.disabled || undefined}
            onMouseDown={(event) => event.preventDefault()}
            onPointerMove={() => {
              if (!item.disabled) setActive(item.id);
            }}
            onClick={() => choose(item)}
          >
            {item.icon && (
              <span className="mingu-command-icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>
              <strong>{item.label}</strong>
              {item.description && <small>{item.description}</small>}
            </span>
            {item.shortcut && <kbd aria-hidden="true">{item.shortcut}</kbd>}
          </li>
        ))}
      </ul>
      {!filtered.length && (
        <p role="status" className="mingu-command-empty">
          {emptyLabel}
        </p>
      )}
      <footer className="mingu-command-footer">
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> Navigate
        </span>
        <span>
          <kbd>↵</kbd> Select
        </span>
        <span>
          <kbd>esc</kbd> Close
        </span>
      </footer>
    </Dialog>
  );
}
