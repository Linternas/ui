"use client";
import * as React from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./system/base";
import { BottomSheet } from "./BottomSheet";
import {
  nativeTouchTarget,
  useTouchAction,
  type TouchAction,
} from "./mobile-shared";
import { mobileMotion } from "./system/motion-tokens";
export interface LongPressMenuProps {
  label: string;
  children: ReactNode;
  actions: readonly TouchAction[];
  disabled?: boolean;
  delay?: number;
  triggerLabel?: string;
  description?: string;
  errorMessage?: string;
  className?: string;
}
export function LongPressMenu({
  label,
  children,
  actions,
  disabled = false,
  delay = 500,
  triggerLabel = "Actions",
  description = "Choose an action",
  errorMessage = "Action failed. Try again.",
  className = "",
}: LongPressMenuProps) {
  const [open, setOpen] = useState(false),
    [pressing, setPressing] = useState(false),
    trigger = useRef<HTMLButtonElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    pointer = useRef<{ id: number; x: number; y: number } | null>(null),
    suppress = useRef(false);
  const action = useTouchAction(errorMessage),
    unavailable = disabled || actions.length === 0;
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pointer.current = null;
    setPressing(false);
  };
  const show = () => {
    if (unavailable) return;
    cancel();
    action.clearError();
    trigger.current?.focus({ preventScroll: true });
    setOpen(true);
  };
  useEffect(() => {
    const stop = () => cancel();
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);
  useEffect(() => {
    if (unavailable) {
      cancel();
      setOpen(false);
    }
  }, [unavailable]);
  return (
    <div className={`mingu-long-press ${className}`}>
      <div
        className="mingu-long-surface"
        data-pressing={pressing || undefined}
        onPointerDown={(event) => {
          suppress.current = false;
          if (!event.isPrimary) {
            cancel();
            return;
          }
          if (
            unavailable ||
            event.button !== 0 ||
            (event.target as Element).closest(nativeTouchTarget)
          )
            return;
          cancel();
          pointer.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
          };
          setPressing(true);
          timer.current = setTimeout(
            () => {
              suppress.current = true;
              show();
            },
            Math.max(350, Math.min(1500, Number.isFinite(delay) ? delay : 500)),
          );
        }}
        onPointerMove={(event) => {
          const start = pointer.current;
          if (
            start &&
            start.id === event.pointerId &&
            Math.hypot(event.clientX - start.x, event.clientY - start.y) >
              mobileMotion.longPressSlop
          )
            cancel();
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onClickCapture={(event) => {
          if (suppress.current) {
            suppress.current = false;
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onContextMenu={(event) => {
          if (
            unavailable ||
            (event.target as Element).closest(nativeTouchTarget)
          )
            return;
          event.preventDefault();
          show();
        }}
      >
        {children}
      </div>
      <Button
        ref={trigger}
        variant="ghost"
        size="sm"
        disabled={unavailable}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
      >
        {triggerLabel}
        <span aria-hidden="true">•••</span>
      </Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        description={description}
        defaultSnap={0}
        snapPoints={[0.45, 0.7]}
        className="mingu-long-sheet"
      >
        <div className="mingu-long-actions">
          {actions.map((item) => (
            <Button
              key={item.id}
              variant={item.danger ? "danger" : "secondary"}
              icon={item.icon}
              disabled={unavailable || item.disabled || !!action.pending}
              loading={action.pending === item.id}
              onClick={async () => {
                if (await action.run(item)) setOpen(false);
              }}
            >
              {item.label}
            </Button>
          ))}
          {action.error && (
            <p role="alert" className="mingu-field-error">
              {action.error}
            </p>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
