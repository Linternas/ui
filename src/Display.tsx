"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon, useControllable } from "./shared";

export interface FolderProps {
  color?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  children?: ReactNode;
}
export function Folder({
  color = "#3c82ef",
  size = "md",
  label = "Project files",
  children,
}: FolderProps) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className={`mi-folder mi-folder-${size}`}
      style={{ "--mi-folder-color": color } as React.CSSProperties}
      aria-label={label}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
    >
      <span className="mi-folder-back" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="mi-folder-paper"
          style={{ "--paper": i } as React.CSSProperties}
        >
          <span />
          <span />
          <span />
        </span>
      ))}
      <span className="mi-folder-front" data-open={open || undefined}>
        {children ?? <span>{label}</span>}
      </span>
    </button>
  );
}

export interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  padStart?: number;
  separator?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
}
export function AnimatedCounter({
  value,
  decimals = 0,
  padStart = 1,
  separator = ",",
  prefix,
  suffix,
  className = "",
}: AnimatedCounterProps) {
  const finite = Number.isFinite(value) ? value : 0;
  const [whole, fraction] = Math.abs(finite)
    .toFixed(Math.min(15, Math.max(0, decimals)))
    .split(".");
  const padded = whole.padStart(Math.min(24, Math.max(1, padStart)), "0");
  const text = `${finite < 0 ? "−" : ""}${padded.replace(/\B(?=(\d{3})+(?!\d))/g, separator)}${fraction ? `.${fraction}` : ""}`;
  const reduced = useReducedMotion();
  return (
    <span
      className={`mi-counter ${className}`}
      role="img"
      aria-label={`${typeof prefix === "string" ? prefix : ""}${text}${typeof suffix === "string" ? suffix : ""}`}
    >
      {prefix}
      <span className="mi-counter-figures" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {[...text].map((char, index) => (
            <motion.span
              layout
              key={`${text.length - index}-${/\d/.test(char) ? "digit" : char}`}
              className={
                /\d/.test(char) ? "mi-counter-window" : "mi-counter-mark"
              }
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: 1,
                width: /\d/.test(char) ? ".64em" : "auto",
              }}
              exit={{ opacity: 0, width: 0 }}
            >
              {/\d/.test(char) ? (
                <motion.span
                  className="mi-counter-wheel"
                  animate={{ y: `${-Number(char) * 10}%` }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 95, damping: 19 }
                  }
                >
                  {Array.from({ length: 10 }, (_, digit) => (
                    <span key={digit}>{digit}</span>
                  ))}
                </motion.span>
              ) : (
                char
              )}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      {suffix}
    </span>
  );
}

