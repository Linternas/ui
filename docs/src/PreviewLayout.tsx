import type { ReactNode } from "react";

// Presentation belongs to the preview, not to the reusable component's layout.
const centered = new Set([
  "emoji-reaction",
  "notification-bell",
  "delete-button",
  "duration-picker",
  "gooey-nav",
  "breadcrumbs",
  "radio-group",
  "switch",
  "checkbox",
  "button-group",
  "segmented-control",
  "bottom-sheet",
  "pagination",
  "navigation",
  "tabs",
  "dialog",
  "alert-dialog",
  "drawer",
  "popover",
  "dropdown-menu",
  "toast",
  "card-navigation",
]);

export default function PreviewLayout({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return centered.has(id) ? (
    <div className="ui-preview-centered">{children}</div>
  ) : (
    children
  );
}
