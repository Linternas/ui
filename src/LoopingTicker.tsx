"use client";
import { useReducedMotion } from "./motion-policy";

import * as React from "react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { Button } from "./system/base";
export interface TickerItem {
  id: string;
  content: ReactNode;
}
export interface LoopingTickerProps {
  items: readonly TickerItem[];
  label: string;
  speed?: number;
  direction?: "left" | "right";
  autoPlay?: boolean;
  className?: string;
}
export function LoopingTicker({
  items,
  label,
  speed = 36,
  direction = "left",
  autoPlay = true,
  className = "",
}: LoopingTickerProps) {
  const root = useRef<HTMLDivElement>(null),
    group = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0),
    [minimum, setMinimum] = useState(0),
    [paused, setPaused] = useState(!autoPlay),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false),
    [visible, setVisible] = useState(false),
    [background, setBackground] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = root.current,
      copy = group.current;
    if (!element || !copy) return;
    const measure = () => {
      setMinimum(element.clientWidth);
      setDistance(copy.getBoundingClientRect().width);
    };
    const size = new ResizeObserver(measure);
    size.observe(element);
    size.observe(copy);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false),
    );
    observer.observe(element);
    const visibility = () => setBackground(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    measure();
    visibility();
    return () => {
      size.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const stopped =
    paused ||
    hovered ||
    focused ||
    !visible ||
    background ||
    !autoPlay ||
    reduced ||
    items.length < 2;
  const duration =
    distance / Math.max(8, Math.min(120, Number.isFinite(speed) ? speed : 36));
  return (
    <div
      className={`mingu-ticker ${className}`}
      style={
        {
          "--mingu-ticker-distance": `${distance}px`,
          "--mingu-ticker-duration": `${Math.max(1, duration)}s`,
          "--mingu-ticker-min": `${minimum}px`,
        } as CSSProperties
      }
    >
      <div
        ref={root}
        className="mingu-ticker-viewport"
        data-static={reduced || items.length < 2 || !autoPlay || undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        <div
          className="mingu-ticker-track"
          data-paused={stopped || undefined}
          data-direction={direction}
        >
          <div
            ref={group}
            role="list"
            aria-label={label}
            className="mingu-ticker-group"
          >
            {items.map((item) => (
              <div role="listitem" key={item.id}>
                {item.content}
              </div>
            ))}
          </div>
          <div
            className="mingu-ticker-group mingu-ticker-clone"
            aria-hidden="true"
            inert
          >
            {items.map((item) => (
              <div key={item.id}>{item.content}</div>
            ))}
          </div>
        </div>
      </div>
      {autoPlay && items.length > 1 && !reduced && (
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Play ticker" : "Pause ticker"}
        </Button>
      )}
      {!items.length && <p className="mingu-muted">No items</p>}
    </div>
  );
}
