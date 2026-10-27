"use client";
import { Icon as VectorIcon } from "../icons";

import * as React from "react";
import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../system/base";
import { SelectField } from "../system/forms";
import { CopyButton } from "../system/micro-interactions";
import { useControllable } from "../shared";
import { bounded, safeHex, type CollectionProps } from "./collection-shared";

export interface FlipCardProps extends CollectionProps {
  front: ReactNode;
  back: ReactNode;
  flipped?: boolean;
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
}
export function FlipCard({
  front,
  back,
  flipped: controlled,
  defaultFlipped = false,
  onFlippedChange,
  label = "Two sides of an idea",
  disabled,
  className = "",
  style,
}: FlipCardProps) {
  const [flipped, setFlipped] = useControllable(
      controlled,
      defaultFlipped,
      onFlippedChange,
    ),
    trigger = useRef<HTMLButtonElement>(null);
  return (
    <section
      className={`mingu-design-lab mingu-flip-card ${className}`}
      style={style}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Escape" && flipped && !disabled) {
          e.preventDefault();
          e.stopPropagation();
          setFlipped(false);
          trigger.current?.focus();
        }
      }}
    >
      <div className="mingu-flip-stage" data-flipped={flipped || undefined}>
        <div className="mingu-flip-inner">
          <div
            className="mingu-flip-face"
            inert={flipped}
            aria-hidden={flipped}
          >
            {front}
          </div>
          <div
            className="mingu-flip-face mingu-flip-back"
            inert={!flipped}
            aria-hidden={!flipped}
          >
            {back}
          </div>
        </div>
      </div>
      <Button
        ref={trigger}
        variant="outline"
        aria-pressed={flipped}
        disabled={disabled}
        onClick={() => setFlipped(!flipped)}
      >
        {flipped ? (
          <>
            Show front <VectorIcon name="undo" size="1em" />
          </>
        ) : (
          <>
            Show back <VectorIcon name="redo" size="1em" />
          </>
        )}
      </Button>
    </section>
  );
}

