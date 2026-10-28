"use client";
import { Icon as VectorIcon } from "../icons";

import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Button, Checkbox } from "../system/base";
import { useControllable } from "../shared";
import { useExperimentCanvas } from "../experimental/canvas";
import { bounded, safeHex, type CollectionProps } from "./collection-shared";

interface SimulationProps extends CollectionProps {
  paused?: boolean;
  defaultPaused?: boolean;
  onPausedChange?: (paused: boolean) => void;
}
function begin(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const css = getComputedStyle(canvas),
    w = canvas.width,
    h = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return {
    ctx,
    w,
    h,
    ink: css.getPropertyValue("--mingu-accent").trim() || "#777777",
    muted: css.getPropertyValue("--mingu-muted").trim() || "#777777",
    background: css.getPropertyValue("--mingu-raised").trim() || "#ffffff",
  };
}
function MotionButton({
  paused,
  onChange,
  reduced,
  disabled,
}: {
  paused: boolean;
  onChange: (v: boolean) => void;
  reduced: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || reduced}
      onClick={() => onChange(!paused)}
    >
      {reduced
        ? "Reduced motion"
        : paused
          ? "Resume animation"
          : "Pause animation"}
    </Button>
  );
}
const colors = ["#9285e8", "#75b5c9", "#e6a481", "#9dc58b", "#d797bc"];
export interface ConfettiBurstProps extends CollectionProps {
  count?: number;
  burstKey?: string | number;
  onBurst?: () => void;
  colors?: readonly string[];
}
interface ConfettiPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  life: number;
  color: string;
}
export function ConfettiBurst({
  count = 72,
  burstKey,
  onBurst,
  colors: palette = colors,
  label = "A little celebration",
  disabled,
  className = "",
  style,
}: ConfettiBurstProps) {
  const points = useRef<ConfettiPoint[]>([]),
    serial = useRef(0),
    [bursts, setBursts] = useState(0),
    [running, setRunning] = useState(false);
  const scene = useExperimentCanvas((dt, canvas) => {
    const b = begin(canvas);
    if (!b) return;
    const { ctx, w, h } = b;
    points.current = points.current.filter((p) => p.life > 0);
    for (const p of points.current) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.75 * dt;
      p.angle += p.spin * dt;
      p.life -= dt;
      ctx.save();
      ctx.globalAlpha = bounded(p.life, 0, 1);
      ctx.translate(p.x * w, p.y * h);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-w * 0.006, -w * 0.003, w * 0.012, w * 0.006);
      ctx.restore();
    }
    if (!points.current.length) {
      if (running) setRunning(false);
      ctx.fillStyle = b.muted;
      ctx.textAlign = "center";
      ctx.font = `${Math.max(12, w * 0.025)}px system-ui`;
      ctx.fillText("Something worth celebrating?", w / 2, h / 2);
    }
  }, disabled || !running);
  const launch = (x = 0.5, y = 0.7) => {
    if (disabled) return;
    const n = Math.floor(bounded(count, 12, 160)),
      seed = ++serial.current;
    const next = Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + seed * 0.3,
        speed = 0.18 + (i % 9) * 0.035;
      return {
        x: scene.reduced ? x + Math.cos(angle) * (0.1 + (i % 4) * 0.035) : x,
        y: scene.reduced ? y + Math.sin(angle) * (0.2 + (i % 3) * 0.04) : y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        angle,
        spin: ((i % 7) - 3) * 2,
        life: 2 + (i % 5) * 0.1,
        color: safeHex(
          palette[i % Math.max(1, palette.length)] ?? colors[i % colors.length],
        ),
      };
    });
    points.current = [...points.current, ...next].slice(-240);
    setBursts((b) => b + 1);
    setRunning(!scene.reduced);
    scene.invalidate();
    onBurst?.();
  };
  useEffect(() => {
    if (burstKey !== undefined) launch();
  }, [burstKey]);
  return (
    <section
      className={`mingu-kinetic ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-kinetic-heading">
        <strong>{label}</strong>
        <span>{bursts} bursts</span>
      </div>
      <canvas
        ref={scene.canvas}
        role="img"
        aria-label="Confetti canvas. Use Launch confetti to celebrate."
        className="mingu-kinetic-canvas"
        onClick={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          launch(
            (e.clientX - b.left) / b.width,
            (e.clientY - b.top) / b.height,
          );
        }}
      />
      <div className="mingu-kinetic-actions">
        <Button disabled={disabled} onClick={() => launch()}>
          Launch confetti <VectorIcon name="sparkle" size="1em" />
        </Button>
        <Button
          variant="ghost"
          disabled={disabled || !bursts}
          onClick={() => {
            points.current = [];
            setBursts(0);
            setRunning(false);
            scene.invalidate();
          }}
        >
          Clear confetti
        </Button>
      </div>
    </section>
  );
}

export interface FieldCharge {
  id: string;
  x: number;
  y: number;
  strength: number;
}
export interface VectorFieldProps extends SimulationProps {
  value?: readonly FieldCharge[];
  defaultValue?: readonly FieldCharge[];
  onValueChange?: (charges: FieldCharge[]) => void;
}
export function VectorField({
  value,
  defaultValue = [
    { id: "a", x: 0.32, y: 0.5, strength: 1 },
    { id: "b", x: 0.68, y: 0.5, strength: -1 },
  ],
  onValueChange,
  paused: controlled,
  defaultPaused = false,
  onPausedChange,
  label = "Vector field",
  disabled,
  className = "",
  style,
}: VectorFieldProps) {
  const [charges, setCharges] = useControllable<readonly FieldCharge[]>(
      value,
      defaultValue,
      (next) => onValueChange?.([...next]),
    ),
    [paused, setPaused] = useControllable(
      controlled,
      defaultPaused,
      onPausedChange,
    ),
    [polarity, setPolarity] = useState(1),
    phase = useRef(0),
    serial = useRef(0),
    prefix = useId(),
    hover = useRef<{ x: number; y: number } | null>(null);
  const scene = useExperimentCanvas((dt, canvas) => {
    phase.current += dt;
    const b = begin(canvas);
    if (!b) return;
    const { ctx, w, h, ink, muted } = b,
      all = [
        ...charges.slice(0, 8),
        ...(hover.current
          ? [{ id: "probe", ...hover.current, strength: 0.3 }]
          : []),
      ];
    for (let row = 0; row < 14; row++)
      for (let col = 0; col < 24; col++) {
        const x = (col + 0.5) / 24,
          y = (row + 0.5) / 14;
        let fx = 0.07 * Math.cos(phase.current * 0.5),
          fy = 0.04 * Math.sin(phase.current * 0.4);
        for (const c of all) {
          const dx = x - bounded(c.x, 0, 1),
            dy = y - bounded(c.y, 0, 1),
            distance = dx * dx + dy * dy + 0.008;
          fx += (dx * bounded(c.strength, -2, 2)) / distance;
          fy += (dy * bounded(c.strength, -2, 2)) / distance;
        }
        const angle = Math.atan2(fy, fx),
          length = (w / 24) * 0.65,
          px = x * w,
          py = y * h;
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.25 + Math.min(0.6, Math.hypot(fx, fy) * 0.09);
        ctx.lineWidth = Math.max(1, w / 750);
        ctx.beginPath();
        ctx.moveTo(
          px - (Math.cos(angle) * length) / 2,
          py - (Math.sin(angle) * length) / 2,
        );
        ctx.lineTo(
          px + (Math.cos(angle) * length) / 2,
          py + (Math.sin(angle) * length) / 2,
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(
          px + (Math.cos(angle) * length) / 2,
          py + (Math.sin(angle) * length) / 2,
        );
        ctx.lineTo(
          px + Math.cos(angle + 2.4) * length * 0.1,
          py + Math.sin(angle + 2.4) * length * 0.1,
        );
        ctx.stroke();
      }
    ctx.globalAlpha = 1;
    for (const c of charges.slice(0, 8)) {
      ctx.fillStyle = b.background;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        bounded(c.x, 0, 1) * w,
        bounded(c.y, 0, 1) * h,
        w * 0.025,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = muted;
      ctx.font = `${Math.max(12, w * 0.025)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        c.strength > 0 ? "+" : "−",
        bounded(c.x, 0, 1) * w,
        bounded(c.y, 0, 1) * h,
      );
    }
  }, paused || disabled);
  const add = (x: number, y: number) => {
    if (!disabled && charges.length < 8)
      setCharges([
        ...charges,
        {
          id: `${prefix}-charge-${++serial.current}`,
          x: bounded(x, 0, 1),
          y: bounded(y, 0, 1),
          strength: polarity,
        },
      ]);
  };
  useEffect(scene.invalidate, [charges, polarity, paused]);
  return (
    <section
      className={`mingu-kinetic ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-kinetic-heading">
        <strong>{label}</strong>
        <span>{charges.length} / 8 charges</span>
      </div>
      <canvas
        ref={scene.canvas}
        className="mingu-kinetic-canvas"
        role="img"
        aria-label="Interactive vector field"
        onPointerMove={(e) => {
          if (disabled || e.pointerType === "touch") return;
          const b = e.currentTarget.getBoundingClientRect();
          hover.current = {
            x: (e.clientX - b.left) / b.width,
            y: (e.clientY - b.top) / b.height,
          };
          scene.invalidate();
        }}
        onPointerLeave={() => {
          hover.current = null;
          scene.invalidate();
        }}
        onClick={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          add((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height);
        }}
      />
      <div className="mingu-kinetic-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          aria-pressed={polarity === -1}
          onClick={() => setPolarity(-polarity)}
        >
          {polarity > 0 ? (
            "+ Positive"
          ) : (
            <>
              <VectorIcon name="minus" size="1em" /> Negative
            </>
          )}
        </Button>
        <Button
          size="sm"
          disabled={disabled || charges.length >= 8}
          onClick={() => add(0.5, 0.5)}
        >
          Add center charge
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || !charges.length}
          onClick={() => setCharges([])}
        >
          Clear charges
        </Button>
        <MotionButton
          paused={paused}
          onChange={setPaused}
          reduced={scene.reduced}
          disabled={disabled}
        />
      </div>
    </section>
  );
}

export interface ReactionParameters {
  feed: number;
  kill: number;
}
export interface ReactionDiffusionProps extends SimulationProps {
  parameters?: ReactionParameters;
  defaultParameters?: ReactionParameters;
  onParametersChange?: (parameters: ReactionParameters) => void;
}
interface ChemicalGrid {
  a: Float32Array;
  b: Float32Array;
  nextA: Float32Array;
  nextB: Float32Array;
}
const gw = 80,
  gh = 54;
// A full Euler step makes this four-neighbour diffusion stencil oscillate
// between the clamps and eventually saturate the entire field.
const reactionTimeStep = 0.5;
function chemicals(): ChemicalGrid {
  const a = new Float32Array(gw * gh).fill(1),
    b = new Float32Array(gw * gh);
  // Several asymmetric seeds give the first frame a useful pattern to explore.
  for (const [cx, cy, radius] of [
    [18, 16, 5],
    [40, 27, 6],
    [61, 15, 4],
    [22, 40, 4],
    [61, 40, 5],
  ])
    for (let y = cy - radius; y <= cy + radius; y++)
      for (let x = cx - radius; x <= cx + radius; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2) continue;
        a[y * gw + x] = 0;
        b[y * gw + x] = 1;
      }
  return {
    a,
    b,
    nextA: new Float32Array(gw * gh),
    nextB: new Float32Array(gw * gh),
  };
}
function reactionStep(
  g: ChemicalGrid,
  feed: number,
  kill: number,
  count: number,
) {
  for (let n = 0; n < count; n++) {
    for (let y = 0; y < gh; y++)
      for (let x = 0; x < gw; x++) {
        const i = y * gw + x,
          left = y * gw + ((x + gw - 1) % gw),
          right = y * gw + ((x + 1) % gw),
          up = ((y + gh - 1) % gh) * gw + x,
          down = ((y + 1) % gh) * gw + x;
        const a = g.a[i],
          b = g.b[i],
          ab = a * b * b;
        const lapA = (g.a[left] + g.a[right] + g.a[up] + g.a[down]) * 0.25 - a,
          lapB = (g.b[left] + g.b[right] + g.b[up] + g.b[down]) * 0.25 - b;
        g.nextA[i] = bounded(
          a + reactionTimeStep * (lapA - ab + feed * (1 - a)),
          0,
          1,
        );
        g.nextB[i] = bounded(
          b + reactionTimeStep * (0.5 * lapB + ab - (kill + feed) * b),
          0,
          1,
        );
      }
    [g.a, g.nextA] = [g.nextA, g.a];
    [g.b, g.nextB] = [g.nextB, g.b];
  }
}
export function ReactionDiffusion({
  parameters,
  defaultParameters = { feed: 0.055, kill: 0.062 },
  onParametersChange,
  paused: controlled,
  defaultPaused = false,
  onPausedChange,
  label = "Reaction diffusion",
  disabled,
  className = "",
  style,
}: ReactionDiffusionProps) {
  const [settings, setSettings] = useControllable(
      parameters,
      defaultParameters,
      onParametersChange,
    ),
    [paused, setPaused] = useControllable(
      controlled,
      defaultPaused,
      onPausedChange,
    ),
    grid = useRef<ChemicalGrid | null>(null),
    buffer = useRef<HTMLCanvasElement | null>(null),
    elapsed = useRef(0),
    [steps, setSteps] = useState(0);
  const ensure = () => {
    if (!grid.current) {
      grid.current = chemicals();
      reactionStep(
        grid.current,
        bounded(settings.feed, 0.01, 0.08),
        bounded(settings.kill, 0.03, 0.08),
        160,
      );
    }
    return grid.current;
  };
  const advance = (n: number) =>
    reactionStep(
      ensure(),
      bounded(settings.feed, 0.01, 0.08),
      bounded(settings.kill, 0.03, 0.08),
      n,
    );
  const scene = useExperimentCanvas((dt, canvas) => {
    if (dt) {
      elapsed.current += dt;
      if (elapsed.current > 0.03) {
        advance(4);
        elapsed.current = 0;
      }
    }
    const b = begin(canvas);
    if (!b) return;
    const g = ensure();
    if (!buffer.current) {
      buffer.current = document.createElement("canvas");
      buffer.current.width = gw;
      buffer.current.height = gh;
    }
    const ctx = buffer.current.getContext("2d");
    if (!ctx) return;
    const image = ctx.createImageData(gw, gh);
    // Resolve semantic colors through Canvas, including custom theme colors.
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = b.background;
    ctx.fillRect(0, 0, 1, 1);
    const background = ctx.getImageData(0, 0, 1, 1).data;
    ctx.fillStyle = b.ink;
    ctx.fillRect(0, 0, 1, 1);
    const accent = ctx.getImageData(0, 0, 1, 1).data;
    for (let i = 0; i < gw * gh; i++) {
      const shade = bounded(g.b[i] * 2.4, 0, 1);
      for (let channel = 0; channel < 3; channel++)
        image.data[i * 4 + channel] =
          background[channel] + (accent[channel] - background[channel]) * shade;
      image.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    b.ctx.imageSmoothingEnabled = false;
    b.ctx.drawImage(buffer.current, 0, 0, b.w, b.h);
  }, paused || disabled);
  useEffect(scene.invalidate, [settings, paused]);
  const reset = () => {
    grid.current = null;
    setSteps(0);
    scene.invalidate();
  };
  const seed = (x = 0.5, y = 0.5) => {
    if (disabled) return;
    const g = ensure(),
      cx = Math.floor(bounded(x, 0, 0.99) * gw),
      cy = Math.floor(bounded(y, 0, 0.99) * gh);
    for (let yy = -4; yy <= 4; yy++)
      for (let xx = -4; xx <= 4; xx++) {
        const i = ((cy + yy + gh) % gh) * gw + ((cx + xx + gw) % gw);
        g.a[i] = 0;
        g.b[i] = 1;
      }
    scene.invalidate();
  };
  return (
    <section
      className={`mingu-kinetic ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-kinetic-heading">
        <strong>{label}</strong>
        <span>80 × 54 cells</span>
      </div>
      <canvas
        ref={scene.canvas}
        className="mingu-kinetic-canvas mingu-reaction-canvas"
        role="img"
        aria-label="Reaction diffusion pattern"
        onClick={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          seed((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height);
        }}
      />
      <div className="mingu-kinetic-fields">
        <label>
          Feed · {settings.feed.toFixed(3)}
          <input
            aria-label="Feed rate"
            type="range"
            min="0.01"
            max="0.08"
            step="0.001"
            value={bounded(settings.feed, 0.01, 0.08)}
            disabled={disabled}
            onChange={(e) =>
              setSettings({ ...settings, feed: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Kill · {settings.kill.toFixed(3)}
          <input
            aria-label="Kill rate"
            type="range"
            min="0.03"
            max="0.08"
            step="0.001"
            value={bounded(settings.kill, 0.03, 0.08)}
            disabled={disabled}
            onChange={(e) =>
              setSettings({ ...settings, kill: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <div className="mingu-kinetic-actions">
        <MotionButton
          paused={paused}
          onChange={setPaused}
          reduced={scene.reduced}
          disabled={disabled}
        />
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => {
            advance(20);
            setSteps(steps + 20);
            scene.invalidate();
          }}
        >
          Step pattern
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => seed()}
        >
          Seed center
        </Button>
        <Button size="sm" variant="ghost" disabled={disabled} onClick={reset}>
          Reset pattern
        </Button>
      </div>
      <span className="mingu-kinetic-note">
        Tap to seed · {steps} manual steps
      </span>
    </section>
  );
}

export interface TerrainMeshProps extends SimulationProps {
  amplitude?: number;
  defaultAmplitude?: number;
  onAmplitudeChange?: (value: number) => void;
  seed?: number;
}
export function TerrainMesh({
  amplitude: controlledAmplitude,
  defaultAmplitude = 0.55,
  onAmplitudeChange,
  seed = 1,
  paused: controlled,
  defaultPaused = false,
  onPausedChange,
  label = "Terrain mesh",
  disabled,
  className = "",
  style,
}: TerrainMeshProps) {
  const [amplitude, setAmplitude] = useControllable(
      controlledAmplitude,
      defaultAmplitude,
      onAmplitudeChange,
    ),
    [paused, setPaused] = useControllable(
      controlled,
      defaultPaused,
      onPausedChange,
    ),
    [yaw, setYaw] = useState(0),
    [generation, setGeneration] = useState(0),
    phase = useRef(0);
  const scene = useExperimentCanvas((dt, canvas) => {
    phase.current += dt * 0.35;
    const b = begin(canvas);
    if (!b) return;
    const { ctx, w, h, ink } = b;
    ctx.fillStyle = b.background;
    ctx.fillRect(0, 0, w, h);
    const project = (col: number, row: number) => {
      const x = (col / 25) * 2 - 1,
        z = (row / 17) * 2 - 1,
        rx = x * Math.cos(yaw) - z * Math.sin(yaw),
        rz = x * Math.sin(yaw) + z * Math.cos(yaw),
        perspective = 2.3 / (rz + 4);
      const height =
        (Math.sin(x * 3.4 + seed + generation + phase.current) +
          Math.cos(z * 4.6 + seed * 0.6) +
          Math.sin((x + z) * 6.2 - phase.current) * 0.4) *
        bounded(amplitude, 0, 1) *
        0.35;
      return {
        x: w * 0.5 + rx * w * 0.72 * perspective,
        y:
          h * 0.65 +
          rz * h * 0.45 * perspective -
          height * h * 0.7 * perspective,
      };
    };
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(1, w / 700);
    for (let row = 0; row < 18; row++) {
      ctx.globalAlpha = 0.15 + (row / 17) * 0.55;
      ctx.beginPath();
      for (let col = 0; col < 26; col++) {
        const p = project(col, row);
        if (!col) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    for (let col = 0; col < 26; col++) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      for (let row = 0; row < 18; row++) {
        const p = project(col, row);
        if (!row) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, paused || disabled);
  useEffect(scene.invalidate, [amplitude, yaw, generation, seed]);
  return (
    <section
      className={`mingu-kinetic ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-kinetic-heading">
        <strong>{label}</strong>
        <span>26 × 18 vertices</span>
      </div>
      <canvas
        ref={scene.canvas}
        className="mingu-kinetic-canvas"
        role="img"
        aria-label="Interactive wireframe terrain"
        onPointerMove={(e) => {
          if (disabled || e.pointerType === "touch") return;
          const b = e.currentTarget.getBoundingClientRect();
          setYaw(((e.clientX - b.left) / b.width - 0.5) * 1.2);
        }}
      />
      <div className="mingu-kinetic-fields">
        <label>
          Height
          <input
            type="range"
            aria-label="Terrain height"
            min="0"
            max="1"
            step="0.01"
            value={bounded(amplitude, 0, 1)}
            disabled={disabled}
            onChange={(e) => setAmplitude(Number(e.target.value))}
          />
        </label>
        <label>
          View angle
          <input
            type="range"
            aria-label="View angle"
            min="-0.8"
            max="0.8"
            step="0.01"
            value={yaw}
            disabled={disabled}
            onChange={(e) => setYaw(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="mingu-kinetic-actions">
        <MotionButton
          paused={paused}
          onChange={setPaused}
          reduced={scene.reduced}
          disabled={disabled}
        />
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => {
            setGeneration((g) => g + 1);
            scene.invalidate();
          }}
        >
          New terrain
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            phase.current += 0.15;
            scene.invalidate();
          }}
        >
          Step terrain
        </Button>
      </div>
    </section>
  );
}

export interface PendulumWaveProps extends SimulationProps {
  count?: number;
  gravity?: number;
  defaultGravity?: number;
  onGravityChange?: (value: number) => void;
  onPluck?: (index: number) => void;
}
export function PendulumWave({
  count = 12,
  gravity: controlledGravity,
  defaultGravity = 1,
  onGravityChange,
  onPluck,
  paused: controlled,
  defaultPaused = false,
  onPausedChange,
  label = "Pendulum wave",
  disabled,
  className = "",
  style,
}: PendulumWaveProps) {
  const n = Math.floor(bounded(count, 3, 24)),
    [gravity, setGravity] = useControllable(
      controlledGravity,
      defaultGravity,
      onGravityChange,
    ),
    [paused, setPaused] = useControllable(
      controlled,
      defaultPaused,
      onPausedChange,
    ),
    phase = useRef(1),
    offsets = useRef<number[]>([]),
    positions = useRef<{ x: number; y: number }[]>([]),
    [plucks, setPlucks] = useState(0);
  const scene = useExperimentCanvas((dt, canvas) => {
    phase.current += dt;
    const b = begin(canvas);
    if (!b) return;
    const { ctx, w, h, ink } = b;
    positions.current = [];
    for (let i = 0; i < n; i++) {
      const length = 0.38 + (i / (n - 1)) * 0.42,
        angle =
          Math.sin(
            phase.current * Math.sqrt(bounded(gravity, 0.2, 2) / length) * 2 +
              (offsets.current[i] ?? i * 0.06),
          ) * 0.55,
        anchorX = w * (0.1 + (i / (n - 1)) * 0.8),
        anchorY = h * 0.1,
        len = h * length,
        x = anchorX + Math.sin(angle) * len * 0.6,
        y = anchorY + Math.cos(angle) * len;
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = Math.max(1, w / 800);
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 0.65 + (i / n) * 0.35;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, w * 0.012), 0, Math.PI * 2);
      ctx.fill();
      positions.current.push({ x: x / w, y: y / h });
    }
    ctx.globalAlpha = 1;
  }, paused || disabled);
  useEffect(scene.invalidate, [gravity, count]);
  const pluck = (index: number) => {
    if (disabled) return;
    offsets.current[index] =
      (offsets.current[index] ?? index * 0.06) + Math.PI / 2;
    setPlucks((p) => p + 1);
    scene.invalidate();
    onPluck?.(index);
  };
  return (
    <section
      className={`mingu-kinetic ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mingu-kinetic-heading">
        <strong>{label}</strong>
        <span>
          {n} pendulums · {plucks} plucks
        </span>
      </div>
      <canvas
        ref={scene.canvas}
        className="mingu-kinetic-canvas"
        role="img"
        aria-label="Interactive pendulum wave"
        onClick={(e) => {
          const b = e.currentTarget.getBoundingClientRect(),
            x = (e.clientX - b.left) / b.width,
            y = (e.clientY - b.top) / b.height;
          let selected = 0,
            distance = Infinity;
          positions.current.forEach((p, i) => {
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < distance) {
              distance = d;
              selected = i;
            }
          });
          pluck(selected);
        }}
      />
      <div className="mingu-kinetic-fields">
        <label>
          Gravity
          <input
            type="range"
            aria-label="Pendulum gravity"
            min="0.2"
            max="2"
            step="0.05"
            value={bounded(gravity, 0.2, 2)}
            disabled={disabled}
            onChange={(e) => setGravity(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="mingu-kinetic-actions">
        <MotionButton
          paused={paused}
          onChange={setPaused}
          reduced={scene.reduced}
          disabled={disabled}
        />
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => pluck(Math.floor(n / 2))}
        >
          Pluck middle
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            phase.current = 0;
            offsets.current = Array(n).fill(0);
            setPlucks(0);
            scene.invalidate();
          }}
        >
          Synchronize
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            phase.current += 0.1;
            scene.invalidate();
          }}
        >
          Step wave
        </Button>
      </div>
    </section>
  );
}
