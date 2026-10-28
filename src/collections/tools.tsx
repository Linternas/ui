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
import { Button, Dialog, Input, TextField } from "../system/base";
import { Slider, TextareaField } from "../system/forms";
import { useMotionPreference as useReducedMotion } from "../experimental/motion-preference";

const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
function useValue<T>(
  value: T | undefined,
  initial: T,
  change?: (next: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState(initial);
  return [
    value === undefined ? internal : value,
    (next) => {
      if (value === undefined) setInternal(next);
      change?.(next);
    },
  ];
}
function useReset(ref: React.RefObject<HTMLElement | null>, reset: () => void) {
  const latest = useRef(reset);
  latest.current = reset;
  useEffect(() => {
    const form = ref.current?.closest("form");
    const fn = () => latest.current();
    form?.addEventListener("reset", fn);
    return () => form?.removeEventListener("reset", fn);
  }, [ref]);
}
interface ToolProps {
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface TagInputProps extends ToolProps {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (tags: string[]) => void;
  suggestions?: readonly string[];
  name?: string;
  maxTags?: number;
  error?: string;
}
export function TagInput({
  value,
  defaultValue = [],
  onValueChange,
  suggestions = [],
  label = "Tags",
  name,
  maxTags = 12,
  disabled,
  error,
  className = "",
  style,
}: TagInputProps) {
  const [tags, setTags] = useValue<readonly string[]>(
    value,
    defaultValue,
    onValueChange as ((v: readonly string[]) => void) | undefined,
  );
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const limit = Math.floor(clamp(maxTags, 1, 100)),
    available = suggestions
      .filter(
        (s) =>
          !tags.includes(s) && s.toLowerCase().includes(draft.toLowerCase()),
      )
      .slice(0, 6);
  const add = (text: string) => {
    const tag = text.trim().slice(0, 48);
    if (!tag || disabled) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setNotice("This tag is already selected.");
      return;
    }
    if (tags.length >= limit) {
      setNotice(`Choose up to ${limit} tags.`);
      return;
    }
    setTags([...tags, tag]);
    setDraft("");
    setNotice(`${tag} added.`);
    input.current?.focus();
  };
  const remove = (tag: string) => {
    if (disabled) return;
    setTags(tags.filter((t) => t !== tag));
    setNotice(`${tag} removed.`);
    input.current?.focus();
  };
  useReset(root, () => {
    if (value === undefined) setTags(defaultValue);
    setDraft("");
    setNotice("");
  });
  return (
    <div
      ref={root}
      className={`mingu-tool mingu-tag-input ${className}`}
      style={style}
    >
      <label htmlFor={id}>{label}</label>
      <div className="mingu-tag-shell" aria-disabled={disabled}>
        <div className="mingu-tag-list">
          {tags.map((tag) => (
            <span className="mingu-tag" key={tag}>
              {tag}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${tag}`}
                onClick={() => remove(tag)}
              >
                <VectorIcon name="close" size="1em" />
              </button>
              {name && (
                <input
                  type="hidden"
                  name={name}
                  value={tag}
                  disabled={disabled}
                />
              )}
            </span>
          ))}
        </div>
        <Input
          ref={input}
          id={id}
          value={draft}
          disabled={disabled}
          maxLength={48}
          placeholder="Type and press Enter"
          aria-invalid={!!error || undefined}
          aria-describedby={`${id}-hint`}
          onChange={(e) => {
            setDraft(e.currentTarget.value);
            setNotice("");
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
            if (e.key === "Backspace" && !draft && tags.length) {
              e.preventDefault();
              remove(tags[tags.length - 1]);
            }
          }}
        />
        <Button
          variant="secondary"
          disabled={disabled || !draft.trim() || tags.length >= limit}
          onClick={() => add(draft)}
        >
          Add tag
        </Button>
      </div>
      {!!available.length && (
        <div className="mingu-tool-row" aria-label="Suggested tags">
          {available.map((tag) => (
            <Button
              key={tag}
              variant="ghost"
              size="sm"
              disabled={disabled || tags.length >= limit}
              onClick={() => add(tag)}
            >
              + {tag}
            </Button>
          ))}
        </div>
      )}
      <small id={`${id}-hint`}>
        {error ||
          `${tags.length}/${limit} tags · Backspace removes the last tag.`}
      </small>
      <span role="status" className="mingu-tool-sr">
        {notice}
      </span>
    </div>
  );
}

export interface WheelPickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface WheelPickerProps extends ToolProps {
  options: readonly WheelPickerOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}
export function WheelPicker({
  options,
  value,
  defaultValue = options.find((o) => !o.disabled)?.value ?? "",
  onValueChange,
  label = "Choose a value",
  disabled,
  name,
  className = "",
  style,
}: WheelPickerProps) {
  const [selected, setSelected] = useValue(value, defaultValue, onValueChange);
  const list = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const index = options.findIndex((o) => o.value === selected && !o.disabled),
    active = index >= 0 ? index : options.findIndex((o) => !o.disabled);
  const scrollTo = (i: number, smooth = true) =>
    list.current?.scrollTo({
      top: Math.max(0, i) * 44,
      behavior: smooth && !reduced ? "smooth" : "instant",
    });
  const choose = (i: number, focus = false) => {
    if (disabled || !options[i] || options[i].disabled) return;
    setSelected(options[i].value);
    scrollTo(i);
    if (focus) refs.current[i]?.focus({ preventScroll: true });
  };
  const latestWheel = useRef({ options, disabled, active, setSelected });
  latestWheel.current = { options, disabled, active, setSelected };
  useEffect(() => {
    clearTimeout(timer.current);
    scrollTo(active, false);
  }, [selected, active, options.length, disabled]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useReset(root, () => {
    if (value === undefined) setSelected(defaultValue);
  });
  return (
    <div
      ref={root}
      className={`mingu-tool mingu-wheel-picker ${className}`}
      style={style}
    >
      <span id={id}>{label}</span>
      <div className="mingu-wheel-window">
        <div
          ref={list}
          className="mingu-wheel-list"
          role="listbox"
          aria-labelledby={id}
          aria-disabled={disabled}
          onScroll={() => {
            clearTimeout(timer.current);
            if (disabled) return;
            timer.current = setTimeout(() => {
              const latest = latestWheel.current;
              if (!list.current || latest.disabled) return;
              const i = Math.round(list.current.scrollTop / 44);
              if (!latest.options[i] || latest.options[i].disabled) {
                scrollTo(latest.active);
                return;
              }
              latest.setSelected(latest.options[i].value);
            }, 140);
          }}
          onKeyDown={(e) => {
            if (
              !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key) ||
              disabled
            )
              return;
            e.preventDefault();
            let next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? options.length - 1
                  : active + (e.key === "ArrowDown" ? 1 : -1);
            const step = e.key === "ArrowUp" || e.key === "End" ? -1 : 1;
            while (next >= 0 && next < options.length && options[next].disabled)
              next += step;
            choose(next, true);
          }}
        >
          {options.length ? (
            options.map((option, i) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === selected}
                key={option.value}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                disabled={disabled || option.disabled}
                tabIndex={i === active ? 0 : -1}
                onClick={() => choose(i)}
              >
                {option.label}
              </button>
            ))
          ) : (
            <p>No options available.</p>
          )}
        </div>
        <i className="mingu-wheel-focus" aria-hidden="true" />
      </div>
      {name && (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      )}
      <small>
        Scroll, tap, or use{" "}
        <VectorIcon name="arrow-up" size="1em" label="Arrow up" />{" "}
        <VectorIcon name="arrow-down" size="1em" label="Arrow down" />
      </small>
    </div>
  );
}

type Hsva = [number, number, number, number];
function hexToHsva(hex: string): Hsva {
  const raw = hex.replace(/^#/, "");
  if (!/^[\da-f]{6}([\da-f]{2})?$/i.test(raw)) return [220, 0.65, 0.85, 1];
  const r = parseInt(raw.slice(0, 2), 16) / 255,
    g = parseInt(raw.slice(2, 4), 16) / 255,
    b = parseInt(raw.slice(4, 6), 16) / 255,
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  let h = d
    ? max === r
      ? ((g - b) / d) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4
    : 0;
  return [
    (h * 60 + 360) % 360,
    max ? d / max : 0,
    max,
    raw.length === 8 ? parseInt(raw.slice(6), 16) / 255 : 1,
  ];
}
function hsvaToHex([h, s, v, a]: Hsva) {
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c;
  const rgb =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return `#${[...rgb.map((n) => n + m), a]
    .map((n) =>
      Math.round(clamp(n) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
export interface ColorPickerProps extends ToolProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  name?: string;
}
export function ColorPicker({
  value,
  defaultValue = "#5577ddff",
  onValueChange,
  label = "Color",
  disabled,
  name,
  className = "",
  style,
}: ColorPickerProps) {
  const [color, setColor] = useValue(value, defaultValue, onValueChange);
  const [draft, setDraft] = useState(color);
  const root = useRef<HTMLDivElement>(null);
  const hsva = hexToHsva(color),
    [h, s, v, a] = hsva;
  useEffect(() => setDraft(color), [color]);
  useReset(root, () => {
    if (value === undefined) setColor(defaultValue);
  });
  const update = (next: Hsva) => {
    if (!disabled) setColor(hsvaToHex(next));
  };
  const point = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    update([
      h,
      clamp((event.clientX - rect.left) / rect.width),
      1 - clamp((event.clientY - rect.top) / rect.height),
      a,
    ]);
  };
  return (
    <div
      ref={root}
      className={`mingu-tool mingu-color-picker ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <div className="mingu-tool-heading">
        <strong>{label}</strong>
        <span
          className="mingu-color-swatch"
          style={{ background: color }}
          aria-label={`Selected ${color}`}
        />
      </div>
      <div
        className="mingu-color-plane"
        style={{ backgroundColor: `hsl(${h} 100% 50%)` }}
        aria-hidden="true"
        onPointerDown={(e) => {
          if (disabled || e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          point(e);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) point(e);
        }}
      >
        <i style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }} />
      </div>
      <Slider
        label="Hue"
        min={0}
        max={359}
        step={1}
        value={Math.round(h)}
        disabled={disabled}
        onValueChange={(n) => update([n, s, v, a])}
      />
      <div className="mingu-tool-columns">
        <Slider
          label="Saturation"
          min={0}
          max={100}
          value={Math.round(s * 100)}
          disabled={disabled}
          onValueChange={(n) => update([h, n / 100, v, a])}
        />
        <Slider
          label="Brightness"
          min={0}
          max={100}
          value={Math.round(v * 100)}
          disabled={disabled}
          onValueChange={(n) => update([h, s, n / 100, a])}
        />
      </div>
      <Slider
        label="Opacity"
        min={0}
        max={100}
        value={Math.round(a * 100)}
        disabled={disabled}
        onValueChange={(n) => update([h, s, v, n / 100])}
      />
      <TextField
        label="Hex color"
        value={draft}
        disabled={disabled}
        spellCheck={false}
        maxLength={9}
        error={
          /^#[\da-f]{6}([\da-f]{2})?$/i.test(draft)
            ? undefined
            : "Use #RRGGBB or #RRGGBBAA."
        }
        onChange={(e) => {
          const next = e.currentTarget.value;
          setDraft(next);
          if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(next))
            setColor(next.toLowerCase());
        }}
      />
      {name && (
        <input type="hidden" name={name} value={color} disabled={disabled} />
      )}
    </div>
  );
}

export type BezierPoints = [number, number, number, number];
export interface BezierEditorProps extends ToolProps {
  value?: BezierPoints;
  defaultValue?: BezierPoints;
  onValueChange?: (points: BezierPoints) => void;
  duration?: number;
  name?: string;
}
export function BezierEditor({
  value,
  defaultValue = [0.22, 0.75, 0.3, 1],
  onValueChange,
  duration = 1200,
  label = "Motion curve",
  disabled,
  name,
  className = "",
  style,
}: BezierEditorProps) {
  const [raw, setPoints] = useValue(value, defaultValue, onValueChange);
  const p = raw.map((n) => clamp(n)) as BezierPoints;
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const ball = useRef<HTMLDivElement>(null),
    root = useRef<HTMLDivElement>(null),
    animation = useRef<Animation | null>(null);
  const css = `cubic-bezier(${p.map((n) => n.toFixed(2)).join(", ")})`;
  useEffect(() => () => animation.current?.cancel(), []);
  useEffect(() => {
    if (reduced || disabled) {
      animation.current?.cancel();
      setPlaying(false);
    }
  }, [reduced, disabled]);
  useReset(root, () => {
    if (value === undefined) setPoints(defaultValue);
    animation.current?.cancel();
    setPlaying(false);
  });
  const set = (i: number, n: number) => {
    if (disabled) return;
    const next = [...p] as BezierPoints;
    next[i] = clamp(n);
    setPoints(next);
  };
  const drag = (e: React.PointerEvent<SVGCircleElement>, i: number) => {
    const bounds = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const next = [...p] as BezierPoints;
    next[i] = clamp(
      (((e.clientX - bounds.left) / bounds.width) * 240 - 30) / 180,
    );
    next[i + 1] =
      1 - clamp((((e.clientY - bounds.top) / bounds.height) * 240 - 30) / 180);
    setPoints(next);
  };
  const play = () => {
    if (!ball.current || disabled) return;
    animation.current?.cancel();
    if (reduced) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const run = ball.current.animate(
      [{ left: "0%" }, { left: "calc(100% - 28px)" }],
      { duration: clamp(duration, 200, 5000), easing: css, fill: "forwards" },
    );
    animation.current = run;
    run.onfinish = () => setPlaying(false);
  };
  return (
    <div
      ref={root}
      className={`mingu-tool mingu-bezier-editor ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <strong>{label}</strong>
      <svg
        className="mingu-bezier-graph"
        viewBox="0 0 240 240"
        role="img"
        aria-label="Cubic bezier curve with draggable handles"
      >
        <path
          className="mingu-bezier-guide"
          d="M30 30V210H210 M30 210L210 30"
        />
        <path
          className="mingu-bezier-arm"
          d={`M30 210L${30 + p[0] * 180} ${210 - p[1] * 180}M210 30L${30 + p[2] * 180} ${210 - p[3] * 180}`}
        />
        <path
          className="mingu-bezier-line"
          d={`M30 210C${30 + p[0] * 180} ${210 - p[1] * 180},${30 + p[2] * 180} ${210 - p[3] * 180},210 30`}
        />
        {[0, 2].map((i) => (
          <circle
            key={i}
            cx={30 + p[i] * 180}
            cy={210 - p[i + 1] * 180}
            r="11"
            className="mingu-bezier-handle"
            aria-hidden="true"
            onPointerDown={(e) => {
              if (disabled || e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              drag(e, i);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) drag(e, i);
            }}
          />
        ))}
      </svg>
      <div className="mingu-tool-columns">
        {p.map((n, i) => (
          <Slider
            key={i}
            label={["Start X", "Start Y", "End X", "End Y"][i]}
            min={0}
            max={1}
            step={0.01}
            value={n}
            disabled={disabled}
            onValueChange={(next) => set(i, next)}
          />
        ))}
      </div>
      <code className="mingu-tool-code">{css}</code>
      <div className="mingu-bezier-track">
        <div ref={ball} className="mingu-bezier-ball" />
      </div>
      <Button disabled={disabled} onClick={play}>
        {playing ? "Replay motion" : "Play motion"}
      </Button>
      {reduced && (
        <small>Motion reduction is on. The curve remains editable.</small>
      )}
      {name && (
        <input type="hidden" name={name} value={css} disabled={disabled} />
      )}
    </div>
  );
}

export interface CursorPeer {
  id: string;
  name: string;
  x: number;
  y: number;
  message?: string;
}
export interface CollaborativeCursorProps extends ToolProps {
  peers: readonly CursorPeer[];
  children?: ReactNode;
  onPositionChange?: (position: { x: number; y: number } | null) => void;
}
export function CollaborativeCursor({
  peers,
  children,
  onPositionChange,
  label = "Shared canvas",
  disabled,
  className = "",
  style,
}: CollaborativeCursorProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const reduced = useReducedMotion();
  const change = useRef(onPositionChange);
  change.current = onPositionChange;
  useEffect(() => () => change.current?.(null), []);
  const report = (next: typeof position) => {
    setPosition(next);
    onPositionChange?.(next);
  };
  return (
    <div
      className={`mingu-tool mingu-cursor-space ${className}`}
      style={style}
      role="region"
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-reduced={!!reduced}
      onPointerMove={(e) => {
        if (disabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        report({
          x: clamp((e.clientX - r.left) / r.width),
          y: clamp((e.clientY - r.top) / r.height),
        });
      }}
      onPointerLeave={() => report(null)}
      onBlur={() => report(null)}
      onKeyDown={(e) => {
        if (
          e.target !== e.currentTarget ||
          disabled ||
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        )
          return;
        e.preventDefault();
        const current = position ?? { x: 0.5, y: 0.5 };
        report({
          x: clamp(
            current.x +
              (e.key === "ArrowRight"
                ? 0.025
                : e.key === "ArrowLeft"
                  ? -0.025
                  : 0),
          ),
          y: clamp(
            current.y +
              (e.key === "ArrowDown"
                ? 0.025
                : e.key === "ArrowUp"
                  ? -0.025
                  : 0),
          ),
        });
      }}
    >
      <div className="mingu-cursor-content">{children}</div>
      <div className="mingu-cursor-overlay" aria-hidden="true">
        {peers.slice(0, 20).map((peer, i) => (
          <div
            className="mingu-peer"
            key={peer.id}
            data-tone={i % 3}
            data-right={peer.x > 0.65}
            data-bottom={peer.y > 0.7}
            style={{
              left: `${clamp(peer.x) * 100}%`,
              top: `${clamp(peer.y) * 100}%`,
            }}
          >
            <svg width="18" height="24" viewBox="0 0 18 24">
              <path d="M2 2L16 14L9 15L6 22Z" />
            </svg>
            <span>
              {peer.name.slice(0, 40)}
              {peer.message && <small>{peer.message.slice(0, 100)}</small>}
            </span>
          </div>
        ))}
        {position && (
          <div
            className="mingu-local-cross"
            style={{
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
            }}
          >
            <VectorIcon name="plus" size={24} />
          </div>
        )}
      </div>
      <span className="mingu-tool-sr">
        {peers.length
          ? `${Math.min(peers.length, 20)} supplied peers. ${peers
              .slice(0, 20)
              .map((p) => `${p.name}${p.message ? `: ${p.message}` : ""}`)
              .join(". ")}`
          : "No other peers."}
      </span>
    </div>
  );
}

export type EditorBlockType = "paragraph" | "heading" | "quote" | "code";
export interface EditorBlock {
  id: string;
  type: EditorBlockType;
  text: string;
}
export interface SlashCommandEditorProps extends ToolProps {
  value?: readonly EditorBlock[];
  defaultValue?: readonly EditorBlock[];
  onValueChange?: (blocks: EditorBlock[]) => void;
  name?: string;
  maxLength?: number;
}
const editorTypes: EditorBlockType[] = [
  "paragraph",
  "heading",
  "quote",
  "code",
];
function EditableBlock({
  block,
  disabled,
  maxLength,
  onText,
  onKey,
  node,
}: {
  block: EditorBlock;
  disabled?: boolean;
  maxLength: number;
  onText: (text: string) => void;
  onKey: React.KeyboardEventHandler<HTMLDivElement>;
  node: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const offsets = (el: HTMLDivElement) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!el.contains(range.startContainer) || !el.contains(range.endContainer))
      return null;
    const before = range.cloneRange();
    before.selectNodeContents(el);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    return { start, end: start + range.toString().length };
  };
  const renderText = (el: HTMLDivElement, text: string, caret?: number) => {
    const node = document.createTextNode(text);
    el.replaceChildren(node);
    // A final newline alone has no visual caret position in contenteditable.
    // The empty BR supplies that line without becoming part of the text model.
    if (text.endsWith("\n")) {
      const placeholder = document.createElement("br");
      placeholder.dataset.editorPlaceholder = "true";
      el.append(placeholder);
    }
    if (caret !== undefined) {
      const range = document.createRange();
      range.setStart(node, Math.min(Math.max(0, caret), text.length));
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };
  const insert = (value: string) => {
    const el = ref.current;
    if (!el || disabled) return;
    // Cross-block selections must never delete or replace another block/host DOM.
    const selection = offsets(el);
    if (!selection) return;
    const previous = el.textContent ?? "";
    const available = Math.max(
      0,
      maxLength - previous.length + selection.end - selection.start,
    );
    const text = value.slice(0, available);
    const next =
      previous.slice(0, selection.start) + text + previous.slice(selection.end);
    renderText(el, next, selection.start + text.length);
    onText(next);
  };
  const syncInput = (el: HTMLDivElement) => {
    const text = (el.textContent ?? "").slice(0, maxLength);
    if (!composing.current) {
      const selection = offsets(el);
      renderText(el, text, selection?.start);
    }
    onText(text);
  };
  useEffect(() => {
    const el = ref.current;
    if (!el || composing.current) return;
    const placeholder = el.querySelector("br[data-editor-placeholder]");
    if (
      el.textContent !== block.text ||
      !!placeholder !== block.text.endsWith("\n")
    ) {
      const selection = document.activeElement === el ? offsets(el) : null;
      renderText(el, block.text, selection?.start);
    }
  }, [block.text]);
  return (
    <div
      ref={(el) => {
        ref.current = el;
        node(el);
      }}
      contentEditable={!disabled}
      suppressContentEditableWarning
      role="textbox"
      aria-label={`${block.type} block`}
      aria-multiline="true"
      aria-disabled={disabled}
      data-type={block.type}
      data-placeholder="Write something, or type /"
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          e.shiftKey &&
          !e.nativeEvent.isComposing &&
          !disabled
        ) {
          e.preventDefault();
          insert("\n");
          return;
        }
        onKey(e);
      }}
      onCompositionStart={() => {
        composing.current = true;
      }}
      onCompositionEnd={(e) => {
        composing.current = false;
        syncInput(e.currentTarget);
      }}
      onInput={(e) => syncInput(e.currentTarget)}
      onPaste={(e) => {
        e.preventDefault();
        if (disabled) return;
        insert(e.clipboardData.getData("text/plain"));
      }}
      onDrop={(e) => e.preventDefault()}
    />
  );
}
export function SlashCommandEditor({
  value,
  defaultValue = [{ id: "first", type: "paragraph", text: "" }],
  onValueChange,
  label = "Document editor",
  disabled,
  name,
  maxLength = 20000,
  className = "",
  style,
}: SlashCommandEditorProps) {
  const [blocks, setBlocks] = useValue<readonly EditorBlock[]>(
    value,
    defaultValue,
    onValueChange as ((v: readonly EditorBlock[]) => void) | undefined,
  );
  const [menu, setMenu] = useState<string | null>(null),
    [command, setCommand] = useState(0);
  const root = useRef<HTMLDivElement>(null),
    refs = useRef(new Map<string, HTMLDivElement>());
  const serial = useRef(0);
  const uid = useId();
  const max = clamp(maxLength, 1, 100000);
  const count = blocks.reduce((sum, b) => sum + b.text.length, 0);
  const focus = (id: string) =>
    requestAnimationFrame(() => {
      const el = refs.current.get(id);
      el?.focus();
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
  const add = (after?: string) => {
    if (disabled || blocks.length >= 50) return;
    const id = `${uid}-${++serial.current}`,
      next = [...blocks],
      index = after ? next.findIndex((b) => b.id === after) + 1 : next.length;
    next.splice(index, 0, { id, type: "paragraph", text: "" });
    setBlocks(next);
    focus(id);
  };
  const apply = (type: EditorBlockType) => {
    if (disabled || !menu) return;
    const id = menu;
    setBlocks(
      blocks.map((b) =>
        b.id === id ? { ...b, type, text: b.text === "/" ? "" : b.text } : b,
      ),
    );
    setMenu(null);
    focus(id);
  };
  useReset(root, () => {
    if (value === undefined) setBlocks(defaultValue);
    setMenu(null);
  });
  return (
    <div
      ref={root}
      className={`mingu-tool mingu-slash-editor ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <div className="mingu-tool-heading">
        <strong>{label}</strong>
        <small>
          {count}/{max}
        </small>
      </div>
      <div className="mingu-editor-document">
        {blocks.slice(0, 50).map((block, index) => (
          <div className="mingu-editor-row" key={block.id}>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              aria-label={`Block ${index + 1} format`}
              aria-expanded={menu === block.id}
              onClick={() => {
                setMenu(menu === block.id ? null : block.id);
                setCommand(0);
              }}
            >
              <VectorIcon name="plus" size="1em" />
            </Button>
            <EditableBlock
              block={block}
              disabled={disabled}
              maxLength={Math.max(0, max - count + block.text.length)}
              node={(el) => {
                if (el) refs.current.set(block.id, el);
                else refs.current.delete(block.id);
              }}
              onText={(text) => {
                setBlocks(
                  blocks.map((b) => (b.id === block.id ? { ...b, text } : b)),
                );
                if (text === "/") {
                  setMenu(block.id);
                  setCommand(0);
                } else if (menu === block.id) setMenu(null);
              }}
              onKey={(e) => {
                if (e.nativeEvent.isComposing || disabled) return;
                if (
                  menu === block.id &&
                  ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)
                ) {
                  e.preventDefault();
                  if (e.key === "Escape") setMenu(null);
                  else if (e.key === "Enter") apply(editorTypes[command]);
                  else
                    setCommand((command + (e.key === "ArrowDown" ? 1 : 3)) % 4);
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  add(block.id);
                }
                if (e.key === "Backspace" && !block.text && blocks.length > 1) {
                  e.preventDefault();
                  const remaining = blocks.filter((b) => b.id !== block.id);
                  setBlocks(remaining);
                  focus(remaining[Math.max(0, index - 1)].id);
                }
              }}
            />
            {menu === block.id && (
              <div
                className="mingu-editor-commands"
                role="menu"
                aria-label="Block format"
              >
                {editorTypes.map((type, i) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={type}
                    data-active={command === i}
                    disabled={disabled}
                    onClick={() => apply(type)}
                  >
                    {type === "heading" ? (
                      "H"
                    ) : type === "code" ? (
                      <VectorIcon name="code" size="1em" />
                    ) : type === "quote" ? (
                      <VectorIcon name="quote" size="1em" />
                    ) : (
                      <VectorIcon name="paragraph" size="1em" />
                    )}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {!blocks.length && <p>Start with an empty page.</p>}
      </div>
      <div className="mingu-tool-row">
        <Button
          variant="secondary"
          disabled={disabled || blocks.length >= 50}
          onClick={() => add()}
        >
          Add block
        </Button>
        <small>Type / for blocks · Shift+Enter for a line break</small>
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={JSON.stringify(blocks)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export interface ChartPoint {
  label: string;
  value: number;
}
export type ChartRange = [number, number];
export interface ChartRangeNavigatorProps extends ToolProps {
  data: readonly ChartPoint[];
  value?: ChartRange;
  defaultValue?: ChartRange;
  onValueChange?: (range: ChartRange) => void;
  name?: string;
}
export function ChartRangeNavigator({
  data: supplied,
  value,
  defaultValue,
  onValueChange,
  label = "Chart range",
  disabled,
  name,
  className = "",
  style,
}: ChartRangeNavigatorProps) {
  const data = supplied.slice(0, 1000),
    last = Math.max(0, data.length - 1);
  const [range, setRange] = useValue<ChartRange>(
    value,
    defaultValue ?? [0, last],
    onValueChange,
  );
  const start = Math.round(clamp(range[0], 0, last)),
    end = Math.round(clamp(range[1], start, last));
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; start: number; end: number } | null>(null);
  const selected = data.slice(start, end + 1);
  useReset(root, () => {
    if (value === undefined) setRange(defaultValue ?? [0, last]);
  });
  const path = (points: readonly ChartPoint[]) => {
    const values = points.map((p) => (Number.isFinite(p.value) ? p.value : 0)),
      min = Math.min(...values),
      max = Math.max(...values),
      height = max - min || 1;
    return values
      .map(
        (v, i) =>
          `${i ? "L" : "M"}${points.length < 2 ? 300 : (i / (points.length - 1)) * 600} ${160 - ((v - min) / height) * 140}`,
      )
      .join(" ");
  };
  return (
    <div
      ref={root}
      className={`mingu-tool mingu-chart-navigator ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <div className="mingu-tool-heading">
        <strong>{label}</strong>
        <small>{selected.length} points</small>
      </div>
      {data.length ? (
        <>
          <svg
            viewBox="0 0 600 180"
            className="mingu-chart-main"
            role="img"
            aria-label={`${label}: ${data[start]?.label} to ${data[end]?.label}`}
          >
            <path d={path(selected)} />
            <circle
              cx={selected.length < 2 ? 300 : 600}
              cy={
                selected.length ? Number(path(selected).split(" ").pop()) : 90
              }
              r="4"
            />
          </svg>
          <div className="mingu-chart-overview">
            <svg
              viewBox="0 0 600 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={path(data)} />
            </svg>
            <div
              className="mingu-chart-selection"
              style={{
                left: `${last ? (start / last) * 100 : 0}%`,
                width: `${last ? Math.max(1, ((end - start) / last) * 100) : 100}%`,
              }}
              onPointerDown={(e) => {
                if (disabled || e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, start, end };
              }}
              onPointerMove={(e) => {
                if (
                  !drag.current ||
                  !e.currentTarget.hasPointerCapture(e.pointerId)
                )
                  return;
                const width =
                  e.currentTarget.parentElement!.getBoundingClientRect().width;
                const delta = Math.round(
                  ((e.clientX - drag.current.x) / width) * last,
                );
                const length = drag.current.end - drag.current.start,
                  a = clamp(drag.current.start + delta, 0, last - length);
                setRange([a, a + length]);
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              aria-hidden="true"
            >
              <span>
                <VectorIcon name="more-vertical" size="1em" />
              </span>
            </div>
          </div>
          <div className="mingu-tool-columns">
            <Slider
              label="Range start"
              min={0}
              max={last || 1}
              step={1}
              value={start}
              disabled={disabled || !last}
              onValueChange={(n) => setRange([Math.min(n, end), end])}
            />
            <Slider
              label="Range end"
              min={0}
              max={last || 1}
              step={1}
              value={end}
              disabled={disabled || !last}
              onValueChange={(n) => setRange([start, Math.max(n, start)])}
            />
          </div>
          <div className="mingu-tool-heading">
            <span>{data[start]?.label}</span>
            <span>{data[end]?.label}</span>
          </div>
          <details>
            <summary>View selected data</summary>
            <ol className="mingu-chart-data">
              {selected.map((p, i) => (
                <li key={start + i}>
                  {p.label}
                  <span>{p.value}</span>
                </li>
              ))}
            </ol>
          </details>
        </>
      ) : (
        <p>No chart data.</p>
      )}
      {name && (
        <input
          type="hidden"
          name={name}
          value={`${start},${end}`}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export interface CarouselScrubberItem {
  id: string;
  title: string;
  content: ReactNode;
}
export interface CarouselScrubberProps extends ToolProps {
  items: readonly CarouselScrubberItem[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
}
export function CarouselScrubber({
  items,
  value,
  defaultValue = 0,
  onValueChange,
  label = "Media collection",
  disabled,
  className = "",
  style,
}: CarouselScrubberProps) {
  const [raw, setIndex] = useValue(value, defaultValue, onValueChange),
    index = Math.round(clamp(raw, 0, Math.max(0, items.length - 1)));
  const track = useRef<HTMLDivElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    node.scrollTo({
      left: node.clientWidth * index,
      behavior: reduced ? "instant" : "smooth",
    });
  }, [index, reduced]);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const obs = new ResizeObserver(() =>
      node.scrollTo({ left: node.clientWidth * index, behavior: "instant" }),
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [index]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      className={`mingu-tool mingu-carousel-scrubber ${className}`}
      style={style}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        ref={track}
        className="mingu-scrubber-track"
        data-disabled={disabled}
        onScroll={() => {
          clearTimeout(timer.current);
          if (disabled) return;
          timer.current = setTimeout(() => {
            const node = track.current;
            if (node?.clientWidth)
              setIndex(Math.round(node.scrollLeft / node.clientWidth));
          }, 160);
        }}
      >
        {items.map((item, i) => (
          <article
            className="mingu-scrubber-slide"
            key={item.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}: ${item.title}`}
            inert={i !== index}
          >
            <div>{item.content}</div>
            <h3>{item.title}</h3>
          </article>
        ))}
        {!items.length && <p>No media to explore.</p>}
      </div>
      <div className="mingu-tool-row">
        <Button
          variant="secondary"
          disabled={disabled || !index || !items.length}
          onClick={() => setIndex(index - 1)}
        >
          Previous
        </Button>
        <span aria-live="polite">
          {items.length ? `${index + 1} / ${items.length}` : "0 / 0"}
        </span>
        <Button
          variant="secondary"
          disabled={disabled || index >= items.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Next
        </Button>
      </div>
      <Slider
        label="Scrub slides"
        min={0}
        max={Math.max(1, items.length - 1)}
        step={1}
        value={index}
        disabled={disabled || items.length < 2}
        onValueChange={setIndex}
      />
    </div>
  );
}

export interface DialogStackStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}
export interface DialogStackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: readonly DialogStackStep[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  onComplete?: () => void;
  completeLabel?: string;
}
export function DialogStack({
  open,
  onOpenChange,
  steps,
  value,
  defaultValue = 0,
  onValueChange,
  onComplete,
  completeLabel = "Finish",
}: DialogStackProps) {
  const [raw, setIndex] = useValue(value, defaultValue, onValueChange);
  const index = Math.round(clamp(raw, 0, Math.max(0, steps.length - 1))),
    step = steps[index];
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    content.current?.focus();
  }, [index, open]);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={step?.title ?? "No steps"}
      description={step?.description}
      className="mingu-dialog-stack"
      motion={reduced ? undefined : "scale"}
    >
      <div className="mingu-dialog-depth" aria-hidden="true">
        <i />
        <i />
      </div>
      <small>
        Step {steps.length ? index + 1 : 0} of {steps.length}
      </small>
      <div
        key={step?.id}
        ref={content}
        tabIndex={-1}
        className="mingu-dialog-step"
      >
        {step?.content ?? <p>There are no steps to complete.</p>}
      </div>
      <div className="mingu-tool-row">
        <Button
          variant="secondary"
          disabled={!index}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </Button>
        {step && (
          <Button
            onClick={() => {
              if (index < steps.length - 1) setIndex(index + 1);
              else {
                onComplete?.();
                onOpenChange(false);
              }
            }}
          >
            {index < steps.length - 1 ? "Continue" : completeLabel}
          </Button>
        )}
      </div>
    </Dialog>
  );
}

export interface SandboxSource {
  html: string;
  css: string;
  js: string;
}
export interface LiveCodeSandboxProps extends ToolProps {
  value?: SandboxSource;
  defaultValue?: SandboxSource;
  onValueChange?: (source: SandboxSource) => void;
  autoRun?: boolean;
}
const starter: SandboxSource = {
  html: '<button id="hello">A small interaction <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg></button>\n<p id="count">Pressed 0 times</p>',
  css: "body { font: 16px system-ui; display: grid; place-content: center; min-height: 220px; margin: 0; background: #f5f5f3; color: #1a1a1a; }\nbutton { padding: 18px 24px; border: 1px solid #ddd; border-radius: 16px; background: white; font: inherit; cursor: pointer; transition: transform .2s; }\nbutton:hover { transform: translateY(-4px); }\np { text-align: center; font-size: 13px; color: #777; }\n@media(prefers-reduced-motion:reduce) { button { transition: none; } }",
  js: 'let count = 0;\ndocument.querySelector("#hello").addEventListener("click", () => {\n  document.querySelector("#count").textContent = `Pressed ${++count} times`;\n});',
};
function sandboxDocument(source: SandboxSource) {
  // No host eval or message bridge. Opaque iframe origin; CSP blocks remote subresources and fetch.
  const encoded = JSON.stringify({
    html: source.html.slice(0, 50000),
    css: source.css.slice(0, 50000),
    js: source.js.slice(0, 50000),
  }).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src 'none'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none';"><style id="sandbox-style"></style></head><body><main id="sandbox-root"></main><pre id="sandbox-error" role="alert" style="white-space:pre-wrap;color:#b42318;font:13px monospace"></pre><script>(()=>{const source=${encoded};const showError=error=>{let out=document.getElementById('sandbox-error');if(!out){out=document.createElement('pre');out.id='sandbox-error';out.setAttribute('role','alert');document.body.append(out);}out.textContent=String(error).slice(0,2000);};window.addEventListener('error',event=>showError(event.message));window.addEventListener('unhandledrejection',event=>showError(event.reason));document.getElementById('sandbox-root').innerHTML=source.html;document.getElementById('sandbox-style').textContent=source.css;const code=document.createElement('script');code.textContent=source.js;document.body.append(code);})();<\/script></body></html>`;
}
export function LiveCodeSandbox({
  value,
  defaultValue = starter,
  onValueChange,
  autoRun = false,
  label = "Live code sandbox",
  disabled,
  className = "",
  style,
}: LiveCodeSandboxProps) {
  const [source, setSource] = useValue(value, defaultValue, onValueChange);
  const [running, setRunning] = useState(source);
  const [tab, setTab] = useState<keyof SandboxSource>("html");
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState("Preview ready");
  const lastSource = useRef(source);
  const runTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (lastSource.current === source) return;
    lastSource.current = source;
    if (!autoRun || disabled) return;
    runTimer.current = setTimeout(() => {
      setRunning(source);
      setVersion((v) => v + 1);
      setStatus("Preview updated");
    }, 600);
    return () => clearTimeout(runTimer.current);
  }, [source, autoRun, disabled]);
  return (
    <div
      className={`mingu-tool mingu-live-sandbox ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <div className="mingu-tool-heading">
        <strong>{label}</strong>
        <span
          className="mingu-sandbox-tabs"
          role="group"
          aria-label="Source language"
        >
          {(["html", "css", "js"] as const).map((language) => (
            <Button
              variant={tab === language ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={tab === language}
              key={language}
              onClick={() => setTab(language)}
            >
              {language.toUpperCase()}
            </Button>
          ))}
        </span>
      </div>
      <TextareaField
        label={`${tab.toUpperCase()} source`}
        value={source[tab]}
        rows={8}
        maxLength={50000}
        spellCheck={false}
        disabled={disabled}
        onChange={(e) => setSource({ ...source, [tab]: e.currentTarget.value })}
      />
      <div className="mingu-tool-row">
        <Button
          disabled={disabled}
          onClick={() => {
            clearTimeout(runTimer.current);
            setRunning(source);
            setVersion((v) => v + 1);
            setStatus("Preview updated");
          }}
        >
          Run preview
        </Button>
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            clearTimeout(runTimer.current);
            lastSource.current = defaultValue;
            setSource(defaultValue);
            setRunning(defaultValue);
            setVersion((v) => v + 1);
            setStatus("Source reset");
          }}
        >
          Reset code
        </Button>
        <small role="status">{status}</small>
      </div>
      <iframe
        key={version}
        title="Code preview"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        srcDoc={sandboxDocument(running)}
        className="mingu-sandbox-frame"
      />
      <small>
        Runs inside an isolated preview. External scripts and fetch are blocked.
        JavaScript errors appear inside the preview.
      </small>
    </div>
  );
}
