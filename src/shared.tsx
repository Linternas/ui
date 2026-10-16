"use client";
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
export function Icon({
  name,
  size = 20,
}: {
  name:
    | "play"
    | "pause"
    | "replay"
    | "check"
    | "close"
    | "bell"
    | "trash"
    | "edit"
    | "search"
    | "chevron";
  size?: number;
}) {
  const paths = {
    play: "M9 5l11 7-11 7z",
    pause: "M8 5v14M16 5v14",
    replay: "M4 10a8 8 0 111 8M4 4v6h6",
    check: "M5 12l4 4L19 6",
    close: "M6 6l12 12M18 6L6 18",
    bell: "M5 17h14l-2-4V9a5 5 0 00-10 0v4zM10 21h4",
    trash: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6",
    edit: "M5 16l-1 4 4-1L20 7l-3-3z",
    search: "M20 20l-5-5M17 10a7 7 0 11-14 0 7 7 0 0114 0",
    chevron: "M6 9l6 6 6-6",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
