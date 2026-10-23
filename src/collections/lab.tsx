"use client";
import * as React from "react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Button, TextField, Select, Dialog } from "../system/base";
import { Slider, TextareaField } from "../system/forms";
import { useExperimentCanvas } from "../experimental/canvas";
import { prepareSurface, clamp } from "../experimental/surface";
import { useControllable } from "../shared";
export interface LabProps {
  label?: string;
  className?: string;
  style?: CSSProperties;
}
function Shell({
  label,
  className = "",
  style,
  children,
  status,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  status?: string;
}) {
  return (
    <div
      className={`mingu-lab-collection ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      {children}
      {status && (
        <p className="mingu-experiment-status" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
function Settings({ children }: { children: ReactNode }) {
  return <div className="mingu-lab-settings">{children}</div>;
}
function Actions({ children }: { children: ReactNode }) {
  return <div className="mingu-experiment-buttons">{children}</div>;
}
function fallbackImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 400;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#d9ddd9";
  c.fillRect(0, 0, 640, 400);
  c.fillStyle = "#354848";
  c.beginPath();
  c.arc(320, 200, 132, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#f5eee0";
  c.font = "700 86px system-ui";
  c.textAlign = "center";
  c.fillText("FORM", 320, 230);
  return canvas;
}
function useRaster(src?: string) {
  const [raster, setRaster] = useState<{
      image: CanvasImageSource;
      pixels: Uint8ClampedArray;
      width: number;
      height: number;
    } | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setError("");
    setRaster(null);
    const read = (source: CanvasImageSource, width: number, height: number) => {
      if (!alive) return;
      try {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(
          256 / Math.max(1, width),
          256 / Math.max(1, height),
        );
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        const context = canvas.getContext("2d", { willReadFrequently: true })!;
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        setRaster({
          image: canvas,
          width: canvas.width,
          height: canvas.height,
          pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
        });
      } catch {
        setError(
          "This image cannot be sampled. Use a local image or a CORS-enabled source.",
        );
      }
    };
    if (!src) {
      const image = fallbackImage();
      read(image, image.width, image.height);
      return () => {
        alive = false;
      };
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => read(image, image.naturalWidth, image.naturalHeight);
    image.onerror = () => {
      if (alive) setError("Image could not be loaded.");
    };
    image.src = src;
    return () => {
      alive = false;
      image.onload = image.onerror = null;
    };
  }, [src]);
  return { raster, error };
}
const point = (
  event: React.PointerEvent<HTMLElement>,
  canvas: HTMLCanvasElement,
) => {
  const r = canvas.getBoundingClientRect();
  return {
    x: clamp((event.clientX - r.left) / r.width, 0, 1),
    y: clamp((event.clientY - r.top) / r.height, 0, 1),
  };
};
function Controls({
  paused,
  setPaused,
  reduced,
  touch,
  setTouch,
  reset,
}: {
  paused: boolean;
  setPaused: (p: boolean) => void;
  reduced: boolean;
  touch: boolean;
  setTouch: (p: boolean) => void;
  reset: () => void;
}) {
  return (
    <>
      <Button
        variant="ghost"
        disabled={reduced}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? "Resume motion" : "Pause motion"}
      </Button>
      <Button
        variant="ghost"
        aria-pressed={touch}
        onClick={() => setTouch(!touch)}
      >
        Touch interaction
      </Button>
      <Button variant="ghost" onClick={reset}>
        Reset experiment
      </Button>
    </>
  );
}
function imageFit(
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
) {
  const scale = Math.min(width / imageWidth, height / imageHeight);
  return {
    x: (width - imageWidth * scale) / 2,
    y: (height - imageHeight * scale) / 2,
    width: imageWidth * scale,
    height: imageHeight * scale,
  };
}
function polyClip(
  points: { x: number; y: number }[],
  threshold: number,
  front: boolean,
) {
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length],
      da = a.x + a.y - threshold,
      db = b.x + b.y - threshold,
      inside = front ? da <= 0 : da >= 0,
      next = front ? db <= 0 : db >= 0;
    if (inside) result.push(a);
    if (inside !== next) {
      const t = da / (da - db);
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return result;
}

export interface StickerPeelProps extends LabProps {
  text?: string;
  image?: string;
  peel?: number;
  defaultPeel?: number;
  onPeelChange?: (amount: number) => void;
}
export function StickerPeel({
  text = "MINGU / MADE TO PLAY",
  image,
  peel,
  defaultPeel = 0.12,
  onPeelChange,
  label = "Sticker peel",
  className,
  style,
}: StickerPeelProps) {
  const [value, setValue] = useControllable(peel, defaultPeel, onPeelChange),
    stage = useRef<HTMLDivElement>(null),
    gesture = useRef<{
      id: number;
      x: number;
      y: number;
      start: number;
    } | null>(null),
    drag = useDragControls(),
    reduced = useReducedMotion(),
    x = useMotionValue(0),
    y = useMotionValue(0),
    id = useId().replace(/:/g, "");
  const p = clamp(value, 0, 1),
    threshold = (1 - p) * 440,
    rect = [
      { x: 0, y: 0 },
      { x: 220, y: 0 },
      { x: 220, y: 220 },
      { x: 0, y: 220 },
    ],
    front = polyClip(rect, threshold, true),
    back = polyClip(rect, threshold, false).map((q) => ({
      x: threshold - q.y,
      y: threshold - q.x,
    }));
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status={
        p > 0.9
          ? "Peeled away. Stick it back whenever you like."
          : "Drag the corner to peel. Use the top handle to move the sticker."
      }
    >
      <div ref={stage} className="mingu-lab-surface mingu-sticker-stage">
        <motion.div
          className="mingu-sticker"
          drag
          dragListener={false}
          dragControls={drag}
          dragConstraints={stage}
          dragElastic={reduced ? 0 : 0.12}
          dragMomentum={!reduced}
          style={{ x, y }}
        >
          <svg viewBox="-10 -10 240 240" aria-hidden="true">
            <defs>
              <clipPath id={id}>
                <polygon points={front.map((q) => `${q.x},${q.y}`).join(" ")} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id})`}>
              <rect width="220" height="220" rx="22" fill="var(--mingu-text)" />
              {image && (
                <image
                  href={image}
                  width="220"
                  height="220"
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              <text
                x="110"
                y="96"
                fill="var(--mingu-bg)"
                textAnchor="middle"
                fontSize="42"
                fontWeight="700"
              >
                ✳
              </text>
              <text
                x="110"
                y="145"
                fill="var(--mingu-bg)"
                textAnchor="middle"
                fontSize="10"
              >
                {text.slice(0, 30)}
              </text>
            </g>
            <polygon
              points={back.map((q) => `${q.x},${q.y}`).join(" ")}
              fill="var(--mingu-raised)"
              stroke="var(--mingu-border)"
              strokeWidth="1.5"
            />
          </svg>
          <button
            type="button"
            className="mingu-sticker-move"
            aria-label="Move sticker"
            onPointerDown={(event) => drag.start(event)}
            onKeyDown={(event) => {
              if (!event.key.startsWith("Arrow")) return;
              event.preventDefault();
              const maxX = Math.max(
                  0,
                  (stage.current?.clientWidth ?? 240) / 2 - 120,
                ),
                maxY = Math.max(
                  0,
                  (stage.current?.clientHeight ?? 300) / 2 - 120,
                );
              x.set(
                clamp(
                  x.get() +
                    (event.key === "ArrowLeft"
                      ? -12
                      : event.key === "ArrowRight"
                        ? 12
                        : 0),
                  -maxX,
                  maxX,
                ),
              );
              y.set(
                clamp(
                  y.get() +
                    (event.key === "ArrowUp"
                      ? -12
                      : event.key === "ArrowDown"
                        ? 12
                        : 0),
                  -maxY,
                  maxY,
                ),
              );
            }}
          >
            ⠿
          </button>
          <button
            type="button"
            className="mingu-sticker-corner"
            aria-label="Peel corner"
            onPointerDown={(event) => {
              event.stopPropagation();
              gesture.current = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                start: p,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const g = gesture.current;
              if (g?.id === event.pointerId)
                setValue(
                  clamp(
                    g.start +
                      (g.x - event.clientX + (g.y - event.clientY)) / 440,
                    0,
                    1,
                  ),
                );
            }}
            onPointerUp={() => {
              gesture.current = null;
            }}
            onPointerCancel={() => {
              gesture.current = null;
            }}
            onKeyDown={(event) => {
              if (!event.key.startsWith("Arrow")) return;
              event.preventDefault();
              setValue(
                clamp(
                  p +
                    (["ArrowLeft", "ArrowUp"].includes(event.key)
                      ? 0.05
                      : -0.05),
                  0,
                  1,
                ),
              );
            }}
          >
            ↖
          </button>
        </motion.div>
      </div>
      <Settings>
        <Slider
          label="Peel amount"
          min={0}
          max={1}
          step={0.01}
          value={p}
          onValueChange={setValue}
        />
      </Settings>
      <Actions>
        <Button variant="secondary" onClick={() => setValue(p > 0.5 ? 0 : 1)}>
          {p > 0.5 ? "Stick it back" : "Peel away"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setValue(clamp(defaultPeel, 0, 1));
            x.set(0);
            y.set(0);
          }}
        >
          Reset sticker
        </Button>
      </Actions>
    </Shell>
  );
}

export interface ElasticMeshProps extends LabProps {
  text?: string;
}
export function ElasticMesh({
  text = "SOFT",
  label = "Elastic mesh",
  className,
  style,
}: ElasticMeshProps) {
  const [word, setWord] = useState(text),
    [paused, setPaused] = useState(false),
    [touch, setTouch] = useState(false),
    [force, setForce] = useState(1),
    [status, setStatus] = useState("Press, pull, and let the letters recover.");
  const nodes = useRef<
      { x: number; y: number; hx: number; hy: number; vx: number; vy: number }[]
    >([]),
    key = useRef(""),
    pointer = useRef<{
      id: number;
      x: number;
      y: number;
      startX: number;
      startY: number;
    } | null>(null),
    pulse = useRef(0),
    live = useRef({ word, force, reduced: false });
  live.current.word = word;
  live.current.force = force;
  const animation = useExperimentCanvas((delta, canvas) => {
    const s = prepareSurface(canvas);
    if (!s) return;
    const { context: c, width, height, ink } = s,
      k = `${width}:${height}:${live.current.word}`,
      gap = 7;
    if (key.current !== k) {
      key.current = k;
      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const m = mask.getContext("2d", { willReadFrequently: true })!;
      let size = Math.min(height * 0.5, width * 0.25);
      m.font = `800 ${size}px system-ui`;
      const measure = m.measureText(live.current.word || " ").width;
      if (measure > width * 0.83) size *= (width * 0.83) / measure;
      m.font = `800 ${size}px system-ui`;
      m.textAlign = "center";
      m.textBaseline = "middle";
      m.fillText(live.current.word || " ", width / 2, height / 2);
      const a = m.getImageData(0, 0, width, height).data,
        list: typeof nodes.current = [];
      for (let y = gap; y < height - gap; y += gap)
        for (let x = gap; x < width - gap; x += gap)
          if (a[(y * width + x) * 4 + 3] > 100)
            list.push({ x, y, hx: x, hy: y, vx: 0, vy: 0 });
      nodes.current = list.slice(0, 2600);
    }
    c.fillStyle = ink;
    const field = pointer.current,
      step = delta * 60;
    for (const n of nodes.current) {
      const dx = n.hx - (field?.startX ?? width / 2),
        dy = n.hy - (field?.startY ?? height / 2),
        w = Math.max(0, 1 - Math.hypot(dx, dy) / 150),
        targetX =
          n.hx +
          (field
            ? (field.x - field.startX) * w * live.current.force
            : dx * w * pulse.current * 0.25),
        targetY =
          n.hy +
          (field
            ? (field.y - field.startY) * w * live.current.force
            : dy * w * pulse.current * 0.25);
      if (live.current.reduced || paused) {
        n.x = targetX;
        n.y = targetY;
      } else {
        n.vx = (n.vx + (targetX - n.x) * 0.08 * step) * Math.pow(0.8, step);
        n.vy = (n.vy + (targetY - n.y) * 0.08 * step) * Math.pow(0.8, step);
        n.x += n.vx * step;
        n.y += n.vy * step;
      }
      const bulge = 1 + w * (field ? 0.35 : pulse.current * 0.25);
      c.globalAlpha = 0.65 + 0.35 * w;
      c.fillRect(
        n.x - (gap * bulge) / 2,
        n.y - (gap * bulge) / 2,
        gap * bulge - 1,
        gap * bulge - 1,
      );
    }
    c.globalAlpha = 1;
    if (delta) pulse.current *= Math.pow(0.95, step);
  }, paused);
  live.current.reduced = !!animation.reduced;
  useEffect(() => animation.invalidate(), [word, force, animation.invalidate]);
  const end = () => {
    pointer.current = null;
    animation.invalidate();
  };
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status={
        animation.reduced
          ? "Motion reduced. Manual stretches stay still."
          : status
      }
    >
      <div
        className="mingu-lab-surface"
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
          const r = canvas.getBoundingClientRect();
          pointer.current = {
            id: event.pointerId,
            x: event.clientX - r.left,
            y: event.clientY - r.top,
            startX: event.clientX - r.left,
            startY: event.clientY - r.top,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          animation.invalidate();
        }}
        onPointerMove={(event) => {
          const p = pointer.current,
            c = animation.canvas.current;
          if (p?.id !== event.pointerId || !c) return;
          const r = c.getBoundingClientRect();
          p.x = event.clientX - r.left;
          p.y = event.clientY - r.top;
          animation.invalidate();
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
      </div>
      <Settings>
        <TextField
          label="Mesh text"
          maxLength={14}
          value={word}
          onChange={(e) => setWord(e.currentTarget.value)}
        />
        <Slider
          label="Stretch force"
          value={force}
          min={0.3}
          max={2}
          step={0.1}
          onValueChange={setForce}
        />
      </Settings>
      <Actions>
        <Button
          variant="secondary"
          onClick={() => {
            pulse.current = 2;
            setStatus("The center stretches outward.");
            animation.invalidate();
          }}
        >
          Stretch center
        </Button>
        <Controls
          paused={paused}
          setPaused={setPaused}
          reduced={!!animation.reduced}
          touch={touch}
          setTouch={setTouch}
          reset={() => {
            key.current = "";
            pointer.current = null;
            pulse.current = 0;
            animation.invalidate();
          }}
        />
      </Actions>
    </Shell>
  );
}

export interface ImageParticleMorphProps extends LabProps {
  src?: string;
  alt?: string;
}
export function ImageParticleMorph({
  src,
  alt = "Image transformed into a particle globe",
  label = "Image particle morph",
  className,
  style,
}: ImageParticleMorphProps) {
  const { raster, error } = useRaster(src),
    [amount, setAmount] = useState(0),
    [yaw, setYaw] = useState(0),
    [paused, setPaused] = useState(false),
    [touch, setTouch] = useState(false),
    progress = useRef(0),
    gesture = useRef<{ id: number; x: number; start: number } | null>(null),
    live = useRef({ raster, amount, yaw, reduced: false });
  live.current = { raster, amount, yaw, reduced: live.current.reduced };
  const animation = useExperimentCanvas((delta, canvas) => {
    const s = prepareSurface(canvas),
      r = live.current.raster;
    if (!s || !r) return;
    const { context: c, width, height } = s;
    progress.current =
      live.current.reduced || paused
        ? live.current.amount
        : progress.current +
          (live.current.amount - progress.current) * Math.min(1, delta * 7);
    const t = progress.current,
      fit = imageFit(width * 0.8, height * 0.72, r.width, r.height),
      radius = Math.min(width, height) * 0.34,
      particles: { x: number; y: number; z: number; color: string }[] = [],
      cols = 44,
      rows = clamp(Math.round((cols * r.height) / r.width), 8, 40),
      total = cols * rows;
    for (let i = 0; i < total; i++) {
      const u = ((i % cols) + 0.5) / cols,
        v = (Math.floor(i / cols) + 0.5) / rows,
        sx = Math.min(r.width - 1, Math.floor(u * r.width)),
        sy = Math.min(r.height - 1, Math.floor(v * r.height)),
        idx = (sy * r.width + sx) * 4,
        gy = 1 - (2 * i) / (total - 1),
        ring = Math.sqrt(Math.max(0, 1 - gy * gy)),
        angle = i * 2.399963 + live.current.yaw,
        gx = Math.cos(angle) * ring,
        gz = Math.sin(angle) * ring,
        z = gz * radius * t,
        p = 700 / (700 - z),
        x = ((u - 0.5) * fit.width * (1 - t) + gx * radius * t) * p + width / 2,
        y =
          ((v - 0.5) * fit.height * (1 - t) + gy * radius * t) * p + height / 2;
      particles.push({
        x,
        y,
        z,
        color: `rgb(${r.pixels[idx]} ${r.pixels[idx + 1]} ${r.pixels[idx + 2]})`,
      });
    }
    particles.sort((a, b) => a.z - b.z);
    for (const p of particles) {
      c.fillStyle = p.color;
      const size =
        Math.max(2, Math.min(fit.width / cols, fit.height / rows)) *
        (700 / (700 - p.z));
      c.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }
  }, paused);
  live.current.reduced = !!animation.reduced;
  useEffect(
    () => animation.invalidate(),
    [raster, amount, yaw, animation.invalidate],
  );
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status={
        error || "Morph the image into a three-dimensional particle globe."
      }
    >
      <div
        className="mingu-lab-surface"
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerDown={(event) => {
          if (event.button !== 0 || (event.pointerType === "touch" && !touch))
            return;
          gesture.current = {
            id: event.pointerId,
            x: event.clientX,
            start: yaw,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const g = gesture.current;
          if (g?.id === event.pointerId)
            setYaw(
              clamp(g.start + (event.clientX - g.x) * 0.012, -Math.PI, Math.PI),
            );
        }}
        onPointerUp={() => {
          gesture.current = null;
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
        <span className="mingu-visually-hidden">{alt}</span>
      </div>
      <Settings>
        <Slider
          label="Globe amount"
          value={amount}
          min={0}
          max={1}
          step={0.01}
          onValueChange={setAmount}
        />
        <Slider
          label="Globe rotation"
          value={yaw}
          min={-Math.PI}
          max={Math.PI}
          step={0.05}
          onValueChange={setYaw}
        />
      </Settings>
      <Actions>
        <Button
          variant="secondary"
          onClick={() => setAmount(amount > 0.5 ? 0 : 1)}
        >
          {amount > 0.5 ? "Form image" : "Form globe"}
        </Button>
        <Controls
          paused={paused}
          setPaused={setPaused}
          reduced={!!animation.reduced}
          touch={touch}
          setTouch={setTouch}
          reset={() => {
            setAmount(0);
            setYaw(0);
            progress.current = 0;
            animation.invalidate();
          }}
        />
      </Actions>
    </Shell>
  );
}

export interface DitherRevealProps extends LabProps {
  src?: string;
  alt?: string;
}
export function DitherReveal({
  src,
  alt = "Dithered image",
  label = "Dither reveal",
  className,
  style,
}: DitherRevealProps) {
  const { raster, error } = useRaster(src),
    [radius, setRadius] = useState(70),
    [recover, setRecover] = useState(true),
    [paused, setPaused] = useState(false),
    [touch, setTouch] = useState(false),
    brush = useRef<{ x: number; y: number } | null>(null),
    cells = useRef(new Map<number, number>()),
    live = useRef({ raster, radius, recover, reduced: false });
  live.current = { raster, radius, recover, reduced: live.current.reduced };
  const animation = useExperimentCanvas((delta, canvas) => {
    const s = prepareSurface(canvas),
      r = live.current.raster;
    if (!s || !r) return;
    const { context: c, width, height, ink } = s,
      fit = imageFit(width * 0.92, height * 0.9, r.width, r.height),
      cols = 64,
      rows = clamp(Math.round((cols * r.height) / r.width), 12, 52),
      cw = fit.width / cols,
      ch = fit.height / rows,
      background =
        getComputedStyle(canvas).getPropertyValue("--mingu-bg").trim() ||
        "#fafafa";
    c.drawImage(r.image, fit.x, fit.y, fit.width, fit.height);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const id = y * cols + x,
          px = fit.x + (x + 0.5) * cw,
          py = fit.y + (y + 0.5) * ch,
          idx =
            (Math.min(r.height - 1, Math.floor(((y + 0.5) / rows) * r.height)) *
              r.width +
              Math.min(r.width - 1, Math.floor(((x + 0.5) / cols) * r.width))) *
            4,
          gray =
            (r.pixels[idx] * 0.2126 +
              r.pixels[idx + 1] * 0.7152 +
              r.pixels[idx + 2] * 0.0722) /
            255;
        let amount = cells.current.get(id) || 0;
        if (
          brush.current &&
          Math.hypot(
            brush.current.x * width - px,
            brush.current.y * height - py,
          ) < live.current.radius
        )
          amount = 1;
        else if (delta && live.current.recover)
          amount = Math.max(0, amount - delta * 0.42);
        if (amount) cells.current.set(id, amount);
        else cells.current.delete(id);
        c.globalAlpha = 1 - amount;
        c.fillStyle = background;
        c.fillRect(fit.x + x * cw, fit.y + y * ch, cw + 0.5, ch + 0.5);
        c.fillStyle = ink;
        const dot = Math.sqrt(1 - gray) * Math.min(cw, ch) * 0.49;
        c.beginPath();
        c.arc(px, py, dot, 0, Math.PI * 2);
        c.fill();
      }
    c.globalAlpha = 1;
  }, paused);
  live.current.reduced = !!animation.reduced;
  useEffect(() => {
    cells.current.clear();
    animation.invalidate();
  }, [raster, animation.invalidate]);
  useEffect(
    () => animation.invalidate(),
    [radius, recover, animation.invalidate],
  );
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status={error || "Brush away the printed dots to uncover the image."}
    >
      <div
        className="mingu-lab-surface"
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerMove={(event) => {
          if (event.pointerType === "touch" && !touch) return;
          const canvas = animation.canvas.current;
          if (canvas) {
            brush.current = point(event, canvas);
            animation.invalidate();
          }
        }}
        onPointerLeave={() => {
          brush.current = null;
        }}
        onPointerUp={() => {
          brush.current = null;
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
        <span className="mingu-visually-hidden">{alt}</span>
      </div>
      <Settings>
        <Slider
          label="Reveal radius"
          min={25}
          max={150}
          step={5}
          value={radius}
          onValueChange={setRadius}
        />
      </Settings>
      <Actions>
        <Button
          variant="secondary"
          onClick={() => {
            for (let i = 0; i < 64 * 52; i++) cells.current.set(i, 1);
            animation.invalidate();
          }}
        >
          Reveal image
        </Button>
        <Button
          variant="ghost"
          aria-pressed={recover}
          onClick={() => setRecover(!recover)}
        >
          Recover dots
        </Button>
        <Controls
          paused={paused}
          setPaused={setPaused}
          reduced={!!animation.reduced}
          touch={touch}
          setTouch={setTouch}
          reset={() => {
            cells.current.clear();
            brush.current = null;
            animation.invalidate();
          }}
        />
      </Actions>
    </Shell>
  );
}

export interface FluidGlassLensProps extends LabProps {
  src?: string;
  alt?: string;
}
export function FluidGlassLens({
  src,
  alt = "Image under a refractive glass lens",
  label = "Fluid glass lens",
  className,
  style,
}: FluidGlassLensProps) {
  const { raster, error } = useRaster(src),
    [position, setPosition] = useState({ x: 0.5, y: 0.5 }),
    [radius, setRadius] = useState(90),
    [strength, setStrength] = useState(0.65),
    [touch, setTouch] = useState(false),
    live = useRef({ raster, position, radius, strength });
  live.current = { raster, position, radius, strength };
  const animation = useExperimentCanvas((_, canvas) => {
    const s = prepareSurface(canvas),
      r = live.current.raster;
    if (!s || !r) return;
    const { context: c, width, height } = s,
      { position: p, radius: rr, strength: k } = live.current,
      fit = imageFit(width * 0.94, height * 0.9, r.width, r.height),
      cx = p.x * width,
      cy = p.y * height;
    c.drawImage(r.image, fit.x, fit.y, fit.width, fit.height);
    c.save();
    c.beginPath();
    c.arc(cx, cy, rr, 0, Math.PI * 2);
    c.clip();
    const cell = 4;
    for (let y = -rr; y < rr; y += cell)
      for (let x = -rr; x < rr; x += cell) {
        const distance = Math.hypot(x, y) / rr;
        if (distance > 1) continue;
        const bend =
            1 - k * Math.sqrt(Math.max(0, 1 - distance * distance)) * 0.65,
          sx = clamp((cx + x * bend - fit.x) / fit.width, 0, 1) * r.width,
          sy = clamp((cy + y * bend - fit.y) / fit.height, 0, 1) * r.height;
        c.drawImage(
          r.image,
          sx,
          sy,
          Math.max(1, (r.width / fit.width) * cell),
          Math.max(1, (r.height / fit.height) * cell),
          cx + x,
          cy + y,
          cell + 0.5,
          cell + 0.5,
        );
      }
    const gloss = c.createLinearGradient(cx - rr, cy - rr, cx + rr, cy + rr);
    gloss.addColorStop(0, "rgba(255,255,255,.4)");
    gloss.addColorStop(0.25, "rgba(255,255,255,0)");
    gloss.addColorStop(0.8, "rgba(255,255,255,0)");
    gloss.addColorStop(1, "rgba(255,255,255,.2)");
    c.fillStyle = gloss;
    c.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    c.restore();
    c.beginPath();
    c.arc(cx, cy, rr, 0, Math.PI * 2);
    c.lineWidth = 1.5;
    c.strokeStyle = "rgba(255,255,255,.7)";
    c.stroke();
  }, true);
  useEffect(
    () => animation.invalidate(),
    [raster, position, radius, strength, animation.invalidate],
  );
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status={
        error ||
        "Move the lens across the image. Its curved edge bends the sampled image."
      }
    >
      <div
        className="mingu-lab-surface"
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerMove={(event) => {
          if (event.pointerType === "touch" && !touch) return;
          const canvas = animation.canvas.current;
          if (canvas) setPosition(point(event, canvas));
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
        <span className="mingu-visually-hidden">{alt}</span>
      </div>
      <Settings>
        <Slider
          label="Lens radius"
          min={30}
          max={140}
          step={5}
          value={radius}
          onValueChange={setRadius}
        />
        <Slider
          label="Refraction"
          min={0}
          max={1}
          step={0.05}
          value={strength}
          onValueChange={setStrength}
        />
        <Slider
          label="Lens horizontal position"
          min={0}
          max={1}
          step={0.01}
          value={position.x}
          onValueChange={(x) => setPosition((p) => ({ ...p, x }))}
        />
        <Slider
          label="Lens vertical position"
          min={0}
          max={1}
          step={0.01}
          value={position.y}
          onValueChange={(y) => setPosition((p) => ({ ...p, y }))}
        />
      </Settings>
      <Actions>
        <Button
          variant="ghost"
          aria-pressed={touch}
          onClick={() => setTouch(!touch)}
        >
          Touch interaction
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPosition({ x: 0.5, y: 0.5 });
            setRadius(90);
            setStrength(0.65);
          }}
        >
          Reset lens
        </Button>
      </Actions>
    </Shell>
  );
}

export interface LanyardProps extends LabProps {
  name?: string;
  subtitle?: string;
}
export function Lanyard({
  name = "Mingu",
  subtitle = "DESIGN ENGINEER",
  label = "Lanyard",
  className,
  style,
}: LanyardProps) {
  const [title, setTitle] = useState(name),
    [paused, setPaused] = useState(false),
    [touch, setTouch] = useState(false),
    [flipped, setFlipped] = useState(false),
    state = useRef({ x: 0, y: 180, vx: 0, vy: 0 }),
    pointer = useRef<{ id: number; x: number; y: number } | null>(null),
    stage = useRef<HTMLDivElement>(null),
    button = useRef<HTMLButtonElement>(null),
    live = useRef({ title, subtitle, flipped, reduced: false });
  live.current = { title, subtitle, flipped, reduced: live.current.reduced };
  const animation = useExperimentCanvas((delta, canvas) => {
    const s = prepareSurface(canvas);
    if (!s) return;
    const { context: c, width, height, ink, muted } = s,
      anchor = { x: width / 2, y: 0 },
      q = state.current,
      length = Math.min(175, height * 0.42),
      p = pointer.current,
      dt = delta * 60;
    if (p) {
      q.x = clamp(p.x - width / 2, -width / 2 + 65, width / 2 - 65);
      q.y = clamp(p.y, 80, height - 70);
      q.vx = q.vy = 0;
    } else if (delta) {
      const distance = Math.max(1, Math.hypot(q.x, q.y)),
        stretch = (distance - length) * 0.035;
      q.vx = (q.vx - (q.x / distance) * stretch * dt) * Math.pow(0.985, dt);
      q.vy =
        (q.vy + (0.18 - (q.y / distance) * stretch) * dt) * Math.pow(0.985, dt);
      q.x += q.vx * dt;
      q.y += q.vy * dt;
    }
    q.x = clamp(q.x, -width / 2 + 65, width / 2 - 65);
    q.y = clamp(q.y, 75, height - 70);
    const x = anchor.x + q.x,
      y = q.y,
      angle = Math.atan2(q.y, q.x) - Math.PI / 2;
    c.strokeStyle = muted;
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(anchor.x, -10);
    c.quadraticCurveTo(
      anchor.x + q.x * 0.25,
      Math.max(40, y * 0.52),
      x,
      y - 62,
    );
    c.stroke();
    c.save();
    c.translate(x, y);
    c.rotate(angle * 0.45);
    c.shadowColor = "rgba(0,0,0,.13)";
    c.shadowBlur = 16;
    c.shadowOffsetY = 8;
    c.fillStyle = ink;
    c.beginPath();
    c.roundRect(-62, -56, 124, 142, 12);
    c.fill();
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
    c.fillStyle =
      getComputedStyle(canvas).getPropertyValue("--mingu-bg").trim() || "white";
    c.textAlign = "center";
    if (live.current.flipped) {
      c.font = "600 11px system-ui";
      c.fillText("MADE TO INTERACT", 0, 4);
      c.font = "10px system-ui";
      c.fillText("MINGU / STUDIO", 0, 25);
    } else {
      c.font = "700 30px system-ui";
      c.fillText("✳", 0, -15);
      c.font = "600 17px system-ui";
      c.fillText(live.current.title.slice(0, 14), 0, 18);
      c.font = "8px system-ui";
      c.fillText(live.current.subtitle.slice(0, 22), 0, 40);
    }
    c.restore();
    if (button.current) {
      button.current.style.left = `${x}px`;
      button.current.style.top = `${y + 15}px`;
      button.current.style.transform = `translate(-50%,-50%) rotate(${angle * 0.45}rad)`;
    }
  }, paused);
  live.current.reduced = !!animation.reduced;
  useEffect(
    () => animation.invalidate(),
    [title, subtitle, flipped, animation.invalidate],
  );
  const end = () => {
    pointer.current = null;
    animation.invalidate();
  };
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status="Drag the badge, or use its arrow keys. Flip it to see the back."
    >
      <div ref={stage} className="mingu-lab-surface">
        <canvas ref={animation.canvas} aria-hidden="true" />
        <button
          ref={button}
          type="button"
          className="mingu-lanyard-hit"
          aria-label="Move lanyard badge"
          style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
          onPointerDown={(event) => {
            if (event.button !== 0 || (event.pointerType === "touch" && !touch))
              return;
            const r = stage.current!.getBoundingClientRect();
            pointer.current = {
              id: event.pointerId,
              x: event.clientX - r.left,
              y: event.clientY - r.top,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (pointer.current?.id !== event.pointerId) return;
            const r = stage.current!.getBoundingClientRect();
            pointer.current.x = event.clientX - r.left;
            pointer.current.y = event.clientY - r.top;
            animation.invalidate();
          }}
          onPointerUp={end}
          onPointerCancel={end}
          onLostPointerCapture={end}
          onKeyDown={(event) => {
            if (!event.key.startsWith("Arrow")) return;
            event.preventDefault();
            state.current.x +=
              event.key === "ArrowLeft"
                ? -20
                : event.key === "ArrowRight"
                  ? 20
                  : 0;
            state.current.y +=
              event.key === "ArrowUp"
                ? -20
                : event.key === "ArrowDown"
                  ? 20
                  : 0;
            animation.invalidate();
          }}
        />
      </div>
      <Settings>
        <TextField
          label="Badge name"
          maxLength={14}
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
        />
      </Settings>
      <Actions>
        <Button
          variant="secondary"
          onClick={() => {
            state.current.vx = 7;
            state.current.vy = -2;
            if (animation.reduced || paused) {
              state.current.x = 70;
              state.current.y = 160;
            }
            animation.invalidate();
          }}
        >
          Swing badge
        </Button>
        <Button
          variant="ghost"
          aria-pressed={flipped}
          onClick={() => setFlipped(!flipped)}
        >
          Flip badge
        </Button>
        <Controls
          paused={paused}
          setPaused={setPaused}
          reduced={!!animation.reduced}
          touch={touch}
          setTouch={setTouch}
          reset={() => {
            state.current = { x: 0, y: 180, vx: 0, vy: 0 };
            pointer.current = null;
            setFlipped(false);
            animation.invalidate();
          }}
        />
      </Actions>
    </Shell>
  );
}

type XY = { x: number; y: number };
function textureTriangle(
  c: CanvasRenderingContext2D,
  image: CanvasImageSource,
  source: [XY, XY, XY],
  target: [XY, XY, XY],
) {
  const [a, b, d] = source,
    [A, B, D] = target,
    den = a.x * (b.y - d.y) + b.x * (d.y - a.y) + d.x * (a.y - b.y);
  if (Math.abs(den) < 0.0001) return;
  const solve = (u: number, v: number, w: number) => [
    (u * (b.y - d.y) + v * (d.y - a.y) + w * (a.y - b.y)) / den,
    (u * (d.x - b.x) + v * (a.x - d.x) + w * (b.x - a.x)) / den,
    (u * (b.x * d.y - d.x * b.y) +
      v * (d.x * a.y - a.x * d.y) +
      w * (a.x * b.y - b.x * a.y)) /
      den,
  ];
  const [aa, cc, ee] = solve(A.x, B.x, D.x),
    [bb, dd, ff] = solve(A.y, B.y, D.y);
  c.save();
  c.beginPath();
  c.moveTo(A.x, A.y);
  c.lineTo(B.x, B.y);
  c.lineTo(D.x, D.y);
  c.closePath();
  c.clip();
  c.transform(aa, bb, cc, dd, ee, ff);
  c.drawImage(image, 0, 0);
  c.restore();
}
function textureQuad(
  c: CanvasRenderingContext2D,
  image: CanvasImageSource,
  iw: number,
  ih: number,
  p: [XY, XY, XY, XY],
  u0 = 0,
  u1 = 1,
) {
  textureTriangle(
    c,
    image,
    [
      { x: u0 * iw, y: 0 },
      { x: u1 * iw, y: 0 },
      { x: u1 * iw, y: ih },
    ],
    [p[0], p[1], p[2]],
  );
  textureTriangle(
    c,
    image,
    [
      { x: u0 * iw, y: 0 },
      { x: u1 * iw, y: ih },
      { x: u0 * iw, y: ih },
    ],
    [p[0], p[2], p[3]],
  );
}
export interface DomeGalleryItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
}
export interface DomeGalleryProps extends LabProps {
  items: readonly DomeGalleryItem[];
  onSelect?: (item: DomeGalleryItem) => void;
}
export function DomeGallery({
  items,
  onSelect,
  label = "Dome gallery",
  className,
  style,
}: DomeGalleryProps) {
  const [yaw, setYaw] = useState(0),
    [selected, setSelected] = useState(0),
    [open, setOpen] = useState(false),
    [touch, setTouch] = useState(false),
    [loaded, setLoaded] = useState<Map<string, HTMLImageElement>>(new Map()),
    [failures, setFailures] = useState(0),
    gesture = useRef<{ id: number; x: number; start: number } | null>(null),
    live = useRef({ items, loaded, yaw, selected });
  live.current = { items, loaded, yaw, selected };
  useEffect(() => {
    let alive = true;
    const next = new Map<string, HTMLImageElement>(),
      images: HTMLImageElement[] = [];
    setLoaded(next);
    setFailures(0);
    for (const item of items.slice(0, 24)) {
      const image = new Image();
      images.push(image);
      image.onload = () => {
        if (alive) {
          next.set(item.id, image);
          setLoaded(new Map(next));
        }
      };
      image.onerror = () => {
        if (alive) setFailures((n) => n + 1);
      };
      image.src = item.src;
    }
    return () => {
      alive = false;
      for (const image of images) image.onload = image.onerror = null;
    };
  }, [items]);
  const animation = useExperimentCanvas((_, canvas) => {
    const s = prepareSurface(canvas);
    if (!s) return;
    const { context: c, width, height, muted, ink } = s,
      { items, loaded, yaw, selected } = live.current,
      count = Math.min(items.length, 24),
      radius = Math.min(width * 0.35, height * 0.65),
      cards = [];
    for (let i = 0; i < count; i++) {
      const angle =
          (i - Math.floor(count / 2)) *
            Math.min(0.7, (Math.PI * 1.6) / Math.max(1, count)) +
          yaw,
        z = Math.cos(angle) * radius,
        x = Math.sin(angle) * radius,
        y = Math.sin(i * 1.7) * 28,
        scale = 650 / (650 - z),
        w = Math.min(125, width * 0.25) * scale,
        h = w * 1.32,
        cx = width / 2 + x * scale,
        cy = height / 2 + y * scale;
      cards.push({ i, z, cx, cy, w, h, angle });
    }
    cards.sort((a, b) => a.z - b.z);
    for (const q of cards) {
      const item = items[q.i],
        image = loaded.get(item.id);
      c.save();
      c.globalAlpha = clamp((q.z / radius + 1) * 0.35 + 0.3, 0.16, 1);
      const tilt = Math.sin(q.angle) * q.w * 0.12,
        p: [XY, XY, XY, XY] = [
          { x: q.cx - q.w / 2, y: q.cy - q.h / 2 - tilt },
          { x: q.cx + q.w / 2, y: q.cy - q.h / 2 + tilt },
          { x: q.cx + q.w / 2, y: q.cy + q.h / 2 + tilt },
          { x: q.cx - q.w / 2, y: q.cy + q.h / 2 - tilt },
        ];
      if (image)
        textureQuad(c, image, image.naturalWidth, image.naturalHeight, p);
      else {
        c.fillStyle = muted;
        c.fillRect(q.cx - q.w / 2, q.cy - q.h / 2, q.w, q.h);
      }
      if (q.i === selected) {
        c.strokeStyle = ink;
        c.lineWidth = 2;
        c.beginPath();
        p.forEach((v, i) => (i ? c.lineTo(v.x, v.y) : c.moveTo(v.x, v.y)));
        c.closePath();
        c.stroke();
      }
      c.restore();
    }
  }, true);
  useEffect(
    () => animation.invalidate(),
    [loaded, yaw, selected, items, animation.invalidate],
  );
  useEffect(() => {
    if (selected >= Math.min(items.length, 24)) setSelected(0);
  }, [items.length, selected]);
  const current = items[selected] || items[0];
  const choose = (index: number) => {
    const next = clamp(index, 0, Math.max(0, Math.min(items.length, 24) - 1));
    setSelected(next);
    const count = Math.min(items.length, 24);
    setYaw(
      -(next - Math.floor(count / 2)) *
        Math.min(0.7, (Math.PI * 1.6) / Math.max(1, count)),
    );
  };
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status={
        !items.length
          ? "Add images to start a gallery."
          : failures
            ? `${failures} image(s) could not be loaded.`
            : "Drag to turn the curved gallery. Select a work to inspect it."
      }
    >
      <div
        className="mingu-lab-surface"
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerDown={(event) => {
          if (event.button !== 0 || (event.pointerType === "touch" && !touch))
            return;
          gesture.current = {
            id: event.pointerId,
            x: event.clientX,
            start: yaw,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const g = gesture.current;
          if (g?.id === event.pointerId)
            setYaw(
              Math.atan2(
                Math.sin(g.start + (event.clientX - g.x) * 0.008),
                Math.cos(g.start + (event.clientX - g.x) * 0.008),
              ),
            );
        }}
        onPointerUp={() => {
          gesture.current = null;
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
      </div>
      <div className="mingu-dome-items" role="group" aria-label="Gallery works">
        {items.slice(0, 24).map((item, i) => (
          <Button
            key={item.id}
            variant={selected === i ? "secondary" : "ghost"}
            aria-pressed={selected === i}
            onClick={() => choose(i)}
          >
            {item.title || item.alt}
          </Button>
        ))}
      </div>
      <Settings>
        <Slider
          label="Gallery rotation"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={yaw}
          onValueChange={setYaw}
        />
      </Settings>
      <Actions>
        <Button
          variant="secondary"
          disabled={!current}
          onClick={() => {
            if (current) {
              setOpen(true);
              onSelect?.(current);
            }
          }}
        >
          Open selected work
        </Button>
        <Button
          variant="ghost"
          aria-pressed={touch}
          onClick={() => setTouch(!touch)}
        >
          Touch interaction
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setYaw(0);
            setSelected(0);
          }}
        >
          Reset gallery
        </Button>
      </Actions>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={current?.title || current?.alt || "Selected work"}
      >
        {current && (
          <img
            className="mingu-dome-detail"
            src={current.src}
            alt={current.alt}
          />
        )}
      </Dialog>
    </Shell>
  );
}

export interface FoldablePaperProps extends LabProps {
  text?: string;
  fold?: number;
  defaultFold?: number;
  onFoldChange?: (amount: number) => void;
}
export function FoldablePaper({
  text = "A SMALL NOTE\n\nMake room for a new idea.\nFold, open, begin again.",
  fold,
  defaultFold = 0,
  onFoldChange,
  label = "Foldable paper",
  className,
  style,
}: FoldablePaperProps) {
  const [content, setContent] = useState(text),
    [amount, setAmount] = useControllable(fold, defaultFold, onFoldChange),
    [crease, setCrease] = useState(0.52),
    [touch, setTouch] = useState(false),
    sheet = useRef<HTMLCanvasElement | null>(null),
    gesture = useRef<{ id: number; x: number; start: number } | null>(null),
    live = useRef({ content, amount, crease });
  live.current = { content, amount, crease };
  const animation = useExperimentCanvas((_, canvas) => {
    const s = prepareSurface(canvas);
    if (!s) return;
    const { context: c, width, height } = s,
      { content, amount, crease } = live.current;
    let image = sheet.current;
    if (!image) {
      image = document.createElement("canvas");
      image.width = 600;
      image.height = 760;
      sheet.current = image;
    }
    const ctx = image.getContext("2d")!;
    ctx.fillStyle = "#f5f0e5";
    ctx.fillRect(0, 0, 600, 760);
    ctx.fillStyle = "#353630";
    ctx.font = "600 26px system-ui";
    let line = 85;
    for (const paragraph of content.split("\n")) {
      const words = paragraph.split(" ");
      let run = "";
      for (const word of words) {
        const test = run ? `${run} ${word}` : word;
        if (ctx.measureText(test).width > 490 && run) {
          ctx.fillText(run, 55, line);
          line += 40;
          run = word;
        } else run = test;
      }
      ctx.fillText(run, 55, line);
      line += 40;
      if (line > 700) break;
    }
    ctx.strokeStyle = "#d5cebd";
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(crease * 600, 0);
    ctx.lineTo(crease * 600, 760);
    ctx.stroke();
    const scale = Math.min((width * 0.68) / 600, (height * 0.86) / 760),
      w = 600 * scale,
      h = 760 * scale,
      angle = clamp(amount, 0, 1) * Math.PI * 0.96,
      hinge = (crease - 0.5) * w,
      project = (x: number, y: number) => {
        const right = x > hinge,
          local = x - hinge,
          xx = right ? hinge + Math.cos(angle) * local : x,
          z = right ? Math.sin(angle) * local : 0,
          p = 650 / (650 - z);
        return { x: width / 2 + xx * p, y: height / 2 + y * p };
      };
    const strips = 40;
    for (let i = 0; i < strips; i++) {
      const u0 = i / strips,
        u1 = (i + 1) / strips,
        x0 = (u0 - 0.5) * w,
        x1 = (u1 - 0.5) * w,
        p: [XY, XY, XY, XY] = [
          project(x0, -h / 2),
          project(x1, -h / 2),
          project(x1, h / 2),
          project(x0, h / 2),
        ];
      if ((u0 + u1) / 2 > crease && angle > Math.PI / 2) {
        c.fillStyle = "#e1dac9";
        c.beginPath();
        p.forEach((v, k) => (k ? c.lineTo(v.x, v.y) : c.moveTo(v.x, v.y)));
        c.closePath();
        c.fill();
      } else textureQuad(c, image, 600, 760, p, u0, u1);
    }
  }, true);
  useEffect(
    () => animation.invalidate(),
    [content, amount, crease, animation.invalidate],
  );
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status="A paper surface folded along an adjustable crease. Drag horizontally or use the controls."
    >
      <div
        className="mingu-lab-surface"
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerDown={(event) => {
          if (event.button !== 0 || (event.pointerType === "touch" && !touch))
            return;
          gesture.current = {
            id: event.pointerId,
            x: event.clientX,
            start: amount,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const g = gesture.current;
          if (g?.id === event.pointerId)
            setAmount(clamp(g.start + (g.x - event.clientX) / 220, 0, 1));
        }}
        onPointerUp={() => {
          gesture.current = null;
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
      </div>
      <Settings>
        <TextareaField
          label="Paper text"
          value={content}
          maxLength={600}
          rows={3}
          onChange={(event) => setContent(event.currentTarget.value)}
        />
        <Slider
          label="Paper fold"
          min={0}
          max={1}
          step={0.01}
          value={clamp(amount, 0, 1)}
          onValueChange={setAmount}
        />
        <Slider
          label="Crease position"
          min={0.25}
          max={0.75}
          step={0.01}
          value={crease}
          onValueChange={setCrease}
        />
      </Settings>
      <Actions>
        <Button
          variant="secondary"
          onClick={() => setAmount(amount > 0.5 ? 0 : 1)}
        >
          {amount > 0.5 ? "Unfold paper" : "Fold paper"}
        </Button>
        <Button
          variant="ghost"
          aria-pressed={touch}
          onClick={() => setTouch(!touch)}
        >
          Touch interaction
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setAmount(defaultFold);
            setCrease(0.52);
            setContent(text);
          }}
        >
          Reset paper
        </Button>
      </Actions>
    </Shell>
  );
}

export interface WebcamPixelGridProps extends LabProps {
  onCameraStateChange?: (
    state: "idle" | "requesting" | "live" | "error",
  ) => void;
}
export function WebcamPixelGrid({
  label = "Webcam pixel grid",
  className,
  style,
  onCameraStateChange,
}: WebcamPixelGridProps) {
  const [status, setStatus] = useState<
      "idle" | "requesting" | "live" | "error"
    >("idle"),
    [message, setMessage] = useState(
      "Camera is off. Try the sample without camera access.",
    ),
    [sample, setSample] = useState(false),
    [mirrored, setMirrored] = useState(true),
    [cells, setCells] = useState(40),
    [paused, setPaused] = useState(false),
    video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    request = useRef(0),
    callback = useRef(onCameraStateChange),
    statusRef = useRef(status),
    sampleCanvas = useRef<HTMLCanvasElement | null>(null),
    sampleBuffer = useRef<HTMLCanvasElement | null>(null),
    active = useRef(false);
  callback.current = onCameraStateChange;
  statusRef.current = status;
  const update = (state: typeof status) => {
    setStatus(state);
    statusRef.current = state;
    callback.current?.(state);
  };
  const stop = (reason = "Camera stopped.") => {
    request.current++;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) {
      video.current.pause();
      video.current.srcObject = null;
    }
    update("idle");
    setMessage(reason);
  };
  const live = useRef({ status, sample, mirrored, cells });
  live.current = { status, sample, mirrored, cells };
  const animation = useExperimentCanvas(
    (_, canvas) => {
      const s = prepareSurface(canvas);
      if (!s) return;
      const { context: c, width, height, ink } = s,
        q = live.current;
      let source: CanvasImageSource | null = null,
        sw = 640,
        sh = 400;
      if (
        q.status === "live" &&
        video.current &&
        video.current.readyState >= 2
      ) {
        source = video.current;
        sw = video.current.videoWidth;
        sh = video.current.videoHeight;
      } else if (q.sample) {
        sampleCanvas.current ??= fallbackImage();
        source = sampleCanvas.current;
      }
      if (!source) {
        c.fillStyle = ink;
        c.textAlign = "center";
        c.font = "14px system-ui";
        c.fillText(
          q.status === "requesting"
            ? "Waiting for camera permission…"
            : "Camera is off",
          width / 2,
          height / 2,
        );
        return;
      }
      sampleBuffer.current ??= document.createElement("canvas");
      const sample = sampleBuffer.current;
      const sampleHeight = clamp(Math.round((q.cells * sh) / sw), 1, 64);
      if (sample.width !== q.cells) sample.width = q.cells;
      if (sample.height !== sampleHeight) sample.height = sampleHeight;
      const context = sample.getContext("2d", { willReadFrequently: true })!;
      context.drawImage(source, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(
          0,
          0,
          sample.width,
          sample.height,
        ).data,
        fit = imageFit(width * 0.94, height * 0.9, sw, sh),
        cw = fit.width / sample.width,
        ch = fit.height / sample.height;
      for (let y = 0; y < sample.height; y++)
        for (let x = 0; x < sample.width; x++) {
          const idx = (y * sample.width + x) * 4;
          c.fillStyle = `rgb(${pixels[idx]} ${pixels[idx + 1]} ${pixels[idx + 2]})`;
          c.fillRect(
            fit.x + (q.mirrored ? sample.width - 1 - x : x) * cw,
            fit.y + y * ch,
            Math.max(1, cw - 1),
            Math.max(1, ch - 1),
          );
        }
    },
    paused || (!sample && status !== "live"),
  );
  active.current = animation.active;
  useEffect(
    () => animation.invalidate(),
    [status, sample, mirrored, cells, animation.invalidate],
  );
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop("Camera stopped while the page is hidden.");
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      request.current++;
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      if (video.current) video.current.srcObject = null;
    };
  }, []);
  useEffect(() => {
    if (!animation.active && ["live", "requesting"].includes(statusRef.current))
      stop("Camera stopped outside the visible area.");
  }, [animation.active]);
  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      update("error");
      setMessage(
        "This browser does not provide camera access. Use the sample instead.",
      );
      return;
    }
    const token = ++request.current;
    setSample(false);
    update("requesting");
    setMessage("Waiting for camera permission…");
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 400 } },
        audio: false,
      });
      if (token !== request.current || document.hidden || !active.current) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = next;
      const target = video.current;
      if (!target) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }
      target.srcObject = next;
      await target.play();
      if (token !== request.current || document.hidden || !active.current) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }
      update("live");
      setMessage("Camera is live locally. Frames are not uploaded.");
      animation.invalidate();
    } catch (error) {
      if (token !== request.current) return;
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      update("error");
      setMessage(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Camera permission denied. Use the sample or try again."
          : "Camera could not start. Check the device and browser permissions.",
      );
    }
  };
  return (
    <Shell label={label} className={className} style={style} status={message}>
      <div className="mingu-lab-surface">
        <canvas ref={animation.canvas} aria-hidden="true" />
        <video
          ref={video}
          playsInline
          muted
          className="mingu-visually-hidden"
        />
      </div>
      <Settings>
        <Slider
          label="Pixel columns"
          min={12}
          max={64}
          step={1}
          value={cells}
          onValueChange={setCells}
        />
      </Settings>
      <Actions>
        <Button
          variant="secondary"
          disabled={status === "requesting" || status === "live"}
          onClick={start}
        >
          Start camera
        </Button>
        <Button
          variant="ghost"
          disabled={status !== "live" && status !== "requesting"}
          onClick={() => stop()}
        >
          Stop camera
        </Button>
        <Button
          variant="ghost"
          aria-pressed={sample}
          onClick={() => {
            stop("Sample image. The camera is off.");
            setSample(true);
          }}
        >
          Use sample
        </Button>
        <Button
          variant="ghost"
          aria-pressed={mirrored}
          onClick={() => setMirrored(!mirrored)}
        >
          Mirror image
        </Button>
        <Button
          variant="ghost"
          disabled={!!animation.reduced}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Resume pixels" : "Pause pixels"}
        </Button>
      </Actions>
    </Shell>
  );
}

