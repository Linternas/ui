"use client";
import * as React from "react";
import { useState, type ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { selectionSpring } from "./system/motion-tokens";
export interface DirectionalCardProps
  extends Omit<ComponentProps<"a">, "children" | "title"> {
  title: string;
  description?: string;
  image: { src: string; alt: string };
}
export function DirectionalCard({
  title,
  description,
  image,
  className = "",
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: DirectionalCardProps) {
  const [visible, setVisible] = useState(false),
    [edge, setEdge] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  return (
    <a
      {...props}
      className={`mingu-directional ${className}`}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.defaultPrevented || event.pointerType === "touch") return;
        const box = event.currentTarget.getBoundingClientRect(),
          x = (event.clientX - box.left) / box.width,
          y = (event.clientY - box.top) / box.height;
        const distances = [x, 1 - x, y, 1 - y];
        const direction = distances.indexOf(Math.min(...distances));
        setEdge(
          direction === 0
            ? { x: -100, y: 0 }
            : direction === 1
              ? { x: 100, y: 0 }
              : direction === 2
                ? { x: 0, y: -100 }
                : { x: 0, y: 100 },
        );
        setVisible(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (
          !event.defaultPrevented &&
          !event.currentTarget.matches(":focus-visible")
        )
          setVisible(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) {
          setEdge({ x: 0, y: 0 });
          setVisible(true);
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.defaultPrevented) setVisible(false);
      }}
    >
      <img src={image.src} alt={image.alt} draggable={false} />
      <motion.span
        key={`${edge.x}-${edge.y}`}
        aria-hidden="true"
        className="mingu-directional-wash"
        initial={
          reduced ? false : { x: `${edge.x}%`, y: `${edge.y}%`, opacity: 0 }
        }
        animate={{
          x: visible || reduced ? "0%" : `${edge.x}%`,
          y: visible || reduced ? "0%" : `${edge.y}%`,
          opacity: visible || reduced ? 1 : 0,
        }}
        transition={reduced ? { duration: 0 } : selectionSpring}
      />
      <span className="mingu-directional-copy">
        <strong>{title}</strong>
        {description && <span>{description}</span>}
        <span aria-hidden="true">↗</span>
      </span>
    </a>
  );
}
