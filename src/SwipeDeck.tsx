"use client";
import * as React from "react";
import { useRef, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useIsPresent,
} from "motion/react";
import { useControllable } from "./shared";
import { Button } from "./system/base";
import { deckSpring, explorationMotion } from "./system/motion-tokens";

export interface SwipeCard {
  id: string;
  label: string;
  content: ReactNode;
}
export interface SwipeDeckProps {
  items: readonly SwipeCard[];
  label?: string;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  loop?: boolean;
  className?: string;
  labels?: {
    previous?: string;
    next?: string;
    empty?: string;
    position?: (index: number, count: number) => string;
  };
}
function DeckCard({
  item,
  onSwipe,
  draggable,
}: {
  item: SwipeCard;
  onSwipe: (direction: number) => boolean;
  draggable: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(
    x,
    [-200, 200],
    [-explorationMotion.deckTilt, explorationMotion.deckTilt],
  );
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const present = useIsPresent();
  return (
    <motion.div
      className="mingu-deck-card"
      role="group"
      aria-label={item.label}
      aria-hidden={!present || undefined}
      inert={!present}
      style={{
        x,
        rotate: reduced ? 0 : rotate,
        pointerEvents: present ? "auto" : "none",
      }}
      initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      variants={{
        leave: (direction: number) => ({
          x: direction * 260,
          opacity: 0,
          rotate: direction * explorationMotion.deckTilt,
          transition: { duration: explorationMotion.deckExit, ease: "easeOut" },
        }),
      }}
      exit={reduced ? { opacity: 0 } : "leave"}
      transition={reduced ? { duration: 0 } : deckSpring}
      drag={draggable ? "x" : false}
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragStart={() => x.stop()}
      onPointerDown={(event) => {
        if (
          !(event.target as HTMLElement).closest(
            'button,a,input,textarea,select,[contenteditable="true"]',
          )
        )
          controls.start(event);
      }}
      onDragEnd={(_, info) => {
        const committed =
          Math.abs(info.offset.x) > explorationMotion.deckThreshold ||
          (Math.abs(info.offset.x) > 18 &&
            Math.abs(info.velocity.x) > explorationMotion.deckVelocity);
        if (!committed || !onSwipe(info.offset.x < 0 ? 1 : -1))
          animate(x, 0, deckSpring);
      }}
    >
      {item.content}
    </motion.div>
  );
}
export function SwipeDeck({
  items,
  label = "Cards",
  index,
  defaultIndex = 0,
  onIndexChange,
  loop = true,
  labels,
  className = "",
}: SwipeDeckProps) {
  const [current, setCurrent] = useControllable(
    index,
    defaultIndex,
    onIndexChange,
  );
  const direction = useRef(1);
  const selected = Math.max(
    0,
    Math.min(
      items.length - 1,
      Number.isFinite(current) ? Math.trunc(current) : 0,
    ),
  );
  const move = (delta: number) => {
    if (items.length < 2) return false;
    const next = loop
      ? (selected + delta + items.length) % items.length
      : Math.max(0, Math.min(items.length - 1, selected + delta));
    if (next === selected) return false;
    direction.current = delta > 0 ? -1 : 1;
    setCurrent(next);
    return true;
  };
  if (!items.length)
    return <p className="mingu-muted">{labels?.empty ?? "No cards"}</p>;
  return (
    <section
      className={`mingu-deck ${className}`}
      aria-label={label}
      aria-roledescription="carousel"
    >
      <div className="mingu-deck-stage">
        {items.length > 1 && (
          <>
            <div className="mingu-deck-back" aria-hidden="true" />
            <div
              className="mingu-deck-back mingu-deck-back-second"
              aria-hidden="true"
            />
          </>
        )}
        <AnimatePresence initial={false} custom={direction.current} mode="wait">
          <DeckCard
            key={items[selected].id}
            item={items[selected]}
            onSwipe={move}
            draggable={items.length > 1}
          />
        </AnimatePresence>
      </div>
      <div className="mingu-deck-controls">
        <Button
          variant="ghost"
          size="sm"
          disabled={items.length < 2 || (!loop && selected === 0)}
          onClick={() => move(-1)}
          aria-label={labels?.previous ?? "Previous card"}
        >
          ←
        </Button>
        <span role="status" aria-live="polite">
          {labels?.position?.(selected + 1, items.length) ??
            `${selected + 1} / ${items.length}`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={
            items.length < 2 || (!loop && selected === items.length - 1)
          }
          onClick={() => move(1)}
          aria-label={labels?.next ?? "Next card"}
        >
          →
        </Button>
      </div>
    </section>
  );
}
