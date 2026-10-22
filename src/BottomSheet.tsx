"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Dialog, type DialogProps } from "./system/base";
export interface BottomSheetProps
  extends Omit<DialogProps, "motionOrigin" | "motion"> {
  snapPoints?: readonly number[];
  defaultSnap?: number;
}
export function BottomSheet({
  snapPoints = [0.4, 0.7, 0.92],
  defaultSnap = 1,
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
    snaps[Math.max(0, Math.min(snaps.length - 1, defaultSnap))],
  );
  const pointer = useRef<{ id: number; y: number; height: number } | null>(
    null,
  );
  const content = useRef<HTMLDivElement>(null);
  const index = snaps.reduce(
    (best, point, i) =>
      Math.abs(point - height) < Math.abs(snaps[best] - height) ? i : best,
    0,
  );
  useEffect(() => {
    const dialog = content.current?.closest("dialog");
    if (dialog)
      dialog.style.setProperty(
        "--mingu-sheet-height",
        `${Math.round(height * 100)}dvh`,
      );
  }, [height, props.open]);
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
          aria-valuemin={Math.round(snaps[0] * 100)}
          aria-valuemax={Math.round(snaps[snaps.length - 1] * 100)}
          aria-valuenow={Math.round(height * 100)}
          aria-valuetext={`${Math.round(height * 100)}% of viewport`}
          aria-orientation="vertical"
          onKeyDown={(event) => {
            const next =
              event.key === "ArrowUp" || event.key === "ArrowRight"
                ? Math.min(snaps.length - 1, index + 1)
                : event.key === "ArrowDown" || event.key === "ArrowLeft"
                  ? Math.max(0, index - 1)
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? snaps.length - 1
                      : null;
            if (next !== null) {
              event.preventDefault();
              setHeight(snaps[next]);
            }
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.focus();
            pointer.current = { id: event.pointerId, y: event.clientY, height };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = pointer.current;
            if (start?.id === event.pointerId)
              setHeight(
                Math.max(
                  0.1,
                  Math.min(
                    0.95,
                    start.height + (start.y - event.clientY) / innerHeight,
                  ),
                ),
              );
          }}
          onPointerUp={(event) => {
            if (pointer.current?.id !== event.pointerId) return;
            pointer.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
            if (height < snaps[0] - 0.08) props.onOpenChange(false);
            else setHeight(snaps[index]);
          }}
          onPointerCancel={() => {
            pointer.current = null;
            setHeight(snaps[index]);
          }}
          onLostPointerCapture={() => {
            if (pointer.current) setHeight(snaps[index]);
            pointer.current = null;
          }}
        >
          <span aria-hidden="true" />
        </div>
        <div className="mingu-sheet-scroll">{children}</div>
      </div>
    </Dialog>
  );
}
