"use client";
import * as React from "react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { Button } from "../system/base";

type Shell = { className?: string; style?: CSSProperties; label?: string };
function useValue<T>(
  value: T | undefined,
  initial: T,
  change?: (value: T) => void,
): [T, (value: T) => void] {
  const [local, setLocal] = useState(initial);
  const live = useRef({ value, change });
  live.current = { value, change };
  const update = useCallback((next: T) => {
    if (live.current.value === undefined) setLocal(next);
    live.current.change?.(next);
  }, []);
  return [value === undefined ? local : value, update];
}
function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);
  return reduced;
}
function classes(base: string, extra?: string) {
  return `mingu-collection-${base}${extra ? ` ${extra}` : ""}`;
}

function isCarouselNativeTarget(
  target: EventTarget | null,
  stage: HTMLElement,
) {
  if (!(target instanceof Element) || target === stage) return false;
  const native = target.closest(
    'a,button,input,textarea,select,summary,audio,video,[contenteditable]:not([contenteditable="false"]),[tabindex],[role="button"],[role="link"],[role="textbox"],[role="combobox"],[role="slider"],[role="spinbutton"],[role="checkbox"],[role="radio"],[role="switch"],[role="tab"],[role="menuitem"],[role="listbox"],[data-carousel-native]',
  );
  return !!native && native !== stage && stage.contains(native);
}

export interface TransitionPage {
  id: string;
  title: string;
  description?: string;
  media?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}
export interface PageTransitionProps extends Shell {
  pages: readonly TransitionPage[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  backLabel?: string;
}
/** A shared-element list/detail state transition. Routing remains owned by the consumer. */
export function PageTransition({
  pages,
  value,
  defaultValue = null,
  onValueChange,
  backLabel = "All projects",
  label = "Projects",
  className,
  style,
}: PageTransitionProps) {
  const [selected, setSelected] = useValue(value, defaultValue, onValueChange),
    reduced = useReduced(),
    unique = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null),
    previous = useRef<string | null>(null),
    transition = useRef<{
      finished: Promise<void>;
      skipTransition(): void;
    } | null>(null);
  const page = pages.find((p) => p.id === selected);
  const selectedId = page?.id ?? null;
  useEffect(() => () => transition.current?.skipTransition(), []);
  function navigate(id: string | null) {
    transition.current?.skipTransition();
    previous.current = selectedId;
    const update = () => flushSync(() => setSelected(id));
    const doc = document as Document & {
      startViewTransition?: (update: () => void) => {
        finished: Promise<void>;
        skipTransition(): void;
      };
    };
    if (!reduced && doc.startViewTransition) {
      try {
        const current = doc.startViewTransition(update);
        transition.current = current;
        current.finished
          .catch(() => {})
          .finally(() => {
            if (transition.current === current) transition.current = null;
          });
      } catch {
        update();
      }
    } else update();
  }
  useEffect(() => {
    if (previous.current === selectedId) return;
    const target = selectedId
      ? root.current?.querySelector<HTMLElement>("[data-page-heading]")
      : root.current?.querySelector<HTMLElement>(
          `[data-page-id="${CSS.escape(previous.current ?? "")}"]`,
        );
    target?.focus({ preventScroll: true });
  }, [selectedId]);
  return (
    <div
      ref={root}
      className={classes("page-transition", className)}
      style={style}
      aria-label={label}
    >
      {page ? (
        <article>
          <Button variant="ghost" onClick={() => navigate(null)}>
            ← {backLabel}
          </Button>
          <div
            className="mingu-collection-page-hero"
            style={{
              viewTransitionName: `${unique}-media-${pages.indexOf(page)}`,
            }}
          >
            {page.media}
          </div>
          <h3
            tabIndex={-1}
            data-page-heading
            style={{
              viewTransitionName: `${unique}-title-${pages.indexOf(page)}`,
            }}
          >
            {page.title}
          </h3>
          {page.description && <p>{page.description}</p>}
          <div>{page.content}</div>
        </article>
      ) : (
        <div className="mingu-collection-page-grid">
          {pages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              disabled={p.disabled}
              data-page-id={p.id}
              className="mingu-collection-project"
              onClick={() => navigate(p.id)}
            >
              <span
                className="mingu-collection-page-hero"
                style={{ viewTransitionName: `${unique}-media-${i}` }}
              >
                {p.media}
              </span>
              <strong style={{ viewTransitionName: `${unique}-title-${i}` }}>
                {p.title}
              </strong>
              {p.description && <span>{p.description}</span>}
              <span aria-hidden="true">Explore ↗</span>
            </button>
          ))}
          {!pages.length && <p>No projects yet.</p>}
        </div>
      )}
    </div>
  );
}

