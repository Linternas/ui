"use client";
import { Icon as VectorIcon } from "./icons";

import * as React from "react";
import { useId, useState, type Ref, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { useControllable } from "./shared";
import { SegmentedControl } from "./system/micro-interactions";
import { selectionSpring, filterMotion } from "./system/motion-tokens";
export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface AnimatedFilterBarProps<T> {
  label: string;
  filters: readonly FilterOption[];
  items: readonly T[];
  getKey: (item: T) => string;
  getFilter: (item: T) => string | readonly string[];
  renderItem: (item: T) => ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  allValue?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}
function FilterResult({
  children,
  reduced,
  ref,
}: {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
  reduced: boolean | null;
}) {
  const present = useIsPresent();
  return (
    <motion.div
      ref={ref}
      role="listitem"
      layout={reduced ? false : "position"}
      inert={!present || undefined}
      aria-hidden={!present || undefined}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
      transition={reduced ? { duration: 0 } : filterMotion}
    >
      {children}
    </motion.div>
  );
}
export function AnimatedFilterBar<T>({
  label,
  filters,
  items,
  getKey,
  getFilter,
  renderItem,
  value,
  defaultValue,
  onValueChange,
  allValue = "all",
  emptyLabel = "No matches",
  disabled,
  className = "",
}: AnimatedFilterBarProps<T>) {
  const [selected, select] = useControllable(
    value,
    defaultValue ?? filters.find((f) => !f.disabled)?.value ?? "",
    onValueChange,
  );
  const current =
    filters.find((f) => f.value === selected && !f.disabled)?.value ??
    filters.find((f) => !f.disabled)?.value ??
    "";
  const reduced = useReducedMotion();
  const matches = (item: T, key: string) =>
    key === allValue || [getFilter(item)].flat().includes(key);
  const visible = items.filter((item) => matches(item, current));
  return (
    <div className={`mingu-filter ${className}`}>
      <SegmentedControl
        label={label}
        disabled={disabled}
        value={current}
        onValueChange={select}
        options={filters.map((filter) => ({
          ...filter,
          label: `${filter.label} · ${items.filter((item) => matches(item, filter.value)).length}`,
        }))}
      />
      <p className="mingu-filter-count mingu-muted" role="status">
        {visible.length} result{visible.length === 1 ? "" : "s"}
      </p>
      <div
        role="list"
        aria-label={`${label} results`}
        className="mingu-filter-results"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => (
            <FilterResult key={getKey(item)} reduced={reduced}>
              {renderItem(item)}
            </FilterResult>
          ))}
        </AnimatePresence>
      </div>
      {!visible.length && <p className="mingu-muted">{emptyLabel}</p>}
    </div>
  );
}
export interface SortableItem {
  id: string;
  label: string;
  content?: ReactNode;
  disabled?: boolean;
}
export interface SortableListProps {
  items: readonly SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}
function SortableRow({
  item,
  items,
  onReorder,
  disabled,
  describedBy,
  announce,
}: {
  item: SortableItem;
  items: readonly SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  disabled?: boolean;
  describedBy: string;
  announce: (message: string) => void;
}) {
  const controls = useDragControls();
  const reduced = useReducedMotion();
  const move = (target: number) => {
    const from = items.findIndex((i) => i.id === item.id);
    if (target < 0 || target >= items.length || target === from) return;
    const next = [...items];
    next.splice(from, 1);
    next.splice(target, 0, item);
    onReorder(next);
    announce(
      `${item.label} moved to position ${target + 1} of ${items.length}`,
    );
  };
  return (
    <Reorder.Item
      as="li"
      value={item.id}
      className="mingu-sortable-row"
      dragListener={false}
      dragControls={controls}
      drag={disabled || item.disabled ? false : "y"}
      layout={true}
      whileDrag={reduced ? undefined : { scale: 1.02, zIndex: 1 }}
      transition={reduced ? { duration: 0 } : selectionSpring}
      onDragEnd={() => announce(`${item.label} dropped`)}
    >
      <button
        type="button"
        className="mingu-sortable-handle"
        aria-label={`Move ${item.label}`}
        aria-describedby={describedBy}
        disabled={disabled || item.disabled}
        onPointerDown={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          controls.start(event);
        }}
        onKeyDown={(event) => {
          const index = items.findIndex((i) => i.id === item.id);
          const target =
            event.key === "ArrowUp"
              ? index - 1
              : event.key === "ArrowDown"
                ? index + 1
                : event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? items.length - 1
                    : -1;
          if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            move(target);
          }
        }}
      >
        <span aria-hidden="true">
          <VectorIcon name="grip" size="1em" />
        </span>
      </button>
      <div>{item.content ?? item.label}</div>
    </Reorder.Item>
  );
}
export function SortableList({
  items,
  onReorder,
  label = "Reorder items",
  disabled,
  className = "",
}: SortableListProps) {
  const id = useId(),
    [message, announce] = useState("");
  return (
    <div className={`mingu-sortable ${className}`}>
      <p id={id} className="mingu-visually-hidden">
        Drag a handle, or use Up and Down arrows, Home and End to move its item.
      </p>
      <Reorder.Group
        as="ul"
        axis="y"
        values={items.map((item) => item.id)}
        onReorder={(order) => {
          if (!disabled)
            onReorder(order.map((id) => items.find((item) => item.id === id)!));
        }}
        aria-label={label}
      >
        {items.map((item) => (
          <SortableRow
            key={item.id}
            item={item}
            items={items}
            onReorder={onReorder}
            disabled={disabled}
            describedBy={id}
            announce={announce}
          />
        ))}
      </Reorder.Group>
      <span role="status" className="mingu-visually-hidden">
        {message}
      </span>
      {!items.length && <p className="mingu-muted">No items</p>}
    </div>
  );
}
