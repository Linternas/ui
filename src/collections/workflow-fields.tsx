"use client";
import { Icon as VectorIcon } from "../icons";

import { TextareaField } from "../system/forms";
import * as React from "react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, TextField, Checkbox } from "../system/base";
import { EmptyState } from "../system/display";
import { useControllable } from "../shared";
import {
  bounded,
  useNativeReset,
  type CollectionProps,
} from "./collection-shared";

export interface DateRange {
  start: string;
  end: string;
}
export interface DateRangePickerProps extends CollectionProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
  name?: string;
  min?: string;
  max?: string;
  presets?: readonly ({ label: string } & DateRange)[];
}
const dateStamp = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return NaN;
  const n = Date.parse(`${s}T00:00:00Z`);
  return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === s
    ? n
    : NaN;
};
export function DateRangePicker({
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  name,
  min,
  max,
  presets = [],
  label = "Date range",
  disabled,
  className = "",
  style,
}: DateRangePickerProps) {
  const [range, setRange] = useControllable(value, defaultValue, onValueChange),
    root = useRef<HTMLFieldSetElement>(null),
    endInput = useRef<HTMLInputElement>(null),
    start = dateStamp(range.start),
    end = dateStamp(range.end),
    invalid = Number.isFinite(start) && Number.isFinite(end) && start > end;
  useEffect(() => {
    endInput.current?.setCustomValidity(
      invalid ? "End must be on or after start." : "",
    );
  }, [invalid]);
  useNativeReset(root, () => {
    if (value === undefined) setRange(defaultValue);
  });
  return (
    <fieldset
      ref={root}
      disabled={disabled}
      className={`mingu-workflow mingu-date-range ${className}`}
      style={style}
    >
      <legend>{label}</legend>
      <div className="mingu-workflow-two">
        <TextField
          type="date"
          label="Start date"
          name={name ? `${name}.start` : undefined}
          value={range.start}
          min={min}
          max={max}
          onChange={(e) => setRange({ ...range, start: e.target.value })}
        />
        <TextField
          ref={endInput}
          type="date"
          label="End date"
          name={name ? `${name}.end` : undefined}
          value={range.end}
          min={min}
          max={max}
          error={invalid ? "End must be on or after start." : undefined}
          onChange={(e) => setRange({ ...range, end: e.target.value })}
        />
      </div>
      <div className="mingu-workflow-actions">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => setRange({ start: p.start, end: p.end })}
          >
            {p.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          disabled={!range.start && !range.end}
          onClick={() => setRange({ start: "", end: "" })}
        >
          Clear dates
        </Button>
      </div>
      <output className="mingu-workflow-note" aria-live="polite">
        {invalid
          ? "Check the date order"
          : Number.isFinite(start) && Number.isFinite(end)
            ? `${Math.round((end - start) / 86400000) + 1} days selected`
            : "Choose a start and end date"}
      </output>
    </fieldset>
  );
}

export interface TimePickerProps extends CollectionProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (time: string) => void;
  stepMinutes?: number;
  name?: string;
  timezoneLabel?: string;
}
const minutes = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
    : NaN;
const clock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
export function TimePicker({
  value,
  defaultValue = "09:30",
  onValueChange,
  stepMinutes = 5,
  name,
  timezoneLabel,
  label = "Time",
  disabled,
  className = "",
  style,
}: TimePickerProps) {
  const [time, setTime] = useControllable(value, defaultValue, onValueChange),
    root = useRef<HTMLDivElement>(null),
    amount = minutes(time),
    step = Math.floor(bounded(stepMinutes, 1, 60));
  useNativeReset(root, () => {
    if (value === undefined) setTime(defaultValue);
  });
  return (
    <div
      ref={root}
      className={`mingu-workflow mingu-time-picker ${className}`}
      style={style}
    >
      <span className="mingu-workflow-label">{label}</span>
      <div className="mingu-time-face" aria-hidden="true">
        <strong>{Number.isFinite(amount) ? time : "--:--"}</strong>
        {timezoneLabel && <small>{timezoneLabel}</small>}
      </div>
      <TextField
        type="time"
        label={`Set ${label}`}
        name={name}
        step={step * 60}
        value={time}
        disabled={disabled}
        onChange={(e) => setTime(e.target.value)}
      />
      <div className="mingu-workflow-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || !Number.isFinite(amount) || amount <= 0}
          onClick={() => setTime(clock(Math.max(0, amount - step)))}
        >
          <VectorIcon name="minus" size="1em" /> {step} min
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || !Number.isFinite(amount) || amount >= 1439}
          onClick={() => setTime(clock(Math.min(1439, amount + step)))}
        >
          + {step} min
        </Button>
      </div>
    </div>
  );
}

