"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./shared";

const defaultReactions = [
  { emoji: "❤️", label: "Love" },
  { emoji: "👍", label: "Like" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "🤔", label: "Thinking" },
  { emoji: "👀", label: "Eyes" },
];
export interface EmojiReactionProps {
  reactions?: readonly { emoji: string; label: string }[];
  onReact?: (emoji: string) => void;
}
export function EmojiReaction({
  reactions = defaultReactions,
  onReact,
}: EmojiReactionProps) {
  const [open, setOpen] = useState(false),
    [chosen, setChosen] = useState(""),
    [burst, setBurst] = useState(0);
  const root = useRef<HTMLDivElement>(null),
    button = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>("[data-reaction]")?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return (
    <div
      className="mi-reaction"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          button.current?.focus();
        }
        if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
          const buttons = Array.from(
            root.current?.querySelectorAll<HTMLButtonElement>(
              "[data-reaction]",
            ) ?? [],
          );
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          if (index >= 0) {
            event.preventDefault();
            buttons[
              (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
                buttons.length
            ]?.focus();
          }
        }
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            className="mi-reaction-picker"
            id={id}
            role="group"
            aria-label="Choose a reaction"
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
          >
            {reactions.map((reaction) => (
              <motion.button
                type="button"
                data-reaction
                key={reaction.label}
                aria-label={reaction.label}
                whileHover={{ scale: 1.35, y: -7 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setChosen(reaction.emoji);
                  setBurst((count) => count + 1);
                  setOpen(false);
                  onReact?.(reaction.emoji);
                  button.current?.focus();
                }}
              >
                {reaction.emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        ref={button}
        className="mi-reaction-trigger"
        aria-label={
          chosen ? `Reacted ${chosen}. Change reaction` : "Add reaction"
        }
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        {chosen || "☺"}
        <span>{chosen ? "Reacted" : "React"}</span>
      </button>
      {burst > 0 && (
        <span className="mi-reaction-burst" aria-hidden="true" key={burst}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{
                x: (i - 2) * 24,
                y: -90 - Math.abs(i - 2) * 10,
                opacity: 0,
                scale: 1.2,
                rotate: (i - 2) * 18,
              }}
              transition={{ duration: 1, ease: "easeOut", delay: i * 0.04 }}
            >
              {chosen}
            </motion.span>
          ))}
        </span>
      )}
      <span className="mru-sr-only" role="status">
        {chosen ? `Selected reaction: ${chosen}` : ""}
      </span>
    </div>
  );
}
export function NotificationBell({
  count = 0,
  onClick,
  label = "Notifications",
}: {
  count?: number;
  onClick?: () => void;
  label?: string;
}) {
  const [rings, setRings] = useState(0);
  const unread = Math.max(0, Math.floor(count));
  return (
    <button
      type="button"
      className="mi-notification"
      aria-label={`${label}, ${unread} unread`}
      onClick={() => {
        setRings((value) => value + 1);
        onClick?.();
      }}
    >
      <motion.span
        key={rings}
        className="mi-notification-icon"
        animate={{ rotate: rings ? [0, -19, 17, -12, 9, -4, 0] : 0 }}
        transition={{ duration: 0.65 }}
      >
        <Icon name="bell" size={31} />
      </motion.span>
      <AnimatePresence>
        {unread > 0 && (
          <motion.span
            className="mi-notification-badge"
            key={unread}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            {unread > 99 ? "99+" : unread}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
