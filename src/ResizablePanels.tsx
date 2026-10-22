"use client";
import * as React from "react";
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useControllable } from "./shared";
export interface ResizablePanelsProps {
  first: ReactNode;
  second: ReactNode;
  label?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}
export function ResizablePanels({
  first,
  second,
  label = "Resize panels",
  value,
  defaultValue = 50,
  onValueChange,
  min = 20,
  max = 80,
  disabled,
  className = "",
  style,
}: ResizablePanelsProps) {
  const low = Math.max(0, Math.min(99, Number.isFinite(min) ? min : 20)),
    high = Math.max(low + 1, Math.min(100, Number.isFinite(max) ? max : 80));
  const clamp = (n: number) =>
    Math.max(low, Math.min(high, Number.isFinite(n) ? n : 50));
  const [percent, setPercent] = useControllable(
    value,
    clamp(defaultValue),
    onValueChange,
  );
  const [collapsed, setCollapsed] = useState(false),
    [dragging, setDragging] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    firstPanel = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null),
    previous = useRef(clamp(defaultValue));
  const id = useId();
  const update = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = root.current?.getBoundingClientRect();
    if (box?.width) {
      setCollapsed(false);
      setPercent(clamp(((event.clientX - box.left) / box.width) * 100));
    }
  };
  const toggle = () => {
    if (!collapsed) previous.current = clamp(percent);
    else setPercent(previous.current);
    setCollapsed(!collapsed);
  };
  return (
    <div
      ref={root}
      className={`mingu-resizable ${className}`}
      data-collapsed={collapsed || undefined}
      data-dragging={dragging || undefined}
      style={
        {
          ...style,
          "--mingu-panel-split": `${collapsed ? 0 : clamp(percent)}%`,
        } as CSSProperties
      }
    >
      <div
        id={`${id}-first`}
        ref={firstPanel}
        className="mingu-resizable-panel"
        inert={collapsed || undefined}
        aria-hidden={collapsed || undefined}
      >
        {first}
      </div>
      <div
        className="mingu-resizable-divider"
        role="separator"
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={collapsed ? 0 : low}
        aria-valuemax={high}
        aria-valuenow={collapsed ? 0 : Math.round(clamp(percent))}
        aria-valuetext={
          collapsed ? "First panel collapsed" : `${Math.round(clamp(percent))}%`
        }
        aria-controls={`${id}-first ${id}-second`}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onDoubleClick={() => {
          if (!disabled) toggle();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter") {
            event.preventDefault();
            toggle();
            return;
          }
          const next =
            event.key === "ArrowLeft"
              ? clamp(percent) - (event.shiftKey ? 10 : 1)
              : event.key === "ArrowRight"
                ? clamp(percent) + (event.shiftKey ? 10 : 1)
                : event.key === "Home"
                  ? low
                  : event.key === "End"
                    ? high
                    : null;
          if (next !== null) {
            event.preventDefault();
            setCollapsed(false);
            setPercent(clamp(next));
          }
        }}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.focus();
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (pointer.current === event.pointerId) update(event);
        }}
        onPointerUp={(event) => {
          if (pointer.current === event.pointerId) {
            pointer.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
            setDragging(false);
          }
        }}
        onPointerCancel={() => {
          pointer.current = null;
          setDragging(false);
        }}
        onLostPointerCapture={() => {
          pointer.current = null;
          setDragging(false);
        }}
      >
        <span aria-hidden="true" />
      </div>
      <div id={`${id}-second`} className="mingu-resizable-panel">
        {second}
      </div>
    </div>
  );
}
