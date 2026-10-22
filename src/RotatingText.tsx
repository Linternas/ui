"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "./system/base";
import { selectionSpring } from "./system/motion-tokens";
export interface RotatingTextProps {
  words: readonly string[];
  label?: string;
  interval?: number;
  autoPlay?: boolean;
  className?: string;
}
export function RotatingText({
  words,
  label,
  interval = 2400,
  autoPlay = true,
  className = "",
}: RotatingTextProps) {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [visible, setVisible] = useState(false),
    [background, setBackground] = useState(false);
  const root = useRef<HTMLSpanElement>(null),
    reduced = useReducedMotion();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false),
    );
    observer.observe(element);
    const refresh = () => setBackground(document.hidden);
    document.addEventListener("visibilitychange", refresh);
    refresh();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const stopped =
    !autoPlay ||
    paused ||
    hovered ||
    !visible ||
    background ||
    reduced ||
    words.length < 2;
  useEffect(() => {
    if (stopped) return;
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % words.length),
      Math.max(
        800,
        Math.min(10000, Number.isFinite(interval) ? interval : 2400),
      ),
    );
    return () => clearInterval(timer);
  }, [stopped, interval, words.length]);
  const current = reduced ? 0 : index % Math.max(1, words.length);
  return (
    <span
      ref={root}
      className={`mingu-rotating ${className}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <span className="mingu-visually-hidden">
        {label ?? words.join(" / ")}
      </span>
      <span className="mingu-rotating-slot" aria-hidden="true">
        {words.map((word, i) => (
          <span className="mingu-rotating-measure" key={i}>
            {word}
          </span>
        ))}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={current}
            className="mingu-rotating-word"
            initial={
              reduced ? false : { y: 12, opacity: 0, filter: "blur(4px)" }
            }
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{
              y: reduced ? 0 : -12,
              opacity: 0,
              filter: reduced ? "blur(0px)" : "blur(4px)",
            }}
            transition={reduced ? { duration: 0 } : selectionSpring}
          >
            {words[current] ?? ""}
          </motion.span>
        </AnimatePresence>
      </span>
      {autoPlay && words.length > 1 && !reduced && (
        <Button
          variant="ghost"
          size="sm"
          aria-label={paused ? "Play text rotation" : "Pause text rotation"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "▷" : "Ⅱ"}
        </Button>
      )}
    </span>
  );
}
