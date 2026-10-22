"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./system/base";
import { selectionSpring, mobileMotion } from "./system/motion-tokens";
import {
  nativeTouchTarget,
  useTouchAction,
  type TouchAction,
} from "./mobile-shared";
export interface SwipeActionsProps {
  label: string;
  children: ReactNode;
  startActions?: readonly TouchAction[];
  endActions?: readonly TouchAction[];
  disabled?: boolean;
  actionsLabel?: string;
  closeLabel?: string;
  errorMessage?: string;
  className?: string;
}
export function SwipeActions({
  label,
  children,
  startActions = [],
  endActions = [],
  disabled = false,
  actionsLabel = "Actions",
  closeLabel = "Close actions",
  errorMessage = "Action failed. Try again.",
  className = "",
}: SwipeActionsProps) {
  const root = useRef<HTMLDivElement>(null),
    startPanel = useRef<HTMLDivElement>(null),
    endPanel = useRef<HTMLDivElement>(null),
    id = useId(),
    reduced = useReducedMotion();
  const [widths, setWidths] = useState({ start: 0, end: 0 }),
    [side, setSide] = useState<"start" | "end" | null>(null),
    [dragX, setDragX] = useState<number | null>(null);
  const drag = useRef<{
      id: number;
      x: number;
      y: number;
      base: number;
      locked: boolean;
    } | null>(null),
    suppress = useRef(false);
  const action = useTouchAction(errorMessage);
  const offset = disabled
    ? 0
    : side === "start"
      ? widths.start
      : side === "end"
        ? -widths.end
        : 0;
  useEffect(() => {
    const resize = () =>
      setWidths({
        start: startPanel.current?.offsetWidth ?? 0,
        end: endPanel.current?.offsetWidth ?? 0,
      });
    const observer = new ResizeObserver(resize);
    if (startPanel.current) observer.observe(startPanel.current);
    if (endPanel.current) observer.observe(endPanel.current);
    resize();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (disabled) {
      drag.current = null;
      setDragX(null);
      setSide(null);
    }
  }, [disabled]);
  useEffect(() => {
    if (!side) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setSide(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [side]);
  const cancel = () => {
    drag.current = null;
    setDragX(null);
  };
  const panel = (
    actions: readonly TouchAction[],
    position: "start" | "end",
  ) => (
    <div
      ref={position === "start" ? startPanel : endPanel}
      className={`mingu-swipe-options mingu-swipe-${position}`}
      id={`${id}-${position}`}
      inert={side !== position || disabled || undefined}
      aria-hidden={side !== position || disabled}
    >
      {actions.map((item) => (
        <Button
          key={item.id}
          variant={item.danger ? "danger" : "secondary"}
          icon={item.icon}
          disabled={disabled || item.disabled || !!action.pending}
          loading={action.pending === item.id}
          onClick={async (event) => {
            const restore = event.currentTarget === document.activeElement;
            if (await action.run(item)) {
              setSide(null);
              if (restore)
                requestAnimationFrame(() =>
                  root.current
                    ?.querySelector<HTMLButtonElement>(".mingu-swipe-toggle")
                    ?.focus(),
                );
            }
          }}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
  return (
    <div
      ref={root}
      className={`mingu-swipe ${className}`}
      role="group"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          cancel();
          setSide(null);
          root.current
            ?.querySelector<HTMLButtonElement>(".mingu-swipe-toggle")
            ?.focus();
        }
      }}
    >
      <div className="mingu-swipe-viewport">
        {panel(startActions, "start")}
        {panel(endActions, "end")}
        <motion.div
          className="mingu-swipe-content"
          animate={{ x: dragX ?? offset }}
          transition={
            reduced || dragX !== null ? { duration: 0 } : selectionSpring
          }
          onPointerDown={(event) => {
            suppress.current = false;
            if (!event.isPrimary) {
              cancel();
              return;
            }
            if (
              event.button !== 0 ||
              disabled ||
              action.pending ||
              (event.target as Element).closest(nativeTouchTarget)
            )
              return;
            drag.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              base: offset,
              locked: false,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start || start.id !== event.pointerId) return;
            const dx = event.clientX - start.x,
              dy = event.clientY - start.y;
            if (!start.locked) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) < mobileMotion.axisSlop)
                return;
              if (Math.abs(dy) > Math.abs(dx)) {
                cancel();
                return;
              }
              start.locked = true;
              suppress.current = true;
            }
            event.preventDefault();
            setDragX(
              Math.max(-widths.end, Math.min(widths.start, start.base + dx)),
            );
          }}
          onPointerUp={(event) => {
            const start = drag.current;
            if (!start || start.id !== event.pointerId) return;
            const final = Math.max(
              -widths.end,
              Math.min(widths.start, start.base + event.clientX - start.x),
            );
            if (start.locked)
              setSide(
                final > widths.start * mobileMotion.swipeRatio &&
                  widths.start > 0
                  ? "start"
                  : final < -widths.end * mobileMotion.swipeRatio &&
                      widths.end > 0
                    ? "end"
                    : null,
              );
            cancel();
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={cancel}
          onLostPointerCapture={cancel}
          onFocusCapture={() => setSide(null)}
          onClickCapture={(event) => {
            if (suppress.current) {
              suppress.current = false;
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <div className="mingu-swipe-body">{children}</div>
        </motion.div>
      </div>
      <div className="mingu-swipe-footer">
        <Button
          className="mingu-swipe-toggle"
          variant="ghost"
          size="sm"
          disabled={
            disabled ||
            !!action.pending ||
            (!startActions.length && !endActions.length)
          }
          aria-expanded={side !== null}
          aria-controls={`${id}-start ${id}-end`}
          onClick={() =>
            setSide(side ? null : endActions.length ? "end" : "start")
          }
        >
          {side ? closeLabel : actionsLabel}
          <span aria-hidden="true">{side ? "×" : "↔"}</span>
        </Button>
        {startActions.length > 0 && endActions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || !!action.pending}
            onClick={() => setSide(side === "start" ? "end" : "start")}
            aria-label="Show other actions"
          >
            ⇄
          </Button>
        )}
      </div>
      {action.error && (
        <p className="mingu-field-error" role="alert">
          {action.error}
        </p>
      )}
    </div>
  );
}
