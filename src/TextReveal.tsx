"use client";
import { useReducedMotion } from "./motion-policy";

import * as React from "react";
import { useEffect, useRef, useState, type RefObject } from "react";

export interface TextRevealProps {
  text: string;
  containerRef?: RefObject<HTMLElement | null>;
  className?: string;
}
export function TextReveal({
  text,
  containerRef,
  className = "",
}: TextRevealProps) {
  const root = useRef<HTMLParagraphElement>(null),
    reduced = useReducedMotion();
  // The server-rendered copy is fully readable before scroll enhancement starts.
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    const element = root.current,
      container = containerRef?.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const box = element.getBoundingClientRect(),
        bounds = container?.getBoundingClientRect();
      const top = bounds ? bounds.top + container!.clientTop : 0;
      const height = container ? container.clientHeight : window.innerHeight;
      const start = top + height * 0.9,
        end = top + height * 0.3 - box.height;
      setProgress(
        Math.max(0, Math.min(1, (start - box.top) / Math.max(1, start - end))),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const target = container ?? window;
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    if (container) observer.observe(container);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [containerRef, reduced, text]);
  const words = text.split(/(\s+)/),
    count = words.filter((w) => w.trim()).length;
  let word = 0;
  return (
    <p ref={root} className={`mingu-text-reveal ${className}`}>
      <span className="mingu-visually-hidden">{text}</span>
      <span aria-hidden="true">
        {words.map((part, i) => {
          if (!part.trim()) return part;
          const local = Math.max(0, Math.min(1, progress * count - word++));
          return (
            <span
              key={i}
              style={{ opacity: reduced ? 1 : 0.55 + 0.45 * local }}
            >
              {part}
            </span>
          );
        })}
      </span>
    </p>
  );
}