export interface DynamicStatusIslandProps extends Shell {
  status?: "idle" | "working" | "success" | "error";
  title: string;
  detail?: ReactNode;
  progress?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  actions?: ReactNode;
  disabled?: boolean;
}
export function DynamicStatusIsland({
  status = "idle",
  title,
  detail,
  progress,
  open,
  defaultOpen = false,
  onOpenChange,
  actions,
  disabled,
  label = "Task status",
  className,
  style,
}: DynamicStatusIslandProps) {
  const [expanded, setExpanded] = useValue(open, defaultOpen, onOpenChange),
    id = useId();
  return (
    <section
      className={classes("status-island", className)}
      data-expanded={expanded}
      data-status={status}
      style={style}
      aria-label={label}
    >
      <button
        type="button"
        className="mingu-collection-island-trigger"
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="mingu-collection-island-dot" aria-hidden="true">
          {status === "success"
            ? "✓"
            : status === "error"
              ? "!"
              : status === "working"
                ? "◌"
                : "·"}
        </span>
        <span aria-live="polite">{title}</span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div
        id={id}
        hidden={!expanded}
        className="mingu-collection-island-detail"
      >
        {detail && <div>{detail}</div>}
        {typeof progress === "number" && (
          <label className="mingu-collection-island-progress">
            Progress{" "}
            <progress max={100} value={Math.max(0, Math.min(100, progress))} />
            <span>{Math.round(Math.max(0, Math.min(100, progress)))}%</span>
          </label>
        )}
        {actions && (
          <div className="mingu-collection-nav-actions">{actions}</div>
        )}
      </div>
    </section>
  );
}

export interface MenuLink {
  id: string;
  label: string;
  href: string;
  description?: string;
  disabled?: boolean;
}
export interface MegaMenuItem {
  id: string;
  label: string;
  description?: string;
  links: readonly MenuLink[];
  disabled?: boolean;
}
export interface AnimatedMegaMenuProps extends Shell {
  items: readonly MegaMenuItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}
