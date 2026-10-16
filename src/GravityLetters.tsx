"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

interface Glyph {
  id: number;
  content: ReactNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  radius: number;
}
export interface GravityLettersProps {
  items?: readonly ReactNode[];
  type?: "letters" | "numbers" | "both";
  gravity?: number;
  size?: number;
  maxGlyphs?: number;
  deviceTilt?: boolean;
}
export function GravityLetters({
  items,
  type = "letters",
  gravity = 900,
  size = 30,
  maxGlyphs = 80,
  deviceTilt = false,
}: GravityLettersProps) {
  const root = useRef<HTMLDivElement>(null),
    bodies = useRef<Glyph[]>([]),
    sequence = useRef(0),
    pouring = useRef<ReturnType<typeof setInterval> | null>(null),
    tilt = useRef(0);
  const nodes = useRef(new Map<number, HTMLSpanElement>());
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const reduced = useReducedMotion();
  const stop = () => {
    if (pouring.current) clearInterval(pouring.current);
    pouring.current = null;
  };
  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (!deviceTilt) return;
    const orient = (event: DeviceOrientationEvent) => {
      tilt.current = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 35));
    };
    window.addEventListener("deviceorientation", orient);
    return () => {
      tilt.current = 0;
      window.removeEventListener("deviceorientation", orient);
    };
  }, [deviceTilt]);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    let frame = 0,
      last = 0,
      visible = false;
    const update = (now: number) => {
      const dt = Math.min(0.032, last ? (now - last) / 1000 : 0.016);
      last = now;
      const width = container.clientWidth,
        height = container.clientHeight;
      const list = bodies.current;
      for (let i = 0; i < list.length; i++) {
        const body = list[i];
        if (!body) continue;
        if (reduced) {
          body.x =
            body.radius + ((i * size * 1.15) % Math.max(size, width - size));
          body.y =
            height -
            body.radius -
            Math.floor((i * size * 1.15) / Math.max(size, width - size)) * size;
        } else {
          body.vy += gravity * dt;
          body.vx += tilt.current * gravity * dt;
          body.x += body.vx * dt;
          body.y += body.vy * dt;
          body.angle += body.spin * dt;
          if (body.x < body.radius || body.x > width - body.radius) {
            body.x = Math.max(
              body.radius,
              Math.min(width - body.radius, body.x),
            );
            body.vx *= -0.55;
          }
          if (body.y > height - body.radius) {
            body.y = height - body.radius;
            body.vy *= -0.35;
            body.vx *= 0.94;
            body.spin *= 0.8;
          }
        }
      }
      if (!reduced)
        for (let i = 0; i < list.length; i++)
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j];
            if (!a || !b) continue;
            const dx = b.x - a.x,
              dy = b.y - a.y,
              distance = Math.hypot(dx, dy),
              overlap = a.radius + b.radius - distance;
            if (overlap > 0 && distance > 0.01) {
              const nx = dx / distance,
                ny = dy / distance;
              a.x -= nx * overlap * 0.5;
              a.y -= ny * overlap * 0.5;
              b.x += nx * overlap * 0.5;
              b.y += ny * overlap * 0.5;
              const impulse = ((b.vx - a.vx) * nx + (b.vy - a.vy) * ny) * 0.55;
              if (impulse < 0) {
                a.vx += impulse * nx;
                a.vy += impulse * ny;
                b.vx -= impulse * nx;
                b.vy -= impulse * ny;
              }
            }
          }
      for (const body of list) {
        const node = nodes.current.get(body.id);
        if (node)
          node.style.transform = `translate(${body.x - body.radius}px, ${body.y - body.radius}px) rotate(${body.angle}rad)`;
      }
      frame =
        !reduced && visible && !document.hidden
          ? requestAnimationFrame(update)
          : 0;
    };
    const refresh = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      refresh();
    });
    observer.observe(container);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [gravity, reduced, size, glyphs]);
  function drop(x: number, y: number) {
    const pool = items?.length
      ? items
      : [
          ...(type === "numbers"
            ? "0123456789"
            : type === "both"
              ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
              : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
        ];
    const glyph: Glyph = {
      id: sequence.current++,
      content: pool[Math.floor(Math.random() * pool.length)],
      x,
      y,
      vx: (Math.random() - 0.5) * 130,
      vy: 0,
      angle: 0,
      spin: (Math.random() - 0.5) * 8,
      radius: size / 2,
    };
    const limit = Math.max(1, Math.min(200, maxGlyphs));
    bodies.current = [
      ...(limit > 1 ? bodies.current.slice(-(limit - 1)) : []),
      glyph,
    ];
    setGlyphs(bodies.current);
  }
  return (
    <div
      className="mi-gravity"
      ref={root}
      role="button"
      tabIndex={0}
      aria-label="Drop letters. Click, hold, or press Enter"
      onPointerDown={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - box.left,
          y = event.clientY - box.top;
        stop();
        drop(x, y);
        event.currentTarget.setPointerCapture(event.pointerId);
        pouring.current = setInterval(() => drop(x, y), 110);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          drop((root.current?.clientWidth ?? 250) / 2, 20);
        }
      }}
    >
      <span className="mi-gravity-hint" aria-hidden="true">
        Click & hold to let go.
      </span>
      {glyphs.map((glyph) => (
        <span
          key={glyph.id}
          aria-hidden="true"
          className="mi-gravity-glyph"
          ref={(node) => {
            if (node) nodes.current.set(glyph.id, node);
            else nodes.current.delete(glyph.id);
          }}
          style={{ fontSize: size, width: size, height: size }}
        >
          {glyph.content}
        </span>
      ))}
      <span className="mru-sr-only" role="status">
        {glyphs.length} letters in the field
      </span>
    </div>
  );
}
