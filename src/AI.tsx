"use client";
import { useReducedMotion } from "./motion-policy";

import { motion } from "./motion";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Icon, useControllable } from "./shared";

export interface GridRevealProps {
  src?: string | null;
  alt: string;
  progress?: number;
  caption?: string;
  aspect?: number;
  onRevealComplete?: () => void;
  onError?: () => void;
}
export function GridReveal(props: GridRevealProps) {
  return <GridRevealFrame key={props.src ?? ""} {...props} />;
}
function GridRevealFrame({
  src,
  alt,
  progress,
  caption = "Creating image",
  aspect = 1.5,
  onRevealComplete,
  onError,
}: GridRevealProps) {
  const [loaded, setLoaded] = useState(""),
    [failed, setFailed] = useState(""),
    [clock, setClock] = useState(0);
  const reduced = useReducedMotion();
  const image = useRef<HTMLImageElement>(null),
    reported = useRef(false);
  const reveal = () => {
    if (!src || reported.current) return;
    reported.current = true;
    setLoaded(src);
    onRevealComplete?.();
  };
  const reject = () => {
    if (!src || reported.current) return;
    reported.current = true;
    setFailed(src);
    onError?.();
  };
  useEffect(() => {
    // A cached SSR image may have finished before hydration attached its load listener.
    if (image.current?.complete) {
      if (image.current.naturalWidth > 0) reveal();
      else reject();
    }
  }, [src]);
  useEffect(() => {
    setClock(0);
    if (src || reduced || progress !== undefined) return;
    const timer = setInterval(
      () => setClock((previous) => Math.min(0.85, previous + 0.018)),
      120,
    );
    return () => clearInterval(timer);
  }, [src, reduced, progress]);
  const ready = !!src && loaded === src;
  const level = ready
    ? 7
    : Math.min(
        6,
        Math.floor(Math.max(0, Math.min(1, progress ?? clock)) * 7) + 2,
      );
  const cells = useMemo(() => {
    let result = [{ x: 0, y: 0, width: 100, height: 100 }];
    for (let pass = 0; pass < level; pass++)
      result = result.flatMap((cell, index) => {
        const horizontal = (pass + index) % 2 === 0;
        return [0, 1].map((half) =>
          horizontal
            ? {
                ...cell,
                x: cell.x + (half * cell.width) / 2,
                width: cell.width / 2,
              }
            : {
                ...cell,
                y: cell.y + (half * cell.height) / 2,
                height: cell.height / 2,
              },
        );
      });
    return result;
  }, [level]);
  return (
    <figure
      className="mi-grid-reveal"
      style={{ aspectRatio: aspect }}
      aria-busy={!ready && failed !== src}
    >
      {src && (
        <img
          ref={image}
          key={src}
          src={src}
          alt={alt}
          onLoad={reveal}
          onError={reject}
          className="mi-grid-image"
          data-ready={ready || undefined}
        />
      )}
      <div
        className="mi-grid-cells"
        aria-hidden="true"
        data-ready={ready || undefined}
      >
        {cells.map((cell, index) => (
          <motion.span
            key={`${cell.x}-${cell.y}-${cell.width}`}
            layout
            initial={false}
            animate={{
              opacity: ready ? 0 : 0.3 + 0.6 * Math.abs(Math.sin(index * 1.73)),
            }}
            transition={{
              duration: reduced ? 0 : 0.7,
              delay: ready ? (index % 8) * 0.025 : 0,
            }}
            style={{
              left: `${cell.x}%`,
              top: `${cell.y}%`,
              width: `${cell.width}%`,
              height: `${cell.height}%`,
            }}
          />
        ))}
      </div>
      {!ready && (
        <figcaption>
          <span className="mi-status-dot" />
          {failed === src && src ? "Image unavailable" : caption}
        </figcaption>
      )}
    </figure>
  );
}