export interface RangeSliderProps extends CollectionProps {
  value?: readonly [number, number];
  defaultValue?: readonly [number, number];
  onValueChange?: (range: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  minGap?: number;
  name?: string;
  unit?: string;
}
export function RangeSlider({
  value,
  defaultValue = [20, 80],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minGap = 0,
  name,
  unit = "",
  label = "Range",
  disabled,
  className = "",
  style,
}: RangeSliderProps) {
  const low = Number.isFinite(min) ? min : 0,
    high = Number.isFinite(max) && max > low ? max : low + 100,
    gap = bounded(minGap, 0, high - low),
    increment = bounded(step, 0.000001, high - low);
  const [range, setRange] = useControllable<readonly [number, number]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next] as [number, number]),
    ),
    a = bounded(range[0], low, high - gap),
    b = bounded(range[1], a + gap, high),
    root = useRef<HTMLFieldSetElement>(null);
  useNativeReset(root, () => {
    if (value === undefined) setRange(defaultValue);
  });
  return (
    <fieldset
      ref={root}
      disabled={disabled}
      className={`mingu-workflow mingu-dual-range ${className}`}
      style={style}
    >
      <legend>{label}</legend>
      <output>
        {a}
        {unit} <span>—</span> {b}
        {unit}
      </output>
      <div className="mingu-dual-track">
        <span
          style={{
            left: `${((a - low) / (high - low)) * 100}%`,
            right: `${((high - b) / (high - low)) * 100}%`,
          }}
        />
        <input
          type="range"
          aria-label={`${label} minimum`}
          min={low}
          max={high}
          step={increment}
          value={a}
          onChange={(e) =>
            setRange([Math.min(Number(e.target.value), b - gap), b])
          }
        />
        <input
          type="range"
          aria-label={`${label} maximum`}
          min={low}
          max={high}
          step={increment}
          value={b}
          onChange={(e) =>
            setRange([a, Math.max(Number(e.target.value), a + gap)])
          }
        />
      </div>
      <div className="mingu-workflow-spread">
        <small>
          {low}
          {unit}
        </small>
        <small>
          {high}
          {unit}
        </small>
      </div>
      {name && (
        <>
          <input type="hidden" name={`${name}.min`} value={a} />
          <input type="hidden" name={`${name}.max`} value={b} />
        </>
      )}
    </fieldset>
  );
}