export interface MazePosition {
  row: number;
  column: number;
}
export interface MazeRunnerProps extends CollectionProps {
  maze?: readonly string[];
  seed?: number;
  position?: MazePosition;
  defaultPosition?: MazePosition;
  onPositionChange?: (position: MazePosition) => void;
  onComplete?: () => void;
}
export function generateMaze(seed = 1, width = 11, height = 9): string[] {
  const w = Math.floor(bounded(width, 5, 21)) | 1,
    h = Math.floor(bounded(height, 5, 21)) | 1,
    grid = Array.from({ length: h }, () => Array(w).fill("#"));
  let random = (Number.isFinite(seed) ? seed : 1) | 0;
  const next = () => {
    random = (Math.imul(random, 1664525) + 1013904223) | 0;
    return (random >>> 0) / 4294967296;
  };
  const stack: [[number, number]] | [number, number][] = [[1, 1]];
  grid[1][1] = " ";
  while (stack.length) {
    const [x, y] = stack[stack.length - 1],
      directions = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ].filter(
        ([dx, dy]) =>
          x + dx > 0 &&
          x + dx < w - 1 &&
          y + dy > 0 &&
          y + dy < h - 1 &&
          grid[y + dy][x + dx] === "#",
      );
    if (!directions.length) {
      stack.pop();
      continue;
    }
    const [dx, dy] = directions[Math.floor(next() * directions.length)];
    grid[y + dy / 2][x + dx / 2] = " ";
    grid[y + dy][x + dx] = " ";
    stack.push([x + dx, y + dy]);
  }
  grid[1][1] = "S";
  grid[h - 2][w - 2] = "G";
  return grid.map((row) => row.join(""));
}
export function MazeRunner({
  maze,
  seed = 1,
  position,
  defaultPosition = { row: 1, column: 1 },
  onPositionChange,
  onComplete,
  label = "Find your way",
  disabled,
  className = "",
  style,
}: MazeRunnerProps) {
  const [generation, setGeneration] = useState(0),
    [current, setCurrent] = useControllable(
      position,
      defaultPosition,
      onPositionChange,
    ),
    [moves, setMoves] = useState(0),
    [notice, setNotice] = useState("Use arrow keys or the direction buttons."),
    board = useMemo(
      () =>
        maze?.length
          ? maze.slice(0, 21).map((row) => row.slice(0, 21))
          : generateMaze(seed + generation),
      [maze, seed, generation],
    );
  const cols = Math.max(1, ...board.map((r) => r.length)),
    floors = board.flatMap((row, r) =>
      Array.from(row).flatMap((cell, c) =>
        cell !== "#" ? [{ row: r, column: c, cell }] : [],
      ),
    ),
    start = floors.find((p) => p.cell === "S") ??
      floors[0] ?? { row: 0, column: 0 },
    goal =
      floors.find((p) => p.cell === "G") ?? floors[floors.length - 1] ?? start,
    actual = floors.some(
      (p) => p.row === current.row && p.column === current.column,
    )
      ? current
      : start,
    complete = actual.row === goal.row && actual.column === goal.column;
  const move = (dr: number, dc: number) => {
    if (disabled || complete) return;
    const next = { row: actual.row + dr, column: actual.column + dc };
    if (!floors.some((p) => p.row === next.row && p.column === next.column)) {
      setNotice("A wall. Try another direction.");
      return;
    }
    setCurrent(next);
    setMoves(moves + 1);
    if (next.row === goal.row && next.column === goal.column) {
      setNotice(`Goal reached in ${moves + 1} moves.`);
      onComplete?.();
    } else setNotice(`${moves + 1} moves`);
  };
  const reset = () => {
    setCurrent({ row: start.row, column: start.column });
    setMoves(0);
    setNotice("Back at the start.");
  };
  return (
    <section
      className={`mingu-design-lab mingu-maze ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-lab-heading">
        <strong>{label}</strong>
        <span>{moves} moves</span>
      </div>
      <div
        className="mingu-maze-board"
        tabIndex={disabled ? -1 : 0}
        role="group"
        aria-label="Maze controls. Use arrow keys to reach the goal."
        style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}
        onKeyDown={(e) => {
          const delta =
            e.key === "ArrowRight"
              ? [0, 1]
              : e.key === "ArrowLeft"
                ? [0, -1]
                : e.key === "ArrowDown"
                  ? [1, 0]
                  : e.key === "ArrowUp"
                    ? [-1, 0]
                    : null;
          if (delta) {
            e.preventDefault();
            move(delta[0], delta[1]);
          }
        }}
      >
        {board.map((row, r) =>
          Array.from({ length: cols }, (_, c) => {
            const cell = row[c] ?? "#",
              player = actual.row === r && actual.column === c;
            return (
              <span
                key={`${r}-${c}`}
                data-wall={cell === "#" || undefined}
                data-player={player || undefined}
                data-goal={cell === "G" || undefined}
                aria-hidden="true"
                onClick={() => {
                  if (
                    Math.abs(actual.row - r) + Math.abs(actual.column - c) ===
                    1
                  )
                    move(r - actual.row, c - actual.column);
                }}
              >
                {player ? (
                  <VectorIcon name="dot" size="1em" />
                ) : cell === "G" ? (
                  <VectorIcon name="sparkle" size="1em" />
                ) : (
                  ""
                )}
              </span>
            );
          }),
        )}
      </div>
      <div className="mingu-lab-actions">
        {[
          ["Up", -1, 0],
          ["Left", 0, -1],
          ["Down", 1, 0],
          ["Right", 0, 1],
        ].map(([name, dr, dc]) => (
          <Button
            key={String(name)}
            size="sm"
            variant="outline"
            aria-label={`Move ${name}`}
            disabled={disabled || complete}
            onClick={() => move(Number(dr), Number(dc))}
          >
            {name === "Up" ? (
              <VectorIcon name="arrow-up" size="1em" />
            ) : name === "Down" ? (
              <VectorIcon name="arrow-down" size="1em" />
            ) : name === "Left" ? (
              <VectorIcon name="arrow-left" size="1em" />
            ) : (
              <VectorIcon name="arrow-right" size="1em" />
            )}
          </Button>
        ))}
        <Button size="sm" variant="ghost" disabled={disabled} onClick={reset}>
          Reset maze
        </Button>
        {!maze && (
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => {
              setGeneration((g) => g + 1);
              setCurrent({ row: 1, column: 1 });
              setMoves(0);
              setNotice("A new maze.");
            }}
          >
            New maze
          </Button>
        )}
      </div>
      <output className="mingu-lab-note" role="status">
        {notice}
      </output>
    </section>
  );
}

export interface ClipPoint {
  x: number;
  y: number;
}
export interface ClipPathEditorProps extends CollectionProps {
  value?: readonly ClipPoint[];
  defaultValue?: readonly ClipPoint[];
  onValueChange?: (points: ClipPoint[]) => void;
}
const initialPolygon = [
  { x: 20, y: 5 },
  { x: 85, y: 15 },
  { x: 98, y: 70 },
  { x: 60, y: 96 },
  { x: 5, y: 78 },
];
export const clipPathCss = (points: readonly ClipPoint[]) =>
  points.length >= 3
    ? `polygon(${points
        .slice(0, 12)
        .map(
          (p) =>
            `${Math.round(bounded(p.x, 0, 100))}% ${Math.round(bounded(p.y, 0, 100))}%`,
        )
        .join(", ")})`
    : "none";
export function ClipPathEditor({
  value,
  defaultValue = initialPolygon,
  onValueChange,
  label = "Shape a little space",
  disabled,
  className = "",
  style,
}: ClipPathEditorProps) {
  const [points, setPoints] = useControllable<readonly ClipPoint[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    [selected, setSelected] = useState(0),
    drag = useRef<number | null>(null),
    svg = useRef<SVGSVGElement>(null),
    index = Math.min(selected, points.length - 1),
    point = points[index],
    css = clipPathCss(points);
  const update = (i: number, patch: Partial<ClipPoint>) => {
    if (!disabled)
      setPoints(points.map((p, n) => (i === n ? { ...p, ...patch } : p)));
  };
  return (
    <section
      className={`mingu-design-lab mingu-clip-editor ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-lab-heading">
        <strong>{label}</strong>
        <span>{points.length} anchors</span>
      </div>
      <div className="mingu-clip-stage">
        <div className="mingu-clip-art" style={{ clipPath: css }} />
        <svg
          ref={svg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-label="Polygon anchors"
          onPointerDown={(e) => {
            const node = (e.target as Element).closest<SVGElement>(
              "[data-anchor]",
            );
            if (!node || disabled) return;
            drag.current = Number(node.dataset.anchor);
            setSelected(drag.current);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current === null) return;
            const r = e.currentTarget.getBoundingClientRect();
            update(drag.current, {
              x: Math.round(
                bounded(((e.clientX - r.left) / r.width) * 100, 0, 100),
              ),
              y: Math.round(
                bounded(((e.clientY - r.top) / r.height) * 100, 0, 100),
              ),
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
        >
          <polygon
            points={points
              .slice(0, 12)
              .map((p) => `${bounded(p.x, 0, 100)},${bounded(p.y, 0, 100)}`)
              .join(" ")}
            fill="none"
            stroke="var(--mingu-accent)"
            strokeWidth=".5"
            strokeDasharray="1 1"
          />
          {points.slice(0, 12).map((p, i) => (
            <circle
              key={i}
              data-anchor={i}
              role="button"
              aria-label={`Select anchor ${i + 1}`}
              aria-pressed={i === index}
              aria-disabled={disabled || undefined}
              tabIndex={disabled ? -1 : 0}
              cx={bounded(p.x, 0, 100)}
              cy={bounded(p.y, 0, 100)}
              r={i === index ? 3 : 2.2}
              onClick={() => {
                if (!disabled) setSelected(i);
              }}
              onKeyDown={(e) => {
                if (disabled) return;
                if (["Enter", " "].includes(e.key)) {
                  e.preventDefault();
                  setSelected(i);
                }
                const delta =
                  e.key === "ArrowRight"
                    ? [1, 0]
                    : e.key === "ArrowLeft"
                      ? [-1, 0]
                      : e.key === "ArrowDown"
                        ? [0, 1]
                        : e.key === "ArrowUp"
                          ? [0, -1]
                          : null;
                if (delta) {
                  e.preventDefault();
                  setSelected(i);
                  update(i, {
                    x: bounded(p.x + delta[0], 0, 100),
                    y: bounded(p.y + delta[1], 0, 100),
                  });
                }
              }}
            />
          ))}
        </svg>
      </div>
      {point && (
        <div className="mingu-lab-fields">
          <label>
            X · {Math.round(point.x)}%
            <input
              type="range"
              aria-label="Anchor X"
              min="0"
              max="100"
              value={bounded(point.x, 0, 100)}
              disabled={disabled}
              onChange={(e) => update(index, { x: Number(e.target.value) })}
            />
          </label>
          <label>
            Y · {Math.round(point.y)}%
            <input
              type="range"
              aria-label="Anchor Y"
              min="0"
              max="100"
              value={bounded(point.y, 0, 100)}
              disabled={disabled}
              onChange={(e) => update(index, { y: Number(e.target.value) })}
            />
          </label>
        </div>
      )}
      <div className="mingu-lab-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || points.length >= 12}
          onClick={() => {
            setPoints([...points, { x: 50, y: 50 }]);
            setSelected(points.length);
          }}
        >
          Add anchor
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || points.length <= 3}
          onClick={() => {
            setPoints(points.filter((_, i) => i !== index));
            setSelected(0);
          }}
        >
          Remove anchor
        </Button>
        <CopyButton text={`clip-path: ${css};`} label="Copy clip path" />
      </div>
    </section>
  );
}

export interface ContrastColors {
  foreground: string;
  background: string;
}
export interface ContrastCheckerProps extends CollectionProps {
  value?: ContrastColors;
  defaultValue?: ContrastColors;
  onValueChange?: (colors: ContrastColors) => void;
  sample?: string;
}
// sRGB conversion and ratio: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
export function contrastRatio(foreground: string, background: string) {
  const luminance = (input: string) => {
    const color = safeHex(input);
    const channels = [1, 3, 5].map((i) => {
      const v = parseInt(color.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function ContrastChecker({
  value,
  defaultValue = { foreground: "#252132", background: "#eee8f5" },
  onValueChange,
  sample = "Good ideas deserve to be seen.",
  label = "Contrast checker",
  disabled,
  className = "",
  style,
}: ContrastCheckerProps) {
  const [colors, setColors] = useControllable(
      value,
      defaultValue,
      onValueChange,
    ),
    ratio = contrastRatio(colors.foreground, colors.background);
  return (
    <section
      className={`mingu-design-lab mingu-contrast-checker ${className}`}
      style={style}
      aria-label={label}
    >
      <div
        className="mingu-contrast-sample"
        style={{
          background: safeHex(colors.background),
          color: safeHex(colors.foreground),
        }}
      >
        <span>A SMALL DETAIL</span>
        <strong>{sample}</strong>
        <b>{ratio.toFixed(2)} : 1</b>
      </div>
      <div className="mingu-lab-fields">
        {(["foreground", "background"] as const).map((key) => (
          <label key={key}>
            {key === "foreground" ? "Text color" : "Background color"}
            <span className="mingu-color-line">
              <input
                type="color"
                aria-label={
                  key === "foreground" ? "Text color" : "Background color"
                }
                disabled={disabled}
                value={safeHex(colors[key])}
                onChange={(e) =>
                  setColors({ ...colors, [key]: e.target.value })
                }
              />
              <code>{safeHex(colors[key])}</code>
            </span>
          </label>
        ))}
      </div>
      <div className="mingu-contrast-results">
        <span data-pass={ratio >= 4.5}>
          Normal AA · {ratio >= 4.5 ? "Pass" : "Below 4.5:1"}
        </span>
        <span data-pass={ratio >= 3}>
          Large AA · {ratio >= 3 ? "Pass" : "Below 3:1"}
        </span>
        <span data-pass={ratio >= 7}>
          Normal AAA · {ratio >= 7 ? "Pass" : "Below 7:1"}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() =>
          setColors({
            foreground: colors.background,
            background: colors.foreground,
          })
        }
      >
        Swap colors <VectorIcon name="swap" size="1em" />
      </Button>
    </section>
  );
}

export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset?: boolean;
}
export interface ShadowEditorProps extends CollectionProps {
  value?: readonly ShadowLayer[];
  defaultValue?: readonly ShadowLayer[];
  onValueChange?: (layers: ShadowLayer[]) => void;
}
const softShadow: ShadowLayer[] = [
  {
    id: "soft-a",
    x: 0,
    y: 16,
    blur: 32,
    spread: -8,
    color: "#191625",
    opacity: 0.18,
  },
  {
    id: "soft-b",
    x: 0,
    y: 2,
    blur: 8,
    spread: 0,
    color: "#191625",
    opacity: 0.06,
  },
];
export function shadowCss(layers: readonly ShadowLayer[]) {
  return (
    layers
      .slice(0, 4)
      .map((layer) => {
        const color = safeHex(layer.color),
          rgb = [1, 3, 5]
            .map((i) => parseInt(color.slice(i, i + 2), 16))
            .join(", ");
        return `${layer.inset ? "inset " : ""}${Math.round(bounded(layer.x, -80, 80))}px ${Math.round(bounded(layer.y, -80, 80))}px ${Math.round(bounded(layer.blur, 0, 100))}px ${Math.round(bounded(layer.spread, -30, 40))}px rgba(${rgb}, ${Number(bounded(layer.opacity, 0, 1).toFixed(2))})`;
      })
      .join(", ") || "none"
  );
}
export function ShadowEditor({
  value,
  defaultValue = softShadow,
  onValueChange,
  label = "A little depth",
  disabled,
  className = "",
  style,
}: ShadowEditorProps) {
  const [layers, setLayers] = useControllable<readonly ShadowLayer[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    [selected, setSelected] = useState(defaultValue[0]?.id ?? ""),
    prefix = useId(),
    serial = useRef(0),
    layer = layers.find((l) => l.id === selected) ?? layers[0],
    css = shadowCss(layers);
  const update = (patch: Partial<ShadowLayer>) => {
    if (layer && !disabled)
      setLayers(
        layers.map((l) => (l.id === layer.id ? { ...l, ...patch } : l)),
      );
  };
  return (
    <section
      className={`mingu-design-lab mingu-shadow-editor ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-shadow-stage">
        <div style={{ boxShadow: css }}>
          <span>THOUGHTFULLY MADE</span>
          <strong>{label}</strong>
          <small>Shape the space around it.</small>
        </div>
      </div>
      <div className="mingu-lab-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setLayers(softShadow);
            setSelected("soft-a");
          }}
        >
          Soft
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setLayers([
              {
                id: "hard",
                x: 8,
                y: 8,
                blur: 0,
                spread: 0,
                color: "#191625",
                opacity: 0.8,
              },
            ]);
            setSelected("hard");
          }}
        >
          Hard
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setLayers([
              {
                id: "float",
                x: 0,
                y: 28,
                blur: 48,
                spread: -16,
                color: "#191625",
                opacity: 0.3,
              },
            ]);
            setSelected("float");
          }}
        >
          Float
        </Button>
      </div>
      {layer && (
        <>
          <SelectField
            label="Shadow layer"
            value={layer.id}
            disabled={disabled}
            onChange={(e) => setSelected(e.target.value)}
          >
            {layers.map((l, i) => (
              <option key={l.id} value={l.id}>
                Layer {i + 1}
              </option>
            ))}
          </SelectField>
          <div className="mingu-lab-fields mingu-shadow-fields">
            {(["x", "y", "blur", "spread", "opacity"] as const).map((key) => (
              <label key={key}>
                {key}
                <input
                  type="range"
                  aria-label={`Shadow ${key}`}
                  min={
                    key === "opacity"
                      ? 0
                      : key === "blur"
                        ? 0
                        : key === "spread"
                          ? -30
                          : -80
                  }
                  max={
                    key === "opacity"
                      ? 1
                      : key === "blur"
                        ? 100
                        : key === "spread"
                          ? 40
                          : 80
                  }
                  step={key === "opacity" ? 0.01 : 1}
                  value={layer[key]}
                  disabled={disabled}
                  onChange={(e) => update({ [key]: Number(e.target.value) })}
                />
              </label>
            ))}
            <label>
              Color
              <input
                type="color"
                aria-label="Shadow color"
                disabled={disabled}
                value={safeHex(layer.color)}
                onChange={(e) => update({ color: e.target.value })}
              />
            </label>
          </div>
        </>
      )}
      <div className="mingu-lab-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || layers.length >= 4}
          onClick={() => {
            const id = `${prefix}-${++serial.current}`;
            setLayers([
              ...layers,
              {
                id,
                x: 0,
                y: 8,
                blur: 16,
                spread: 0,
                color: "#191625",
                opacity: 0.12,
              },
            ]);
            setSelected(id);
          }}
        >
          Add layer
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || !layer}
          onClick={() => {
            setLayers(layers.filter((l) => l.id !== layer?.id));
            setSelected("");
          }}
        >
          Remove layer
        </Button>
        <CopyButton text={`box-shadow: ${css};`} label="Copy shadow CSS" />
      </div>
    </section>
  );
}
