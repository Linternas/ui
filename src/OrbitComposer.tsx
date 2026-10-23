"use client";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { Button, Select } from "./system/base";
import { Slider } from "./system/forms";
import { useExperimentCanvas } from "./experimental/canvas";
import {
  prepareSurface,
  surfacePoint,
  clamp,
  type ExperimentProps,
} from "./experimental/surface";
import { simulationMotion as limits } from "./system/motion-tokens";
export type OrbitPreset = "loom" | "petal" | "satellite";
export interface OrbitComposerProps extends ExperimentProps {
  defaultPreset?: OrbitPreset;
  onPresetChange?: (preset: OrbitPreset) => void;
}
type Arm = { speed: number; radius: number; phase: number };
const presets: Record<OrbitPreset, readonly Arm[]> = {
  loom: [
    { speed: 1, radius: 0.17, phase: 0 },
    { speed: -2.1, radius: 0.1, phase: 1.2 },
    { speed: 3, radius: 0.055, phase: 2 },
  ],
  petal: [
    { speed: 1, radius: 0.17, phase: 0 },
    { speed: -3, radius: 0.13, phase: 0 },
    { speed: 2, radius: 0.025, phase: 0 },
  ],
  satellite: [
    { speed: 0.45, radius: 0.21, phase: 0 },
    { speed: 2.6, radius: 0.08, phase: 0 },
    { speed: -4, radius: 0.035, phase: 1 },
  ],
};
function orbitPoints(
  width: number,
  height: number,
  center: { x: number; y: number },
  arms: readonly Arm[],
  reach: number,
  time: number,
) {
  const list = [{ x: center.x * width, y: center.y * height }],
    unit = Math.min(width, height) * reach;
  for (const arm of arms) {
    const parent = list[list.length - 1],
      angle = arm.phase + time * arm.speed;
    list.push({
      x: parent.x + Math.cos(angle) * arm.radius * unit,
      y: parent.y + Math.sin(angle) * arm.radius * unit,
    });
  }
  return list;
}
const copyPreset = (id: OrbitPreset) => presets[id].map((arm) => ({ ...arm }));
export function OrbitComposer({
  defaultPreset = "loom",
  onPresetChange,
  label = "Orbit composer",
  className = "",
  style,
}: OrbitComposerProps) {
  const initial = Object.prototype.hasOwnProperty.call(presets, defaultPreset)
      ? defaultPreset
      : "loom",
    [preset, setPreset] = useState<OrbitPreset>(initial),
    [arms, setArms] = useState(() => copyPreset(initial)),
    [reach, setReach] = useState(1),
    [paused, setPaused] = useState(false),
    [editing, setEditing] = useState(false),
    [touch, setTouch] = useState(false),
    [tracing, setTracing] = useState(true),
    [message, setMessage] = useState(
      "Three little orbits. Endless little paths.",
    );
  const elapsed = useRef(0),
    center = useRef({ x: 0.5, y: 0.48 }),
    points = useRef<{ x: number; y: number }[]>([]),
    trail = useRef<{ x: number; y: number }[]>([]),
    dimensions = useRef({ width: 0, height: 0 }),
    handles = useRef<(HTMLButtonElement | null)[]>([]),
    gesture = useRef<{ id: number; arm: number } | null>(null),
    settings = useRef({ arms, reach, tracing });
  settings.current = { arms, reach, tracing };
  const animation = useExperimentCanvas((delta, canvas) => {
    const surface = prepareSurface(canvas);
    if (!surface) return;
    const { context: ctx, width, height, accent, muted } = surface;
    if (
      width !== dimensions.current.width ||
      height !== dimensions.current.height
    ) {
      dimensions.current = { width, height };
      trail.current = [];
      gesture.current = null;
    }
    if (!gesture.current) elapsed.current += delta;
    const unit = Math.min(width, height) * settings.current.reach;
    const list = orbitPoints(
      width,
      height,
      center.current,
      settings.current.arms,
      settings.current.reach,
      elapsed.current,
    );
    points.current = list;
    const tip = list[3];
    if (delta && settings.current.tracing && !gesture.current) {
      trail.current.push(tip);
      if (trail.current.length > limits.trailLimit)
        trail.current.splice(0, trail.current.length - limits.trailLimit);
    }
    if (settings.current.tracing && trail.current.length > 1) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      const part = Math.ceil(trail.current.length / 12);
      for (let start = 0; start < trail.current.length - 1; start += part) {
        ctx.globalAlpha = 0.12 + (0.6 * start) / trail.current.length;
        ctx.beginPath();
        ctx.moveTo(trail.current[start].x, trail.current[start].y);
        for (
          let i = start + 1;
          i <= Math.min(start + part, trail.current.length - 1);
          i++
        )
          ctx.lineTo(trail.current[i].x, trail.current[i].y);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = muted;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.18;
    ctx.setLineDash([3, 6]);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        list[i].x,
        list[i].y,
        settings.current.arms[i].radius * unit,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(list[0].x, list[0].y);
    list.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.globalAlpha = 1;
    list.forEach((p, i) => {
      const handle = handles.current[i];
      if (handle) {
        handle.style.left = `${p.x}px`;
        handle.style.top = `${p.y}px`;
      }
    });
  }, paused || editing);
  useEffect(
    () => animation.invalidate(),
    [arms, reach, tracing, editing, animation.invalidate],
  );
  const apply = (id: OrbitPreset) => {
    setPreset(id);
    setArms(copyPreset(id));
    setReach(1);
    elapsed.current = 0;
    center.current = { x: 0.5, y: 0.48 };
    trail.current = [];
    onPresetChange?.(id);
    setMessage(`${id} preset loaded.`);
    animation.invalidate();
  };
  const readLayout = () => {
    const canvas = animation.canvas.current;
    if (canvas) {
      dimensions.current = {
        width: canvas.clientWidth,
        height: canvas.clientHeight,
      };
      points.current = orbitPoints(
        canvas.clientWidth,
        canvas.clientHeight,
        center.current,
        settings.current.arms,
        settings.current.reach,
        elapsed.current,
      );
    }
  };
  const adjust = (index: number, x: number, y: number) => {
    readLayout();
    const { width, height } = dimensions.current;
    if (!width || !height) return;
    if (index === 0) {
      center.current = {
        x: clamp(x / width, 0.05, 0.95),
        y: clamp(y / height, 0.05, 0.95),
      };
    } else {
      const parent = points.current[index - 1];
      if (!parent) return;
      const dx = x - parent.x,
        dy = y - parent.y,
        unit = Math.min(width, height) * reach;
      setArms((previous) =>
        previous.map((arm, i) =>
          i === index - 1
            ? {
                ...arm,
                radius: clamp(Math.hypot(dx, dy) / unit, 0.02, 0.3),
                phase: Math.atan2(dy, dx) - elapsed.current * arm.speed,
              }
            : arm,
        ),
      );
    }
    trail.current = [];
    animation.invalidate();
  };
  const drawCycle = () => {
    readLayout();
    const { width, height } = dimensions.current;
    if (!width || !height) return;
    const start = elapsed.current,
      duration = (Math.PI * 2) / Math.max(0.1, Math.abs(arms[0].speed));
    const path = [];
    for (let i = 0; i <= 450; i++)
      path.push(
        orbitPoints(
          width,
          height,
          center.current,
          arms,
          reach,
          start + (duration * i) / 450,
        )[3],
      );
    elapsed.current = start + duration;
    trail.current = path;
    setTracing(true);
    setMessage("One cycle, drawn by the orbits.");
    animation.invalidate();
  };
  const stop = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = gesture.current?.id === event.pointerId;
    if (active) gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    // Pointer editing resumes on release; keyboard editing stays focused and still.
    if (active && document.activeElement?.matches("[data-orbit-handle]"))
      event.currentTarget.focus({ preventScroll: true });
  };
  return (
    <div
      className={`mingu-orbit-composer ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <div
        className="mingu-experiment-surface mingu-orbit-surface mingu-simulation-surface"
        tabIndex={-1}
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary) return;
          const handle = (event.target as Element).closest<HTMLElement>(
            "[data-orbit-handle]",
          );
          if (event.pointerType === "touch" && !touch && !handle) return;
          const index = handle ? Number(handle.dataset.orbitHandle) : 0,
            canvas = animation.canvas.current;
          if (!canvas) return;
          event.preventDefault();
          if (handle) handle.focus({ preventScroll: true });
          else event.currentTarget.focus({ preventScroll: true });
          gesture.current = { id: event.pointerId, arm: index };
          event.currentTarget.setPointerCapture(event.pointerId);
          if (!handle) {
            const p = surfacePoint(event, canvas);
            adjust(0, p.x, p.y);
          }
          setMessage(
            index
              ? `Orbit ${index} held. Drag to reshape.`
              : "Move the center of the system.",
          );
        }}
        onPointerMove={(event) => {
          const active = gesture.current,
            canvas = animation.canvas.current;
          if (!active || !canvas || active.id !== event.pointerId) return;
          const p = surfacePoint(event, canvas);
          adjust(active.arm, p.x, p.y);
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={() => {
          gesture.current = null;
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
        {[0, 1, 2, 3].map((i) => (
          <button
            type="button"
            key={i}
            ref={(element) => {
              handles.current[i] = element;
            }}
            data-orbit-handle={i}
            className={`mingu-simulation-handle mingu-orbit-handle${i === 0 ? " is-center" : ""}`}
            aria-label={i ? `Adjust orbit ${i}` : "Move orbit center"}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  event.key,
                )
              )
                return;
              event.preventDefault();
              readLayout();
              const p = points.current[i];
              if (!p) return;
              const step = event.shiftKey ? 24 : 8;
              adjust(
                i,
                p.x +
                  (event.key === "ArrowLeft"
                    ? -step
                    : event.key === "ArrowRight"
                      ? step
                      : 0),
                p.y +
                  (event.key === "ArrowUp"
                    ? -step
                    : event.key === "ArrowDown"
                      ? step
                      : 0),
              );
              setMessage(
                i
                  ? `Orbit ${i} reshaped with the arrow keys.`
                  : "Center moved with the arrow keys.",
              );
            }}
          >
            <span aria-hidden="true">{i === 0 ? "+" : i}</span>
          </button>
        ))}
        <span className="mingu-experiment-coordinate" aria-hidden="true">
          SMALL CIRCLES / UNEXPECTED PATHS
        </span>
      </div>
      <div className="mingu-simulation-settings mingu-orbit-settings">
        <Select
          aria-label="Orbit preset"
          value={preset}
          onChange={(event) => apply(event.currentTarget.value as OrbitPreset)}
        >
          <option value="loom">Loom</option>
          <option value="petal">Petal</option>
          <option value="satellite">Satellite</option>
        </Select>
        <Slider
          label="Reach"
          value={reach}
          onValueChange={(value) => {
            setReach(value);
            trail.current = [];
          }}
          min={0.4}
          max={1.4}
          step={0.1}
        />
        {arms.map((arm, index) => (
          <Slider
            key={index}
            label={`Orbit ${index + 1} speed`}
            value={arm.speed}
            min={-5}
            max={5}
            step={0.1}
            onValueChange={(speed) => {
              setArms((previous) =>
                previous.map((a, i) =>
                  i === index
                    ? {
                        ...a,
                        speed,
                        phase: a.phase + (a.speed - speed) * elapsed.current,
                      }
                    : a,
                ),
              );
              trail.current = [];
            }}
          />
        ))}
      </div>
      <div className="mingu-experiment-buttons">
        <Button variant="secondary" onClick={drawCycle}>
          Draw a cycle
        </Button>
        <Button
          variant="secondary"
          disabled={!!animation.reduced}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Resume orbits" : "Pause orbits"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setArms((previous) =>
              previous.map((arm) => ({
                ...arm,
                speed: -arm.speed,
                phase: arm.phase + 2 * arm.speed * elapsed.current,
              })),
            );
            trail.current = [];
            setMessage("Direction reversed.");
          }}
        >
          Reverse
        </Button>
        <Button
          variant="ghost"
          aria-pressed={tracing}
          onClick={() => {
            setTracing(!tracing);
            trail.current = [];
          }}
        >
          {tracing ? "Hide trail" : "Show trail"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            trail.current = [];
            setMessage("A fresh path starts here.");
            animation.invalidate();
          }}
        >
          Clear trail
        </Button>
        <Button
          variant="ghost"
          aria-pressed={touch}
          onClick={() => {
            setTouch(!touch);
            gesture.current = null;
          }}
        >
          Touch interaction
        </Button>
        <Button variant="ghost" onClick={() => apply(initial)}>
          Reset orbits
        </Button>
      </div>
      <p className="mingu-experiment-status" role="status">
        {animation.reduced
          ? "Motion reduced. Move the handles with touch or arrow keys."
          : editing
            ? "Motion rests while a handle is focused. Tab away to continue."
            : message}
      </p>
    </div>
  );
}