export interface ImageRelightingProps extends LabProps {
  src?: string;
  depthSrc?: string;
  alt?: string;
}
export function ImageRelighting({
  src,
  depthSrc,
  alt = "Image with interactive lighting",
  label = "Image relighting",
  className,
  style,
}: ImageRelightingProps) {
  const { raster, error } = useRaster(src),
    { raster: depth, error: depthError } = useRaster(depthSrc),
    [position, setPosition] = useState({ x: 0.3, y: 0.25 }),
    [strength, setStrength] = useState(0.7),
    [touch, setTouch] = useState(false),
    cache = useRef<HTMLCanvasElement | null>(null),
    live = useRef({ raster, depth, depthSrc, position, strength });
  live.current = { raster, depth, depthSrc, position, strength };
  const animation = useExperimentCanvas((_, canvas) => {
    const s = prepareSurface(canvas),
      r = live.current.raster,
      d = live.current.depth;
    if (!s || !r) return;
    const { context: c, width, height, ink } = s,
      { position: p, strength: k, depthSrc } = live.current;
    cache.current ??= document.createElement("canvas");
    const buffer = cache.current;
    buffer.width = r.width;
    buffer.height = r.height;
    const ctx = buffer.getContext("2d")!,
      output = ctx.createImageData(r.width, r.height),
      z = (x: number, y: number) => {
        x = clamp(x, 0, r.width - 1);
        y = clamp(y, 0, r.height - 1);
        if (depthSrc && d) {
          const dx = Math.min(d.width - 1, Math.floor((x / r.width) * d.width)),
            dy = Math.min(d.height - 1, Math.floor((y / r.height) * d.height)),
            i = (dy * d.width + dx) * 4;
          return d.pixels[i] / 255;
        }
        const i = (y * r.width + x) * 4;
        return (
          (r.pixels[i] * 0.2126 +
            r.pixels[i + 1] * 0.7152 +
            r.pixels[i + 2] * 0.0722) /
          255
        );
      };
    for (let y = 0; y < r.height; y++)
      for (let x = 0; x < r.width; x++) {
        let nx = (z(x - 1, y) - z(x + 1, y)) * 4,
          ny = (z(x, y - 1) - z(x, y + 1)) * 4,
          nz = 1;
        const nl = Math.hypot(nx, ny, nz);
        nx /= nl;
        ny /= nl;
        nz /= nl;
        const lx = (p.x - x / r.width) * 2,
          ly = (p.y - y / r.height) * 2,
          lz = 0.7,
          ll = Math.hypot(lx, ly, lz),
          diffuse = Math.max(0, (nx * lx + ny * ly + nz * lz) / ll),
          light = 1 + k * (diffuse - 0.55),
          i = (y * r.width + x) * 4;
        output.data[i] = r.pixels[i] * light;
        output.data[i + 1] = r.pixels[i + 1] * light;
        output.data[i + 2] = r.pixels[i + 2] * light;
        output.data[i + 3] = r.pixels[i + 3];
      }
    ctx.putImageData(output, 0, 0);
    const fit = imageFit(width * 0.92, height * 0.9, r.width, r.height);
    c.drawImage(buffer, fit.x, fit.y, fit.width, fit.height);
    c.strokeStyle = ink;
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(p.x * width, p.y * height, 8, 0, Math.PI * 2);
    c.moveTo(p.x * width - 13, p.y * height);
    c.lineTo(p.x * width + 13, p.y * height);
    c.moveTo(p.x * width, p.y * height - 13);
    c.lineTo(p.x * width, p.y * height + 13);
    c.stroke();
  }, true);
  useEffect(
    () => animation.invalidate(),
    [raster, depth, depthSrc, position, strength, animation.invalidate],
  );
  return (
    <Shell
      label={label}
      className={className}
      style={style}
      status={
        error ||
        (depthSrc ? depthError : "") ||
        (depthSrc
          ? "Lighting uses the supplied depth image."
          : "Lighting uses relief estimated from image brightness.")
      }
    >
      <div
        className="mingu-lab-surface"
        style={{ touchAction: touch ? "none" : "pan-y pinch-zoom" }}
        onPointerMove={(event) => {
          if (event.pointerType === "touch" && !touch) return;
          const canvas = animation.canvas.current;
          if (canvas) setPosition(point(event, canvas));
        }}
      >
        <canvas ref={animation.canvas} aria-hidden="true" />
        <span className="mingu-visually-hidden">{alt}</span>
      </div>
      <Settings>
        <Slider
          label="Light horizontal position"
          min={0}
          max={1}
          step={0.01}
          value={position.x}
          onValueChange={(x) => setPosition((p) => ({ ...p, x }))}
        />
        <Slider
          label="Light vertical position"
          min={0}
          max={1}
          step={0.01}
          value={position.y}
          onValueChange={(y) => setPosition((p) => ({ ...p, y }))}
        />
        <Slider
          label="Light intensity"
          min={0}
          max={1.5}
          step={0.05}
          value={strength}
          onValueChange={setStrength}
        />
      </Settings>
      <Actions>
        <Button
          variant="ghost"
          aria-pressed={touch}
          onClick={() => setTouch(!touch)}
        >
          Touch interaction
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPosition({ x: 0.3, y: 0.25 });
            setStrength(0.7);
          }}
        >
          Reset lighting
        </Button>
      </Actions>
    </Shell>
  );
}