export interface SelectionNode {
  id: string;
  label: string;
  disabled?: boolean;
  children?: readonly SelectionNode[];
}
export interface TreeSelectProps extends CollectionProps {
  nodes: readonly SelectionNode[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (ids: string[]) => void;
  name?: string;
  defaultExpandedIds?: readonly string[];
}
const leaves = (
  node: SelectionNode,
  parentDisabled = false,
): SelectionNode[] =>
  node.children?.length
    ? node.children.flatMap((n) => leaves(n, parentDisabled || !!node.disabled))
    : [{ ...node, disabled: parentDisabled || node.disabled }];
export function TreeSelect({
  nodes,
  value,
  defaultValue = [],
  onValueChange,
  name,
  defaultExpandedIds = [],
  label = "Choose folders",
  disabled,
  className = "",
  style,
}: TreeSelectProps) {
  const [selected, setSelected] = useControllable<readonly string[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    [expanded, setExpanded] = useState<readonly string[]>(defaultExpandedIds),
    [query, setQuery] = useState(""),
    root = useRef<HTMLFieldSetElement>(null);
  useNativeReset(root, () => {
    if (value === undefined) {
      setSelected(defaultValue);
      setQuery("");
      setExpanded(defaultExpandedIds);
    }
  });
  const matches = (node: SelectionNode): boolean =>
    node.label.toLowerCase().includes(query.toLowerCase()) ||
    !!node.children?.some(matches);
  const render = (
    node: SelectionNode,
    parentDisabled = false,
    showAll = false,
  ): ReactNode => {
    if (query && !showAll && !matches(node)) return null;
    const branch = !!node.children?.length,
      all = leaves(node, parentDisabled),
      enabled = all.filter((n) => !n.disabled),
      checked =
        (enabled.length ? enabled : all).length > 0 &&
        (enabled.length ? enabled : all).every((n) => selected.includes(n.id)),
      some = all.some((n) => selected.includes(n.id)),
      locked = disabled || parentDisabled || node.disabled,
      open = !!query || expanded.includes(node.id);
    return (
      <li key={node.id}>
        <div className="mingu-tree-line">
          {branch ? (
            <button
              type="button"
              className="mingu-tree-disclosure"
              aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
              aria-expanded={open}
              disabled={disabled}
              onClick={() =>
                setExpanded((current) =>
                  current.includes(node.id)
                    ? current.filter((id) => id !== node.id)
                    : [...current, node.id],
                )
              }
            >
              {open ? (
                <VectorIcon name="minus" size="1em" />
              ) : (
                <VectorIcon name="plus" size="1em" />
              )}
            </button>
          ) : (
            <span className="mingu-tree-indent" />
          )}
          <Checkbox
            checked={checked}
            indeterminate={!checked && some}
            disabled={locked || !enabled.length}
            onChange={() => {
              const ids = enabled.map((n) => n.id);
              setSelected(
                checked
                  ? selected.filter((id) => !ids.includes(id))
                  : [...new Set([...selected, ...ids])],
              );
            }}
          >
            {node.label}
          </Checkbox>
        </div>
        {branch && open && (
          <ul>
            {node.children!.map((child) =>
              render(
                child,
                !!locked,
                showAll ||
                  node.label.toLowerCase().includes(query.toLowerCase()),
              ),
            )}
          </ul>
        )}
      </li>
    );
  };
  return (
    <fieldset
      ref={root}
      disabled={disabled}
      className={`mingu-workflow mingu-tree-select ${className}`}
      style={style}
    >
      <legend>{label}</legend>
      <TextField
        type="search"
        label={`Search ${label}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul aria-label={label}>{nodes.map((n) => render(n))}</ul>
      {(!nodes.length || !nodes.some(matches)) && (
        <p className="mingu-workflow-note">No matching items</p>
      )}
      <output className="mingu-workflow-note">
        {selected.length} selected
      </output>
      {name &&
        selected.map((id) => (
          <input key={id} type="hidden" name={name} value={id} />
        ))}
    </fieldset>
  );
}

export interface CascaderProps extends CollectionProps {
  nodes: readonly SelectionNode[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (path: string[]) => void;
  name?: string;
}
export function Cascader({
  nodes,
  value,
  defaultValue = [],
  onValueChange,
  name,
  label = "Choose a destination",
  disabled,
  className = "",
  style,
}: CascaderProps) {
  const [path, setPath] = useControllable<readonly string[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    root = useRef<HTMLFieldSetElement>(null),
    prefix = useId();
  useNativeReset(root, () => {
    if (value === undefined) setPath(defaultValue);
  });
  const levels: { nodes: readonly SelectionNode[]; selected?: string }[] = [],
    chosen: SelectionNode[] = [];
  let current = nodes;
  for (let i = 0; i < 12 && current.length; i++) {
    levels.push({ nodes: current, selected: path[i] });
    const selected = current.find((n) => n.id === path[i]);
    if (!selected) break;
    chosen.push(selected);
    current = selected.children ?? [];
  }
  return (
    <fieldset
      ref={root}
      disabled={disabled}
      className={`mingu-workflow mingu-cascader ${className}`}
      style={style}
    >
      <legend>{label}</legend>
      <div className="mingu-cascader-columns">
        {levels.map((level, i) => (
          <fieldset key={i}>
            <legend>Level {i + 1}</legend>
            {level.nodes.map((node) => (
              <label key={node.id}>
                <input
                  type="radio"
                  name={`${prefix}-${i}`}
                  checked={node.id === level.selected}
                  disabled={node.disabled}
                  onChange={() => setPath([...path.slice(0, i), node.id])}
                />
                <span>{node.label}</span>
                {!!node.children?.length && (
                  <span aria-hidden="true">
                    <VectorIcon name="chevron-right" size="1em" />
                  </span>
                )}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      {!nodes.length && (
        <p className="mingu-workflow-note">No destinations available</p>
      )}
      <output className="mingu-workflow-note">
        {chosen.length
          ? chosen.map((n) => n.label).join(" / ")
          : "Choose a path"}
      </output>
      {name && <input type="hidden" name={name} value={path.join("/")} />}
    </fieldset>
  );
}

export interface MentionOption {
  id: string;
  label: string;
  handle?: string;
  description?: string;
  disabled?: boolean;
}
export interface MentionInputProps extends CollectionProps {
  options: readonly MentionOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (text: string) => void;
  onMention?: (option: MentionOption) => void;
  name?: string;
  placeholder?: string;
  maxLength?: number;
}
export function MentionInput({
  options,
  value,
  defaultValue = "",
  onValueChange,
  onMention,
  name,
  placeholder = "Write a note. Type @ to mention…",
  maxLength = 2000,
  label = "Message",
  disabled,
  className = "",
  style,
}: MentionInputProps) {
  const [text, setText] = useControllable(value, defaultValue, onValueChange),
    [token, setToken] = useState<{
      start: number;
      end: number;
      query: string;
    } | null>(null),
    [active, setActive] = useState(0),
    [notice, setNotice] = useState(""),
    input = useRef<HTMLTextAreaElement>(null),
    root = useRef<HTMLDivElement>(null),
    id = useId();
  useNativeReset(root, () => {
    if (value === undefined) {
      setText(defaultValue);
      setToken(null);
    }
  });
  const inspect = (next: string, caret: number) => {
    const found = next.slice(0, caret).match(/(?:^|\s)@([\p{L}\p{N}_-]*)$/u);
    setToken(
      found
        ? { start: caret - found[1].length - 1, end: caret, query: found[1] }
        : null,
    );
    setActive(0);
  };
  const matches = token
    ? options
        .filter(
          (o) =>
            !o.disabled &&
            `${o.label} ${o.handle ?? o.id}`
              .toLowerCase()
              .includes(token.query.toLowerCase()),
        )
        .slice(0, 6)
    : [];
  const choose = (option: MentionOption) => {
    if (!token || disabled) return;
    const insert = `@${(option.handle ?? option.id).replace(/\s+/g, "_")} `,
      next = text.slice(0, token.start) + insert + text.slice(token.end);
    if (next.length > maxLength) return;
    setText(next);
    setToken(null);
    setNotice(`Mentioned ${option.label}`);
    onMention?.(option);
    queueMicrotask(() => {
      input.current?.focus();
      input.current?.setSelectionRange(
        token.start + insert.length,
        token.start + insert.length,
      );
    });
  };
  return (
    <div
      ref={root}
      className={`mingu-workflow mingu-mention ${className}`}
      style={style}
    >
      <TextareaField
        ref={input}
        label={label}
        name={name}
        value={text}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={4}
        aria-autocomplete="list"
        aria-controls={token ? id : undefined}
        aria-activedescendant={
          token && matches[active] ? `${id}-${active}` : undefined
        }
        onChange={(e) => {
          setText(e.target.value);
          inspect(e.target.value, e.target.selectionStart);
        }}
        onClick={(e) =>
          inspect(e.currentTarget.value, e.currentTarget.selectionStart)
        }
        onBlur={(e) => {
          if (!root.current?.contains(e.relatedTarget as Node)) setToken(null);
        }}
        onKeyDown={(e) => {
          if (!token) return;
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setToken(null);
          } else if (
            matches.length &&
            (e.key === "ArrowDown" || e.key === "ArrowUp")
          ) {
            e.preventDefault();
            setActive(
              (active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) %
                matches.length,
            );
          } else if (matches.length && (e.key === "Enter" || e.key === "Tab")) {
            e.preventDefault();
            choose(matches[active] ?? matches[0]);
          }
        }}
      />
      {token && (
        <div
          className="mingu-mention-panel"
          role="listbox"
          id={id}
          aria-label="Mention suggestions"
        >
          {matches.map((option, i) => (
            <button
              key={option.id}
              id={`${id}-${i}`}
              type="button"
              role="option"
              aria-selected={active === i}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(option)}
            >
              <span className="mingu-mention-avatar" aria-hidden="true">
                {option.label[0]}
              </span>
              <span>
                <strong>{option.label}</strong>
                <small>
                  {option.description ?? `@${option.handle ?? option.id}`}
                </small>
              </span>
            </button>
          ))}
          {!matches.length && (
            <p className="mingu-workflow-note">No matching people</p>
          )}
        </div>
      )}
      <span className="mingu-workflow-note">
        @ to mention · {text.length} / {maxLength}
      </span>
      <span role="status" className="mru-sr-only">
        {notice}
      </span>
    </div>
  );
}

export interface StepperItem {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  disabled?: boolean;
  canContinue?: boolean;
}
export interface StepperProps extends CollectionProps {
  steps: readonly StepperItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  onComplete?: () => void;
  completedIds?: readonly string[];
  allowJump?: boolean;
}
export function Stepper({
  steps,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  completedIds = [],
  allowJump = false,
  label = "Setup steps",
  disabled,
  className = "",
  style,
}: StepperProps) {
  const enabled = steps.filter((s) => !s.disabled),
    [selected, setSelected] = useControllable(
      value,
      defaultValue ?? enabled[0]?.id ?? "",
      onValueChange,
    ),
    current = enabled.find((s) => s.id === selected) ?? enabled[0],
    index = enabled.findIndex((s) => s.id === current?.id);
  if (!current) return <EmptyState title="No steps available" />;
  return (
    <section
      className={`mingu-workflow mingu-stepper ${className}`}
      style={style}
      aria-label={label}
    >
      <nav aria-label={label}>
        <ol>
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                disabled={
                  disabled ||
                  s.disabled ||
                  (!allowJump &&
                    enabled.findIndex((e) => e.id === s.id) > index &&
                    !completedIds.includes(s.id))
                }
                aria-current={s.id === current.id ? "step" : undefined}
                onClick={() => setSelected(s.id)}
              >
                <span>
                  {completedIds.includes(s.id) ? (
                    <VectorIcon name="check" size={16} />
                  ) : (
                    i + 1
                  )}
                </span>
                <strong>{s.title}</strong>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mingu-stepper-content">
        <h3>{current.title}</h3>
        {current.description && (
          <p className="mingu-workflow-note">{current.description}</p>
        )}
        {current.content}
      </div>
      <div className="mingu-workflow-spread">
        <Button
          variant="ghost"
          disabled={disabled || index <= 0}
          onClick={() => setSelected(enabled[index - 1].id)}
        >
          <VectorIcon name="arrow-left" size="1em" /> Back
        </Button>
        <Button
          disabled={disabled || current.canContinue === false}
          onClick={() => {
            if (index < enabled.length - 1) setSelected(enabled[index + 1].id);
            else onComplete?.();
          }}
        >
          {index === enabled.length - 1 ? (
            "Finish"
          ) : (
            <>
              Continue <VectorIcon name="arrow-right" size="1em" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
