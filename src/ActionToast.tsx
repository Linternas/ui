"use client";
import { useReducedMotion } from "./motion-policy";

import { motion } from "./motion";

import { Icon as VectorIcon } from "./icons";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, useIsPresent } from "motion/react";
import { Button } from "./system/base";
import type { ToastMessage } from "./system/overlays";
import { selectionSpring } from "./system/motion-tokens";
export interface ActionToastMessage extends ToastMessage {
  action?: { label: string; onAction: () => void | Promise<void> };
  progress?: number;
  busy?: boolean;
}
export interface ActionToastProps {
  messages: readonly ActionToastMessage[];
  onDismiss: (id: string) => void;
  label?: string;
  placement?: "inline" | "bottom-right";
  className?: string;
}
function ActionToastRow({
  message,
  dismiss,
}: {
  message: ActionToastMessage;
  dismiss: () => void;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const alive = useRef(true),
    present = useIsPresent(),
    reduced = useReducedMotion();
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const action = async () => {
    if (!message.action || pending) return;
    setPending(true);
    setError("");
    try {
      await message.action.onAction();
    } catch {
      if (alive.current) setError("Action failed. Try again.");
    } finally {
      if (alive.current) setPending(false);
    }
  };
  return (
    <motion.div
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: reduced ? 0 : 24 }}
      transition={reduced ? { duration: 0 } : selectionSpring}
      inert={!present || undefined}
      aria-hidden={!present || undefined}
      aria-busy={pending || message.busy || undefined}
      className={`mingu-toast mingu-action-toast mingu-tone-${message.tone ?? "neutral"}`}
    >
      <div className="mingu-action-toast-copy">
        <strong>{message.title}</strong>
        {message.description && <p>{message.description}</p>}
        {message.progress !== undefined && (
          <progress
            aria-label={`${message.title} progress`}
            max={100}
            value={Math.max(0, Math.min(100, message.progress))}
          />
        )}
        {error && (
          <p role="alert" className="mingu-inline-error">
            {error}
          </p>
        )}
      </div>
      {message.action && (
        <Button
          size="sm"
          variant="outline"
          loading={pending}
          onClick={() => void action()}
        >
          {message.action.label}
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        aria-label={`Dismiss ${message.title}`}
        onClick={dismiss}
      >
        <VectorIcon name="close" size="1em" />
      </Button>
    </motion.div>
  );
}
export function ActionToast({
  messages,
  onDismiss,
  label = "Notifications",
  placement = "bottom-right",
  className = "",
}: ActionToastProps) {
  const region = useRef<HTMLElement>(null);
  return (
    <section
      ref={region}
      tabIndex={-1}
      aria-label={label}
      className={`mingu-action-toast-region ${className}`}
      data-placement={placement}
    >
      <span className="mingu-visually-hidden" role="status" aria-atomic="true">
        {messages.map((item) => item.title).join(". ")}
      </span>
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <ActionToastRow
            key={message.id}
            message={message}
            dismiss={() => {
              if (region.current?.contains(document.activeElement))
                region.current.focus({ preventScroll: true });
              onDismiss(message.id);
            }}
          />
        ))}
      </AnimatePresence>
    </section>
  );
}
