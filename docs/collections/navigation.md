# Navigation collection

Ten independent components use the host's semantic tokens. Import the components from the package root and load `system.css` plus `styles.css`. All take `className`, `style` and an accessible `label` where applicable. Data IDs must be unique and stable. These components provide presentation and callbacks; actual application routing and task work remain with the consumer.

## PageTransition

`pages: readonly TransitionPage[]` is required. Each page has `id`, `title`, optional `description`, `media`, `disabled`, and `content`. `value?: string | null`, `defaultValue?: string | null` (default `null`) and `onValueChange?(id: string | null)` manage list/detail selection. Use a route-derived `value` and update the router in `onValueChange` to synchronize application URLs; the component does not change browser history on its own. `backLabel` defaults to `All projects`.

The browser View Transition API connects each page's title and media between list and detail. Unsupported browsers and reduced motion update immediately. Native transition failures do not prevent the state update. Focus goes to the detail heading and returns to the previous project's button. Rapid navigation skips the old visual transition. Media should be decorative or static content, rather than interactive controls, because list items are buttons. Avoid nested interactive elements in titles and descriptions. Empty arrays show an empty state. The consumer must supply dimensions and accessible text for images.

## DynamicStatusIsland

`title: string` is required. `status` is `idle | working | success | error` (default `idle`), `detail?: ReactNode`, `progress?: number` (clamped 0–100), and `actions?: ReactNode` describe the real task. `open`, `defaultOpen` and `onOpenChange` control expansion; `disabled` disables its toggle. The status title announces changes politely; progress is native HTML. The component never invents task progress or runs tasks. Put cancel/retry controls in `actions`. Collapsing preserves task work owned by the consumer. Reduced motion removes the working glyph rotation.

## AnimatedMegaMenu

`items: readonly MegaMenuItem[]` is required. Each group has `id`, `label`, optional `description`, `disabled`, and `links`. A `MenuLink` has `id`, `label`, `href`, optional `description` and `disabled`. `value`, `defaultValue` (default `null`) and `onValueChange` select the open group's ID or `null`. Clicking a trigger toggles it. When a group is already open, a fine pointer entering another trigger switches it; touch uses clicks. Left/Right/Home/End move between enabled triggers. Down opens the group and focuses its first enabled link. Escape closes and returns focus; outside pointer input closes; links use normal anchors. This is disclosure navigation, not an ARIA application menu: native Tab navigation stays intact. Empty group links show an empty state.

## SortableGrid

`items: readonly SortableGridItem[]` is required. Each item has `id`, `label`, `content`, optional `disabled`. `order?: readonly string[]`, `defaultOrder?: readonly string[]`, and `onOrderChange?(ids: string[])` control order. Missing item IDs are appended; removed and duplicate order IDs are ignored. `minItemWidth` defaults to 140 CSS px, with a lower bound of 80, and the grid adapts to available width. `disabled` prevents all movement.

Drag the dedicated handle onto another cell to commit a reorder on release. Pointer cancellation leaves the order unchanged. Handles opt into touch gestures; the rest of a card preserves native page scrolling and interactive children. For keyboard operation, focus a handle and press Space or Enter to pick it up. Left/Right move one cell, Up/Down use the measured number of visible columns, Home/End move to the boundaries; Space, Enter or Escape finish. Changes are announced. Disabled source and target cells cannot be moved directly. The order callback is the source of truth for controlled consumers. Items are not virtualization; use appropriately sized collections. Empty arrays show an empty state.

## CardNavigation

`groups: readonly CardNavigationGroup[]` is required: each group has `id`, `title`, optional `description`, and `links` using `MenuLink`. `open`, `defaultOpen` and `onOpenChange` manage expansion; `triggerLabel` defaults to `Explore`; `disabled` disables the toggle. Links are native anchors; selection collapses. Escape collapses and returns focus to the toggle. Card entry stagger is bounded to a short per-card delay and removed for reduced motion. Empty groups show an empty state. No outside-click dismissal is imposed; this is inline navigation.

## ScrollStack

`items: readonly ScrollStackItem[]` is required: `id`, `title`, `content`. `top` defaults to 16 CSS px; `offset` defaults to 20 and is clamped 0–40 px. Cards use native sticky positioning and remain in document order; there is no wheel interception, fixed page locking or synthetic scroll. The nearest overflow ancestor naturally becomes the scroll container. Reduced motion makes the cards normal static articles. Keep the stack small enough that `top + index * offset` leaves useful vertical space. Avoid excessively tall cards; no component can make content taller than the viewport fully visible while it is sticky.

## StickyScrollStory

`steps: readonly StickyStoryStep[]` is required: `id`, `title`, `description: ReactNode`, `preview: ReactNode`. `value`, `defaultValue` and `onValueChange` manage the selected step, defaulting to the first. `scrollContainerRef?: RefObject<HTMLElement | null>` selects a stable overflow ancestor; omitted means the window. `top` defaults to 16 CSS px. The nearest step to 40% of the scroll viewport becomes active. Each step also has an explicit Show button, so selection does not require scrolling. Listeners and pending animation frames are cleaned up. At 767 CSS px and below, every preview is mounted beside its own text; on desktop only the selected preview is mounted in the sticky aside. A preview is never duplicated into both responsive positions. SSR starts with the single desktop preview and applies the viewport layout after hydration. Changing layouts remounts previews, so keep persistent interactive state in the consumer. Empty data shows an empty state.

## FooterReveal

`children: ReactNode` is page content; `footer: ReactNode` is the content to reveal. `footerLabel` defaults to `Site footer`. `disabled` opts out of the sticky reveal. The page content covers the native sticky footer as it scrolls away. Reduced motion uses normal document flow. Works in a normal page or an overflow container; no JavaScript scroll listeners or background animation. Keep the footer short enough to fit its scroll viewport. Focusable footer content remains in normal DOM order. While the footer contains focus it enters normal flow above the covering content, so keyboard navigation can reveal the actual focused control. The component renders `<footer>`, so do not nest another site footer landmark inside the `footer` prop.

## ScrollExpandMedia

`children: ReactNode` is the media (supply native image/video accessible text and dimensions). `caption?: ReactNode` renders a figcaption. `scrollContainerRef` selects a stable overflow ancestor, otherwise the window. `minScale` defaults to `.72` and is clamped `.3–1`; `borderRadius` defaults to 32 CSS px and shrinks to zero as the frame expands. Scroll and resize update a single frame; ResizeObserver handles content size changes and all work is cleaned up. Reduced motion uses the final full-size frame. The wrapper always preserves its layout footprint, so following content does not jump. This is a media frame, not a zoomable image viewer.

## CoverflowCarousel

`items: readonly CoverflowItem[]` is required: `id`, `title`, `content`, optional `disabled`. Disabled items are excluded from the browsable set. `value`, `defaultValue`, `onValueChange` select a stable ID. `loop` defaults to false; `disabled` prevents navigation. Previous/Next buttons represent real boundaries and disable for a single or empty set. Focus the stage for Left/Right/Home/End, or swipe horizontally more than 40 CSS px. Vertical touch scrolling and pinch zoom are preserved. Inactive slides are inert and hidden from the accessibility tree; current title and position announce politely. Reduced motion removes 3D rotation and transition interpolation while preserving selection. Avoid autoplay; it is intentionally absent. Slides can contain interactive content. Buttons, links, inputs, editable regions, common interactive ARIA roles, tabindex targets and `[data-carousel-native]` opt out of stage pointer capture and navigation keys, preserving their native click and keyboard behavior. Horizontal swipes should begin on noninteractive slide content or the stage.
