"use client";
import * as React from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./system/base";
import { playgroundMotion } from "./system/motion-tokens";
export interface TrailImage {
  src: string;
  alt: string;
}
export interface CursorTrailProps {
  images: readonly TrailImage[];
  label: string;
  children?: ReactNode;
  className?: string;
}
type Stamp = { id: number; x: number; y: number; image: TrailImage };
export function CursorTrail({
  images,
  label,
  children,
  className = "",
}: CursorTrailProps) {
  const root = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion();
  const [fine, setFine] = useState(false),
    [visible, setVisible] = useState(false),
    [background, setBackground] = useState(false),
    [paused, setPaused] = useState(false),
    [stamps, setStamps] = useState<Stamp[]>([]);
  const serial = useRef(0),
    last = useRef<{ x: number; y: number } | null>(null),
    timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const enabled =
    fine && !reduced && visible && !background && !paused && images.length > 0;
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    last.current = null;
    setStamps([]);
  };
  useEffect(() => {
    const media = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(media.matches),
      visibility = () => setBackground(document.hidden);
    update();
    visibility();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false),
    );
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, []);
  useEffect(() => {
    if (!enabled) clear();
  }, [enabled]);
  return (
    <div
      ref={root}
      className={`mingu-cursor-trail ${className}`}
      role="group"
      aria-label={label}
      data-active={enabled || undefined}
      onPointerLeave={clear}
      onPointerMove={(event) => {
        if (
          !enabled ||
          event.pointerType !== "mouse" ||
          (event.target as Element).closest("button,a,input,textarea,select")
        )
          return;
        const box = event.currentTarget.getBoundingClientRect(),
          x = event.clientX - box.left,
          y = event.clientY - box.top;
        if (
          last.current &&
          Math.hypot(x - last.current.x, y - last.current.y) <
            playgroundMotion.trailDistance
        )
          return;
        last.current = { x, y };
        const id = serial.current++,
          image = images[id % images.length];
        setStamps((items) => [
          ...items.slice(-(playgroundMotion.trailLimit - 1)),
          { id, x, y, image },
        ]);
        const timer = setTimeout(() => {
          setStamps((items) => items.filter((s) => s.id !== id));
          timers.current.delete(timer);
        }, playgroundMotion.trailLifetime);
        timers.current.add(timer);
      }}
    >
      <div className="mingu-cursor-content">{children}</div>
      <div className="mingu-cursor-samples">
        {images.map((image, i) => (
          <img key={i} src={image.src} alt={image.alt} draggable={false} />
        ))}
      </div>
      <div className="mingu-cursor-stamps" aria-hidden="true">
        {stamps.map((stamp) => (
          <motion.img
            key={stamp.id}
            src={stamp.image.src}
            alt=""
            draggable={false}
            style={{
              left: stamp.x,
              top: stamp.y,
              rotate: stamp.id % 2 ? 8 : -8,
            }}
            initial={{ scale: 0.65, opacity: 0 }}
            animate={{
              scale: [0.65, 1, 1, 0.9],
              opacity: [0, 1, 1, 0],
              y: [0, 0, 0, 24],
            }}
            transition={{
              duration: playgroundMotion.trailLifetime / 1000,
              times: [0, 0.2, 0.7, 1],
            }}
          />
        ))}
      </div>
      {fine && !reduced && (
        <Button
          className="mingu-cursor-toggle"
          variant="ghost"
          size="sm"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Enable trail" : "Pause trail"}
        </Button>
      )}
    </div>
  );
}
