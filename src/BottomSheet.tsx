"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Dialog, type DialogProps } from "./system/base";
export interface BottomSheetProps
  extends Omit<DialogProps, "motionOrigin" | "motion"> {
  snapPoints?: readonly number[];
  defaultSnap?: number;
  fitContent?: boolean;
}
export function BottomSheet({
  snapPoints = [0.4, 0.7, 0.92],
  defaultSnap,
  fitContent = true,
  children,
  className = "",
  ...props
}: BottomSheetProps) {
  const snaps = [
    ...new Set(
      snapPoints.filter(
        (point) => Number.isFinite(point) && point >= 0.2 && point <= 0.95,
      ),
    ),
  ].sort((a, b) => a - b);
  if (!snaps.length) snaps.push(0.5);
  const [height, setHeight] = useState(
    snaps[Math.max(0, Math.min(snaps.length - 1, defaultSnap ?? 1))],
  );
  const pointer = useRef<{
    id: number;
    y: number;
    height: number;
    fitting: boolean;
    ceiling: number;
  } | null>(null);
  const content = useRef<HTMLDivElement>(null),
    inner = useRef<HTMLDivElement>(null);
  const [resized, setResized] = useState(false),
    [natural, setNatural] = useState<number | null>(null),
    [viewport, setViewport] = useState(0);
  const fitting = fitContent && defaultSnap === undefined && !resized;
  const displayed =
    fitting && natural !== null && viewport > 0
      ? Math.min(height, natural / viewport)
      : height;
  useEffect(() => {
    if (props.open && fitContent && defaultSnap === undefined)
      setResized(false);
  }, [props.open, fitContent, defaultSnap]);
  useEffect(() => {
    const dialog = content.current?.closest("dialog"),
      body = inner.current,
      scroll = body?.parentElement;
    if (!dialog || !body || !scroll || !props.open) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setViewport(window.innerHeight);
      const styles = getComputedStyle(scroll);
      const height =
        body.getBoundingClientRect().height +
        dialog.getBoundingClientRect().height -
        scroll.getBoundingClientRect().height +
        parseFloat(styles.paddingTop) +
        parseFloat(styles.paddingBottom);
      setNatural((previous) =>
        previous !== null && Math.abs(previous - height) < 1
          ? previous
          : Math.ceil(height),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    observer.observe(dialog);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [props.open, props.description]);
  const index = snaps.reduce(
    (best, point, i) =>
      Math.abs(point - displayed) < Math.abs(snaps[best] - displayed)
        ? i
        : best,
    0,
  );
  useEffect(() => {
    const dialog = content.current?.closest("dialog");
    if (dialog)
      dialog.style.setProperty(
        "--mingu-sheet-height",
        fitting && natural !== null
          ? `min(${Math.round(height * 100)}dvh, ${natural}px)`
          : `${Math.round(height * 100)}dvh`,
      );
  }, [height, props.open, fitting, natural]);
  return (
    <Dialog
      {...props}
      motion="bottom"
      className={`mingu-bottom-sheet ${className}`}
    >
      <div ref={content} className="mingu-bottom-sheet-content">
        <div
          className="mingu-sheet-handle"
          role="slider"
          tabIndex={0}
          aria-label="Sheet height"
          aria-valuemin={Math.round(Math.min(snaps[0], displayed) * 100)}
          aria-valuemax={Math.round(snaps[snaps.length - 1] * 100)}
          aria-valuenow={Math.round(displayed * 100)}
          aria-valuetext={`${Math.round(displayed * 100)}% of viewport`}
          aria-orientation="vertical"
          onKeyDown={(event) => {
            const next =
              event.key === "ArrowUp" || event.key === "ArrowRight"
                ? snaps.findIndex((point) => point > displayed + 0.001) < 0
                  ? snaps.length - 1
                  : snaps.findIndex((point) => point > displayed + 0.001)
                : event.key === "ArrowDown" || event.key === "ArrowLeft"
                  ? snaps.reduce(
                      (best, point, i) =>
                        point < displayed - 0.001 ? i : best,
                      0,
                    )
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? snaps.length - 1
                      : null;
            if (next !== null) {
              event.preventDefault();
              setResized(true);
              setHeight(snaps[next]);
            }
          }}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.focus();
            setResized(true);
            setHeight(displayed);
            pointer.current = {
              id: event.pointerId,
              y: event.clientY,
              height: displayed,
              fitting,
              ceiling: height,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = pointer.current;
            if (start?.id === event.pointerId)
              setHeight(
                Math.max(
                  0.1,
                  Math.min(
                    snaps[snaps.length - 1],
                    start.height + (start.y - event.clientY) / innerHeight,
                  ),
                ),
              );
          }}
          onPointerUp={(event) => {
            if (pointer.current?.id !== event.pointerId) return;
            const start = pointer.current;
            pointer.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
            if (Math.abs(event.clientY - start.y) < 8) {
              setHeight(start.ceiling);
              setResized(!start.fitting);
              return;
            }
            if (height < snaps[0] - 0.08 && event.clientY - start.y > 50)
              props.onOpenChange(false);
            else setHeight(snaps[index]);
          }}
          onPointerCancel={() => {
            const start = pointer.current;
            pointer.current = null;
            if (start) {
              setHeight(start.ceiling);
              setResized(!start.fitting);
            }
          }}
          onLostPointerCapture={() => {
            const start = pointer.current;
            pointer.current = null;
            if (start) {
              setHeight(start.ceiling);
              setResized(!start.fitting);
            }
          }}
        >
          <span aria-hidden="true" />
        </div>
        <div className="mingu-sheet-scroll">
          <div ref={inner} className="mingu-sheet-inner">
            {children}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
