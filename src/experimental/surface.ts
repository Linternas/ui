import type { CSSProperties, PointerEvent } from "react";
export interface ExperimentProps {
  label?: string;
  className?: string;
  style?: CSSProperties;
}
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
export function prepareSurface(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const width = Math.max(1, canvas.clientWidth),
    height = Math.max(1, canvas.clientHeight),
    ratio = canvas.width / width;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const style = getComputedStyle(canvas);
  return {
    context,
    width,
    height,
    ink: style.getPropertyValue("--mingu-text").trim() || "#111",
    accent: style.getPropertyValue("--mingu-accent").trim() || "#666",
    muted: style.getPropertyValue("--mingu-muted").trim() || "#777",
  };
}
export function surfacePoint(
  event: PointerEvent<HTMLElement>,
  canvas: HTMLCanvasElement,
) {
  const box = canvas.getBoundingClientRect();
  return {
    x: clamp(event.clientX - box.left, 0, box.width),
    y: clamp(event.clientY - box.top, 0, box.height),
  };
}
