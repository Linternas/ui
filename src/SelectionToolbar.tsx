"use client";
import * as React from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./system/base";
export interface SelectionAction {
  id: string;
  label: string;
  onSelect: (text: string, range: Range) => void | Promise<void>;
}
export interface SelectionToolbarProps {
  children: ReactNode;
  actions?: readonly SelectionAction[];
  label?: string;
  className?: string;
}
export function SelectionToolbar({
  children,
  actions = [],
  label = "Selected text actions",
  className = "",
}: SelectionToolbarProps) {
  const root = useRef<HTMLDivElement>(null),
    toolbar = useRef<HTMLDivElement>(null),
    selection = useRef<{ text: string; range: Range } | null>(null);
  const [active, setActive] = useState(0);
  const alive = useRef(true);
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [position, setPosition] = useState({ left: 0, top: 0 });
  useEffect(() => {
    alive.current = true;
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = window.getSelection();
        const content = root.current;
        if (
          !current ||
          current.isCollapsed ||
          !current.rangeCount ||
          !content?.contains(current.anchorNode) ||
          !content.contains(current.focusNode)
        ) {
          if (!toolbar.current?.contains(document.activeElement))
            setOpen(false);
          return;
        }
        const range = current.getRangeAt(0).cloneRange(),
          text = current.toString().trim();
        if (!text || !(range.commonAncestorContainer instanceof Node)) {
          setOpen(false);
          return;
        }
        selection.current = { text, range };
        const box = range.getBoundingClientRect();
        const width = toolbar.current?.offsetWidth ?? 200,
          height = toolbar.current?.offsetHeight ?? 48;
        setPosition({
          left: Math.max(
            8,
            Math.min(
              innerWidth - width - 8,
              box.left + box.width / 2 - width / 2,
            ),
          ),
          top: Math.max(
            8,
            box.top > height + 16
              ? box.top - height - 8
              : Math.min(innerHeight - height - 8, box.bottom + 8),
          ),
        });
        setOpen(true);
        setMessage("");
      });
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        if (toolbar.current?.contains(document.activeElement)) {
          root.current?.focus({ preventScroll: true });
        }
      }
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("selectionchange", refresh);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      alive.current = false;
      cancelAnimationFrame(frame);
      document.removeEventListener("selectionchange", refresh);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, []);
  useEffect(() => {
    const popup = toolbar.current;
    if (!popup) return;
    if (open) {
      popup.showPopover();
      setActive(0);
      const box = popup.getBoundingClientRect();
      setPosition((p) => ({
        left: Math.max(8, Math.min(innerWidth - box.width - 8, p.left)),
        top: Math.max(8, Math.min(innerHeight - box.height - 8, p.top)),
      }));
    } else if (popup.matches(":popover-open")) popup.hidePopover();
  }, [open]);
  const run = async (action?: SelectionAction) => {
    const current = selection.current;
    if (!current || busy) return;
    setBusy(true);
    try {
      if (action)
        await action.onSelect(current.text, current.range.cloneRange());
      else await navigator.clipboard.writeText(current.text);
      if (alive.current)
        setMessage(action ? `${action.label} complete` : "Text copied");
    } catch {
      if (alive.current) setMessage("Action failed. Try again.");
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return (
    <div className={`mingu-selection ${className}`} ref={root} tabIndex={-1}>
      {children}
      <div
        ref={toolbar}
        popover="manual"
        role="toolbar"
        aria-label={label}
        aria-busy={busy || undefined}
        className="mingu-selection-toolbar"
        style={{ left: position.left, top: position.top }}
        onPointerDown={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const buttons = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          );
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? buttons.length - 1
                : (index +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    buttons.length) %
                  buttons.length;
          buttons[next]?.focus();
        }}
      >
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          tabIndex={active === 0 ? 0 : -1}
          onFocus={() => setActive(0)}
          onClick={() => void run()}
        >
          Copy
        </Button>
        {actions.map((action, index) => (
          <Button
            key={action.id}
            size="sm"
            variant="ghost"
            disabled={busy}
            tabIndex={active === index + 1 ? 0 : -1}
            onFocus={() => setActive(index + 1)}
            onClick={() => void run(action)}
          >
            {action.label}
          </Button>
        ))}
        <span className="mingu-selection-message" role="status">
          {message}
        </span>
      </div>
    </div>
  );
}
