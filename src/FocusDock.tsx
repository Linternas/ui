"use client";
import { useReducedMotion } from "./motion-policy";

import { motion } from "./motion";

import * as React from "react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import {
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
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
  capacity,
  active,
  onSelect,
  onNavigate,
  tabIndex,
  onFocus,
}: {
  item: DockItem;
  pointer: MotionValue<number>;
  capacity: MotionValue<number>;
  active: boolean;
  tabIndex: number;
  onFocus: () => void;
  onSelect: () => void;
  onNavigate: (key: string, element: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useMotionValue(0);
  const reduced = useReducedMotion();
  const proximity = useTransform(
    [pointer, focused, capacity],
    ([x, focus, space]: number[]) => {
      if (reduced || item.disabled) return 0;
      if (focus) return 0.6 * space;
      const bounds = ref.current?.getBoundingClientRect();
      return bounds
        ? Math.max(
            0,
            1 -
              Math.abs(x - bounds.left - bounds.width / 2) /
                explorationMotion.dockReach,
          ) * space
        : 0;
    },
  );
  const scale = useSpring(
    useTransform(proximity, [0, 1], [1, explorationMotion.dockScale]),
    dockSpring,
  );
  const y = useSpring(
    useTransform(proximity, [0, 1], [0, -explorationMotion.dockLift]),
    dockSpring,
  );
  const width = useMotionTemplate`calc(var(--mingu-dock-size) * ${scale})`;
  return (
    <motion.div
      ref={ref}
      className="mingu-dock-slot"
      style={{ width: reduced ? undefined : width }}
    >
      <motion.button
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
    </motion.div>
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
  const capacity = useMotionValue(1),
    root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current,
      parent = element?.parentElement;
    if (!element || !parent) return;
    const measure = () => {
      const styles = getComputedStyle(element),
        size =
          element.querySelector<HTMLButtonElement>("button")?.offsetWidth ?? 44;
      const gap = parseFloat(styles.columnGap) || 0,
        padding =
          parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const base =
        items.length * size + Math.max(0, items.length - 1) * gap + padding;
      let neighbours = 1;
      for (
        let distance = size + gap;
        distance < explorationMotion.dockReach;
        distance += size + gap
      )
        neighbours += 2 * (1 - distance / explorationMotion.dockReach);
      const demand =
        size *
        (explorationMotion.dockScale - 1) *
        Math.min(items.length, neighbours);
      capacity.set(
        demand > 0
          ? Math.max(0, Math.min(1, (parent.clientWidth - base - 4) / demand))
          : 0,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [items.length, capacity]);
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
      ref={root}
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
          capacity={capacity}
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
