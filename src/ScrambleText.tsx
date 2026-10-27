"use client";
import { useReducedMotion } from "./motion-policy";

import * as React from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  type ComponentProps,
} from "react";

import { explorationMotion } from "./system/motion-tokens";

export interface ScrambleTextProps
  extends Omit<ComponentProps<"span">, "children"> {
  text: string;
  duration?: number;
  replayKey?: string | number;
  playOnMount?: boolean;
}
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%+=";
/** Transient glyphs are decorative; assistive technology always receives the final text. */
export function ScrambleText({
  text,
  duration = explorationMotion.scrambleDuration,
  replayKey = 0,
  playOnMount = true,
  className = "",
  onPointerEnter,
  ref,
  ...props
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const element = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => element.current!);
  const frame = useRef(0);
  const visible = useRef(false);
  const reduced = useReducedMotion();
  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setDisplay(text);
  }, [text]);
  const play = useCallback(() => {
    cancelAnimationFrame(frame.current);
    const bounds = element.current?.getBoundingClientRect();
    const inView =
      bounds &&
      bounds.bottom > 0 &&
      bounds.top < innerHeight &&
      bounds.right > 0 &&
      bounds.left < innerWidth;
    if (reduced || document.hidden || !inView) {
      setDisplay(text);
      return;
    }
    visible.current = true;
    const total = Math.max(
      100,
      Math.min(
        4000,
        Number.isFinite(duration)
          ? duration
          : explorationMotion.scrambleDuration,
      ),
    );
    let started = 0,
      last = 0;
    const letters = Array.from(text);
    const tick = (now: number) => {
      if (!started) started = now;
      const progress = Math.min(1, (now - started) / total);
      if (now - last >= explorationMotion.scrambleFrame || progress === 1) {
        last = now;
        const revealed = Math.ceil(progress * letters.length);
        setDisplay(
          letters
            .map((char, index) =>
              index < revealed || /\s/.test(char)
                ? char
                : alphabet[
                    (index * 13 + Math.floor(progress * 47)) % alphabet.length
                  ],
            )
            .join(""),
        );
      }
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else frame.current = 0;
    };
    frame.current = requestAnimationFrame(tick);
  }, [text, duration, reduced]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const wasVisible = visible.current;
      visible.current = !!entry?.isIntersecting;
      if (!visible.current) stop();
      else if (!wasVisible && playOnMount) play();
    });
    if (element.current) observer.observe(element.current);
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [play, stop, playOnMount]);
  useEffect(() => {
    play();
    return () => cancelAnimationFrame(frame.current);
  }, [replayKey, play]);
  return (
    <span
      {...props}
      ref={element}
      className={`mingu-scramble ${className}`}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented) play();
      }}
    >
      <span className="mingu-visually-hidden">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
