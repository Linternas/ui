"use client";
import { motion } from "./motion";

import * as React from "react";
import { useId, useRef, useState, type ReactNode } from "react";

import { useControllable } from "./shared";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
}
export interface SidebarProps {
  items: readonly NavigationItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
}
function Sidebar({
  items,
  value,
  defaultValue,
  onChange,
  label = "Navigation",
  variant,
}: SidebarProps & { variant: "bounce" | "hook" | "proximity" }) {
  const [selected, select] = useControllable(
    value,
    defaultValue ?? items[0]?.id ?? "",
    onChange,
  );
  const [nearest, setNearest] = useState(-1);
  const ref = useRef<HTMLElement>(null);
  const id = useId();
  return (
    <nav
      className={`mi-sidebar mi-sidebar-${variant}`}
      ref={ref}
      aria-label={label}
      onPointerMove={(event) => {
        if (variant !== "proximity") return;
        const buttons = ref.current?.querySelectorAll("button");
        let closest = -1,
          distance = Infinity;
        buttons?.forEach((button, index) => {
          const box = button.getBoundingClientRect();
          const next = Math.abs(event.clientY - (box.top + box.height / 2));
          if (next < distance) {
            distance = next;
            closest = index;
          }
        });
        setNearest(closest);
      }}
      onPointerLeave={() => setNearest(-1)}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={selected === item.id}
          onClick={() => select(item.id)}
          onFocus={() => setNearest(index)}
          onBlur={() => setNearest(-1)}
        >
          {selected === item.id && variant === "bounce" && (
            <motion.span
              className="mi-sidebar-active"
              layoutId={`${id}-active`}
              transition={{ type: "spring", stiffness: 380, damping: 23 }}
            />
          )}
          {variant === "hook" && (
            <span className="mi-sidebar-hook" aria-hidden="true">
              {selected === item.id && (
                <motion.svg
                  viewBox="0 0 22 40"
                  layoutId={`${id}-hook`}
                  transition={{ type: "spring", stiffness: 330, damping: 24 }}
                >
                  <path d="M1 0v9q0 11 11 11h7M12 14l7 6-7 6M1 40V31q0-11 11-11" />
                </motion.svg>
              )}
            </span>
          )}
          {variant === "proximity" && (
            <motion.span
              className="mi-proximity-dash"
              aria-hidden="true"
              animate={{
                width:
                  nearest < 0
                    ? selected === item.id
                      ? 22
                      : 10
                    : Math.max(10, 32 - Math.abs(nearest - index) * 9),
              }}
              transition={{ type: "spring", stiffness: 300, damping: 23 }}
            />
          )}
          {item.icon && <span className="mi-sidebar-icon">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
export function BounceSidebar(props: SidebarProps) {
  return <Sidebar {...props} variant="bounce" />;
}
export function HookSidebar(props: SidebarProps) {
  return <Sidebar {...props} variant="hook" />;
}
export function ProximitySidebar(props: SidebarProps) {
  return <Sidebar {...props} variant="proximity" />;
}
export function GooeyNav({
  items,
  value,
  defaultValue,
  onChange,
  label = "Page sections",
}: SidebarProps) {
  const [selected, select] = useControllable(
    value,
    defaultValue ?? items[0]?.id ?? "",
    onChange,
  );
  const id = useId();
  return (
    <nav className="mi-gooey" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={selected === item.id}
          onClick={() => select(item.id)}
        >
          {selected === item.id && (
            <motion.span
              className="mi-gooey-bubble"
              layoutId={`${id}-bubble`}
              transition={{ type: "spring", stiffness: 240, damping: 19 }}
            />
          )}
          <span>
            {item.icon}
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
