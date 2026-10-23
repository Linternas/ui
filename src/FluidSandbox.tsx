"use client";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { Button, Select } from "./system/base";
import { Slider } from "./system/forms";
import { FluidInk } from "./experimental/fluid-ink";
import { useExperimentCanvas } from "./experimental/canvas";
import {
  prepareSurface,
  surfacePoint,
  clamp,
  type ExperimentProps,
} from "./experimental/surface";
import { simulationMotion as limits } from "./system/motion-tokens";
export interface FluidSandboxProps extends ExperimentProps {
  defaultCount?: number;
  onCountChange?: (count: number) => void;
}
type Drop = { x: number; y: number; vx: number; vy: number };
export function FluidSandbox({
  defaultCount = limits.fluidStart,
  onCountChange,
  label = "Fluid sandbox",
  className = "",
  style,
}: FluidSandboxProps) {
  const initial = clamp(Math.round(defaultCount), 0, limits.fluidLimit),
    [count, setCount] = useState(initial),
    [gravity, setGravity] = useState(0.4),
    [viscosity, setViscosity] = useState(0.5),
    [appearance, setAppearance] = useState("ink"),
    [paused, setPaused] = useState(false),
    [touch, setTouch] = useState(false),
    [message, setMessage] = useState("Pour a little. Stir it around.");
  const ink = useRef(new FluidInk());
  const drops = useRef<Drop[]>([]),
    size = useRef({ width: 0, height: 0 }),
    pointer = useRef<{
      id: number;
      x: number;
      y: number;
      dx: number;
      dy: number;
    } | null>(null),
    vortex = useRef({ time: 0, direction: 1 }),
    serial = useRef(0),
    settings = useRef({ gravity, viscosity, appearance, onCountChange });
  settings.current = { gravity, viscosity, appearance, onCountChange };
  const seed = (amount: number, x = 400, y = size.current.height * 0.22) => {
    for (let n = 0; n < amount; n++) {
      const i = serial.current++,
        angle = i * 2.399963,
        radius = 12 + Math.sqrt(n) * 5;
      drops.current.push({
        x: clamp(x + Math.cos(angle) * radius, 16, 784),
        y: clamp(
          y + Math.sin(angle) * radius,
          16,
          Math.max(16, size.current.height - 16),
        ),
        vx: Math.sin(angle) * 12,
        vy: Math.cos(angle) * 8,
      });
    }
    drops.current = drops.current.slice(-limits.fluidLimit);
  };
  const report = () => {
    setCount(drops.current.length);
    settings.current.onCountChange?.(drops.current.length);
  };
  const animation = useExperimentCanvas((delta, canvas) => {
    const surface = prepareSurface(canvas);
    if (!surface) return;
    const { context: ctx, width, height, accent, muted } = surface,
      scale = width / 800,
      h = height / scale;
    if (size.current.width !== width || size.current.height !== h) {
      if (!size.current.width) {
        size.current = { width, height: h };
        seed(initial);
      } else {
        const factor = h / size.current.height;
        drops.current.forEach((p) => {
          p.y = clamp(p.y * factor, 16, h - 16);
          p.vx = p.vy = 0;
        });
        size.current = { width, height: h };
      }
      pointer.current = null;
    }
    const dt = delta * 60;
    if (dt) {
      const grid = new Map<string, number[]>(),
        cell = limits.fluidRadius;
      for (let i = 0; i < drops.current.length; i++) {
        const p = drops.current[i],
          key = `${Math.floor(p.x / cell)}:${Math.floor(p.y / cell)}`,
          bucket = grid.get(key);
        if (bucket) bucket.push(i);
        else grid.set(key, [i]);
      }
      const damp = Math.pow(1 - settings.current.viscosity * 0.035, dt);
      for (let i = 0; i < drops.current.length; i++) {
        const p = drops.current[i],
          gx = Math.floor(p.x / cell),
          gy = Math.floor(p.y / cell);
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            for (const j of grid.get(`${gx + dx}:${gy + dy}`) ?? []) {
              if (j <= i) continue;
              const other = drops.current[j],
                x = other.x - p.x,
                y = other.y - p.y,
                d = Math.max(0.1, Math.hypot(x, y));
              if (d >= cell) continue;
              const push = (1 - d / cell) * 0.85 * dt,
                fx = (x / d) * push,
                fy = (y / d) * push;
              p.vx -= fx;
              p.vy -= fy;
              other.vx += fx;
              other.vy += fy;
              const mix = settings.current.viscosity * 0.025 * dt,
                vx = (other.vx - p.vx) * mix,
                vy = (other.vy - p.vy) * mix;
              p.vx += vx;
              p.vy += vy;
              other.vx -= vx;
              other.vy -= vy;
            }
      }
      for (const p of drops.current) {
        const field =
          pointer.current ??
          (vortex.current.time > 0
            ? { x: 400, y: h * 0.55, dx: 0, dy: 0 }
            : null);
        if (field) {
          const dx = p.x - field.x,
            dy = p.y - field.y,
            d = Math.max(8, Math.hypot(dx, dy)),
            influence = Math.max(0, 1 - d / 240),
            direction = pointer.current ? 1 : vortex.current.direction;
          p.vx +=
            ((-dy / d) * 1.8 * direction + field.dx * 0.06) * influence * dt;
          p.vy +=
            ((dx / d) * 1.8 * direction + field.dy * 0.06) * influence * dt;
        }
        p.vy += settings.current.gravity * 0.32 * dt;
        p.vx = clamp(p.vx * damp, -12, 12);
        p.vy = clamp(p.vy * damp, -12, 12);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 16 || p.x > 784) {
          p.x = clamp(p.x, 16, 784);
          p.vx *= -0.45;
        }
        if (p.y < 16 || p.y > h - 16) {
          p.y = clamp(p.y, 16, h - 16);
          p.vy *= -0.3;
          p.vx *= 0.97;
        }
      }
      vortex.current.time = Math.max(0, vortex.current.time - delta);
      if (pointer.current) {
        pointer.current.dx *= 0.8;
        pointer.current.dy *= 0.8;
      }
    }
    ctx.scale(scale, scale);
    ctx.fillStyle = accent;
    if (settings.current.appearance === "ink")
      ink.current.paint(ctx, drops.current, h, accent);
    else {
      ctx.globalAlpha = 0.8;
      for (const p of drops.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = muted;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1 / scale;
    ctx.beginPath();
    ctx.moveTo(16, h - 9);
    ctx.lineTo(784, h - 9);
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (pointer.current) {
      ctx.strokeStyle = accent;
      ctx.setLineDash([4 / scale, 5 / scale]);
      ctx.beginPath();
      ctx.arc(pointer.current.x, pointer.current.y, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, paused);
  useEffect(
    () => animation.invalidate(),
    [gravity, viscosity, appearance, animation.invalidate],
  );
  const ensureInitialized = () => {
    if (size.current.width) return;
    const canvas = animation.canvas.current,
      width = canvas?.clientWidth || 800,
      height = canvas?.clientHeight || 500;
    size.current = { width, height: height / (width / 800) };
    seed(initial);
  };
  const pour = () => {
    ensureInitialized();
    seed(32, 400, size.current.height * 0.2);
    report();
    setMessage(`${drops.current.length} particles in the sandbox.`);
    animation.invalidate();
  };
  const stop = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointer.current?.id === event.pointerId) pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    animation.invalidate();
  };
  return (
    <div
      className={`mingu-fluid-sandbox ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <div
        className="mingu-experiment-surface mingu-simulation-surface"
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerDown={(event) => {
          if (
            event.button !== 0 ||
            !event.isPrimary ||
            (event.pointerType === "touch" && !touch)
          )
            return;
          const canvas = animation.canvas.current;
          if (!canvas) return;
          const p = surfacePoint(event, canvas),
            scale = canvas.clientWidth / 800;
          pointer.current = {
            id: event.pointerId,
            x: p.x / scale,
            y: p.y / scale,
            dx: 0,
            dy: 0,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          animation.invalidate();
        }}
        onPointerMove={(event) => {
          const p = pointer.current,
            canvas = animation.canvas.current;
          if (!p || !canvas || p.id !== event.pointerId) return;
          const next = surfacePoint(event, canvas),
            scale = canvas.clientWidth / 800,
            x = next.x / scale,
            y = next.y / scale;
          p.dx = clamp(x - p.x, -60, 60);
          p.dy = clamp(y - p.y, -60, 60);
          p.x = x;
          p.y = y;
          animation.invalidate();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={() => {
          pointer.current = null;
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
        <span className="mingu-experiment-coordinate" aria-hidden="true">
          POUR / STIR / SPIN / REPEAT
        </span>
        {!count && (
          <span className="mingu-simulation-empty">
            An empty vessel. Pour something in.
          </span>
        )}
      </div>
      <div className="mingu-simulation-settings">
        <Slider
          label="Gravity"
          min={0}
          max={1.5}
          step={0.1}
          value={gravity}
          onValueChange={setGravity}
        />
        <Slider
          label="Viscosity"
          min={0}
          max={1}
          step={0.1}
          value={viscosity}
          onValueChange={setViscosity}
        />
        <Select
          aria-label="Fluid appearance"
          value={appearance}
          onChange={(event) => setAppearance(event.currentTarget.value)}
        >
          <option value="ink">Soft ink</option>
          <option value="particles">Particles</option>
        </Select>
      </div>
      <div className="mingu-experiment-buttons">
        <Button variant="secondary" onClick={pour}>
          Pour
        </Button>
        {([-1, 1] as const).map((direction) => (
          <Button
            key={direction}
            variant="ghost"
            disabled={!!animation.reduced || paused || !count}
            onClick={() => {
              vortex.current = { time: 2, direction };
              setMessage(
                direction < 0
                  ? "Turning counterclockwise."
                  : "Turning clockwise.",
              );
            }}
          >
            Spin {direction < 0 ? "left" : "right"}
          </Button>
        ))}
        <Button
          variant="ghost"
          disabled={!!animation.reduced}
          aria-pressed={paused}
          onClick={() => {
            setPaused(!paused);
            pointer.current = null;
          }}
        >
          {paused ? "Resume fluid" : "Pause fluid"}
        </Button>
        <Button
          variant="ghost"
          aria-pressed={touch}
          onClick={() => {
            setTouch(!touch);
            pointer.current = null;
          }}
        >
          Touch interaction
        </Button>
        <Button
          variant="ghost"
          disabled={!count}
          onClick={() => {
            ensureInitialized();
            drops.current = [];
            pointer.current = null;
            vortex.current.time = 0;
            report();
            setMessage("The sandbox is empty.");
            animation.invalidate();
          }}
        >
          Drain
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            ensureInitialized();
            drops.current = [];
            seed(initial);
            pointer.current = null;
            vortex.current.time = 0;
            report();
            setMessage("A fresh little pool.");
            animation.invalidate();
          }}
        >
          Reset fluid
        </Button>
      </div>
      <p className="mingu-experiment-status" role="status">
        {animation.reduced
          ? "Motion reduced. Pour and drain the static particles."
          : message}{" "}
        <span>
          {count} / {limits.fluidLimit} particles.
        </span>
      </p>
    </div>
  );
}
