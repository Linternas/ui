"use client";
import { Icon as VectorIcon } from "../icons";

import { SelectField } from "../system/forms";
import * as React from "react";
import { useId, useRef, useState, type ReactNode } from "react";
import { Button, TextField, Checkbox } from "../system/base";
import { EmptyState } from "../system/display";
import { SegmentedControl } from "../system/micro-interactions";
import { useControllable } from "../shared";
import {
  bounded,
  useNativeReset,
  type CollectionProps,
} from "./collection-shared";

export interface FilterField {
  id: string;
  label: string;
  type?: "text" | "number";
}
export interface FilterRule {
  id: string;
  field: string;
  operator: "contains" | "is" | "gt" | "lt";
  value: string;
}
export interface FilterModel {
  mode: "and" | "or";
  rules: readonly FilterRule[];
}
export interface FilterBuilderProps extends CollectionProps {
  fields: readonly FilterField[];
  value?: FilterModel;
  defaultValue?: FilterModel;
  onValueChange?: (filter: FilterModel) => void;
  maxRules?: number;
  name?: string;
}
export function matchesFilter(
  record: Record<string, unknown>,
  filter: FilterModel,
) {
  const check = (rule: FilterRule) => {
    const raw = record[rule.field];
    if (rule.operator === "gt" || rule.operator === "lt") {
      const a = Number(raw),
        b = Number(rule.value);
      return (
        raw !== undefined &&
        rule.value.trim() !== "" &&
        Number.isFinite(a) &&
        Number.isFinite(b) &&
        (rule.operator === "gt" ? a > b : a < b)
      );
    }
    const text = String(raw ?? "").toLowerCase(),
      wanted = rule.value.toLowerCase();
    return rule.operator === "is" ? text === wanted : text.includes(wanted);
  };
  return (
    !filter.rules.length ||
    (filter.mode === "or"
      ? filter.rules.some(check)
      : filter.rules.every(check))
  );
}
export function FilterBuilder({
  fields,
  value,
  defaultValue = { mode: "and", rules: [] },
  onValueChange,
  maxRules = 6,
  name,
  label = "Filter builder",
  disabled,
  className = "",
  style,
}: FilterBuilderProps) {
  const [filter, setFilter] = useControllable(
      value,
      defaultValue,
      onValueChange,
    ),
    root = useRef<HTMLFieldSetElement>(null),
    serial = useRef(0),
    id = useId();
  useNativeReset(root, () => {
    if (value === undefined) setFilter(defaultValue);
  });
  const update = (key: string, patch: Partial<FilterRule>) =>
    setFilter({
      ...filter,
      rules: filter.rules.map((r) => (r.id === key ? { ...r, ...patch } : r)),
    });
  return (
    <fieldset
      ref={root}
      disabled={disabled}
      className={`mingu-workflow mingu-filter-builder ${className}`}
      style={style}
    >
      <legend>{label}</legend>
      <SelectField
        label="Match rules"
        value={filter.mode}
        onChange={(e) =>
          setFilter({ ...filter, mode: e.target.value as FilterModel["mode"] })
        }
      >
        <option value="and">All conditions</option>
        <option value="or">Any condition</option>
      </SelectField>
      <ol>
        {filter.rules.map((rule, i) => (
          <li key={rule.id}>
            <SelectField
              label={`Field ${i + 1}`}
              value={rule.field}
              onChange={(e) =>
                update(rule.id, {
                  field: e.target.value,
                  operator:
                    fields.find((f) => f.id === e.target.value)?.type ===
                    "number"
                      ? "gt"
                      : "contains",
                  value: "",
                })
              }
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={`Operator ${i + 1}`}
              value={rule.operator}
              onChange={(e) =>
                update(rule.id, {
                  operator: e.target.value as FilterRule["operator"],
                })
              }
            >
              {fields.find((f) => f.id === rule.field)?.type === "number" ? (
                <>
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="is">Equals</option>
                </>
              ) : (
                <>
                  <option value="contains">Contains</option>
                  <option value="is">Equals</option>
                </>
              )}
            </SelectField>
            <TextField
              label={`Value ${i + 1}`}
              type={
                fields.find((f) => f.id === rule.field)?.type === "number"
                  ? "number"
                  : "text"
              }
              value={rule.value}
              onChange={(e) => update(rule.id, { value: e.target.value })}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Remove rule ${i + 1}`}
              onClick={() =>
                setFilter({
                  ...filter,
                  rules: filter.rules.filter((r) => r.id !== rule.id),
                })
              }
            >
              <VectorIcon name="close" size="1em" />
            </Button>
          </li>
        ))}
      </ol>
      {!filter.rules.length && (
        <p className="mingu-workflow-note">
          No conditions. Everything matches.
        </p>
      )}
      <div className="mingu-workflow-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={
            !fields.length || filter.rules.length >= bounded(maxRules, 1, 12)
          }
          onClick={() => {
            const field = fields[0];
            if (field)
              setFilter({
                ...filter,
                rules: [
                  ...filter.rules,
                  {
                    id: `${id}-${++serial.current}`,
                    field: field.id,
                    operator: field.type === "number" ? "gt" : "contains",
                    value: "",
                  },
                ],
              });
          }}
        >
          + Add condition
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!filter.rules.length}
          onClick={() => setFilter({ ...filter, rules: [] })}
        >
          Clear rules
        </Button>
      </div>
      {name && (
        <input type="hidden" name={name} value={JSON.stringify(filter)} />
      )}
    </fieldset>
  );
}

export interface ManagedColumn {
  id: string;
  label: string;
  visible: boolean;
  locked?: boolean;
}
export interface ColumnManagerProps extends CollectionProps {
  value?: readonly ManagedColumn[];
  defaultValue?: readonly ManagedColumn[];
  onValueChange?: (columns: ManagedColumn[]) => void;
  minVisible?: number;
  name?: string;
}
export function ColumnManager({
  value,
  defaultValue = [],
  onValueChange,
  minVisible = 1,
  name,
  label = "Table columns",
  disabled,
  className = "",
  style,
}: ColumnManagerProps) {
  const [columns, setColumns] = useControllable<readonly ManagedColumn[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    root = useRef<HTMLFieldSetElement>(null),
    visible = columns.filter((c) => c.visible).length;
  useNativeReset(root, () => {
    if (value === undefined) setColumns(defaultValue);
  });
  const move = (i: number, delta: number) => {
    const next = [...columns];
    if (!next[i + delta]) return;
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    setColumns(next);
  };
  return (
    <fieldset
      ref={root}
      disabled={disabled}
      className={`mingu-workflow mingu-column-manager ${className}`}
      style={style}
    >
      <legend>{label}</legend>
      <ol>
        {columns.map((column, i) => (
          <li key={column.id}>
            <Checkbox
              checked={column.visible}
              disabled={
                column.locked ||
                (column.visible && visible <= Math.max(0, minVisible))
              }
              onChange={() =>
                setColumns(
                  columns.map((c) =>
                    c.id === column.id ? { ...c, visible: !c.visible } : c,
                  ),
                )
              }
            >
              {column.label}
              {column.locked && <small>Required</small>}
            </Checkbox>
            <div className="mingu-workflow-actions">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Move ${column.label} up`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <VectorIcon name="arrow-up" size="1em" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Move ${column.label} down`}
                disabled={i === columns.length - 1}
                onClick={() => move(i, 1)}
              >
                <VectorIcon name="arrow-down" size="1em" />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      {!columns.length && (
        <p className="mingu-workflow-note">No columns to configure</p>
      )}
      <output className="mingu-workflow-note">
        {visible} / {columns.length} visible
      </output>
      {name &&
        columns
          .filter((c) => c.visible)
          .map((c) => (
            <input key={c.id} type="hidden" name={name} value={c.id} />
          ))}
    </fieldset>
  );
}

export interface ScheduleDay {
  id: string;
  label: string;
}
export interface SchedulePickerProps extends CollectionProps {
  days?: readonly ScheduleDay[];
  hours?: readonly number[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (slots: string[]) => void;
  blocked?: readonly string[];
  name?: string;
}
const weekdays = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
];
export function SchedulePicker({
  days = weekdays,
  hours = [9, 10, 11, 12, 13, 14, 15, 16, 17],
  value,
  defaultValue = [],
  onValueChange,
  blocked = [],
  name,
  label = "Availability",
  disabled,
  className = "",
  style,
}: SchedulePickerProps) {
  const [selected, setSelected] = useControllable<readonly string[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    [touch, setTouch] = useState(false),
    [active, setActive] = useState(0),
    root = useRef<HTMLDivElement>(null),
    grid = useRef<HTMLDivElement>(null),
    painting = useRef<boolean | null>(null),
    pointer = useRef("mouse"),
    latest = useRef(selected);
  latest.current = selected;
  useNativeReset(root, () => {
    if (value === undefined) setSelected(defaultValue);
  });
  const visibleDays = days.slice(0, 7),
    visibleHours = [
      ...new Set(hours.filter((h) => Number.isInteger(h) && h >= 0 && h < 24)),
    ].slice(0, 24),
    slots = visibleHours.flatMap((hour) =>
      visibleDays.map((day) => `${day.id}:${hour}`),
    );
  const paint = (key: string, add: boolean) => {
    if (disabled || blocked.includes(key)) return;
    const next = add
      ? [...new Set([...latest.current, key])]
      : latest.current.filter((v) => v !== key);
    latest.current = next;
    setSelected(next);
  };
  return (
    <div
      ref={root}
      className={`mingu-workflow mingu-schedule ${className}`}
      style={style}
    >
      <span className="mingu-workflow-label">{label}</span>
      {slots.length ? (
        <div
          ref={grid}
          role="grid"
          aria-label={label}
          aria-multiselectable="true"
          className="mingu-schedule-grid"
          style={{ touchAction: touch && !disabled ? "none" : "pan-y" }}
          onPointerDown={(e) => {
            pointer.current = e.pointerType;
            if (disabled || (e.pointerType === "touch" && !touch)) return;
            const cell = (e.target as Element).closest<HTMLElement>(
              "[data-slot]",
            );
            if (!cell) return;
            painting.current = !selected.includes(cell.dataset.slot!);
            paint(cell.dataset.slot!, painting.current);
            cell.focus();
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (painting.current === null) return;
            const cell = document
              .elementFromPoint(e.clientX, e.clientY)
              ?.closest<HTMLElement>("[data-slot]");
            if (cell && grid.current?.contains(cell))
              paint(cell.dataset.slot!, painting.current);
          }}
          onPointerUp={() => {
            painting.current = null;
          }}
          onPointerCancel={() => {
            painting.current = null;
          }}
          onLostPointerCapture={() => {
            painting.current = null;
          }}
        >
          <div
            role="row"
            style={{
              gridTemplateColumns: `36px repeat(${visibleDays.length},minmax(0,1fr))`,
            }}
          >
            <span role="columnheader">Time</span>
            {visibleDays.map((d) => (
              <span role="columnheader" key={d.id}>
                {d.label}
              </span>
            ))}
          </div>
          {visibleHours.map((hour, row) => (
            <div
              role="row"
              key={hour}
              style={{
                gridTemplateColumns: `36px repeat(${visibleDays.length},minmax(0,1fr))`,
              }}
            >
              <span role="rowheader">{String(hour).padStart(2, "0")}</span>
              {visibleDays.map((day, col) => {
                const key = `${day.id}:${hour}`,
                  i = row * visibleDays.length + col;
                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    data-slot={key}
                    aria-label={`${day.label} ${String(hour).padStart(2, "0")}:00`}
                    aria-selected={selected.includes(key)}
                    disabled={disabled || blocked.includes(key)}
                    tabIndex={
                      i ===
                      (slots[active] && !blocked.includes(slots[active])
                        ? active
                        : slots.findIndex((slot) => !blocked.includes(slot)))
                        ? 0
                        : -1
                    }
                    onFocus={() => setActive(i)}
                    onClick={(e) => {
                      if (
                        e.detail === 0 ||
                        (pointer.current === "touch" && !touch)
                      )
                        paint(key, !selected.includes(key));
                    }}
                    onKeyDown={(e) => {
                      const next =
                        e.key === "ArrowRight"
                          ? Math.min(i + 1, slots.length - 1)
                          : e.key === "ArrowLeft"
                            ? Math.max(0, i - 1)
                            : e.key === "ArrowDown"
                              ? Math.min(
                                  i + visibleDays.length,
                                  slots.length - 1,
                                )
                              : e.key === "ArrowUp"
                                ? Math.max(0, i - visibleDays.length)
                                : e.key === "Home"
                                  ? 0
                                  : e.key === "End"
                                    ? slots.length - 1
                                    : -1;
                      if (next >= 0) {
                        e.preventDefault();
                        let index = next;
                        const direction =
                          e.key === "Home"
                            ? 1
                            : e.key === "End"
                              ? -1
                              : next >= i
                                ? 1
                                : -1;
                        while (
                          index >= 0 &&
                          index < slots.length &&
                          blocked.includes(slots[index])
                        )
                          index += direction;
                        if (index >= 0 && index < slots.length) {
                          setActive(index);
                          grid.current
                            ?.querySelector<HTMLButtonElement>(
                              `[data-slot="${CSS.escape(slots[index])}"]`,
                            )
                            ?.focus();
                        }
                      }
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <p className="mingu-workflow-note">No available time slots</p>
      )}
      <div className="mingu-workflow-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || !slots.length}
          onClick={() => setSelected(slots.filter((s) => !blocked.includes(s)))}
        >
          Select all slots
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || !selected.length}
          onClick={() => setSelected([])}
        >
          Clear schedule
        </Button>
      </div>
      <div className="mingu-workflow-spread">
        <output className="mingu-workflow-note">
          {selected.length} hours selected
        </output>
        <Checkbox
          checked={touch}
          disabled={disabled}
          onChange={(e) => setTouch(e.currentTarget.checked)}
        >
          Paint with touch
        </Checkbox>
      </div>
      {name &&
        selected.map((slot) => (
          <input
            key={slot}
            type="hidden"
            name={name}
            value={slot}
            disabled={disabled}
          />
        ))}
    </div>
  );
}

export interface WindowPosition {
  x: number;
  y: number;
}
export interface DraggableWindowProps extends CollectionProps {
  title: string;
  children: ReactNode;
  position?: WindowPosition;
  defaultPosition?: WindowPosition;
  onPositionChange?: (position: WindowPosition) => void;
}
export function DraggableWindow({
  title,
  children,
  position,
  defaultPosition = { x: 0, y: 0 },
  onPositionChange,
  disabled,
  className = "",
  style,
}: DraggableWindowProps) {
  const [point, setPoint] = useControllable(
      position,
      defaultPosition,
      onPositionChange,
    ),
    [minimized, setMinimized] = useState(false),
    [maximized, setMaximized] = useState(false),
    root = useRef<HTMLDivElement>(null),
    pane = useRef<HTMLDivElement>(null),
    drag = useRef<{ x: number; y: number; origin: WindowPosition } | null>(
      null,
    );
  const move = (next: WindowPosition) => {
    if (disabled || maximized) return;
    const stage = root.current?.getBoundingClientRect(),
      box = pane.current?.getBoundingClientRect();
    if (stage && box)
      setPoint({
        x: bounded(
          next.x,
          -Math.max(0, (stage.width - box.width) / 2 - 4),
          Math.max(0, (stage.width - box.width) / 2 - 4),
        ),
        y: bounded(
          next.y,
          -Math.max(0, (stage.height - box.height) / 2 - 4),
          Math.max(0, (stage.height - box.height) / 2 - 4),
        ),
      });
  };
  return (
    <div
      className={`mingu-workflow mingu-floating-window ${className}`}
      style={style}
    >
      <div ref={root} className="mingu-floating-stage">
        <div
          ref={pane}
          className="mingu-floating-pane"
          data-maximized={maximized || undefined}
          style={
            {
              "--window-x": `${Number.isFinite(point.x) ? point.x : 0}px`,
              "--window-y": `${Number.isFinite(point.y) ? point.y : 0}px`,
            } as React.CSSProperties
          }
        >
          <header>
            <button
              type="button"
              className="mingu-window-handle"
              aria-label={`Move ${title}`}
              disabled={disabled || maximized}
              onPointerDown={(e) => {
                drag.current = { x: e.clientX, y: e.clientY, origin: point };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (drag.current)
                  move({
                    x: drag.current.origin.x + e.clientX - drag.current.x,
                    y: drag.current.origin.y + e.clientY - drag.current.y,
                  });
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onLostPointerCapture={() => {
                drag.current = null;
              }}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 1 : 10;
                if (
                  [
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                    "Home",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                  move(
                    e.key === "Home"
                      ? { x: 0, y: 0 }
                      : {
                          x:
                            point.x +
                            (e.key === "ArrowRight"
                              ? step
                              : e.key === "ArrowLeft"
                                ? -step
                                : 0),
                          y:
                            point.y +
                            (e.key === "ArrowDown"
                              ? step
                              : e.key === "ArrowUp"
                                ? -step
                                : 0),
                        },
                  );
                }
              }}
            >
              <span aria-hidden="true">
                <VectorIcon name="grip" size="1em" />
              </span>
              {title}
            </button>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              aria-label={minimized ? "Restore window" : "Minimize window"}
              onClick={() => {
                setMinimized(!minimized);
                setMaximized(false);
              }}
            >
              <VectorIcon name="minus" size="1em" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              aria-label={maximized ? "Restore window size" : "Maximize window"}
              onClick={() => {
                setMaximized(!maximized);
                setMinimized(false);
              }}
            >
              <VectorIcon name="square" size="1em" />
            </Button>
          </header>
          <div className="mingu-floating-content" hidden={minimized}>
            {children}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={() => {
          setPoint({ x: 0, y: 0 });
          setMaximized(false);
          setMinimized(false);
        }}
      >
        Center window
      </Button>
    </div>
  );
}

export interface InboxNotification {
  id: string;
  title: string;
  description?: string;
  time?: string;
  read?: boolean;
}
export interface NotificationInboxProps extends CollectionProps {
  value?: readonly InboxNotification[];
  defaultValue?: readonly InboxNotification[];
  onValueChange?: (items: InboxNotification[]) => void;
}
export function NotificationInbox({
  value,
  defaultValue = [],
  onValueChange,
  label = "Inbox",
  disabled,
  className = "",
  style,
}: NotificationInboxProps) {
  const [items, setItems] = useControllable<readonly InboxNotification[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    [filter, setFilter] = useState("all"),
    [archived, setArchived] = useState<{
      item: InboxNotification;
      index: number;
    } | null>(null),
    unread = items.filter((i) => !i.read).length;
  return (
    <section
      className={`mingu-workflow mingu-inbox ${className}`}
      style={style}
      aria-label={label}
    >
      <header className="mingu-workflow-spread">
        <strong>
          {label} <span className="mingu-workflow-note">{unread} unread</span>
        </strong>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || !unread}
          onClick={() => setItems(items.map((i) => ({ ...i, read: true })))}
        >
          Mark all read
        </Button>
      </header>
      <SegmentedControl
        label="Inbox filter"
        value={filter}
        onValueChange={setFilter}
        disabled={disabled}
        options={[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread" },
        ]}
      />
      <ul>
        {items
          .filter((i) => filter === "all" || !i.read)
          .map((item) => (
            <li key={item.id} data-unread={!item.read || undefined}>
              <span className="mingu-inbox-dot" aria-hidden="true" />
              <div>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.time && <small>{item.time}</small>}
                <div className="mingu-workflow-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    aria-label={`Mark ${item.title} ${item.read ? "unread" : "as read"}`}
                    onClick={() =>
                      setItems(
                        items.map((i) =>
                          i.id === item.id ? { ...i, read: !i.read } : i,
                        ),
                      )
                    }
                  >
                    {item.read ? "Mark unread" : "Mark read"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    aria-label={`Archive ${item.title}`}
                    onClick={() => {
                      setArchived({
                        item,
                        index: items.findIndex((i) => i.id === item.id),
                      });
                      setItems(items.filter((i) => i.id !== item.id));
                    }}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </li>
          ))}
      </ul>
      {!items.some((i) => filter === "all" || !i.read) && (
        <EmptyState title="All caught up" description="Nothing waiting here." />
      )}
      {archived && (
        <div className="mingu-workflow-spread">
          <span className="mingu-workflow-note" role="status">
            Archived {archived.item.title}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              if (!items.some((i) => i.id === archived.item.id)) {
                const next = [...items];
                next.splice(
                  Math.min(archived.index, next.length),
                  0,
                  archived.item,
                );
                setItems(next);
              }
              setArchived(null);
            }}
          >
            Undo archive
          </Button>
        </div>
      )}
    </section>
  );
}
