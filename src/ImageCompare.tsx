"use client";
import * as React from "react";
import { useRef, type CSSProperties } from "react";
import { useControllable } from "./shared";

export interface CompareImage {
  src: string;
  alt: string;
}
export interface ImageCompareProps {
  before: CompareImage;
  after: CompareImage;
  label?: string;
  beforeLabel?: string;
  afterLabel?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}
const clamp = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
export function ImageCompare({
  before,
  after,
  label = "Image comparison",
  beforeLabel = "Before",
  afterLabel = "After",
  value,
  defaultValue = 50,
  onValueChange,
  disabled,
  className = "",
  style,
}: ImageCompareProps) {
  const [position, setPosition] = useControllable(
    value,
    clamp(defaultValue),
    onValueChange,
  );
  const current = clamp(position);
  const pointer = useRef<number | null>(null);
  const update = (event: React.PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width)
      setPosition(clamp(((event.clientX - bounds.left) / bounds.width) * 100));
  };
  return (
    <div
      className={`mingu-compare ${className}`}
      style={
        { ...style, "--mingu-compare-position": `${current}%` } as CSSProperties
      }
    >
      <img src={after.src} alt={after.alt} draggable={false} />
      <div
        className="mingu-compare-before"
        style={{ clipPath: `inset(0 ${100 - current}% 0 0)` }}
      >
        <img src={before.src} alt={before.alt} draggable={false} />
      </div>
      <span
        className="mingu-compare-caption mingu-compare-caption-before"
        aria-hidden="true"
      >
        {beforeLabel}
      </span>
      <span
        className="mingu-compare-caption mingu-compare-caption-after"
        aria-hidden="true"
      >
        {afterLabel}
      </span>
      <div className="mingu-compare-divider" aria-hidden="true">
        <span>‹ ›</span>
      </div>
      <input
        type="range"
        className="mingu-compare-input"
        min={0}
        max={100}
        step={1}
        value={current}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={`${Math.round(current)}% ${beforeLabel}, ${Math.round(100 - current)}% ${afterLabel}`}
        onChange={(event) => setPosition(event.currentTarget.valueAsNumber)}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          update(event);
        }}
        onPointerMove={(event) => {
          if (pointer.current === event.pointerId) update(event);
        }}
        onPointerUp={(event) => {
          if (pointer.current === event.pointerId) {
            pointer.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        onLostPointerCapture={() => {
          pointer.current = null;
        }}
      />
    </div>
  );
}
