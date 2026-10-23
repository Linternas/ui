import * as React from "react";

/** Decorative disclosure icon. Geometry is independent of the surrounding font. */
export function ChevronDown() {
  return (
    <svg
      className="mingu-disclosure-chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}
