"use client";
import { useReducedMotion } from "./motion-policy";

import { Icon as VectorIcon } from "./icons";

import * as React from "react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Button } from "./system/base";
export interface ImageLensProps {
  src: string;
  alt: string;
  zoom?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}
export function ImageLens({
  src,
  alt,
  zoom = 2.5,
  label = "Magnify image",
  className = "",
  style,
}: ImageLensProps) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false),
    [pinned, setPinned] = useState(false),
    [failed, setFailed] = useState(false),
    [position, setPosition] = useState({ x: 50, y: 50 });
  const reduced = useReducedMotion();
  const lens = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState({ width: 1, height: 1, lens: 1 });
  useEffect(() => {
    const measure = () => {
      if (root.current && lens.current)
        setSizes({
          width: root.current.clientWidth,
          height: root.current.clientHeight,
          lens: lens.current.offsetWidth,
        });
    };
    const observer = new ResizeObserver(measure);
    if (root.current) observer.observe(root.current);
    if (lens.current) observer.observe(lens.current);
    measure();
    return () => observer.disconnect();
  }, []);
  const factor = Math.max(1.5, Math.min(5, Number.isFinite(zoom) ? zoom : 2.5));
  const move = (x: number, y: number) => {
    const box = root.current?.getBoundingClientRect();
    if (box?.width && box.height)
      setPosition({
        x: Math.max(0, Math.min(100, ((x - box.left) / box.width) * 100)),
        y: Math.max(0, Math.min(100, ((y - box.top) / box.height) * 100)),
      });
  };
  return (
    <div className={`mingu-lens ${className}`} style={style}>
      <div
        ref={root}
        className="mingu-lens-image"
        data-active={((active || pinned) && !failed) || undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && !reduced) setActive(true);
        }}
        onPointerLeave={() => setActive(false)}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse" || pinned)
            move(event.clientX, event.clientY);
        }}
        onPointerDown={(event) => {
          if (pinned && event.button === 0) {
            event.currentTarget.setPointerCapture(event.pointerId);
            move(event.clientX, event.clientY);
          }
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => setActive(false)}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => setFailed(false)}
          onError={() => {
            setFailed(true);
            setActive(false);
            setPinned(false);
          }}
        />
        {!failed && (
          <div
            ref={lens}
            className="mingu-lens-window"
            aria-hidden="true"
            style={{
              left: Math.max(
                sizes.lens / 2,
                Math.min(
                  sizes.width - sizes.lens / 2,
                  (position.x / 100) * sizes.width,
                ),
              ),
              top: Math.max(
                sizes.lens / 2,
                Math.min(
                  sizes.height - sizes.lens / 2,
                  (position.y / 100) * sizes.height,
                ),
              ),
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width: sizes.width * factor,
                height: sizes.height * factor,
                maxWidth: "none",
                left: Math.max(
                  sizes.lens - sizes.width * factor,
                  Math.min(
                    0,
                    sizes.lens / 2 - (position.x / 100) * sizes.width * factor,
                  ),
                ),
                top: Math.max(
                  sizes.lens - sizes.height * factor,
                  Math.min(
                    0,
                    sizes.lens / 2 - (position.y / 100) * sizes.height * factor,
                  ),
                ),
              }}
            />
          </div>
        )}
      </div>
      <div className="mingu-lens-controls">
        <Button
          variant="outline"
          size="sm"
          aria-label={label}
          aria-pressed={pinned}
          disabled={failed}
          onClick={() => {
            setPinned(!pinned);
            setPosition({ x: 50, y: 50 });
          }}
        >
          {pinned ? "Close lens" : "Open lens"}
        </Button>
        {pinned && (
          <div
            role="group"
            aria-label="Lens position"
            onKeyDown={(event) => {
              const delta = event.shiftKey ? 10 : 5;
              if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  event.key,
                )
              ) {
                event.preventDefault();
                setPosition((p) => ({
                  x: Math.max(
                    0,
                    Math.min(
                      100,
                      p.x +
                        (event.key === "ArrowRight"
                          ? delta
                          : event.key === "ArrowLeft"
                            ? -delta
                            : 0),
                    ),
                  ),
                  y: Math.max(
                    0,
                    Math.min(
                      100,
                      p.y +
                        (event.key === "ArrowDown"
                          ? delta
                          : event.key === "ArrowUp"
                            ? -delta
                            : 0),
                    ),
                  ),
                }));
              }
              if (event.key === "Escape") {
                setPinned(false);
                root.current?.parentElement
                  ?.querySelector<HTMLButtonElement>("button")
                  ?.focus();
              }
            }}
          >
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move lens left"
              onClick={() =>
                setPosition((p) => ({ ...p, x: Math.max(0, p.x - 10) }))
              }
            >
              <VectorIcon name="arrow-left" size="1em" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move lens right"
              onClick={() =>
                setPosition((p) => ({ ...p, x: Math.min(100, p.x + 10) }))
              }
            >
              <VectorIcon name="arrow-right" size="1em" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move lens up"
              onClick={() =>
                setPosition((p) => ({ ...p, y: Math.max(0, p.y - 10) }))
              }
            >
              <VectorIcon name="arrow-up" size="1em" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move lens down"
              onClick={() =>
                setPosition((p) => ({ ...p, y: Math.min(100, p.y + 10) }))
              }
            >
              <VectorIcon name="arrow-down" size="1em" />
            </Button>
          </div>
        )}
      </div>
      {failed && (
        <p role="status" className="mingu-muted">
          Image could not be loaded.
        </p>
      )}
    </div>
  );
}
