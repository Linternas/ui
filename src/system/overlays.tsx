"use client";
import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
  type HTMLAttributes,
} from "react";
import { Button, Dialog, type DialogProps, type Tone } from "./base";

/** Native popovers use the top layer, Escape and outside dismissal without portals. */
function usePopover() {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const position = () => {
    const anchor = trigger.current,
      popup = panel.current;
    if (!anchor || !popup) return;
    const rect = anchor.getBoundingClientRect();
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;
    popup.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - width - 8))}px`;
    popup.style.top = `${Math.max(8, rect.bottom + height + 8 > innerHeight ? rect.top - height - 8 : rect.bottom + 8)}px`;
  };
  useEffect(() => {
    if (!open) return;
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    const observer = new ResizeObserver(position);
    if (panel.current) observer.observe(panel.current);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      observer.disconnect();
    };
  }, [open]);
  const close = () => {
    panel.current?.hidePopover();
  };
  return { id, panel, trigger, open, setOpen, position, close };
}
export function Popover({
  trigger,
  children,
  label,
}: {
  trigger: string;
  children: ReactNode;
  label: string;
}) {
  const p = usePopover();
  return (
    <>
      <Button
        ref={p.trigger}
        variant="secondary"
        popoverTarget={p.id}
        aria-expanded={p.open}
        aria-controls={p.id}
      >
        {trigger}
      </Button>
      <div
        ref={p.panel}
        id={p.id}
        popover="auto"
        role="dialog"
        aria-label={label}
        className="mingu-popover"
        onToggle={(e) => {
          const opened = e.newState === "open";
          p.setOpen(opened);
          if (opened) {
            p.position();
            p.panel.current
              ?.querySelector<HTMLElement>(
                'button,input,select,textarea,a[href],[tabindex="0"]',
              )
              ?.focus();
          }
        }}
      >
        {children}
      </div>
    </>
  );
}
export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onSelect: () => void;
}
export function DropdownMenu({
  label,
  items,
}: {
  label: string;
  items: readonly MenuItem[];
}) {
  const p = usePopover();
  const first = useRef<"first" | "last">("first");
  const buttons = () =>
    Array.from(
      p.panel.current?.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ) ?? [],
    );
  return (
    <>
      <Button
        ref={p.trigger}
        variant="secondary"
        popoverTarget={p.id}
        aria-haspopup="menu"
        aria-expanded={p.open}
        aria-controls={p.id}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            first.current = e.key === "ArrowUp" ? "last" : "first";
            p.panel.current?.showPopover();
          }
        }}
      >
        {label} <span aria-hidden="true">⌄</span>
      </Button>
      <div
        id={p.id}
        ref={p.panel}
        popover="auto"
        className="mingu-popover mingu-menu"
        role="menu"
        aria-label={label}
        onToggle={(e) => {
          p.setOpen(e.newState === "open");
          if (e.newState === "open") {
            p.position();
            const list = buttons();
            list[first.current === "last" ? list.length - 1 : 0]?.focus();
            first.current = "first";
          }
        }}
        onKeyDown={(e) => {
          const list = buttons();
          const i = list.indexOf(document.activeElement as HTMLButtonElement);
          let next = -1;
          if (e.key === "ArrowDown") next = (i + 1) % list.length;
          if (e.key === "ArrowUp") next = (i - 1 + list.length) % list.length;
          if (e.key === "Home") next = 0;
          if (e.key === "End") next = list.length - 1;
          if (next >= 0) {
            e.preventDefault();
            list[next]?.focus();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            p.close();
            p.trigger.current?.focus();
          }
          if (e.key === "Tab") {
            p.close();
          }
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            tabIndex={-1}
            data-danger={item.danger || undefined}
            onClick={() => {
              p.close();
              p.trigger.current?.focus();
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}) {
  const id = useId();
  const panel = useRef<HTMLSpanElement>(null);
  const host = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const close = () => {
    clearTimeout(timer.current);
    panel.current?.hidePopover();
  };
  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const p = panel.current,
        anchor = host.current;
      if (!p || !anchor) return;
      p.showPopover();
      const rect = anchor.getBoundingClientRect();
      p.style.left = `${Math.max(8, Math.min(rect.left + (rect.width - p.offsetWidth) / 2, innerWidth - p.offsetWidth - 8))}px`;
      p.style.top = `${Math.max(8, rect.top - p.offsetHeight - 8)}px`;
    }, 150);
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const scroll = () => {
      // Focusing an offscreen trigger scrolls it into view before the delayed tooltip opens.
      if (host.current?.contains(document.activeElement)) show();
      else close();
    };
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, true);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll, true);
    };
  }, []);
  return (
    <span
      ref={host}
      className="mingu-tooltip-host"
      onMouseEnter={show}
      onMouseLeave={close}
      onFocus={show}
      onBlur={close}
    >
      {cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], id]
          .filter(Boolean)
          .join(" "),
      })}
      <span
        ref={panel}
        id={id}
        role="tooltip"
        popover="manual"
        className="mingu-tooltip"
      >
        {content}
      </span>
    </span>
  );
}
export function Drawer(props: DialogProps & { side?: "left" | "right" }) {
  const { side = "right", ...rest } = props;
  return <Dialog {...rest} className={`mingu-drawer mingu-drawer-${side}`} />;
}
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  danger = false,
  busy = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  danger?: boolean;
  busy?: boolean;
}) {
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      initialFocus={cancel}
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
      title={title}
      description={description}
      role="alertdialog"
    >
      <div className="mingu-dialog-actions">
        <Button
          ref={cancel}
          variant="secondary"
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          loading={busy}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: Tone;
}
export function ToastRegion({
  messages,
  onDismiss,
  label = "Notifications",
}: {
  messages: readonly ToastMessage[];
  onDismiss: (id: string) => void;
  label?: string;
}) {
  return (
    <section aria-label={label} className="mingu-toast-region">
      <div className="mingu-visually-hidden" role="status" aria-atomic="true">
        {messages
          .map(
            (item) =>
              `${item.title}${item.description ? ": " + item.description : ""}`,
          )
          .join(". ")}
      </div>
      {messages.map((item) => (
        <div
          key={item.id}
          className={`mingu-toast mingu-tone-${item.tone ?? "neutral"}`}
        >
          <div>
            <strong>{item.title}</strong>
            {item.description && <p>{item.description}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Dismiss ${item.title}`}
            onClick={() => onDismiss(item.id)}
          >
            ×
          </Button>
        </div>
      ))}
    </section>
  );
}
