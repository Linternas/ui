"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  useReadingPosition,
  type ReadingPositionOptions,
} from "./useReadingPosition";

export function RailToc({
  sections,
  containerRef,
  offset,
  title = "On this page",
  className = "",
}: ReadingPositionOptions & { title?: string; className?: string }) {
  const { activeId, navigate } = useReadingPosition({
    sections,
    containerRef,
    offset,
  });
  const listRef = useRef<HTMLOListElement>(null);
  const titleId = useId();
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () =>
      setPoints(
        Array.from(list.querySelectorAll<HTMLElement>(":scope > li")).map(
          (item, index) => ({
            x: 7 + Math.max(0, Math.min(3, sections[index]?.depth ?? 0)) * 12,
            y: item.offsetTop + 17,
          }),
        ),
      );
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    measure();
    return () => observer.disconnect();
  }, [sections]);
  const currentIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  );
  const path = points
    .map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`)
    .join(" ");
  const current = points[currentIndex];
  if (!sections.length) return null;
  return (
    <nav className={`mru-toc ${className}`} aria-labelledby={titleId}>
      <p className="mru-toc-title" id={titleId}>
        {title}
      </p>
      <div className="mru-toc-layout">
        <svg
          className="mru-toc-rail"
          width="52"
          height="100%"
          aria-hidden="true"
        >
          <path d={path} className="mru-toc-track" />
          <path
            d={points
              .slice(0, currentIndex + 1)
              .map(
                (point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`,
              )
              .join(" ")}
            className="mru-toc-traveled"
          />
        </svg>
        {current && (
          <span
            className="mru-toc-cursor"
            aria-hidden="true"
            style={{
              transform: `translate(${current.x - 7}px, ${current.y - 7}px)`,
            }}
          >
            <svg viewBox="0 0 20 20" width="14" height="14">
              <path d="M2 3l16 7-16 7 3-7zM5 10h13" />
            </svg>
          </span>
        )}
        <ol ref={listRef} className="mru-toc-list">
          {sections.map((section, index) => (
            <li
              key={section.id}
              style={{
                paddingLeft:
                  24 + Math.max(0, Math.min(3, section.depth ?? 0)) * 12,
              }}
            >
              <a
                href={`#${encodeURIComponent(section.id)}`}
                aria-current={section.id === activeId ? "location" : undefined}
                data-passed={index < currentIndex || undefined}
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  event.preventDefault();
                  navigate(section.id);
                }}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
