"use client";
import * as React from "react";
import { useState, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { useControllable } from "./shared";
import { dockSpring, explorationMotion } from "./system/motion-tokens";

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}
export interface FocusDockProps {
  items: readonly DockItem[];
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}
function DockButton({
  item,
  pointer,
  active,
  onSelect,
  onNavigate,
  tabIndex,
  onFocus,
}: {
  item: DockItem;
  pointer: MotionValue<number>;
  active: boolean;
  tabIndex: number;
  onFocus: () => void;
  onSelect: () => void;
  onNavigate: (key: string, element: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const focused = useMotionValue(0);
  const reduced = useReducedMotion();
  const proximity = useTransform([pointer, focused], ([x, focus]: number[]) => {
    if (reduced || item.disabled) return 0;
    if (focus) return 0.6;
    const bounds = ref.current?.getBoundingClientRect();
    return bounds
      ? Math.max(
          0,
          1 -
            Math.abs(x - bounds.left - bounds.width / 2) /
              explorationMotion.dockReach,
        )
      : 0;
  });
  const scale = useSpring(
    useTransform(proximity, [0, 1], [1, explorationMotion.dockScale]),
    dockSpring,
  );
  const y = useSpring(
    useTransform(proximity, [0, 1], [0, -explorationMotion.dockLift]),
    dockSpring,
  );
  return (
    <div className="mingu-dock-slot">
      <motion.button
        ref={ref}
        type="button"
        className="mingu-dock-item"
        disabled={item.disabled}
        aria-label={item.label}
        aria-pressed={active}
        tabIndex={tabIndex}
        data-active={active || undefined}
        style={{ scale, y }}
        onClick={onSelect}
        onFocus={() => {
          onFocus();
          focused.set(1);
          pointer.set(Infinity);
        }}
        onBlur={() => focused.set(0)}
        onKeyDown={(event) => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            onNavigate(event.key, event.currentTarget);
          }
        }}
      >
        <span aria-hidden="true">{item.icon}</span>
      </motion.button>
      <span className="mingu-dock-label" aria-hidden="true">
        {item.label}
      </span>
    </div>
  );
}
export function FocusDock({
  items,
  label = "Quick actions",
  value,
  defaultValue = "",
  onValueChange,
  className = "",
}: FocusDockProps) {
  const pointer = useMotionValue(Infinity);
  const [selected, select] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  const [tabStop, setTabStop] = useState(value || defaultValue);
  const tabTarget =
    items.find((item) => item.id === tabStop && !item.disabled)?.id ??
    items.find((item) => !item.disabled)?.id;
  const navigate = (key: string, button: HTMLButtonElement) => {
    const enabled = Array.from(
      button
        .closest('[role="toolbar"]')!
        .querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
    );
    const index = enabled.indexOf(button);
    const next =
      key === "Home"
        ? 0
        : key === "End"
          ? enabled.length - 1
          : (index + (key === "ArrowRight" ? 1 : -1) + enabled.length) %
            enabled.length;
    enabled[next]?.focus();
  };
  return (
    <div
      className={`mingu-dock ${className}`}
      role="toolbar"
      aria-label={label}
      onPointerMove={(event) => {
        if (event.pointerType !== "touch") pointer.set(event.clientX);
      }}
      onPointerLeave={() => pointer.set(Infinity)}
    >
      {items.map((item) => (
        <DockButton
          key={item.id}
          item={item}
          pointer={pointer}
          active={selected === item.id}
          onSelect={() => select(item.id)}
          onNavigate={navigate}
          tabIndex={item.id === tabTarget ? 0 : -1}
          onFocus={() => setTabStop(item.id)}
        />
      ))}
    </div>
  );
}
