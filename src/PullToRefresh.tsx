"use client";
import { Icon as VectorIcon } from "./icons";

import * as React from "react";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./system/base";
import { selectionSpring, mobileMotion } from "./system/motion-tokens";
import { nativeTouchTarget } from "./mobile-shared";
export interface PullToRefreshProps {
  label: string;
  children: ReactNode;
  onRefresh: (options: { signal: AbortSignal }) => void | Promise<void>;
  disabled?: boolean;
  scrollRef?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  labels?: {
    refresh?: string;
    pull?: string;
    release?: string;
    refreshing?: string;
    updated?: string;
    error?: string;
  };
}
export function PullToRefresh({
  label,
  children,
  onRefresh,
  disabled = false,
  scrollRef,
  className = "",
  style,
  labels,
}: PullToRefreshProps) {
  const scroll = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion(),
    mounted = useRef(false),
    controller = useRef<AbortController | null>(null),
    busy = useRef(false);
  useImperativeHandle(scrollRef, () => scroll.current!);
  const [distance, setDistance] = useState(0),
    [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const amount = useRef(0),
    gesture = useRef<{
      id: number;
      x: number;
      y: number;
      locked: boolean;
    } | null>(null);
  const reset = () => {
    amount.current = 0;
    setDistance(0);
    gesture.current = null;
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  const refresh = useCallback(async () => {
    if (disabled || busy.current) return;
    busy.current = true;
    reset();
    setStatus("busy");
    const abort = new AbortController();
    controller.current = abort;
    try {
      await onRefresh({ signal: abort.signal });
      if (mounted.current && !abort.signal.aborted) setStatus("done");
    } catch {
      if (mounted.current && !abort.signal.aborted) setStatus("error");
    } finally {
      busy.current = false;
      if (controller.current === abort) controller.current = null;
    }
  }, [disabled, onRefresh]);
  useEffect(() => {
    const element = scroll.current;
    if (!element) return;
    const start = (event: TouchEvent) => {
      reset();
      if (
        disabled ||
        busy.current ||
        event.touches.length !== 1 ||
        element.scrollTop > 0
      )
        return;
      const target = event.target as Element;
      if (target.closest(nativeTouchTarget)) return;
      for (
        let node = target;
        node && node !== element;
        node = node.parentElement!
      ) {
        if (
          node.scrollHeight > node.clientHeight &&
          /(auto|scroll)/.test(getComputedStyle(node).overflowY)
        )
          return;
      }
      const touch = event.touches[0];
      gesture.current = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        locked: false,
      };
    };
    const move = (event: TouchEvent) => {
      const initial = gesture.current;
      if (!initial) return;
      if (
        event.touches.length !== 1 ||
        disabled ||
        busy.current ||
        element.scrollTop > 0
      ) {
        reset();
        return;
      }
      const touch = Array.from(event.touches).find(
        (t) => t.identifier === initial.id,
      );
      if (!touch) {
        reset();
        return;
      }
      const dx = touch.clientX - initial.x,
        dy = touch.clientY - initial.y;
      if (!initial.locked) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < mobileMotion.axisSlop)
          return;
        if (dy <= 0 || Math.abs(dx) > dy) {
          reset();
          return;
        }
        initial.locked = true;
      }
      if (!event.cancelable) {
        reset();
        return;
      }
      event.preventDefault();
      amount.current = Math.min(
        mobileMotion.pullLimit,
        Math.max(0, dy * mobileMotion.pullResistance),
      );
      setDistance(amount.current);
    };
    const end = (event: TouchEvent) => {
      const initial = gesture.current;
      if (!initial) return;
      if (event.touches.length) {
        reset();
        return;
      }
      if (amount.current >= mobileMotion.pullThreshold) void refresh();
      else reset();
    };
    const cancel = () => reset();
    element.addEventListener("touchstart", start, { passive: true });
    element.addEventListener("touchmove", move, { passive: false });
    element.addEventListener("touchend", end);
    element.addEventListener("touchcancel", cancel);
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      element.removeEventListener("touchstart", start);
      element.removeEventListener("touchmove", move);
      element.removeEventListener("touchend", end);
      element.removeEventListener("touchcancel", cancel);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
      gesture.current = null;
      amount.current = 0;
    };
  }, [disabled, refresh]);
  useEffect(() => {
    if (disabled) reset();
  }, [disabled]);
  const ready = distance >= mobileMotion.pullThreshold;
  const message =
    status === "busy"
      ? (labels?.refreshing ?? "Refreshing…")
      : status === "error"
        ? (labels?.error ?? "Could not refresh. Try again.")
        : status === "done"
          ? (labels?.updated ?? "Updated")
          : "";
  return (
    <div className={`mingu-pull ${className}`} style={style}>
      <div className="mingu-pull-header">
        <span>{label}</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          loading={status === "busy"}
          onClick={() => void refresh()}
        >
          {labels?.refresh ?? "Refresh"}
          <span aria-hidden="true">
            <VectorIcon name="replay" size="1em" />
          </span>
        </Button>
      </div>
      <div
        ref={scroll}
        className="mingu-pull-scroll"
        role="region"
        aria-label={label}
        tabIndex={0}
        aria-busy={status === "busy" || undefined}
      >
        <motion.div
          className="mingu-pull-indicator"
          aria-hidden="true"
          data-ready={ready || undefined}
          animate={{ height: distance }}
          transition={
            reduced || gesture.current ? { duration: 0 } : selectionSpring
          }
        >
          <span
            style={{
              transform: `rotate(${Math.min(180, (distance / mobileMotion.pullThreshold) * 180)}deg)`,
            }}
          >
            <VectorIcon name="arrow-down" size="1em" />
          </span>
          <span>
            {ready
              ? (labels?.release ?? "Release to refresh")
              : (labels?.pull ?? "Pull to refresh")}
          </span>
        </motion.div>
        <div className="mingu-pull-content">{children}</div>
      </div>
      <p
        className={
          status === "error"
            ? "mingu-field-error mingu-pull-status"
            : "mingu-pull-status"
        }
        role="status"
      >
        {message}
      </p>
    </div>
  );
}
