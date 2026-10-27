"use client";
import * as React from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";

export function InteractionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
export function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internal, setInternal] = useState(initial);
  return [
    value === undefined ? internal : value,
    (next) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
  ];
}
export function useCanvasFrame(
  draw: (time: number, delta: number, canvas: HTMLCanvasElement) => void,
) {
  const ref = useRef<HTMLCanvasElement>(null);
  const callback = useRef(draw);
  callback.current = draw;
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0,
      last = 0,
      visible = false;
    const tick = (time: number) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      callback.current(
        reduced ? 0 : time / 1000,
        last ? Math.min((time - last) / 1000, 0.035) : 0.016,
        canvas,
      );
      last = time;
      frame =
        !reduced && visible && !document.hidden
          ? requestAnimationFrame(tick)
          : 0;
    };
    const refresh = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      refresh();
    });
    const size = new ResizeObserver(refresh);
    visibility.observe(canvas);
    size.observe(canvas);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      size.disconnect();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [reduced, draw]);
  return ref;
}
// Kept as a re-export for existing interaction implementations.
export { Icon } from "./icons";