export function AnimatedMegaMenu({
  items,
  value,
  defaultValue = null,
  onValueChange,
  label = "Main navigation",
  className,
  style,
}: AnimatedMegaMenuProps) {
  const [selected, setSelected] = useValue(value, defaultValue, onValueChange),
    root = useRef<HTMLElement>(null),
    triggers = useRef(new Map<string, HTMLButtonElement>()),
    uid = useId();
  const item = items.find((i) => i.id === selected && !i.disabled);
  useEffect(() => {
    if (!item) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setSelected(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [item?.id]);
  return (
    <nav
      ref={root}
      className={classes("mega-menu", className)}
      style={style}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Escape" && item) {
          e.preventDefault();
          setSelected(null);
          triggers.current.get(item.id)?.focus();
        }
      }}
    >
      <div className="mingu-collection-menu-triggers">
        {items.map((i, n) => (
          <Button
            key={i.id}
            variant="ghost"
            disabled={i.disabled}
            ref={(node) => {
              if (node) triggers.current.set(i.id, node);
              else triggers.current.delete(i.id);
            }}
            aria-expanded={item?.id === i.id}
            aria-controls={`${uid}-panel`}
            onClick={() => setSelected(item?.id === i.id ? null : i.id)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse" && item && !i.disabled)
                setSelected(i.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected(i.id);
                requestAnimationFrame(() =>
                  root.current
                    ?.querySelector<HTMLAnchorElement>("[data-mega-link]")
                    ?.focus(),
                );
              }
              if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const enabled = items.filter((x) => !x.disabled),
                  index = enabled.findIndex((x) => x.id === i.id);
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? enabled.length - 1
                      : (index +
                          (e.key === "ArrowRight" ? 1 : -1) +
                          enabled.length) %
                        enabled.length;
                triggers.current.get(enabled[next]?.id)?.focus();
              }
            }}
          >
            {i.label}
            <span aria-hidden="true">⌄</span>
          </Button>
        ))}
      </div>
      <div
        id={`${uid}-panel`}
        hidden={!item}
        className="mingu-collection-mega-panel"
      >
        {item && (
          <div key={item.id} className="mingu-collection-mega-content">
            <div>
              <strong>{item.label}</strong>
              {item.description && <p>{item.description}</p>}
            </div>
            <div className="mingu-collection-mega-links">
              {item.links.map((link) =>
                link.disabled ? (
                  <span key={link.id} aria-disabled="true">
                    {link.label}
                    <small>{link.description}</small>
                  </span>
                ) : (
                  <a
                    data-mega-link
                    key={link.id}
                    href={link.href}
                    onClick={() => setSelected(null)}
                  >
                    {link.label}
                    <small>{link.description}</small>
                    <span aria-hidden="true">↗</span>
                  </a>
                ),
              )}
              {!item.links.length && <p>No links available.</p>}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export interface SortableGridItem {
  id: string;
  content: ReactNode;
  label: string;
  disabled?: boolean;
}
export interface SortableGridProps extends Shell {
  items: readonly SortableGridItem[];
  order?: readonly string[];
  defaultOrder?: readonly string[];
  onOrderChange?: (order: string[]) => void;
  minItemWidth?: number;
  disabled?: boolean;
}
export function SortableGrid({
  items,
  order,
  defaultOrder,
  onOrderChange,
  minItemWidth = 140,
  disabled,
  label = "Reorder items",
  className,
  style,
}: SortableGridProps) {
  const [ids, setIds] = useValue<readonly string[]>(
      order,
      defaultOrder ?? items.map((i) => i.id),
      onOrderChange as ((ids: readonly string[]) => void) | undefined,
    ),
    [lifted, setLifted] = useState<string | null>(null),
    [message, setMessage] = useState(""),
    root = useRef<HTMLDivElement>(null),
    drag = useRef<{ id: string; pointer: number; over: string | null } | null>(
      null,
    ),
    live = useRef(ids);
  const lookup = new Map(items.map((i) => [i.id, i])),
    sorted = [
      ...ids.filter((id, i) => lookup.has(id) && ids.indexOf(id) === i),
      ...items.filter((i) => !ids.includes(i.id)).map((i) => i.id),
    ];
  live.current = sorted;
  function move(id: string, target: string) {
    const next = [...live.current],
      from = next.indexOf(id),
      to = next.indexOf(target);
    if (from < 0 || to < 0 || from === to || lookup.get(target)?.disabled)
      return;
    next.splice(from, 1);
    next.splice(to, 0, id);
    live.current = next;
    setIds(next);
    setMessage(
      `${lookup.get(id)?.label} moved to position ${to + 1} of ${next.length}.`,
    );
  }
  function columns() {
    const cells = root.current?.querySelectorAll<HTMLElement>(
      "[data-sort-grid-item]",
    );
    if (!cells?.length) return 1;
    const top = cells[0].getBoundingClientRect().top;
    return (
      Array.from(cells).filter(
        (c) => Math.abs(c.getBoundingClientRect().top - top) < 3,
      ).length || 1
    );
  }
  function finish(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    if (d.over) move(d.id, d.over);
    drag.current = null;
    setLifted(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  return (
    <div className={classes("sortable", className)} style={style}>
      <p className="mingu-collection-hint">
        Drag a handle, or focus it and press Space, then arrows to move. Escape
        finishes.
      </p>
      <div
        ref={root}
        className="mingu-collection-sort-grid"
        role="group"
        aria-label={label}
        style={{
          gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${Math.max(80, minItemWidth)}px),1fr))`,
        }}
      >
        {sorted.map((id) => {
          const item = lookup.get(id)!;
          return (
            <div
              key={id}
              data-sort-grid-item={id}
              data-lifted={lifted === id}
              className="mingu-collection-sort-cell"
            >
              <Button
                variant="ghost"
                aria-label={`Move ${item.label}`}
                disabled={disabled || item.disabled}
                aria-pressed={lifted === id}
                className="mingu-collection-sort-grip"
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  drag.current = { id, pointer: e.pointerId, over: null };
                  setLifted(id);
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (drag.current?.pointer !== e.pointerId) return;
                  const target = document
                    .elementFromPoint(e.clientX, e.clientY)
                    ?.closest<HTMLElement>("[data-sort-grid-item]");
                  if (target && root.current?.contains(target))
                    drag.current.over = target.dataset.sortGridItem ?? null;
                }}
                onPointerUp={finish}
                onPointerCancel={(e) => {
                  drag.current = null;
                  setLifted(null);
                  if (e.currentTarget.hasPointerCapture(e.pointerId))
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setLifted(lifted === id ? null : id);
                    setMessage(
                      lifted === id
                        ? "Reordering finished."
                        : `${item.label} picked up.`,
                    );
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setLifted(null);
                    setMessage("Reordering finished.");
                  } else if (
                    lifted === id &&
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "Home",
                      "End",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                    const current = live.current.indexOf(id),
                      delta =
                        e.key === "ArrowLeft"
                          ? -1
                          : e.key === "ArrowRight"
                            ? 1
                            : e.key === "ArrowUp"
                              ? -columns()
                              : columns();
                    const target =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? live.current.length - 1
                          : current + delta;
                    const targetId = live.current[target];
                    if (targetId) move(id, targetId);
                  }
                }}
              >
                ⠿
              </Button>
              <div>{item.content}</div>
            </div>
          );
        })}
        {!sorted.length && <p>No items to arrange.</p>}
      </div>
      <span className="mingu-collection-sr" role="status">
        {message}
      </span>
    </div>
  );
}

export interface CardNavigationGroup {
  id: string;
  title: string;
  description?: string;
  links: readonly MenuLink[];
}
export interface CardNavigationProps extends Shell {
  groups: readonly CardNavigationGroup[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  triggerLabel?: string;
  disabled?: boolean;
}
export function CardNavigation({
  groups,
  open,
  defaultOpen = false,
  onOpenChange,
  triggerLabel = "Explore",
  disabled,
  label = "Explore navigation",
  className,
  style,
}: CardNavigationProps) {
  const [expanded, setExpanded] = useValue(open, defaultOpen, onOpenChange),
    id = useId(),
    trigger = useRef<HTMLButtonElement>(null);
  return (
    <nav
      className={classes("card-navigation", className)}
      style={style}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Escape" && expanded) {
          setExpanded(false);
          trigger.current?.focus();
        }
      }}
    >
      <Button
        ref={trigger}
        variant="outline"
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        {triggerLabel}
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </Button>
      <div id={id} hidden={!expanded} className="mingu-collection-nav-cards">
        {groups.map((group, index) => (
          <section
            key={group.id}
            style={{ "--mingu-collection-card-index": index } as CSSProperties}
          >
            <span className="mingu-collection-hint">0{index + 1}</span>
            <h3>{group.title}</h3>
            {group.description && <p>{group.description}</p>}
            {group.links.map((link) =>
              link.disabled ? (
                <span key={link.id} aria-disabled="true">
                  {link.label}
                </span>
              ) : (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setExpanded(false)}
                >
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ),
            )}
          </section>
        ))}
        {!groups.length && <p>No destinations available.</p>}
      </div>
    </nav>
  );
}

export interface ScrollStackItem {
  id: string;
  title: string;
  content: ReactNode;
}
export interface ScrollStackProps extends Shell {
  items: readonly ScrollStackItem[];
  top?: number;
  offset?: number;
}
/** Native sticky stacking: no wheel hijack, and all content remains in document order. */
export function ScrollStack({
  items,
  top = 16,
  offset = 20,
  label = "Stacked stories",
  className,
  style,
}: ScrollStackProps) {
  return (
    <section
      aria-label={label}
      className={classes("scroll-stack", className)}
      style={style}
    >
      {items.map((item, index) => (
        <article
          key={item.id}
          className="mingu-collection-stack-card"
          style={{
            position: "sticky",
            top: Math.max(0, top) + index * Math.max(0, Math.min(40, offset)),
            zIndex: index + 1,
          }}
        >
          <span className="mingu-collection-hint">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </span>
          <h3>{item.title}</h3>
          {item.content}
        </article>
      ))}
      {!items.length && <p>No stories yet.</p>}
    </section>
  );
}

export interface StickyStoryStep {
  id: string;
  title: string;
  description: ReactNode;
  preview: ReactNode;
}
export interface StickyScrollStoryProps extends Shell {
  steps: readonly StickyStoryStep[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  top?: number;
}
export function StickyScrollStory({
  steps,
  value,
  defaultValue,
  onValueChange,
  scrollContainerRef,
  top = 16,
  label = "Product story",
  className,
  style,
}: StickyScrollStoryProps) {
  const [current, setCurrent] = useValue(
      value,
      defaultValue ?? steps[0]?.id ?? "",
      onValueChange,
    ),
    root = useRef<HTMLElement>(null),
    live = useRef({ current, setCurrent, steps });
  live.current = { current, setCurrent, steps };
  useEffect(() => {
    const scroller = scrollContainerRef?.current;
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sections = Array.from(
            root.current?.querySelectorAll<HTMLElement>("[data-story-step]") ??
              [],
          ),
          rect = scroller?.getBoundingClientRect(),
          center = (rect?.top ?? 0) + (rect?.height ?? innerHeight) * 0.4;
        let best: HTMLElement | undefined,
          distance = Infinity;
        for (const section of sections) {
          const r = section.getBoundingClientRect(),
            d = Math.abs((r.top + r.bottom) / 2 - center);
          if (d < distance) {
            distance = d;
            best = section;
          }
        }
        const id = best?.dataset.storyStep;
        if (id && id !== live.current.current) live.current.setCurrent(id);
      });
    };
    const target = scroller ?? window;
    target.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    read();
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [scrollContainerRef, steps.map((s) => s.id).join("|")]);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = matchMedia("(max-width: 767px)");
    const read = () => setMobile(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);
  const selected = steps.find((s) => s.id === current) ?? steps[0];
  return (
    <section
      ref={root}
      className={classes("sticky-story", className)}
      aria-label={label}
      style={style}
    >
      <div className="mingu-collection-story-copy">
        {steps.map((step, index) => (
          <article
            key={step.id}
            data-story-step={step.id}
            data-active={selected?.id === step.id}
          >
            <span className="mingu-collection-hint">
              STEP {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{step.title}</h3>
            <div>{step.description}</div>
            <Button
              size="sm"
              variant="ghost"
              aria-pressed={selected?.id === step.id}
              onClick={() => setCurrent(step.id)}
            >
              Show {step.title}
            </Button>
            {mobile && (
              <div className="mingu-collection-story-mobile-preview">
                {step.preview}
              </div>
            )}
          </article>
        ))}
      </div>
      {selected && !mobile && (
        <aside
          className="mingu-collection-story-preview"
          style={{ top: Math.max(0, top) }}
          aria-label={`${selected.title} preview`}
        >
          <div key={selected.id}>{selected.preview}</div>
        </aside>
      )}
      {!steps.length && <p>No story steps yet.</p>}
    </section>
  );
}

export interface FooterRevealProps extends Shell {
  children: ReactNode;
  footer: ReactNode;
  footerLabel?: string;
  disabled?: boolean;
}
export function FooterReveal({
  children,
  footer,
  footerLabel = "Site footer",
  disabled = false,
  label,
  className,
  style,
}: FooterRevealProps) {
  return (
    <div
      className={classes("footer-reveal", className)}
      style={style}
      data-disabled={disabled}
      aria-label={label}
    >
      <div className="mingu-collection-reveal-content">{children}</div>
      <footer
        className="mingu-collection-reveal-footer"
        aria-label={footerLabel}
      >
        {footer}
      </footer>
    </div>
  );
}

export interface ScrollExpandMediaProps extends Shell {
  children: ReactNode;
  caption?: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  minScale?: number;
  borderRadius?: number;
}
export function ScrollExpandMedia({
  children,
  caption,
  scrollContainerRef,
  minScale = 0.72,
  borderRadius = 32,
  label,
  className,
  style,
}: ScrollExpandMediaProps) {
  const root = useRef<HTMLElement>(null),
    reduced = useReduced(),
    [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const scroll = scrollContainerRef?.current;
    function read() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = root.current?.getBoundingClientRect();
        if (!rect) return;
        const container = scroll?.getBoundingClientRect(),
          height = container?.height ?? innerHeight,
          top = rect.top - (container?.top ?? 0);
        setProgress(Math.max(0, Math.min(1, (height - top) / (height * 0.75))));
      });
    }
    const target = scroll ?? window;
    target.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    const observer = new ResizeObserver(read);
    if (root.current) observer.observe(root.current);
    read();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      target.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [scrollContainerRef]);
  const p = reduced ? 1 : progress,
    min = Math.max(0.3, Math.min(1, minScale));
  return (
    <figure
      ref={root}
      className={classes("expand-media", className)}
      style={style}
      aria-label={label}
    >
      <div
        className="mingu-collection-expand-frame"
        style={{
          transform: `scale(${min + (1 - min) * p})`,
          borderRadius: Math.max(0, borderRadius) * (1 - p),
        }}
      >
        {children}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export interface CoverflowItem {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}
export interface CoverflowCarouselProps extends Shell {
  items: readonly CoverflowItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  loop?: boolean;
  disabled?: boolean;
}
export function CoverflowCarousel({
  items,
  value,
  defaultValue,
  onValueChange,
  loop = false,
  disabled,
  label = "Project gallery",
  className,
  style,
}: CoverflowCarouselProps) {
  const enabled = items.filter((i) => !i.disabled),
    [selected, setSelected] = useValue(
      value,
      defaultValue ?? enabled[0]?.id ?? "",
      onValueChange,
    ),
    active = Math.max(
      0,
      enabled.findIndex((i) => i.id === selected),
    ),
    current = enabled[active],
    start = useRef<{ x: number; y: number; id: number } | null>(null),
    reduced = useReduced();
  function advance(delta: number) {
    if (disabled || !enabled.length) return;
    const next = loop
      ? (active + delta + enabled.length) % enabled.length
      : Math.max(0, Math.min(enabled.length - 1, active + delta));
    setSelected(enabled[next].id);
  }
  return (
    <section
      className={classes("coverflow", className)}
      style={style}
      aria-label={label}
      aria-roledescription="carousel"
    >
      <div
        className="mingu-collection-coverflow-stage"
        tabIndex={disabled ? -1 : 0}
        aria-label="Gallery. Use left and right arrows to navigate."
        onKeyDown={(e) => {
          if (
            e.defaultPrevented ||
            e.altKey ||
            e.ctrlKey ||
            e.metaKey ||
            isCarouselNativeTarget(e.target, e.currentTarget)
          )
            return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            advance(e.key === "ArrowRight" ? 1 : -1);
          }
          if (
            (e.key === "Home" || e.key === "End") &&
            !disabled &&
            enabled.length
          ) {
            e.preventDefault();
            setSelected(enabled[e.key === "Home" ? 0 : enabled.length - 1].id);
          }
        }}
        onPointerDown={(e) => {
          if (
            e.button !== 0 ||
            !e.isPrimary ||
            disabled ||
            e.defaultPrevented ||
            isCarouselNativeTarget(e.target, e.currentTarget)
          )
            return;
          start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          const s = start.current;
          if (!s || s.id !== e.pointerId) return;
          start.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
          const dx = e.clientX - s.x,
            dy = e.clientY - s.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2)
            advance(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          start.current = null;
        }}
        onLostPointerCapture={() => {
          start.current = null;
        }}
      >
        {enabled.map((item, index) => {
          const distance = index - active;
          return (
            <div
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${enabled.length}: ${item.title}`}
              aria-hidden={distance !== 0}
              inert={distance !== 0}
              className="mingu-collection-coverflow-card"
              data-active={distance === 0}
              style={{
                transform: `translate(-50%,-50%) translateX(${distance * 62}%) ${reduced ? "" : `rotateY(${Math.max(-1, Math.min(1, distance)) * -38}deg)`} scale(${distance === 0 ? 1 : 0.78})`,
                opacity: Math.abs(distance) > 2 ? 0 : distance === 0 ? 1 : 0.4,
                zIndex: enabled.length - Math.abs(distance),
              }}
            >
              {item.content}
            </div>
          );
        })}
        {!enabled.length && <p>No slides available.</p>}
      </div>
      <div className="mingu-collection-coverflow-controls">
        <Button
          variant="outline"
          aria-label="Previous slide"
          disabled={disabled || enabled.length < 2 || (!loop && active === 0)}
          onClick={() => advance(-1)}
        >
          ←
        </Button>
        <div aria-live="polite">
          <strong>{current?.title ?? "Empty gallery"}</strong>
          <span>
            {enabled.length ? `${active + 1} / ${enabled.length}` : "0 / 0"}
          </span>
        </div>
        <Button
          variant="outline"
          aria-label="Next slide"
          disabled={
            disabled ||
            enabled.length < 2 ||
            (!loop && active === enabled.length - 1)
          }
          onClick={() => advance(1)}
        >
          →
        </Button>
      </div>
    </section>
  );
}
