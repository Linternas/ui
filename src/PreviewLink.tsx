"use client";
import * as React from "react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { motion, useSpring, useReducedMotion } from "motion/react";
import { previewSpring, gestureMotion } from "./system/motion-tokens";

export interface LinkPreview {
  src: string;
  title?: string;
  description?: string;
  alt?: string;
}
export interface PreviewLinkProps extends ComponentProps<"a"> {
  preview: LinkPreview;
}
export function PreviewLink({
  preview,
  children,
  className = "",
  ref,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: PreviewLinkProps) {
  const card = useRef<HTMLSpanElement>(null);
  const anchor = useRef<HTMLAnchorElement>(null);
  const point = useRef({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const x = useSpring(0, previewSpring),
    y = useSpring(0, previewSpring);
  const place = (immediate = false) => {
    const element = card.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    const gap = gestureMotion.previewGap;
    const left = Math.max(
      gap,
      Math.min(point.current.x + gap, window.innerWidth - width - gap),
    );
    const top = Math.max(
      gap,
      Math.min(
        point.current.y + gap + height > window.innerHeight - gap
          ? point.current.y - height - gap
          : point.current.y + gap,
        window.innerHeight - height - gap,
      ),
    );
    if (immediate || reduced) {
      x.jump(left);
      y.jump(top);
    } else {
      x.set(left);
      y.set(top);
    }
  };
  useEffect(() => {
    const element = card.current;
    if (!element) return;
    if (!open) {
      if (element.matches(":popover-open")) element.hidePopover();
      return;
    }
    element.showPopover();
    place(true);
    const boundsAtOpen = anchor.current?.getBoundingClientRect();
    const dismiss = () => setOpen(false);
    const scroll = () => {
      const bounds = anchor.current?.getBoundingClientRect();
      // Focus can scroll its target into view before a deferred scroll event arrives.
      if (
        !bounds ||
        !boundsAtOpen ||
        Math.abs(bounds.x - boundsAtOpen.x) > 0.5 ||
        Math.abs(bounds.y - boundsAtOpen.y) > 0.5
      )
        dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", dismiss);
      document.removeEventListener("keydown", escape);
      if (element.matches(":popover-open")) element.hidePopover();
    };
  }, [open, reduced]);
  return (
    <a
      {...props}
      ref={(node) => {
        anchor.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      className={`mingu-preview-link ${className}`}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented && event.pointerType !== "touch") {
          point.current = { x: event.clientX, y: event.clientY };
          setOpen(true);
        }
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!event.defaultPrevented && event.pointerType !== "touch") {
          point.current = { x: event.clientX, y: event.clientY };
          if (open) place();
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) {
          const bounds = event.currentTarget.getBoundingClientRect();
          point.current = { x: bounds.left, y: bounds.bottom };
          setOpen(true);
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      onKeyDown={onKeyDown}
    >
      {children}
      <motion.span
        ref={card}
        popover="manual"
        inert
        aria-hidden="true"
        className="mingu-link-preview"
        style={{ x, y }}
      >
        <img
          src={preview.src}
          alt={preview.alt ?? ""}
          onLoad={() => {
            if (open) place(true);
          }}
        />
        {(preview.title || preview.description) && (
          <span className="mingu-link-preview-copy">
            {preview.title && <strong>{preview.title}</strong>}
            {preview.description && <span>{preview.description}</span>}
          </span>
        )}
      </motion.span>
    </a>
  );
}
