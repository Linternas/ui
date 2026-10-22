"use client";
import * as React from "react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { selectionSpring } from "./system/motion-tokens";

export interface RadialAction {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}
export interface RadialMenuProps {
  items: readonly RadialAction[];
  onSelect?: (id: string) => void;
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}
export function RadialMenu({
  items,
  onSelect,
  label = "Quick actions",
  icon = "+",
  disabled,
  className = "",
}: RadialMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const endFirst = useRef(false);
  const id = useId();
  const reduced = useReducedMotion();
  const close = (restore = false) => {
    setOpen(false);
    if (restore) trigger.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!open || disabled) {
      if (disabled) setOpen(false);
      return;
    }
    const buttons = menu.current?.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
    );
    const button = endFirst.current
      ? buttons?.[buttons.length - 1]
      : buttons?.[0];
    (button ?? menu.current)?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, disabled]);
  const navigate = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const buttons = Array.from(
      menu.current?.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ) ?? [],
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (index +
              (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) +
              buttons.length) %
            buttons.length;
    buttons[next]?.focus();
  };
  return (
    <div
      ref={root}
      className={`mingu-radial ${className}`}
      data-open={open || undefined}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <div className="mingu-radial-orbit" aria-hidden="true" />
      <button
        ref={trigger}
        type="button"
        className="mingu-radial-trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        disabled={disabled || !items.length}
        onClick={() => {
          endFirst.current = false;
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            endFirst.current = event.key === "ArrowUp";
            setOpen(true);
          }
        }}
      >
        <motion.span
          aria-hidden="true"
          animate={{ rotate: open && !reduced ? 45 : 0 }}
          transition={selectionSpring}
        >
          {icon}
        </motion.span>
      </button>
      {open && !disabled && (
        <div
          ref={menu}
          id={id}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={navigate}
        >
          {items.map((item, index) => {
            const angle = -Math.PI / 2 + (index / items.length) * Math.PI * 2;
            return (
              <div
                key={item.id}
                className="mingu-radial-slot"
                style={{
                  left: `${50 + Math.cos(angle) * 35}%`,
                  top: `${50 + Math.sin(angle) * 35}%`,
                }}
              >
                <motion.button
                  type="button"
                  role="menuitem"
                  className="mingu-radial-item"
                  aria-label={item.label}
                  disabled={item.disabled}
                  tabIndex={active === index ? 0 : -1}
                  initial={
                    reduced
                      ? false
                      : {
                          opacity: 0,
                          scale: 0.5,
                          x: -Math.cos(angle) * 40,
                          y: -Math.sin(angle) * 40,
                        }
                  }
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  transition={selectionSpring}
                  onFocus={() => setActive(index)}
                  onClick={() => {
                    close(true);
                    onSelect?.(item.id);
                  }}
                >
                  <span aria-hidden="true">{item.icon}</span>
                </motion.button>
                <span className="mingu-radial-label" aria-hidden="true">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