export interface Contribution {
  date: string;
  count: number;
}
export interface RepoContribution {
  name: string;
  count: number;
  url?: string;
}
export interface GithubActivityProps {
  contributions: readonly Contribution[];
  repos?: readonly RepoContribution[];
  label?: string;
}
export function GithubActivity({
  contributions,
  repos = [],
  label = "Contributions",
}: GithubActivityProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const max = Math.max(1, ...contributions.map((day) => day.count));
  return (
    <section className="mi-activity">
      <header>
        <span>
          {contributions
            .reduce((sum, day) => sum + day.count, 0)
            .toLocaleString("en-US")}{" "}
          {label.toLowerCase()}
        </span>
        <span>Last year</span>
      </header>
      <div className="mi-activity-chart" aria-label="Contribution history">
        <div className="mi-activity-months" aria-hidden="true">
          {"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"
            .split(" ")
            .map((month) => (
              <span key={month}>{month}</span>
            ))}
        </div>
        <div className="mi-activity-grid">
          {contributions.map((day) => (
            <span
              key={day.date}
              tabIndex={0}
              title={`${day.date}: ${day.count} contributions`}
              aria-label={`${day.date}: ${day.count} contributions`}
              style={{
                opacity: day.count > 0 ? 0.25 + (0.75 * day.count) / max : 1,
              }}
              data-active={day.count > 0 || undefined}
            />
          ))}
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              id={id}
              className="mi-activity-repos"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
            >
              <p>Top repositories</p>
              {[...repos]
                .sort((a, b) => b.count - a.count)
                .map((repo, index) => (
                  <div key={repo.name}>
                    <span className="mi-repo-avatar">
                      {repo.name[0]?.toUpperCase()}
                    </span>
                    <span>
                      {repo.url ? (
                        <a
                          href={repo.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {repo.name}
                        </a>
                      ) : (
                        repo.name
                      )}
                    </span>
                    <span>{repo.count}</span>
                    <span className="mi-repo-rank">0{index + 1}</span>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        type="button"
        className="mi-activity-toggle"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        <span>
          ◉ <span>Top contributions</span>
        </span>
        <Icon name="chevron" />
      </button>
    </section>
  );
}

export interface PlayerStep {
  label: string;
  duration?: number;
}
export interface StepPlayerProps {
  steps: number | readonly PlayerStep[];
  duration?: number;
  loop?: boolean;
  onComplete?: () => void;
  onValueChange?: (value: number) => void;
}
export function StepPlayer({
  steps,
  duration = 2400,
  loop = false,
  onComplete,
  onValueChange,
}: StepPlayerProps) {
  const entries =
    typeof steps === "number"
      ? Array.from({ length: Math.max(1, Math.min(30, steps)) }, (_, i) => ({
          label: `Step ${i + 1}`,
          duration,
        }))
      : steps;
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [progress, setProgress] = useState(0),
    [speed, setSpeed] = useState(1);
  const elapsed = useRef(0);
  const current = Math.min(index, Math.max(0, entries.length - 1));
  const finished = current === entries.length - 1 && progress >= 1;
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const change = useRef(onValueChange);
  change.current = onValueChange;
  useEffect(() => {
    if (!playing || !entries.length) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) elapsed.current += (now - previous) * speed;
      previous = now;
      const next = Math.min(
        1,
        elapsed.current / Math.max(50, entries[current]?.duration ?? duration),
      );
      setProgress(next);
      if (next === 1) {
        if (current + 1 < entries.length || loop) {
          const nextIndex = (current + 1) % entries.length;
          elapsed.current = 0;
          setProgress(0);
          setIndex(nextIndex);
          change.current?.(nextIndex);
        } else {
          setPlaying(false);
          complete.current?.();
        }
      }
    }, 30);
    return () => clearInterval(timer);
  }, [
    playing,
    current,
    entries.length,
    duration,
    loop,
    speed,
    entries[current]?.duration,
  ]);
  return (
    <div className="mi-player">
      <div className="mi-player-track">
        <button
          type="button"
          className="mi-round"
          disabled={!entries.length}
          aria-label={
            finished ? "Replay steps" : playing ? "Pause steps" : "Play steps"
          }
          onClick={() => {
            if (finished) {
              setIndex(0);
              setProgress(0);
              elapsed.current = 0;
              change.current?.(0);
            }
            setPlaying(!playing);
          }}
        >
          <Icon name={finished ? "replay" : playing ? "pause" : "play"} />
        </button>
        {entries.map((step, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to ${step.label}`}
            aria-current={i === current ? "step" : undefined}
            className="mi-player-step"
            data-active={i === current || undefined}
            onClick={() => {
              setIndex(i);
              elapsed.current = 0;
              setProgress(0);
              change.current?.(i);
            }}
          >
            <span
              style={{
                transform: `scaleX(${i < current ? 1 : i === current ? progress : 0})`,
              }}
            />
          </button>
        ))}
        <button
          type="button"
          className="mi-player-speed"
          aria-label="Playback speed"
          onClick={() => setSpeed(speed === 2 ? 0.5 : speed + 0.5)}
        >
          {speed}×
        </button>
      </div>
      <p className="mi-caption">
        {finished
          ? "Sequence complete"
          : (entries[current]?.label ?? "No steps")}{" "}
        <span>
          {current + 1} / {entries.length}
        </span>
      </p>
    </div>
  );
}

export interface FaqItem {
  id: string;
  question: string;
  answer: ReactNode;
}
export interface FaqProps {
  items: readonly FaqItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}
export function Faq({
  items,
  value,
  defaultValue = null,
  onValueChange,
}: FaqProps) {
  const [open, setOpen] = useControllable(value, defaultValue, onValueChange);
  const root = useRef<HTMLDivElement>(null);
  const prefix = useId();
  return (
    <div className="mi-faq" ref={root}>
      {items.map((item, index) => (
        <div key={item.id} className="mi-faq-thread">
          <button
            type="button"
            aria-expanded={open === item.id}
            aria-controls={open === item.id ? `${prefix}-${index}` : undefined}
            onClick={() => setOpen(open === item.id ? null : item.id)}
            onKeyDown={(event) => {
              const buttons =
                root.current?.querySelectorAll<HTMLButtonElement>("button");
              if (
                buttons &&
                ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                buttons[
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? items.length - 1
                      : (index +
                          (event.key === "ArrowDown" ? 1 : -1) +
                          items.length) %
                        items.length
                ]?.focus();
              }
            }}
          >
            <span>{item.question}</span>
            <span aria-hidden="true">{open === item.id ? "−" : "+"}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === item.id && (
              <motion.div
                id={`${prefix}-${index}`}
                className="mi-faq-answer"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span className="mi-faq-avatar" aria-hidden="true">
                  m
                </span>
                <div>{item.answer}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
