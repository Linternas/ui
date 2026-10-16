"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  useReadingPosition,
  type ReadingPositionOptions,
} from "./useReadingPosition";

export function ScrollProgress({
  sections,
  containerRef,
  offset,
  className = "",
}: ReadingPositionOptions & { className?: string }) {
  const { activeId, progress, navigate } = useReadingPosition({
    sections,
    containerRef,
    offset,
  });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const percent = Math.round(progress * 100);
  const active =
    sections.find((section) => section.id === activeId) ?? sections[0];
  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLAnchorElement>("nav a")?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div
      ref={rootRef}
      className={`mru-progress ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      {open && (
        <nav
          id={panelId}
          className="mru-progress-panel"
          aria-label="Jump to a section"
        >
          <p className="mru-toc-title">Jump to section</p>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${encodeURIComponent(section.id)}`}
              aria-current={section.id === activeId ? "location" : undefined}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                setOpen(false);
                navigate(section.id);
              }}
            >
              {section.label}
            </a>
          ))}
        </nav>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="mru-progress-toggle"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        disabled={!sections.length}
      >
        <svg
          className="mru-progress-ring"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="15" />
          <circle
            cx="18"
            cy="18"
            r="15"
            pathLength="100"
            strokeDasharray={`${percent} 100`}
          />
        </svg>
        <span className="mru-progress-label">
          {active?.label ?? "Reading progress"}
        </span>
        <span className="mru-progress-percent">{percent}%</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
        <span className="mru-sr-only">
          {" "}
          — {percent}% read, toggle section navigation
        </span>
      </button>
    </div>
  );
}
