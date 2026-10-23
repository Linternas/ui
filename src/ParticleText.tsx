"use client";
import * as React from "react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button, TextField } from "./system/base";
import { Slider } from "./system/forms";
import { useControllable } from "./shared";
import { useExperimentCanvas } from "./experimental/canvas";
import { experimentalMotion } from "./system/motion-tokens";
export interface ParticleTextProps {
  text?: string;
  defaultText?: string;
  onTextChange?: (text: string) => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
}
type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
};
export function ParticleText({
  text,
  defaultText = "PLAY",
  onTextChange,
  label = "Particle lettering",
  className = "",
  style,
}: ParticleTextProps) {
  const [value, change] = useControllable(text, defaultText, onTextChange),
    [paused, setPaused] = useState(false),
    [strength, setStrength] = useState(1),
    [touch, setTouch] = useState(false),
    [message, setMessage] = useState("Move through the letters.");
  const particles = useRef<Particle[]>([]),
    signature = useRef(""),
    pointer = useRef<{ x: number; y: number } | null>(null),
    burst = useRef(false),
    settings = useRef({ word: value, strength, reduced: false });
  settings.current.word = Array.from(value).slice(0, 18).join("") || " ";
  settings.current.strength = strength;
  const drawing = useExperimentCanvas((delta, element) => {
    const ctx = element.getContext("2d");
    if (!ctx) return;
    const width = element.clientWidth,
      height = element.clientHeight,
      ratio = element.width / Math.max(1, width);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const styles = getComputedStyle(element),
      word = settings.current.word,
      key = `${word}:${width}:${height}`;
    if (signature.current !== key) {
      signature.current = key;
      const sample = document.createElement("canvas");
      sample.width = Math.max(1, Math.round(width));
      sample.height = Math.max(1, Math.round(height));
      const ink = sample.getContext("2d", { willReadFrequently: true });
      if (!ink) return;
      let size = Math.min(height * 0.48, width * 0.28, 220);
      const family =
        styles.getPropertyValue("--mingu-font-sans") || "system-ui";
      ink.font = `750 ${size}px ${family}`;
      const measured = ink.measureText(word).width;
      if (measured > width * 0.86) size *= (width * 0.86) / measured;
      ink.font = `750 ${size}px ${family}`;
      ink.textAlign = "center";
      ink.textBaseline = "middle";
      ink.fillStyle = "#fff";
      ink.fillText(word, width / 2, height / 2);
      const pixels = ink.getImageData(0, 0, sample.width, sample.height).data,
        points: Particle[] = [];
      const gap = Math.max(
        3,
        Math.ceil(
          Math.sqrt((width * height) / experimentalMotion.particleLimit / 3),
        ),
      );
      for (let y = 0; y < sample.height; y += gap)
        for (let x = 0; x < sample.width; x += gap)
          if (pixels[(y * sample.width + x) * 4 + 3] > 100)
            points.push({ x, y, homeX: x, homeY: y, vx: 0, vy: 0 });
      const stride = Math.max(
        1,
        Math.ceil(points.length / experimentalMotion.particleLimit),
      );
      particles.current = points.filter((_, i) => i % stride === 0);
    }
    const scatter = burst.current;
    burst.current = false;
    ctx.fillStyle = styles.getPropertyValue("--mingu-text") || "#111";
    const step = delta * 60;
    for (let i = 0; i < particles.current.length; i++) {
      const point = particles.current[i];
      if (settings.current.reduced) {
        point.x = point.homeX;
        point.y = point.homeY;
        point.vx = point.vy = 0;
      } else if (delta) {
        if (scatter) {
          const angle = i * 2.399963;
          point.vx += Math.cos(angle) * 22;
          point.vy += Math.sin(angle) * 22;
        }
        const cursor = pointer.current;
        if (cursor) {
          const dx = point.x - cursor.x,
            dy = point.y - cursor.y,
            d = Math.max(1, Math.hypot(dx, dy)),
            radius = experimentalMotion.particleReach;
          if (d < radius) {
            const push = (1 - d / radius) * settings.current.strength * 3.4;
            point.vx += (dx / d) * push;
            point.vy += (dy / d) * push;
          }
        }
        point.vx += (point.homeX - point.x) * 0.034 * step;
        point.vy += (point.homeY - point.y) * 0.034 * step;
        point.vx *= Math.pow(0.87, step);
        point.vy *= Math.pow(0.87, step);
        point.x += point.vx * step;
        point.y += point.vy * step;
      }
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        Math.max(0.8, Math.min(1.7, width / 480)),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }, paused);
  settings.current.reduced = !!drawing.reduced;
  useEffect(() => drawing.invalidate(), [value, strength, drawing.invalidate]);
  const locate = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === "touch" && !touch) return;
    const box = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: event.clientX - box.left,
      y: event.clientY - box.top,
    };
    drawing.invalidate();
  };
  return (
    <div
      className={`mingu-particle-text ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <div className="mingu-experiment-surface mingu-particle-surface">
        <canvas
          ref={drawing.canvas}
          aria-hidden="true"
          onPointerMove={locate}
          onPointerDown={locate}
          onPointerLeave={() => {
            pointer.current = null;
          }}
          onPointerUp={(event) => {
            if (event.pointerType !== "mouse") pointer.current = null;
          }}
          onPointerCancel={() => {
            pointer.current = null;
          }}
          style={{
            touchAction:
              touch && !drawing.reduced ? "none" : "pan-y pinch-zoom",
          }}
        />
        <p className="mingu-visually-hidden">{value || "Empty lettering"}</p>
        <span className="mingu-experiment-coordinate" aria-hidden="true">
          TYPE / FORCE / RETURN
        </span>
      </div>
      <div className="mingu-experiment-controls">
        <TextField
          label="Word"
          value={value}
          maxLength={18}
          onChange={(event) => {
            change(event.currentTarget.value);
            signature.current = "";
            drawing.invalidate();
          }}
        />
        <Slider
          label="Force"
          min={0.4}
          max={2}
          step={0.1}
          value={strength}
          onValueChange={setStrength}
        />
        <div className="mingu-experiment-buttons">
          <Button
            variant="secondary"
            disabled={!!drawing.reduced || paused}
            onClick={() => {
              burst.current = true;
              setMessage("Scattered. The letters find their way home.");
              drawing.invalidate();
            }}
          >
            Scatter
          </Button>
          <Button
            variant="ghost"
            disabled={!!drawing.reduced}
            aria-pressed={paused}
            onClick={() => {
              setPaused(!paused);
              pointer.current = null;
            }}
          >
            {paused ? "Resume motion" : "Pause motion"}
          </Button>
          <Button
            variant="ghost"
            disabled={!!drawing.reduced}
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
            onClick={() => {
              particles.current.forEach((p) => {
                p.x = p.homeX;
                p.y = p.homeY;
                p.vx = p.vy = 0;
              });
              pointer.current = null;
              burst.current = false;
              setMessage("Back in place.");
              drawing.invalidate();
            }}
          >
            Reset particles
          </Button>
        </div>
      </div>
      <p className="mingu-experiment-status" role="status">
        {drawing.reduced ? "Motion reduced. Lettering stays still." : message}
      </p>
    </div>
  );
}
