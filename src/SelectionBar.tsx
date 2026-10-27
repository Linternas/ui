"use client";
import { Icon as VectorIcon } from "./icons";

import * as React from "react";
import { useEffect, useRef, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./system/base";
import { selectionSpring } from "./system/motion-tokens";
import { useTouchAction, type TouchAction } from "./mobile-shared";
export interface SelectionBarProps {
  count: number;
  onClear: () => void;
  actions: readonly TouchAction[];
  label?: string;
  clearLabel?: string;
  formatCount?: (count: number) => string;
  placement?: "sticky" | "fixed" | "inline";
  disabled?: boolean;
  focusReturn?: RefObject<HTMLElement | null>;
  errorMessage?: string;
  className?: string;
}
export function SelectionBar({
  count,
  onClear,
  actions,
  label = "Selection actions",
  clearLabel = "Clear selection",
  formatCount = (n) => `${n} selected`,
  placement = "sticky",
  disabled = false,
  focusReturn,
  errorMessage = "Action failed. Try again.",
  className = "",
}: SelectionBarProps) {
  const total = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0)),
    reduced = useReducedMotion(),
    action = useTouchAction(errorMessage),
    focused = useRef(false),
    root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!total) action.clearError();
    if (!total && focused.current) {
      focusReturn?.current?.focus({ preventScroll: true });
      focused.current = false;
    }
  }, [total, focusReturn, action.clearError]);
  return (
    <motion.div
      ref={root}
      hidden={total === 0}
      className={`mingu-selection-bar ${className}`}
      data-placement={placement}
      role="group"
      aria-label={label}
      initial={false}
      animate={{ opacity: total ? 1 : 0, y: reduced ? 0 : total ? 0 : 16 }}
      transition={reduced ? { duration: 0 } : selectionSpring}
      onFocusCapture={() => {
        focused.current = true;
      }}
      onBlurCapture={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        )
          focused.current = false;
      }}
    >
      <div className="mingu-selection-count" role="status">
        {formatCount(total)}
      </div>
      <div className="mingu-selection-actions">
        {actions.map((item) => (
          <Button
            key={item.id}
            variant={item.danger ? "danger" : "secondary"}
            icon={item.icon}
            disabled={disabled || item.disabled || !!action.pending}
            loading={action.pending === item.id}
            onClick={() => void action.run(item)}
          >
            {item.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          disabled={disabled || !!action.pending}
          onClick={onClear}
          aria-label={clearLabel}
        >
          <span aria-hidden="true">
            <VectorIcon name="close" size="1em" />
          </span>
        </Button>
      </div>
      {action.error && (
        <p className="mingu-field-error" role="alert">
          {action.error}
        </p>
      )}
    </motion.div>
  );
}
