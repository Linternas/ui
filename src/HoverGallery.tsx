"use client";
import * as React from "react";
import { useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { selectionSpring } from "./system/motion-tokens";
import { useControllable } from "./shared";
export interface HoverGalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description?: string;
  disabled?: boolean;
}
export interface HoverGalleryProps {
  items: readonly HoverGalleryItem[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}
export function HoverGallery({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  className = "",
}: HoverGalleryProps) {
  const [selected, select] = useControllable(
    value,
    defaultValue ?? items.find((i) => !i.disabled)?.id ?? "",
    onValueChange,
  );
  const active =
    items.find((i) => i.id === selected && !i.disabled) ??
    items.find((i) => !i.disabled);
  const reduced = useReducedMotion(),
    id = useId(),
    buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [failed, setFailed] = useState<Record<string, string>>({});
  const choose = (id: string) => {
    if (active?.id !== id) select(id);
  };
  return (
    <div
      className={`mingu-hover-gallery ${className}`}
      role="group"
      aria-label={label}
    >
      {items.map((item, index) => (
        <motion.button
          key={item.id}
          type="button"
          ref={(el) => {
            buttons.current[index] = el;
          }}
          className="mingu-hover-panel"
          disabled={item.disabled}
          aria-pressed={active?.id === item.id}
          aria-label={item.title}
          aria-describedby={item.description ? `${id}-${index}` : undefined}
          animate={{ flexGrow: active?.id === item.id ? 4 : 1 }}
          transition={reduced ? { duration: 0 } : selectionSpring}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse" && !item.disabled)
              choose(item.id);
          }}
          onFocus={() => choose(item.id)}
          onClick={() => choose(item.id)}
          onKeyDown={(event) => {
            const enabled = items.flatMap((i, n) => (i.disabled ? [] : [n]));
            const position = enabled.indexOf(index);
            const target =
              event.key === "Home"
                ? enabled[0]
                : event.key === "End"
                  ? enabled[enabled.length - 1]
                  : ["ArrowRight", "ArrowDown"].includes(event.key)
                    ? enabled[(position + 1) % enabled.length]
                    : ["ArrowLeft", "ArrowUp"].includes(event.key)
                      ? enabled[
                          (position - 1 + enabled.length) % enabled.length
                        ]
                      : undefined;
            if (target !== undefined) {
              event.preventDefault();
              buttons.current[target]?.focus();
            }
          }}
        >
          {failed[item.id] !== item.src && (
            <img
              src={item.src}
              alt={item.alt}
              draggable={false}
              onError={() => setFailed((v) => ({ ...v, [item.id]: item.src }))}
            />
          )}
          <span className="mingu-hover-caption">
            <strong>{item.title}</strong>
            {item.description && (
              <span id={`${id}-${index}`}>{item.description}</span>
            )}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
