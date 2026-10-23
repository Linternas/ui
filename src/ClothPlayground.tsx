"use client";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { Button } from "./system/base";
import { Slider } from "./system/forms";
import { useExperimentCanvas } from "./experimental/canvas";
import {
  prepareSurface,
  surfacePoint,
  clamp,
  type ExperimentProps,
} from "./experimental/surface";
import { simulationMotion as limits } from "./system/motion-tokens";
export interface ClothPlaygroundProps extends ExperimentProps {
  defaultWind?: number;
  defaultGravity?: number;
  onTear?: (total: number) => void;
}
type Node = {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  homeX: number;
  homeY: number;
  pinned: boolean;
};
type Thread = { a: number; b: number; length: number; cut: boolean };
const columns = 25,
  rows = 17,
  handleIndex = 8 * columns + 12;
function makeCloth(height: number) {
  const nodes: Node[] = [],
    threads: Thread[] = [];
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < columns; col++) {
      const x = 104 + (col * 592) / (columns - 1),
        y = height * 0.12 + (row * height * 0.58) / (rows - 1),
        i = nodes.length;
      nodes.push({
        x,
        y,
        oldX: x,
        oldY: y,
        homeX: x,
        homeY: y,
        pinned: row === 0 && col % 6 === 0,
      });
      if (col)
        threads.push({
          a: i - 1,
          b: i,
          length: 592 / (columns - 1),
          cut: false,
        });
      if (row)
        threads.push({
          a: i - columns,
          b: i,
          length: (height * 0.58) / (rows - 1),
          cut: false,
        });
    }
  return { nodes, threads, height };
}
export function ClothPlayground({
  defaultWind = 0.4,
  defaultGravity = 0.7,
  onTear,
  label = "Cloth playground",
  className = "",
  style,
}: ClothPlaygroundProps) {
  const [wind, setWind] = useState(clamp(defaultWind, -2, 2)),
    [gravity, setGravity] = useState(clamp(defaultGravity, 0, 1.8)),
    [paused, setPaused] = useState(false),
    [touch, setTouch] = useState(false),
    [tearing, setTearing] = useState(false),
    [anchored, setAnchored] = useState(true),
    [cutCount, setCutCount] = useState(0),
    [message, setMessage] = useState("Pull the fabric. Let it settle.");
  const cloth = useRef<ReturnType<typeof makeCloth> | null>(null),
    signature = useRef(""),
    grip = useRef<HTMLButtonElement>(null),
    grab = useRef<{ id: number; node: number; x: number; y: number } | null>(
      null,
    ),
    clock = useRef(0),
    gust = useRef(0),
    live = useRef({ wind, gravity, anchored, onTear });
  live.current = { wind, gravity, anchored, onTear };
  const initialize = (canvas: HTMLCanvasElement) => {
    const width = Math.max(1, canvas.clientWidth),
      height = canvas.clientHeight / (width / 800),
      key = `${width}:${canvas.clientHeight}`;
    if (signature.current !== key || !cloth.current) {
      signature.current = key;
      cloth.current = makeCloth(height);
      if (!live.current.anchored)
        cloth.current.nodes.forEach((n) => (n.pinned = false));
      grab.current = null;
      setCutCount(0);
    }
    return cloth.current;
  };
  const animation = useExperimentCanvas((delta, canvas) => {
    const surface = prepareSurface(canvas);
    if (!surface) return;
    const { context: ctx, width, height, ink, muted } = surface,
      scale = width / 800,
      worldHeight = height / scale;
    const model = initialize(canvas);
    clock.current += delta;
    const dt = delta / 2;
    for (let sub = 0; sub < 2 && delta > 0; sub++) {
      const push =
        Math.sin(clock.current * 1.7) * live.current.wind * 200 +
        gust.current * 350;
      for (let i = 0; i < model.nodes.length; i++) {
        const n = model.nodes[i];
        if (n.pinned) {
          n.x = n.homeX;
          n.y = n.homeY;
          n.oldX = n.x;
          n.oldY = n.y;
          continue;
        }
        if (grab.current?.node === i) {
          n.x = grab.current.x;
          n.y = grab.current.y;
          n.oldX = n.x;
          n.oldY = n.y;
          continue;
        }
        const vx = (n.x - n.oldX) * 0.985,
          vy = (n.y - n.oldY) * 0.985;
        n.oldX = n.x;
        n.oldY = n.y;
        n.x = clamp(n.x + vx + push * dt * dt, 8, 792);
        n.y = clamp(
          n.y + vy + live.current.gravity * 1100 * dt * dt,
          8,
          worldHeight - 12,
        );
      }
      for (let pass = 0; pass < limits.clothPasses; pass++)
        for (const thread of model.threads) {
          if (thread.cut) continue;
          const a = model.nodes[thread.a],
            b = model.nodes[thread.b],
            dx = b.x - a.x,
            dy = b.y - a.y,
            d = Math.max(0.01, Math.hypot(dx, dy)),
            error = (d - thread.length) / d;
          const fixedA = a.pinned || grab.current?.node === thread.a,
            fixedB = b.pinned || grab.current?.node === thread.b,
            weight = fixedA || fixedB ? 1 : 0.5;
          if (!fixedA) {
            a.x += dx * error * weight;
            a.y += dy * error * weight;
          }
          if (!fixedB) {
            b.x -= dx * error * weight;
            b.y -= dy * error * weight;
          }
        }
      for (const n of model.nodes) {
        n.x = clamp(n.x, 8, 792);
        n.y = clamp(n.y, 8, worldHeight - 12);
        if (n.pinned) {
          n.x = n.homeX;
          n.y = n.homeY;
        }
      }
    }
    gust.current *= Math.pow(0.96, delta * 60);
    ctx.scale(scale, scale);
    ctx.lineWidth = 1 / scale;
    ctx.strokeStyle = muted;
    ctx.globalAlpha = 0.48;
    ctx.beginPath();
    for (const thread of model.threads) {
      if (thread.cut) continue;
      const a = model.nodes[thread.a],
        b = model.nodes[thread.b];
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = ink;
    for (const n of model.nodes)
      if (n.pinned) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3 / scale, 0, Math.PI * 2);
        ctx.fill();
      }
    const center = model.nodes[handleIndex];
    if (grip.current) {
      grip.current.style.left = `${center.x * scale}px`;
      grip.current.style.top = `${center.y * scale}px`;
    }
  }, paused);
  useEffect(
    () => animation.invalidate(),
    [wind, gravity, anchored, animation.invalidate],
  );
  const reset = () => {
    signature.current = "";
    grab.current = null;
    gust.current = 0;
    setCutCount(0);
    setAnchored(true);
    setTearing(false);
    setMessage("Fabric restored.");
    animation.invalidate();
  };
  const cut = (x: number, y: number) => {
    const canvas = animation.canvas.current;
    if (!canvas) return;
    const model = initialize(canvas);
    let removed = 0;
    for (const t of model.threads) {
      if (t.cut) continue;
      const a = model.nodes[t.a],
        b = model.nodes[t.b],
        dx = b.x - a.x,
        dy = b.y - a.y,
        k = clamp(
          ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1),
          0,
          1,
        );
      if (Math.hypot(x - a.x - k * dx, y - a.y - k * dy) < limits.tearRadius) {
        t.cut = true;
        removed++;
      }
    }
    if (removed) {
      const count = model.threads.filter((t) => t.cut).length;
      setCutCount(count);
      live.current.onTear?.(count);
      setMessage("A few threads let go.");
      animation.invalidate();
    }
  };
  const locate = (event: React.PointerEvent<HTMLDivElement>) => {
    const canvas = animation.canvas.current;
    if (!canvas) return null;
    initialize(canvas);
    const point = surfacePoint(event, canvas),
      scale = canvas.clientWidth / 800;
    return { x: point.x / scale, y: point.y / scale };
  };
  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (grab.current?.id === event.pointerId) grab.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return (
    <div
      className={`mingu-cloth-playground ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      <div
        className="mingu-experiment-surface mingu-simulation-surface"
        data-tearing={tearing || undefined}
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary) return;
          const fromGrip = !!(event.target as Element).closest(
            "[data-cloth-grip]",
          );
          if (event.pointerType === "touch" && !touch && !fromGrip) return;
          const p = locate(event),
            model = cloth.current;
          if (!p || !model) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          if (tearing) {
            grab.current = { id: event.pointerId, node: -1, ...p };
            cut(p.x, p.y);
            return;
          }
          let nearest = -1,
            distance = Infinity;
          model.nodes.forEach((n, i) => {
            const d = Math.hypot(n.x - p.x, n.y - p.y);
            if (!n.pinned && d < distance) {
              nearest = i;
              distance = d;
            }
          });
          if (nearest >= 0) {
            grab.current = { id: event.pointerId, node: nearest, ...p };
            grip.current?.focus({ preventScroll: true });
            setMessage("Fabric held. Drag and release.");
          }
        }}
        onPointerMove={(event) => {
          const gesture = grab.current;
          if (!gesture || gesture.id !== event.pointerId) return;
          const p = locate(event);
          if (!p) return;
          if (gesture.node < 0) cut(p.x, p.y);
          else {
            gesture.x = p.x;
            gesture.y = p.y;
            const n = cloth.current?.nodes[gesture.node];
            if (n) {
              n.x = p.x;
              n.y = p.y;
              n.oldX = p.x;
              n.oldY = p.y;
            }
            animation.invalidate();
          }
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={() => {
          grab.current = null;
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
        <button
          ref={grip}
          type="button"
          data-cloth-grip
          className="mingu-simulation-handle"
          aria-label="Pull fabric"
          onKeyDown={(event) => {
            if (
              !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                event.key,
              )
            )
              return;
            event.preventDefault();
            const canvas = animation.canvas.current;
            if (!canvas) return;
            const n = initialize(canvas).nodes[handleIndex];
            if (!n) return;
            const step = event.shiftKey ? 32 : 12;
            n.x = clamp(
              n.x +
                (event.key === "ArrowLeft"
                  ? -step
                  : event.key === "ArrowRight"
                    ? step
                    : 0),
              8,
              792,
            );
            n.y = clamp(
              n.y +
                (event.key === "ArrowUp"
                  ? -step
                  : event.key === "ArrowDown"
                    ? step
                    : 0),
              8,
              (cloth.current?.height ?? 500) - 12,
            );
            setMessage("Fabric pulled with the arrow keys.");
            animation.invalidate();
          }}
        >
          <span aria-hidden="true">↔</span>
        </button>
        <span className="mingu-experiment-coordinate" aria-hidden="true">
          A SOFT PLACE TO PLAY / 425 POINTS
        </span>
      </div>
      <div className="mingu-simulation-settings">
        <Slider
          label="Wind"
          min={-2}
          max={2}
          step={0.1}
          value={wind}
          onValueChange={setWind}
        />
        <Slider
          label="Gravity"
          min={0}
          max={1.8}
          step={0.1}
          value={gravity}
          onValueChange={setGravity}
        />
      </div>
      <div className="mingu-experiment-buttons">
        <Button
          variant="secondary"
          disabled={!!animation.reduced || paused}
          onClick={() => {
            gust.current = 3;
            setMessage("A gust through the fabric.");
          }}
        >
          Gust
        </Button>
        <Button
          variant="ghost"
          aria-pressed={tearing}
          onClick={() => {
            setTearing(!tearing);
            grab.current = null;
          }}
        >
          Tear mode
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const next = !anchored;
            setAnchored(next);
            if (next) {
              signature.current = "";
              setCutCount(0);
            } else cloth.current?.nodes.forEach((n) => (n.pinned = false));
            setMessage(next ? "Anchors restored." : "Anchors released.");
            animation.invalidate();
          }}
        >
          {anchored ? "Release anchors" : "Restore anchors"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const canvas = animation.canvas.current;
            if (!canvas) return;
            const center = initialize(canvas).nodes[handleIndex];
            if (center) cut(center.x, center.y);
          }}
        >
          Cut a slit
        </Button>
        <Button
          variant="ghost"
          disabled={!!animation.reduced}
          aria-pressed={paused}
          onClick={() => {
            setPaused(!paused);
            grab.current = null;
          }}
        >
          {paused ? "Resume cloth" : "Pause cloth"}
        </Button>
        <Button
          variant="ghost"
          aria-pressed={touch}
          onClick={() => setTouch(!touch)}
        >
          Touch interaction
        </Button>
        <Button variant="ghost" onClick={reset}>
          Reset cloth
        </Button>
      </div>
      <p className="mingu-experiment-status" role="status">
        {animation.reduced
          ? "Motion reduced. Pull the handle or cut the static fabric."
          : message}{" "}
        <span>{cutCount} threads cut.</span>
      </p>
    </div>
  );
}
