"use client";
import { Icon as VectorIcon } from "../icons";

import * as React from "react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button, TextField, Checkbox } from "../system/base";
import { EmptyState } from "../system/display";
import { CopyButton } from "../system/micro-interactions";
import { Popover } from "../system/overlays";
import { useControllable } from "../shared";

interface CreativeProps {
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}
const finite = (v: number, fallback: number) =>
  Number.isFinite(v) ? v : fallback;
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const hex = (v: string) => (/^#[\da-f]{6}$/i.test(v) ? v : "#777777");
function useFormReset(
  ref: React.RefObject<HTMLElement | null>,
  reset: () => void,
) {
  const latest = useRef(reset);
  latest.current = reset;
  useEffect(() => {
    const form = ref.current?.closest("form");
    const onReset = () => latest.current();
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, [ref]);
}
export interface ChoiceItem {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface MultiSelectProps extends CreativeProps {
  options: readonly ChoiceItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
  maxSelected?: number;
}
export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  name,
  maxSelected = 12,
  label = "Select items",
  disabled,
  className = "",
  style,
}: MultiSelectProps) {
  const [selected, setSelected] = useControllable<readonly string[]>(
    value,
    defaultValue,
    (next) => onValueChange?.([...next]),
  );
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const max = Math.floor(clamp(finite(maxSelected, 12), 1, 100));
  useFormReset(root, () => {
    if (value === undefined) {
      setSelected(defaultValue);
      setQuery("");
    }
  });
  const choose = (id: string) => {
    if (disabled || options.find((o) => o.value === id)?.disabled) return;
    setSelected(
      selected.includes(id)
        ? selected.filter((v) => v !== id)
        : selected.length < max
          ? [...selected, id]
          : selected,
    );
  };
  const available = options.filter((o) =>
    `${o.label} ${o.description ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div
      ref={root}
      className={`mingu-creative mingu-multi-select ${className}`}
      style={style}
    >
      <span className="mingu-creative-label">{label}</span>
      {disabled ? (
        <Button disabled>{selected.length} selected</Button>
      ) : (
        <Popover
          trigger={
            selected.length
              ? `${selected.length} selected · Edit`
              : "Choose options +"
          }
          label={label}
        >
          <div
            className="mingu-multi-panel"
            onKeyDown={(e) => {
              if (e.key !== "Escape") return;
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget
                .closest<HTMLDivElement>("[popover]")
                ?.hidePopover();
              root.current
                ?.querySelector<HTMLButtonElement>("button[popovertarget]")
                ?.focus();
            }}
          >
            <TextField
              label={`Search ${label}`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div
              className="mingu-choice-list"
              role="group"
              aria-label="Options"
            >
              {available.map((o) => (
                <Checkbox
                  key={o.value}
                  checked={selected.includes(o.value)}
                  disabled={
                    o.disabled ||
                    (!selected.includes(o.value) && selected.length >= max)
                  }
                  onChange={() => choose(o.value)}
                >
                  <span>
                    {o.label}
                    {o.description && <small>{o.description}</small>}
                  </span>
                </Checkbox>
              ))}
              {!available.length && (
                <p className="mingu-creative-muted">No matching options.</p>
              )}
            </div>
            <span className="mingu-creative-muted" role="status">
              {selected.length} / {max} selected
            </span>
          </div>
        </Popover>
      )}
      <div className="mingu-choice-chips">
        {options
          .filter((o) => selected.includes(o.value))
          .map((o) => (
            <button
              key={o.value}
              type="button"
              disabled={disabled || o.disabled}
              aria-label={`Remove ${o.label}`}
              onClick={() => choose(o.value)}
            >
              {o.label}
              <span aria-hidden="true">
                <VectorIcon name="close" size="1em" />
              </span>
            </button>
          ))}
      </div>
      {name &&
        selected.map((id) => (
          <input
            key={id}
            type="hidden"
            name={name}
            value={id}
            disabled={disabled}
          />
        ))}
    </div>
  );
}

export interface TransferListProps extends CreativeProps {
  options: readonly ChoiceItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
}
export function TransferList({
  options,
  value,
  defaultValue = [],
  onValueChange,
  name,
  label = "Assign items",
  disabled,
  className = "",
  style,
}: TransferListProps) {
  const [assigned, setAssigned] = useControllable<readonly string[]>(
    value,
    defaultValue,
    (next) => onValueChange?.([...next]),
  );
  const [marked, setMarked] = useState<string[]>([]),
    [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useFormReset(root, () => {
    if (value === undefined) {
      setAssigned(defaultValue);
      setMarked([]);
      setQuery("");
    }
  });
  const matches = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const movable = (right: boolean) =>
    matches
      .filter(
        (o) =>
          !o.disabled &&
          marked.includes(o.value) &&
          assigned.includes(o.value) === right,
      )
      .map((o) => o.value);
  const move = (right: boolean) => {
    if (disabled) return;
    const ids = movable(!right);
    setAssigned(
      right
        ? [...new Set([...assigned, ...ids])]
        : assigned.filter((id) => !ids.includes(id)),
    );
    setMarked((current) => current.filter((id) => !ids.includes(id)));
  };
  return (
    <div
      ref={root}
      className={`mingu-creative mingu-transfer ${className}`}
      style={style}
    >
      <TextField
        label={label}
        type="search"
        placeholder="Find an item…"
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mingu-transfer-columns">
        {[false, true].map((right) => (
          <section
            key={String(right)}
            aria-label={right ? "Assigned items" : "Available items"}
          >
            <header>
              <strong>{right ? "Assigned" : "Available"}</strong>
              <span>
                {
                  options.filter((o) => assigned.includes(o.value) === right)
                    .length
                }
              </span>
            </header>
            <div className="mingu-choice-list">
              {matches
                .filter((o) => assigned.includes(o.value) === right)
                .map((o) => (
                  <Checkbox
                    key={o.value}
                    disabled={disabled || o.disabled}
                    checked={marked.includes(o.value)}
                    onChange={() =>
                      setMarked((current) =>
                        current.includes(o.value)
                          ? current.filter((id) => id !== o.value)
                          : [...current, o.value],
                      )
                    }
                  >
                    {o.label}
                  </Checkbox>
                ))}
              {!matches.some((o) => assigned.includes(o.value) === right) && (
                <p className="mingu-creative-muted">No items</p>
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="mingu-creative-actions">
        <Button
          variant="outline"
          disabled={disabled || !movable(true).length}
          onClick={() => move(false)}
        >
          <VectorIcon name="arrow-left" size="1em" /> Remove
        </Button>
        <Button
          disabled={disabled || !movable(false).length}
          onClick={() => move(true)}
        >
          Assign <VectorIcon name="arrow-right" size="1em" />
        </Button>
      </div>
      <p className="mingu-creative-muted" role="status">
        {assigned.length} assigned · {marked.length} checked
      </p>
      {name &&
        assigned.map((id) => (
          <input
            key={id}
            type="hidden"
            name={name}
            value={id}
            disabled={disabled}
          />
        ))}
    </div>
  );
}

export interface RatingProps extends CreativeProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  name?: string;
  required?: boolean;
}
export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  name,
  required,
  label = "Rate this experience",
  disabled,
  className = "",
  style,
}: RatingProps) {
  const count = Math.floor(clamp(finite(max, 5), 1, 10)),
    id = useId(),
    root = useRef<HTMLFieldSetElement>(null);
  const [current, setCurrent] = useControllable(
      value,
      defaultValue,
      onValueChange,
    ),
    [hover, setHover] = useState<number | null>(null);
  const selected = clamp(Math.round(finite(current, 0)), 0, count),
    visual = hover ?? selected;
  useFormReset(root, () => {
    if (value === undefined) {
      setCurrent(defaultValue);
      setHover(null);
    }
  });
  return (
    <fieldset
      ref={root}
      className={`mingu-creative mingu-rating ${className}`}
      disabled={disabled}
      style={style}
      onMouseLeave={() => setHover(null)}
    >
      <legend>{label}</legend>
      <div className="mingu-rating-stars">
        {Array.from({ length: count }, (_, i) => (
          <label
            key={i}
            data-filled={i < visual || undefined}
            onMouseEnter={() => {
              if (!disabled) setHover(i + 1);
            }}
          >
            <input
              type="radio"
              name={name ?? id}
              value={i + 1}
              checked={selected === i + 1}
              required={required}
              onChange={() => setCurrent(i + 1)}
              aria-label={`${i + 1} ${i === 0 ? "star" : "stars"}`}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m12 2.5 2.9 5.9 6.5 1-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-1z" />
            </svg>
          </label>
        ))}
      </div>
      <div className="mingu-creative-actions">
        <output>{selected ? `${selected} / ${count}` : "Not rated yet"}</output>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || !selected}
          onClick={() => setCurrent(0)}
        >
          Clear rating
        </Button>
      </div>
    </fieldset>
  );
}

export interface HistoryEntry {
  id: string;
  label: string;
  description?: string;
}
export interface UndoHistoryProps extends CreativeProps {
  entries: readonly HistoryEntry[];
  value: string;
  onValueChange: (id: string) => void;
}
export function UndoHistory({
  entries,
  value,
  onValueChange,
  label = "Version history",
  disabled,
  className = "",
  style,
}: UndoHistoryProps) {
  const index = entries.findIndex((e) => e.id === value);
  const select = (i: number) => {
    if (!disabled && entries[i]) onValueChange(entries[i].id);
  };
  return (
    <section
      className={`mingu-creative mingu-history ${className}`}
      style={style}
      aria-label={label}
    >
      <header className="mingu-creative-heading">
        <strong>{label}</strong>
        <div className="mingu-creative-actions">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || index <= 0}
            onClick={() => select(index - 1)}
          >
            <VectorIcon name="undo" size="1em" /> Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || index < 0 || index >= entries.length - 1}
            onClick={() => select(index + 1)}
          >
            Redo <VectorIcon name="redo" size="1em" />
          </Button>
        </div>
      </header>
      {!entries.length ? (
        <EmptyState
          title="No history yet"
          description="Changes will appear here."
        />
      ) : (
        <ol>
          {entries.map((entry, i) => (
            <li key={entry.id} data-future={i > index || undefined}>
              <button
                type="button"
                disabled={disabled}
                aria-current={entry.id === value ? "step" : undefined}
                onClick={() => select(i)}
              >
                <span className="mingu-history-dot" aria-hidden="true" />
                <span>
                  <strong>{entry.label}</strong>
                  {entry.description && <small>{entry.description}</small>}
                </span>
                {entry.id === value && (
                  <span className="mingu-history-current">Current</span>
                )}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export interface GradientStop {
  id: string;
  color: string;
  position: number;
}
export interface GradientValue {
  angle: number;
  stops: readonly GradientStop[];
}
export interface GradientEditorProps extends CreativeProps {
  value?: GradientValue;
  defaultValue?: GradientValue;
  onValueChange?: (value: GradientValue) => void;
}
const initialGradient: GradientValue = {
  angle: 120,
  stops: [
    { id: "start", color: "#a1d4fa", position: 0 },
    { id: "middle", color: "#a599f1", position: 50 },
    { id: "end", color: "#efb4d3", position: 100 },
  ],
};
export function gradientCss(value: GradientValue) {
  const stops = value.stops.length
    ? [...value.stops]
    : [{ id: "empty", color: "#777777", position: 0 }];
  if (stops.length === 1)
    stops.push({ ...stops[0], id: "fallback-end", position: 100 });
  return `linear-gradient(${clamp(finite(value.angle, 0), 0, 360)}deg, ${stops
    .sort((a, b) => a.position - b.position)
    .map(
      (s) =>
        `${hex(s.color)} ${Math.round(clamp(finite(s.position, 0), 0, 100))}%`,
    )
    .join(", ")})`;
}
export function GradientEditor({
  value,
  defaultValue = initialGradient,
  onValueChange,
  label = "Gradient editor",
  disabled,
  className = "",
  style,
}: GradientEditorProps) {
  const [current, setCurrent] = useControllable(
      value,
      defaultValue,
      onValueChange,
    ),
    [selected, setSelected] = useState(defaultValue.stops[0]?.id ?? "");
  const bar = useRef<HTMLDivElement>(null),
    drag = useRef<string | null>(null),
    serial = useRef(0),
    prefix = useId();
  const stop = current.stops.find((s) => s.id === selected) ?? current.stops[0],
    css = gradientCss(current);
  const update = (id: string, patch: Partial<GradientStop>) => {
    if (!disabled)
      setCurrent({
        ...current,
        stops: current.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      });
  };
  const move = (clientX: number) => {
    const rect = bar.current?.getBoundingClientRect();
    if (rect && drag.current && rect.width)
      update(drag.current, {
        position: Math.round(
          clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
        ),
      });
  };
  return (
    <section
      className={`mingu-creative mingu-gradient-editor ${className}`}
      style={style}
      aria-label={label}
    >
      <header className="mingu-creative-heading">
        <strong>{label}</strong>
        <span className="mingu-creative-muted">
          {current.stops.length} color stops
        </span>
      </header>
      <div
        className="mingu-gradient-art"
        role="img"
        aria-label="Gradient preview"
        style={{ background: css }}
      >
        <span>
          MAKE SOMETHING
          <br />
          <b>beautiful.</b>
        </span>
      </div>
      <div
        ref={bar}
        className="mingu-gradient-track"
        style={{ background: css, touchAction: disabled ? "pan-y" : "none" }}
        onPointerDown={(e) => {
          const handle = (e.target as Element).closest<HTMLElement>(
            "[data-stop]",
          );
          if (disabled || !handle) return;
          drag.current = handle.dataset.stop!;
          setSelected(drag.current);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current) move(e.clientX);
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
      >
        {current.stops.map((s, i) => (
          <button
            key={s.id}
            data-stop={s.id}
            type="button"
            disabled={disabled}
            aria-label={`Select color stop ${i + 1}`}
            aria-pressed={s.id === stop?.id}
            onClick={() => setSelected(s.id)}
            style={{
              left: `${clamp(finite(s.position, 0), 0, 100)}%`,
              background: hex(s.color),
            }}
          />
        ))}
      </div>
      <div className="mingu-gradient-fields">
        {stop && (
          <>
            <label>
              Stop color
              <input
                type="color"
                aria-label="Stop color"
                disabled={disabled}
                value={hex(stop.color)}
                onChange={(e) => update(stop.id, { color: e.target.value })}
              />
            </label>
            <label>
              Position · {Math.round(stop.position)}%
              <input
                type="range"
                aria-label="Stop position"
                min={0}
                max={100}
                value={clamp(stop.position, 0, 100)}
                disabled={disabled}
                onChange={(e) =>
                  update(stop.id, { position: Number(e.target.value) })
                }
              />
            </label>
          </>
        )}
        <label>
          Angle · {Math.round(current.angle)}°
          <input
            type="range"
            aria-label="Gradient angle"
            min={0}
            max={360}
            value={clamp(current.angle, 0, 360)}
            disabled={disabled}
            onChange={(e) =>
              setCurrent({ ...current, angle: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <div className="mingu-creative-actions">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || current.stops.length >= 6}
          onClick={() => {
            const id = `${prefix}-${++serial.current}`;
            setCurrent({
              ...current,
              stops: [
                ...current.stops,
                { id, color: stop?.color ?? "#888888", position: 50 },
              ],
            });
            setSelected(id);
          }}
        >
          + Add stop
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || current.stops.length <= 2 || !stop}
          onClick={() => {
            if (stop) {
              setCurrent({
                ...current,
                stops: current.stops.filter((s) => s.id !== stop.id),
              });
              setSelected(
                current.stops.find((s) => s.id !== stop.id)?.id ?? "",
              );
            }
          }}
        >
          Remove stop
        </Button>
        <CopyButton text={`background: ${css};`} label="Copy CSS" />
      </div>
    </section>
  );
}

export interface PixelEditorProps extends CreativeProps {
  columns?: number;
  rows?: number;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (pixels: string[]) => void;
  defaultColor?: string;
}
export function PixelEditor({
  columns = 12,
  rows = 8,
  value,
  defaultValue = [],
  onValueChange,
  defaultColor = "#a599f1",
  label = "Pixel editor",
  disabled,
  className = "",
  style,
}: PixelEditorProps) {
  const cols = Math.floor(clamp(finite(columns, 12), 2, 24)),
    lines = Math.floor(clamp(finite(rows, 8), 2, 24));
  const [pixels, setPixels] = useControllable<readonly string[]>(
    value,
    defaultValue,
    (next) => onValueChange?.([...next]),
  );
  const [color, setColor] = useState(hex(defaultColor)),
    [erase, setErase] = useState(false),
    [touch, setTouch] = useState(false),
    [active, setActive] = useState(0);
  const grid = useRef<HTMLDivElement>(null),
    painting = useRef(false),
    latest = useRef(pixels);
  latest.current = pixels;
  const paint = (index: number) => {
    if (disabled || index < 0 || index >= cols * lines) return;
    const next = Array.from(
      { length: cols * lines },
      (_, i) => latest.current[i] ?? "transparent",
    );
    const fill = erase ? "transparent" : color;
    if (next[index] === fill) return;
    next[index] = fill;
    latest.current = next;
    setPixels(next);
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols} ${lines}">${Array.from({ length: cols * lines }, (_, i) => (pixels[i] && pixels[i] !== "transparent" ? `<rect x="${i % cols}" y="${Math.floor(i / cols)}" width="1" height="1" fill="${hex(pixels[i])}"/>` : "")).join("")}</svg>`;
  return (
    <section
      className={`mingu-creative mingu-pixel-editor ${className}`}
      style={style}
      aria-label={label}
    >
      <header className="mingu-creative-heading">
        <strong>{label}</strong>
        <label className="mingu-pixel-color">
          Brush
          <input
            type="color"
            aria-label="Brush color"
            value={color}
            disabled={disabled}
            onChange={(e) => {
              setColor(e.target.value);
              setErase(false);
            }}
          />
        </label>
      </header>
      <div
        ref={grid}
        role="grid"
        aria-label="Pixel canvas"
        aria-rowcount={lines}
        aria-colcount={cols}
        className="mingu-pixel-grid"
        style={{ touchAction: touch && !disabled ? "none" : "pan-y" }}
        onPointerDown={(e) => {
          if (disabled || (e.pointerType === "touch" && !touch)) return;
          const cell = (e.target as Element).closest<HTMLElement>(
            "[data-pixel]",
          );
          if (!cell) return;
          painting.current = true;
          paint(Number(cell.dataset.pixel));
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!painting.current) return;
          const cell = document
            .elementFromPoint(e.clientX, e.clientY)
            ?.closest<HTMLElement>("[data-pixel]");
          if (cell && grid.current?.contains(cell))
            paint(Number(cell.dataset.pixel));
        }}
        onPointerUp={() => {
          painting.current = false;
        }}
        onPointerCancel={() => {
          painting.current = false;
        }}
        onLostPointerCapture={() => {
          painting.current = false;
        }}
      >
        {Array.from({ length: lines }, (_, row) => (
          <div
            role="row"
            key={row}
            style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}
          >
            {Array.from({ length: cols }, (_, col) => {
              const index = row * cols + col,
                fill = pixels[index] ?? "transparent";
              return (
                <button
                  key={index}
                  type="button"
                  role="gridcell"
                  data-pixel={index}
                  aria-label={`Pixel ${row + 1}, ${col + 1}`}
                  aria-selected={fill !== "transparent"}
                  disabled={disabled}
                  tabIndex={
                    index === Math.min(active, cols * lines - 1) ? 0 : -1
                  }
                  style={{
                    background: fill === "transparent" ? undefined : hex(fill),
                  }}
                  onFocus={() => setActive(index)}
                  onClick={() => paint(index)}
                  onKeyDown={(e) => {
                    const next =
                      e.key === "ArrowRight"
                        ? Math.min(index + 1, cols * lines - 1)
                        : e.key === "ArrowLeft"
                          ? Math.max(0, index - 1)
                          : e.key === "ArrowDown"
                            ? Math.min(index + cols, cols * lines - 1)
                            : e.key === "ArrowUp"
                              ? Math.max(0, index - cols)
                              : e.key === "Home"
                                ? row * cols
                                : e.key === "End"
                                  ? row * cols + cols - 1
                                  : -1;
                    if (next >= 0) {
                      e.preventDefault();
                      setActive(next);
                      grid.current
                        ?.querySelector<HTMLButtonElement>(
                          `[data-pixel="${next}"]`,
                        )
                        ?.focus();
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mingu-creative-actions">
        <Button
          size="sm"
          variant={erase ? "primary" : "outline"}
          aria-pressed={erase}
          disabled={disabled}
          onClick={() => setErase(!erase)}
        >
          Eraser
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => setPixels([])}
        >
          Clear pixels
        </Button>
        <CopyButton text={svg} label="Copy SVG" />
      </div>
      <Checkbox
        checked={touch}
        disabled={disabled}
        onChange={(e) => setTouch(e.currentTarget.checked)}
      >
        Draw with touch
      </Checkbox>
    </section>
  );
}

export interface ScratchCardProps extends CreativeProps {
  children: ReactNode;
  onRevealChange?: (revealed: boolean) => void;
  revealThreshold?: number;
}
export function ScratchCard({
  children,
  onRevealChange,
  revealThreshold = 0.55,
  label = "Scratch to discover",
  disabled,
  className = "",
  style,
}: ScratchCardProps) {
  const id = useId(),
    root = useRef<SVGSVGElement>(null),
    drawing = useRef(false),
    [points, setPoints] = useState<{ x: number; y: number }[]>([]),
    cells = useRef(new Set<number>()),
    last = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false),
    [touch, setTouch] = useState(false),
    [coverage, setCoverage] = useState(0);
  const reveal = (next: boolean) => {
    setRevealed(next);
    onRevealChange?.(next);
  };
  const scratch = (clientX: number, clientY: number) => {
    const r = root.current?.getBoundingClientRect();
    if (!r?.width || revealed || disabled) return;
    const point = {
      x: clamp(((clientX - r.left) / r.width) * 100, 0, 100),
      y: clamp(((clientY - r.top) / r.height) * 60, 0, 60),
    };
    if (
      last.current &&
      Math.hypot(point.x - last.current.x, point.y - last.current.y) < 1
    )
      return;
    last.current = point;
    setPoints((current) => [...current.slice(-799), point]);
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 16; x++)
        if (
          Math.hypot(
            ((x + 0.5) * 100) / 16 - point.x,
            (y + 0.5) * 6 - point.y,
          ) <= 7
        )
          cells.current.add(y * 16 + x);
    const amount = cells.current.size / 160;
    setCoverage(Math.round(amount * 100));
    if (amount >= clamp(finite(revealThreshold, 0.55), 0.1, 1)) reveal(true);
  };
  return (
    <section
      className={`mingu-creative mingu-scratch ${className}`}
      style={style}
      aria-label={label}
    >
      <div
        className="mingu-scratch-stage"
        data-revealed={revealed || undefined}
      >
        <div
          className="mingu-scratch-prize"
          aria-hidden={!revealed}
          inert={!revealed}
        >
          {children}
        </div>
        {!revealed && (
          <svg
            ref={root}
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
            className="mingu-scratch-cover"
            aria-hidden="true"
            style={{ touchAction: touch && !disabled ? "none" : "pan-y" }}
            onPointerDown={(e) => {
              if (disabled || (e.pointerType === "touch" && !touch)) return;
              drawing.current = true;
              last.current = null;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratch(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (drawing.current) scratch(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              drawing.current = false;
              last.current = null;
            }}
            onPointerCancel={() => {
              drawing.current = false;
              last.current = null;
            }}
            onLostPointerCapture={() => {
              drawing.current = false;
            }}
          >
            <defs>
              <mask id={id}>
                <rect width="100" height="60" fill="white" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="7" fill="black" />
                ))}
              </mask>
              <linearGradient id={`${id}-paint`} x2="1" y2="1">
                <stop stopColor="var(--mingu-raised)" />
                <stop offset="1" stopColor="var(--mingu-border)" />
              </linearGradient>
            </defs>
            <rect
              width="100"
              height="60"
              fill={`url(#${id}-paint)`}
              mask={`url(#${id})`}
            />
            <text
              x="50"
              y="31"
              textAnchor="middle"
              fontSize="5"
              fill="var(--mingu-muted)"
              pointerEvents="none"
            >
              {label}
            </text>
          </svg>
        )}
      </div>
      <div className="mingu-creative-actions">
        <span className="mingu-creative-muted" role="status">
          {revealed ? "Revealed" : `${coverage}% uncovered`}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            if (revealed) {
              setPoints([]);
              cells.current.clear();
              last.current = null;
              setCoverage(0);
              reveal(false);
            } else reveal(true);
          }}
        >
          {revealed ? "Cover again" : "Reveal card"}
        </Button>
      </div>
      <Checkbox
        checked={touch}
        disabled={disabled}
        onChange={(e) => setTouch(e.currentTarget.checked)}
      >
        Scratch with touch
      </Checkbox>
    </section>
  );
}

export interface CircularDialProps extends CreativeProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  name?: string;
}
export function CircularDial({
  value,
  defaultValue = 40,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  name,
  label = "Intensity",
  disabled,
  className = "",
  style,
}: CircularDialProps) {
  const low = finite(min, 0),
    high = Math.max(low + 0.000001, finite(max, 100)),
    increment = Math.max(0.000001, finite(step, 1)),
    root = useRef<HTMLDivElement>(null),
    drag = useRef(false),
    id = useId();
  const [current, setCurrent] = useControllable(
      value,
      defaultValue,
      onValueChange,
    ),
    [touch, setTouch] = useState(false);
  const snap = (v: number) =>
      v >= high
        ? high
        : v <= low
          ? low
          : Number(
              clamp(
                low + Math.round((v - low) / increment) * increment,
                low,
                high,
              ).toFixed(6),
            ),
    actual = snap(finite(current, low)),
    fraction = (actual - low) / (high - low),
    angle = ((135 + fraction * 270) * Math.PI) / 180,
    length = 2 * Math.PI * 38;
  const change = (v: number) => {
    if (!disabled) setCurrent(snap(v));
  };
  useFormReset(root, () => {
    if (value === undefined) setCurrent(defaultValue);
  });
  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect(),
      a =
        ((Math.atan2(
          e.clientY - b.top - b.height / 2,
          e.clientX - b.left - b.width / 2,
        ) *
          180) /
          Math.PI -
          135 +
          360) %
        360;
    change(low + (high - low) * (a > 270 ? (a > 315 ? 0 : 1) : a / 270));
  };
  return (
    <div
      ref={root}
      className={`mingu-creative mingu-circular-dial ${className}`}
      style={style}
    >
      <span className="mingu-creative-label" id={id}>
        {label}
      </span>
      <div
        className="mingu-dial-surface"
        role="slider"
        aria-labelledby={id}
        aria-valuemin={low}
        aria-valuemax={high}
        aria-valuenow={actual}
        aria-valuetext={`${actual}${unit}`}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        style={{ touchAction: touch && !disabled ? "none" : "pan-y" }}
        onPointerDown={(e) => {
          if (disabled || (e.pointerType === "touch" && !touch)) return;
          drag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          point(e);
        }}
        onPointerMove={(e) => {
          if (drag.current) point(e);
        }}
        onPointerUp={() => {
          drag.current = false;
        }}
        onPointerCancel={() => {
          drag.current = false;
        }}
        onLostPointerCapture={() => {
          drag.current = false;
        }}
        onKeyDown={(e) => {
          const next =
            e.key === "Home"
              ? low
              : e.key === "End"
                ? high
                : e.key === "ArrowUp" || e.key === "ArrowRight"
                  ? actual + increment
                  : e.key === "ArrowDown" || e.key === "ArrowLeft"
                    ? actual - increment
                    : e.key === "PageUp"
                      ? actual + increment * 10
                      : e.key === "PageDown"
                        ? actual - increment * 10
                        : null;
          if (next !== null) {
            e.preventDefault();
            change(next);
          }
        }}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="38"
            className="mingu-dial-track"
            strokeDasharray={`${length * 0.75} ${length}`}
            transform="rotate(135 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            className="mingu-dial-fill"
            strokeDasharray={`${length * 0.75 * fraction} ${length}`}
            transform="rotate(135 50 50)"
          />
          <circle
            cx={50 + 38 * Math.cos(angle)}
            cy={50 + 38 * Math.sin(angle)}
            r="4"
            className="mingu-dial-thumb"
          />
        </svg>
        <span className="mingu-dial-number" aria-hidden="true">
          {actual}
          <small>{unit}</small>
        </span>
      </div>
      <div className="mingu-creative-actions">
        <Button
          variant="outline"
          size="sm"
          aria-label={`Decrease ${label}`}
          disabled={disabled || actual <= low}
          onClick={() => change(actual - increment)}
        >
          <VectorIcon name="minus" size="1em" />
        </Button>
        <span className="mingu-creative-muted">Drag · arrow keys</span>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Increase ${label}`}
          disabled={disabled || actual >= high}
          onClick={() => change(actual + increment)}
        >
          +
        </Button>
      </div>
      <Checkbox
        checked={touch}
        disabled={disabled}
        onChange={(e) => setTouch(e.currentTarget.checked)}
      >
        Turn with touch
      </Checkbox>
      {name && (
        <input type="hidden" name={name} value={actual} disabled={disabled} />
      )}
    </div>
  );
}
