# Global Web motion policy — 2026-10-27

Version 0.27.0 adds `motion="system" | "full" | "reduced"` to `DesignSystemProvider` and `InteractionProvider`. The library defaults to `system`. A nested provider inherits its parent when omitted; an explicit `system` follows the OS independently. `useMotionSettings()` exposes the effective policy to consumers. The standalone catalog opts into `full` in its actual app Root.

## Changes and checks

- A reactive shared policy replaces direct OS reads in Mingu components. Changing OS preferences or provider props does not require remounting the application. The input DOM node and draft survive all policy transitions.
- Motion elements, Canvas rendering, CSS reductions, pointer effects, ripple creation and reading navigation share the same policy. Nested CSS boundaries use native `@scope`; full/reduced/system regions do not override each other. `InteractionProvider` adds one layout-neutral `display: contents` boundary; DesignSystemProvider retains its existing div.
- The internal Motion adapter bypasses the dependency's mount-time reduced-motion cache and supplies current transitions/layout options without changing component identities. Reorder keeps the layout measurements needed for dragging while its reduced transition is immediate.
- Paused, disabled, hidden/offscreen and touch rules remain active. The isolated sandbox's user-authored code keeps its own behavior.

Passed:

- Web/Native typechecks, strict consumer declarations (including the new Web policy types) and docs typecheck.
- Final full browser regression: 288 passed, including six motion-policy tests for nesting, OS changes, Canvas, actual catalog Root and reordered layout recovery. The transition tests preserve the same input DOM node and draft.
- SSR: 80 public collection exports and both providers in all three modes, without window or matchMedia.
- Production build and both docs HTTP/inventory tests. The initial sandbox run could not bind a local port; the same HTTP tests passed with local port access.

## Production build verification

Chrome on macOS, 1440px/light and 390px/dark. Windows user agent and `prefers-reduced-motion: reduce` were emulated; this is not an actual Windows browser run. The user reported their Windows diagnostic as reduced=true with working requestAnimationFrame and Web Animations; these are separate observations.

Both production viewport checks found:

- OS reduction: true; catalog policy: full.
- Landing Canvas pixels changed over time, with its pause action enabled.
- Hovering Projects enlarged the real Dock button to scale 1.6.
- Skeleton retained its `mingu-pulse` CSS animation.
- No page errors occurred.

[Measured results](./motion-policy-2026-10-27/results.json)

| Screen                              | Capture                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Landing, full under OS reduction    | [1440px](./motion-policy-2026-10-27/catalog-full-1440.png) · [390px](./motion-policy-2026-10-27/catalog-full-390.png) |
| Dock hover, full under OS reduction | [1440px](./motion-policy-2026-10-27/dock-full-1440.png) · [390px](./motion-policy-2026-10-27/dock-full-390.png)       |

Native implementation and consuming apps were not changed. This pass verifies the Web provider API and catalog build; it does not claim a completed Railway deployment or native-device motion validation.
