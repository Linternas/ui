"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useControllable } from "./shared";
import { elasticSpring, gestureMotion } from "./system/motion-tokens";

export interface ElasticSliderProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
  form?: string;
  formatValue?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
  ref?: React.Ref<HTMLInputElement>;
}
export function ElasticSlider({
  label,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  name,
  form,
  formatValue = String,
  className = "",
  style,
  ref,
}: ElasticSliderProps) {
  const low = Number.isFinite(min) ? min : 0;
  const high = Number.isFinite(max) && max > low ? max : low + 1;
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const lastStep =
    low + Math.floor((high - low) / increment + 1e-10) * increment;
  const normalize = (n: number) =>
    Number(
      Math.max(
        low,
        Math.min(
          lastStep,
          low +
            Math.round(((Number.isFinite(n) ? n : low) - low) / increment) *
              increment,
        ),
      ).toPrecision(15),
    );
  const [position, setPosition] = useControllable(
    value,
    defaultValue ?? low,
    onValueChange,
  );
  const current = normalize(position);
  const track = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(300);
  const pointer = useRef<number | null>(null);
  const id = useId();
  const reduced = useReducedMotion();
  const bend = useSpring(0, elasticSpring);
  const x = 12 + ((current - low) / (high - low)) * (width - 24);
  const thumbX = useSpring(x, elasticSpring);
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner || value !== undefined) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented)
          setPosition(normalize(defaultValue ?? low));
      });
    };
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [value, defaultValue, low, high, increment, form, setPosition]);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(() =>
      setWidth(node.getBoundingClientRect().width),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (pointer.current !== null || reduced) thumbX.jump(x);
    else thumbX.set(x);
  }, [x, reduced, thumbX]);
  useEffect(() => {
    if (disabled || reduced) {
      pointer.current = null;
      bend.jump(0);
    }
  }, [disabled, reduced, bend]);
  const path = useTransform(
    [thumbX, bend],
    ([tx, by]: number[]) =>
      `M12 28 Q${(12 + tx) / 2} 28 ${tx} ${28 + by} Q${(tx + width - 12) / 2} 28 ${width - 12} 28`,
  );
  const cy = useTransform(bend, (n) => 28 + n);
  const update = (event: React.PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width)
      setPosition(
        normalize(
          low +
            Math.max(
              0,
              Math.min(1, (event.clientX - bounds.left) / bounds.width),
            ) *
              (high - low),
        ),
      );
    const area = track.current?.getBoundingClientRect();
    if (area && !reduced)
      bend.set(
        Math.max(
          -gestureMotion.sliderBend,
          Math.min(
            gestureMotion.sliderBend,
            (event.clientY - area.top - 28) * 0.45,
          ),
        ),
      );
  };
  const release = () => {
    pointer.current = null;
    bend.set(0);
  };
  return (
    <div
      className={`mingu-elastic ${className}`}
      style={style}
      data-disabled={disabled || undefined}
    >
      <div className="mingu-elastic-heading">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{formatValue(current)}</output>
      </div>
      <div className="mingu-elastic-track" ref={track}>
        <svg
          width="100%"
          height="56"
          viewBox={`0 0 ${width} 56`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.circle cx={thumbX} cy={cy} r="7" fill="currentColor" />
        </svg>
        <input
          ref={(node) => {
            input.current = node;
            if (typeof ref === "function") return ref(node);
            if (ref) ref.current = node;
          }}
          id={id}
          type="range"
          name={name}
          form={form}
          min={low}
          max={high}
          step={increment}
          value={current}
          disabled={disabled}
          aria-valuetext={formatValue(current)}
          onChange={(event) =>
            setPosition(normalize(event.currentTarget.valueAsNumber))
          }
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
              event.currentTarget.releasePointerCapture(event.pointerId);
              release();
            }
          }}
          onPointerCancel={release}
          onLostPointerCapture={release}
        />
      </div>
    </div>
  );
}
