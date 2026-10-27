import * as React from "react";
import type { CSSProperties } from "react";

/** Shared font-independent SVG paths. No icon font, runtime fetch or native dependency. */
const paths = {
  play: "M9 5l11 7-11 7z",
  pause: "M8 5v14M16 5v14",
  replay: "M4 10a8 8 0 1 1 1 8M4 4v6h6",
  check: "M5 12l4 4L19 6",
  close: "M6 6l12 12M18 6L6 18",
  bell: "M5 17h14l-2-4V9a5 5 0 0 0-10 0v4zM10 21h4",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6",
  edit: "M5 16l-1 4 4-1L20 7l-3-3z",
  search: "M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  chevron: "M6 9l6 6 6-6",
  "chevron-up": "M6 15l6-6 6 6",
  "chevron-left": "M15 5l-7 7 7 7",
  "chevron-right": "M9 5l7 7-7 7",
  "arrow-left": "M19 12H5m6-6-6 6 6 6",
  "arrow-right": "M5 12h14m-6-6 6 6-6 6",
  "arrow-up": "M12 19V5m-6 6 6-6 6 6",
  "arrow-down": "M12 5v14m-6-6 6 6 6-6",
  external: "M6 18 18 6M6 6h12v12",
  "arrow-up-left": "M18 18 6 6m0 12V6h12",
  "arrow-down-right": "M6 6l12 12M6 18h12V6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  sign: "M12 3v10M7 8h10M7 19h10",
  move: "M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4",
  swap: "M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4",
  sort: "M8 3v18m-4-4 4 4 4-4M16 21V3m-4 4 4-4 4 4",
  grip: "M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  "more-vertical": "M12 5h.01M12 12h.01M12 19h.01",
  undo: "M4 10h10a6 6 0 0 1 0 12M4 10l6-6M4 10l6 6",
  redo: "M20 10H10a6 6 0 0 0 0 12M20 10l-6-6M20 10l-6 6",
  loader: "M20 12a8 8 0 1 1-8-8",
  alert: "M12 4v10M12 19h.01",
  command:
    "M8 8V5a3 3 0 1 0-3 3h14a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H5a3 3 0 1 0 3 3V8",
  dot: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  circle: "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  square: "M5 5h14v14H5z",
  diamond: "m12 3 9 9-9 9-9-9z",
  sparkle: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  smile:
    "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0M8 14c2 3 6 3 8 0M8 9h.01M16 9h.01",
  upload: "M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5",
  enter: "M20 4v10H4m5-5-5 5 5 5",
  quote: "M4 7h6v7H4V7zm0 12c4 0 6-2 6-5M14 7h6v7h-6V7zm0 12c4 0 6-2 6-5",
  paragraph: "M14 4H9a5 5 0 0 0 0 10h5M14 4v17M19 4v17M10 4h11",
  code: "m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18",
  heading: "M5 4v16M19 4v16M5 12h14",
  document: "M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6",
  image: "M3 4h18v16H3zM3 16l5-5 5 5 3-3 5 5M16 8h.01",
  clock: "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0M12 7v5l3 2",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  settings:
    "M9 3h6l1 4 4 1v8l-4 1-1 4H9l-1-4-4-1V8l4-1zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
} as const;
export type IconName = keyof typeof paths;
export interface IconProps {
  name: IconName;
  size?: number | string;
  label?: string;
  style?: CSSProperties;
}
/** Decorative by default; label adds an accessible image name for standalone key hints. */
export function Icon({ name, size = 20, label, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "play" || name === "dot" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={
        name === "grip" || name === "more" || name === "more-vertical" ? 3 : 1.7
      }
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      style={{
        display: "inline-block",
        flexShrink: 0,
        verticalAlign: "-0.15em",
        ...style,
      }}
    >
      <path d={paths[name]} />
    </svg>
  );
}
