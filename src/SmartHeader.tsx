"use client";
import * as React from "react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type RefObject,
} from "react";
import { workspaceMotion } from "./system/motion-tokens";
export interface SmartHeaderProps extends ComponentProps<"header"> {
  containerRef?: RefObject<HTMLElement | null>;
  threshold?: number;
}
export function SmartHeader({
  containerRef,
  threshold = workspaceMotion.headerThreshold,
  className = "",
  children,
  onFocusCapture,
  ref,
  ...props
}: SmartHeaderProps) {
  const [hidden, setHidden] = useState(false),
    [scrolled, setScrolled] = useState(false);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const container = containerRef?.current,
      target = container ?? window;
    const position = () =>
      Math.max(0, container ? container.scrollTop : window.scrollY);
    let previous = position(),
      anchor = previous,
      direction = 0,
      frame = 0;
    const update = () => {
      frame = 0;
      const next = position(),
        delta = next - previous;
      const nextDirection = Math.sign(delta);
      if (nextDirection !== direction) {
        anchor = previous;
        direction = nextDirection;
      }
      if (next < 16 || root.current?.contains(document.activeElement))
        setHidden(false);
      else if (Math.abs(next - anchor) >= Math.max(1, threshold)) {
        setHidden(nextDirection > 0);
        anchor = next;
      }
      setScrolled(next > 8);
      previous = next;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    target.addEventListener("scroll", scroll, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("scroll", scroll);
    };
  }, [containerRef, threshold]);
  return (
    <header
      {...props}
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      className={`mingu-smart-header ${className}`}
      data-hidden={hidden || undefined}
      data-scrolled={scrolled || undefined}
      onFocusCapture={(event) => {
        setHidden(false);
        onFocusCapture?.(event);
      }}
    >
      {children}
    </header>
  );
}