export interface WebSource {
  id: string;
  title: string;
  url: string;
  snippet?: string;
}
export interface WebSearchProps {
  sources: readonly WebSource[];
  status?: "searching" | "done";
  query?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  linked?: boolean;
}
const domain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
};
const safeLink = (url: string) => (/^https?:\/\//i.test(url) ? url : undefined);
export function WebSearch({
  sources,
  status = "done",
  query,
  defaultOpen = true,
  open: value,
  onOpenChange,
  linked = true,
}: WebSearchProps) {
  const [open, setOpen] = useControllable(value, defaultOpen, onOpenChange);
  const id = useId();
  return (
    <div className="mi-search" data-status={status}>
      <button
        type="button"
        className="mi-search-toggle"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        <Icon name="search" size={17} />
        <span>
          {status === "searching"
            ? query
              ? `Searching: ${query}`
              : "Searching the web"
            : `Searched ${sources.length} sources`}
        </span>
        <span className="mi-search-avatars" aria-hidden="true">
          {sources.slice(0, 3).map((source, index) => (
            <i
              key={source.id}
              style={{ "--source-index": index } as React.CSSProperties}
            >
              {domain(source.url)[0]}
            </i>
          ))}
        </span>
        <Icon name="chevron" size={14} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="mi-search-cards"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {sources.map((source, index) => (
              <a
                key={source.id}
                href={linked ? safeLink(source.url) : undefined}
                target={linked ? "_blank" : undefined}
                rel="noopener noreferrer"
                tabIndex={linked ? undefined : 0}
              >
                <span className="mi-search-source">
                  {domain(source.url)}
                  <span>{index + 1}</span>
                </span>
                <strong>{source.title}</strong>
                <p>{source.snippet}</p>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export function WebSearchCitation({
  source,
  index = 1,
}: {
  source: WebSource;
  index?: number;
}) {
  return (
    <span className="mi-citation">
      <a href={safeLink(source.url)} target="_blank" rel="noopener noreferrer">
        {domain(source.url)} <sup>{index}</sup>
      </a>
      <span role="tooltip">
        <strong>{source.title}</strong>
        <span>{source.snippet}</span>
      </span>
    </span>
  );
}
export function WebSearchAnswer({
  text,
  speed = 55,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();
  const complete = useRef(onComplete);
  complete.current = onComplete;
  useEffect(() => {
    setCount(reduced ? text.length : 0);
    if (reduced) {
      complete.current?.();
      return;
    }
    let current = 0;
    const timer = setInterval(() => {
      if (document.hidden) return;
      current = Math.min(
        text.length,
        current + Math.max(1, Math.round(speed / 25)),
      );
      setCount(current);
      if (current === text.length) {
        clearInterval(timer);
        complete.current?.();
      }
    }, 40);
    return () => clearInterval(timer);
  }, [text, speed, reduced]);
  return (
    <div className="mi-search-answer">
      <span aria-hidden="true">
        {text.slice(0, count)}
        {count < text.length && <span className="mi-text-caret" />}
      </span>
      <span className="mru-sr-only">{text}</span>
    </div>
  );
}
export type AiState =
  | "thinking"
  | "researching"
  | "analyzing"
  | "writing"
  | "done"
  | "error";
export function AiStatus({
  state = "thinking",
  label,
  detail,
  timer = false,
}: {
  state?: AiState;
  label?: string;
  detail?: string;
  timer?: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);
  const reduced = useReducedMotion();
  const running = state !== "done" && state !== "error";
  useEffect(() => {
    if (!running || !timer) return;
    const interval = setInterval(
      () => setElapsed((seconds) => seconds + 1),
      1000,
    );
    return () => clearInterval(interval);
  }, [running, timer]);
  const labels = {
    thinking: "Thinking",
    researching: "Researching",
    analyzing: "Analyzing",
    writing: "Writing",
    done: "Complete",
    error: "Something went wrong",
  };
  return (
    <div className="mi-ai-status" data-state={state} role="status">
      <span className="mi-ai-icon" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            className="mi-ai-glyph"
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.5 }}
            transition={reduced ? { duration: 0 } : { duration: 0.15 }}
          >
            {state === "done" ? (
              <Icon name="check" size={18} />
            ) : state === "error" ? (
              <Icon name="close" size={18} />
            ) : state === "researching" ? (
              <Icon name="search" size={18} />
            ) : state === "writing" ? (
              <Icon name="edit" size={18} />
            ) : (
              <svg
                className="mi-ai-spinner"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3" />
              </svg>
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mi-ai-copy">
        <span className={`mi-ai-label${running ? " mi-shimmer" : ""}`}>
          {label ?? labels[state]}
        </span>
        {detail && <small className="mi-ai-detail">{detail}</small>}
      </span>
      {timer && (
        <small className="mi-ai-elapsed" aria-hidden="true">
          {elapsed}s
        </small>
      )}
    </div>
  );
}
