"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useMotionPreference as useReducedMotion } from "./motion-preference";
import { experimentalMotion } from "../system/motion-tokens";
/** One bounded canvas loop; paused/reduced scenes redraw only when invalidated. */
export function useExperimentCanvas(
  draw: (delta: number, canvas: HTMLCanvasElement) => void,
  paused = false,
  visibilityTarget?: RefObject<Element | null>,
) {
  const canvas = useRef<HTMLCanvasElement>(null),
    callback = useRef(draw),
    schedule = useRef<(() => void) | null>(null),
    [active, setActive] = useState(false),
    reduced = useReducedMotion();
  callback.current = draw;
  const invalidate = useCallback(() => schedule.current?.(), []);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let frame = 0,
      last = 0,
      visible = false;
    const tick = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      const width = Math.max(1, element.clientWidth),
        height = Math.max(1, element.clientHeight);
      const ratio = Math.min(
        devicePixelRatio || 1,
        experimentalMotion.pixelRatio,
        2048 / width,
        1200 / height,
      );
      const w = Math.round(width * ratio),
        h = Math.round(height * ratio);
      if (element.width !== w || element.height !== h) {
        element.width = w;
        element.height = h;
      }
      callback.current(
        paused || reduced
          ? 0
          : Math.min(0.032, last ? (time - last) / 1000 : 0.016),
        element,
      );
      last = time;
      if (!paused && !reduced) frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      setActive(visible && !document.hidden);
      if (frame && visible && !document.hidden && !paused && !reduced) return;
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    schedule.current = refresh;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      refresh();
    });
    observer.observe(visibilityTarget?.current ?? element);
    const size = new ResizeObserver(refresh);
    size.observe(element);
    document.addEventListener("visibilitychange", refresh);
    // A paused/static canvas still needs repainting when its inherited theme changes.
    const theme = new MutationObserver(refresh);
    let parent: Element | null = element.parentElement;
    while (parent) {
      theme.observe(parent, {
        attributes: true,
        attributeFilter: [
          "class",
          "style",
          "data-mingu-theme",
          "data-mingu-accent",
        ],
      });
      parent = parent.parentElement;
    }
    const colorScheme = matchMedia("(prefers-color-scheme: dark)");
    colorScheme.addEventListener("change", refresh);
    return () => {
      schedule.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      theme.disconnect();
      colorScheme.removeEventListener("change", refresh);
      size.disconnect();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [paused, reduced, visibilityTarget]);
  return { canvas, invalidate, active, reduced };
}
