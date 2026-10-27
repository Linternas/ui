"use client";
import { Icon as VectorIcon } from "../icons";

import * as React from "react";
import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from "react";
import { Button, TextField, Select } from "../system/base";
import { Slider } from "../system/forms";
import { useControllable } from "../shared";
import { useMotionPreference as useReducedMotion } from "../experimental/motion-preference";

interface MediaSurfaceProps {
  label?: string;
  className?: string;
  style?: CSSProperties;
}
const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, Number.isFinite(value) ? value : low));
function useMediaVisibility() {
  const root = useRef<HTMLDivElement>(null),
    [active, setActive] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let visible = false;
    const refresh = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      refresh();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return { root, active };
}
function MediaImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? (
    <div className="mingu-media-unavailable" role="img" aria-label={alt}>
      Image unavailable
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export interface SplitFlapDisplayProps extends MediaSurfaceProps {
  text: string;
  maxLength?: number;
  replayKey?: string | number;
}
/** Transient mechanical type. The accessible text is read once, never per cell. */
export function SplitFlapDisplay({
  text,
  maxLength = 24,
  replayKey = 0,
  label = "Split flap display",
  className = "",
  style,
}: SplitFlapDisplayProps) {
  const characters = Array.from(text).slice(
    0,
    clamp(Math.round(maxLength), 1, 80),
  );
  return (
    <div
      className={`mingu-split-flap ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      <span className="mingu-visually-hidden">
        {characters.join("") || "Empty display"}
      </span>
      <div className="mingu-flap-cells" aria-hidden="true">
        {characters.map((letter, index) => (
          <span
            className="mingu-flap-cell"
            key={`${index}-${letter}-${replayKey}`}
            style={
              {
                "--flap-delay": `${Math.min(index, 20) * 18}ms`,
              } as CSSProperties
            }
          >
            <span className="mingu-flap-letter">
              {letter === " " ? "\u00a0" : letter}
            </span>
            <span className="mingu-flap-hinge" />
          </span>
        ))}
      </div>
    </div>
  );
}

export interface VariableFontProximityProps extends MediaSurfaceProps {
  text: string;
  minWeight?: number;
  maxWeight?: number;
  radius?: number;
}
/** Uses weight even when the consumer's chosen font has no variable width axis. */
export function VariableFontProximity({
  text,
  minWeight = 350,
  maxWeight = 850,
  radius = 180,
  label = "Proximity typography",
  className = "",
  style,
}: VariableFontProximityProps) {
  const hintId = useId(),
    root = useRef<HTMLDivElement>(null),
    letters = useRef<(HTMLSpanElement | null)[]>([]),
    frame = useRef(0),
    selected = useRef(-1),
    reduced = useReducedMotion();
  const low = clamp(minWeight, 100, 900),
    high = clamp(maxWeight, low, 1000),
    reach = clamp(radius, 30, 500),
    visible = Array.from(text).slice(0, 240);
  const reset = () =>
    letters.current.forEach((node) => {
      if (node) {
        node.style.fontWeight = String(low);
        node.style.fontVariationSettings = `'wght' ${low}`;
      }
    });
  const reactTo = (x: number, y: number) => {
    if (reduced) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      // Read geometry before writing weights to avoid a layout per character.
      const weights = letters.current.map((node) => {
        if (!node) return low;
        const box = node.getBoundingClientRect(),
          proximity = Math.max(
            0,
            1 -
              Math.hypot(
                box.x + box.width / 2 - x,
                box.y + box.height / 2 - y,
              ) /
                reach,
          );
        return Math.round(low + (high - low) * proximity * proximity);
      });
      letters.current.forEach((node, index) => {
        if (node) {
          node.style.fontWeight = String(weights[index]);
          node.style.fontVariationSettings = `'wght' ${weights[index]}`;
        }
      });
    });
  };
  useEffect(() => {
    reset();
    selected.current = -1;
    return () => cancelAnimationFrame(frame.current);
  }, [text, low, high, reduced]);
  return (
    <div
      ref={root}
      className={`mingu-font-proximity ${className}`}
      role="group"
      aria-label={label}
      tabIndex={0}
      style={style}
      aria-describedby={hintId}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse")
          reactTo(event.clientX, event.clientY);
      }}
      onPointerDown={(event) => reactTo(event.clientX, event.clientY)}
      onPointerLeave={() => {
        cancelAnimationFrame(frame.current);
        reset();
      }}
      onBlur={() => {
        cancelAnimationFrame(frame.current);
        reset();
      }}
      onPointerCancel={() => {
        cancelAnimationFrame(frame.current);
        reset();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          cancelAnimationFrame(frame.current);
          reset();
          return;
        }
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        selected.current =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? visible.length - 1
              : clamp(
                  selected.current + (event.key === "ArrowLeft" ? -1 : 1),
                  0,
                  visible.length - 1,
                );
        const node = letters.current[selected.current];
        if (node) {
          const box = node.getBoundingClientRect();
          reactTo(box.x + box.width / 2, box.y + box.height / 2);
        }
      }}
    >
      <span className="mingu-visually-hidden">{text}</span>
      <span aria-hidden="true" className="mingu-proximity-letters">
        {visible.map((letter, index) => (
          <span
            key={index}
            ref={(node) => {
              letters.current[index] = node;
            }}
            style={{ fontWeight: low }}
          >
            {letter === " " ? "\u00a0" : letter}
          </span>
        ))}
      </span>
      <span id={hintId} className="mingu-visually-hidden">
        Use left and right arrows to move the emphasis. Escape resets it.
      </span>
    </div>
  );
}

export interface VideoTrack {
  src: string;
  label: string;
  srcLang: string;
  default?: boolean;
}
export interface VideoPlayerProps extends MediaSurfaceProps {
  src?: string;
  poster?: string;
  tracks?: readonly VideoTrack[];
  active?: boolean;
  ref?: Ref<HTMLVideoElement>;
  onTimeChange?: (seconds: number) => void;
  onPlaybackError?: (message: string) => void;
}
/** Real native video; no autoplay, fake progress, or silent playback fallbacks. */
export function VideoPlayer({
  src,
  poster,
  tracks = [],
  active = true,
  ref,
  onTimeChange,
  onPlaybackError,
  label = "Video player",
  className = "",
  style,
}: VideoPlayerProps) {
  const video = useRef<HTMLVideoElement>(null),
    { root, active: visible } = useMediaVisibility(),
    [playing, setPlaying] = useState(false),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(70),
    [muted, setMuted] = useState(false),
    [status, setStatus] = useState(
      src ? "Loading video…" : "Choose a video to begin.",
    ),
    [error, setError] = useState(""),
    [speed, setSpeed] = useState(1);
  const visibility = useRef({ active, visible });
  visibility.current = { active, visible };
  const source = useRef(src),
    alive = useRef(true);
  source.current = src;
  const readMetadata = (node: HTMLVideoElement) => {
    const seconds = node.duration;
    node.volume = volume / 100;
    node.muted = muted;
    node.playbackRate = speed;
    setDuration(Number.isFinite(seconds) ? seconds : 0);
    setStatus("Ready to play.");
    setError("");
  };
  useImperativeHandle(ref, () => video.current!, [src]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const node = video.current;
    node?.pause();
    setPlaying(false);
    setTime(0);
    setDuration(0);
    setError("");
    setStatus(src ? "Loading video…" : "Choose a video to begin.");
    if (src && node && node.readyState >= 1) readMetadata(node);
    return () => node?.pause();
  }, [src]);
  useEffect(() => {
    if (!active || !visible) video.current?.pause();
  }, [active, visible]);
  const fail = (message: string) => {
    setError(message);
    setStatus(message);
    setPlaying(false);
    onPlaybackError?.(message);
  };
  const toggle = async () => {
    const node = video.current;
    if (!node || !src) return;
    if (!node.paused) {
      node.pause();
      return;
    }
    const expected = src;
    setError("");
    setStatus("Starting video…");
    try {
      await node.play();
      if (
        !alive.current ||
        source.current !== expected ||
        document.hidden ||
        !visibility.current.active ||
        !visibility.current.visible
      )
        node.pause();
    } catch {
      if (alive.current && source.current === expected)
        fail(
          "Playback could not start. Choose a supported video and try again.",
        );
    }
  };
  return (
    <div
      ref={root}
      className={`mingu-video-player mingu-media-component ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      <video
        ref={video}
        key={src || "empty"}
        src={src || undefined}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        aria-label={label}
        onLoadedMetadata={(event) => readMetadata(event.currentTarget)}
        onDurationChange={(event) => {
          const seconds = event.currentTarget.duration;
          setDuration(Number.isFinite(seconds) ? seconds : 0);
        }}
        onTimeUpdate={(event) => {
          setTime(event.currentTarget.currentTime);
          onTimeChange?.(event.currentTarget.currentTime);
        }}
        onVolumeChange={(event) => {
          setVolume(Math.round(event.currentTarget.volume * 100));
          setMuted(event.currentTarget.muted);
        }}
        onRateChange={(event) => setSpeed(event.currentTarget.playbackRate)}
        onPlaying={(event) => {
          if (
            !visibility.current.active ||
            !visibility.current.visible ||
            document.hidden
          ) {
            event.currentTarget.pause();
            return;
          }
          setPlaying(true);
          setStatus("Playing");
        }}
        onWaiting={() => setStatus("Buffering…")}
        onPause={() => {
          setPlaying(false);
          setStatus(src ? "Paused" : "Choose a video to begin.");
        }}
        onEnded={() => {
          setPlaying(false);
          setStatus("Finished");
        }}
        onError={() => {
          if (src)
            fail(
              "This video could not be loaded or its format is unsupported.",
            );
        }}
      >
        {tracks.map((track) => (
          <track
            key={`${track.src}-${track.srcLang}`}
            kind="captions"
            src={track.src}
            srcLang={track.srcLang}
            label={track.label}
            default={track.default}
          />
        ))}
      </video>
      <div className="mingu-media-toolbar">
        <Button variant="secondary" disabled={!src || !active} onClick={toggle}>
          {playing ? "Pause video" : "Play video"}
        </Button>
        <Button
          variant="ghost"
          disabled={!src}
          aria-pressed={muted}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            if (video.current) video.current.muted = next;
          }}
        >
          {muted ? "Unmute video" : "Mute video"}
        </Button>
        <span className="mingu-media-time">
          {Math.floor(time)} / {Math.floor(duration)}s
        </span>
      </div>
      <Slider
        label="Seek video"
        min={0}
        max={Math.max(1, duration)}
        step={0.1}
        value={Math.min(time, duration)}
        disabled={!duration}
        onValueChange={(seconds) => {
          if (video.current && duration) {
            video.current.currentTime = seconds;
            setTime(seconds);
          }
        }}
      />
      <div className="mingu-media-toolbar">
        <Slider
          label="Video volume"
          min={0}
          max={100}
          value={volume}
          disabled={!src}
          onValueChange={(next) => {
            setVolume(next);
            if (video.current) video.current.volume = next / 100;
          }}
        />
        <label className="mingu-media-label">
          Playback speed
          <Select
            aria-label="Playback speed"
            value={String(speed)}
            disabled={!src}
            onChange={(event) => {
              const next = Number(event.target.value);
              setSpeed(next);
              if (video.current) video.current.playbackRate = next;
            }}
          >
            <option value="0.5">0.5×</option>
            <option value="1">1×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
          </Select>
        </label>
      </div>
      <p className="mingu-media-status" role={error ? "alert" : "status"}>
        {error || status}
      </p>
    </div>
  );
}

export interface ReelItem {
  id: string;
  title: string;
  src: string;
  alt: string;
  kind?: "image" | "video";
  poster?: string;
  caption?: string;
}
export interface VerticalReelProps extends MediaSurfaceProps {
  items: readonly ReelItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}
export function VerticalReel({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  label = "Vertical reel",
  className = "",
  style,
}: VerticalReelProps) {
  const [value, setValue] = useControllable(index, defaultIndex, onIndexChange),
    current = clamp(Math.round(value), 0, Math.max(0, items.length - 1)),
    viewport = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion(),
    scheduled = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedFrame = useRef(current);
  selectedFrame.current = current;
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const observer = new ResizeObserver(() =>
      node.scrollTo({
        top: selectedFrame.current * node.clientHeight,
        behavior: "instant",
      }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length]);
  useEffect(() => {
    const node = viewport.current;
    if (node)
      node.scrollTo({
        top: current * node.clientHeight,
        behavior: reduced ? "instant" : "smooth",
      });
  }, [current, items.length, reduced]);
  useEffect(
    () => () => {
      if (scheduled.current) clearTimeout(scheduled.current);
    },
    [],
  );
  const choose = (next: number) => setValue(clamp(next, 0, items.length - 1));
  return (
    <div
      className={`mingu-reel mingu-media-component ${className}`}
      style={style}
      role="group"
      aria-label={label}
    >
      {items.length ? (
        <>
          <div
            ref={viewport}
            className="mingu-reel-viewport"
            tabIndex={0}
            aria-label="Scroll through reel"
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                choose(
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? items.length - 1
                      : current + (event.key === "ArrowUp" ? -1 : 1),
                );
              }
            }}
            onScroll={() => {
              if (scheduled.current) clearTimeout(scheduled.current);
              scheduled.current = setTimeout(() => {
                const node = viewport.current;
                if (!node?.clientHeight) return;
                const next = clamp(
                  Math.round(node.scrollTop / node.clientHeight),
                  0,
                  items.length - 1,
                );
                if (next !== current) setValue(next);
              }, 120);
            }}
          >
            {items.map((item, itemIndex) => (
              <article
                key={item.id}
                className="mingu-reel-slide"
                aria-label={`${itemIndex + 1}. ${item.title}`}
                data-active={itemIndex === current || undefined}
              >
                {item.kind === "video" ? (
                  <VideoPlayer
                    src={item.src}
                    poster={item.poster}
                    label={item.title}
                    active={current === itemIndex}
                  />
                ) : (
                  <MediaImage src={item.src} alt={item.alt} />
                )}
                <div className="mingu-reel-caption">
                  <strong>{item.title}</strong>
                  {item.caption && <p>{item.caption}</p>}
                </div>
              </article>
            ))}
          </div>
          <div className="mingu-media-toolbar">
            <Button
              variant="secondary"
              disabled={current === 0}
              onClick={() => choose(current - 1)}
            >
              Previous reel
            </Button>
            <span role="status">
              {current + 1} / {items.length}
            </span>
            <Button
              variant="secondary"
              disabled={current === items.length - 1}
              onClick={() => choose(current + 1)}
            >
              Next reel
            </Button>
          </div>
        </>
      ) : (
        <p className="mingu-media-empty">No reels yet.</p>
      )}
    </div>
  );
}

export interface StoryItem {
  id: string;
  title: string;
  src: string;
  alt: string;
  caption?: string;
  duration?: number;
}
export interface StoryViewerProps extends MediaSurfaceProps {
  items: readonly StoryItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  duration?: number;
  loop?: boolean;
}
export function StoryViewer({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  duration = 5000,
  loop = false,
  label = "Story viewer",
  className = "",
  style,
}: StoryViewerProps) {
  const [value, setValue] = useControllable(index, defaultIndex, onIndexChange),
    current = clamp(Math.round(value), 0, Math.max(0, items.length - 1)),
    [playing, setPlaying] = useState(false),
    [hovered, setHovered] = useState(false),
    [elapsed, setElapsed] = useState(0),
    elapsedRef = useRef(0),
    { root, active } = useMediaVisibility(),
    reduced = useReducedMotion();
  const item = items[current],
    limit = clamp(item?.duration ?? duration, 2000, 30000),
    live = useRef({ current, items, loop, setValue });
  live.current = { current, items, loop, setValue };
  const change = (next: number) => {
    elapsedRef.current = 0;
    setElapsed(0);
    setValue(clamp(next, 0, items.length - 1));
  };
  useEffect(() => {
    elapsedRef.current = 0;
    setElapsed(0);
  }, [item?.id]);
  useEffect(() => {
    if (!playing || hovered || !active || reduced || !items.length) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      elapsedRef.current += Math.min(250, now - last);
      last = now;
      if (elapsedRef.current >= limit) {
        elapsedRef.current = 0;
        const next = live.current.current + 1;
        if (next < live.current.items.length) live.current.setValue(next);
        else if (live.current.loop) live.current.setValue(0);
        else {
          setPlaying(false);
          elapsedRef.current = limit;
        }
      }
      setElapsed(elapsedRef.current);
    }, 50);
    return () => clearInterval(timer);
  }, [playing, hovered, active, reduced, limit, item?.id, items.length]);
  return (
    <div
      ref={root}
      className={`mingu-stories mingu-media-component ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      {item ? (
        <>
          <div className="mingu-story-progress" aria-label="Choose a story">
            {items.map((story, storyIndex) => (
              <button
                type="button"
                key={story.id}
                aria-label={`Story ${storyIndex + 1}: ${story.title}`}
                aria-current={storyIndex === current ? "step" : undefined}
                onClick={() => change(storyIndex)}
              >
                <span
                  style={{
                    width: `${storyIndex < current ? 100 : storyIndex === current ? (elapsed / limit) * 100 : 0}%`,
                  }}
                />
              </button>
            ))}
          </div>
          <div
            className="mingu-story-frame"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            <MediaImage src={item.src} alt={item.alt} />
            <div className="mingu-reel-caption">
              <strong>{item.title}</strong>
              {item.caption && <p>{item.caption}</p>}
            </div>
          </div>
          <div className="mingu-media-toolbar">
            <Button
              variant="secondary"
              disabled={current === 0}
              onClick={() => change(current - 1)}
            >
              Previous story
            </Button>
            <Button
              variant="secondary"
              disabled={!!reduced}
              aria-pressed={playing}
              onClick={() => {
                if (!playing && current === items.length - 1) change(0);
                setPlaying(!playing);
              }}
            >
              {playing ? "Pause stories" : "Play stories"}
            </Button>
            <Button
              variant="secondary"
              disabled={current === items.length - 1}
              onClick={() => change(current + 1)}
            >
              Next story
            </Button>
          </div>
          <p className="mingu-media-status" role="status">
            Story {current + 1} of {items.length}
            {reduced
              ? " · Automatic advance disabled by reduced motion."
              : playing
                ? hovered
                  ? " · Paused while hovering"
                  : " · Automatic advance on"
                : " · Manual navigation"}
          </p>
        </>
      ) : (
        <p className="mingu-media-empty">No stories yet.</p>
      )}
    </div>
  );
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ImageCropperProps extends MediaSurfaceProps {
  src: string;
  alt: string;
  aspect?: number;
  crop?: CropRect;
  defaultCrop?: CropRect;
  onCropChange?: (crop: CropRect) => void;
  onCropComplete?: (blob: Blob, crop: CropRect) => void | Promise<void>;
}
export function ImageCropper({
  src,
  alt,
  aspect = 1,
  crop,
  defaultCrop,
  onCropChange,
  onCropComplete,
  label = "Image cropper",
  className = "",
  style,
}: ImageCropperProps) {
  const image = useRef<HTMLImageElement>(null),
    [size, setSize] = useState({ width: 0, height: 0 }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [output, setOutput] = useState(""),
    generation = useRef(0),
    drag = useRef<{
      id: number;
      x: number;
      y: number;
      crop: CropRect;
      resize: boolean;
    } | null>(null);
  const [value, setValue] = useControllable(
      crop,
      defaultCrop || { x: 15, y: 15, width: 60, height: 60 },
      onCropChange,
    ),
    physicalRatio = size.width && size.height ? size.width / size.height : 1,
    ratio = clamp(aspect, 0.2, 5),
    maxWidth = Math.min(100, (100 * ratio) / physicalRatio),
    width = clamp(value.width, Math.min(5, maxWidth), maxWidth),
    height = (width * physicalRatio) / ratio,
    rectangle = {
      x: clamp(value.x, 0, 100 - width),
      y: clamp(value.y, 0, 100 - height),
      width,
      height,
    };
  const latest = useRef({ rectangle, size });
  latest.current = { rectangle, size };
  useEffect(() => {
    generation.current++;
    setSize({ width: 0, height: 0 });
    setError("");
    setOutput("");
    setBusy(false);
    drag.current = null;
    const node = image.current;
    if (node?.complete && node.naturalWidth)
      setSize({ width: node.naturalWidth, height: node.naturalHeight });
  }, [src]);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  useEffect(
    () => () => {
      if (output) URL.revokeObjectURL(output);
    },
    [output],
  );
  const apply = (next: CropRect) => {
    generation.current++;
    setBusy(false);
    setValue(next);
    setOutput("");
  };
  useEffect(() => {
    generation.current++;
    setBusy(false);
    setOutput("");
  }, [aspect]);
  useEffect(() => {
    generation.current++;
    setBusy(false);
    setOutput("");
  }, [crop?.x, crop?.y, crop?.width, crop?.height]);
  const exportCrop = async () => {
    const node = image.current;
    if (!node || !size.width || busy) return;
    setBusy(true);
    setError("");
    const version = generation.current,
      selected = { ...rectangle };
    try {
      const canvas = document.createElement("canvas"),
        outputWidth = Math.max(
          1,
          Math.round(
            Math.min(2048, 2048 * ratio, (size.width * selected.width) / 100),
          ),
        ),
        outputHeight = Math.max(1, Math.round(outputWidth / ratio));
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.drawImage(
        node,
        (size.width * selected.x) / 100,
        (size.height * selected.y) / 100,
        (size.width * selected.width) / 100,
        (size.height * selected.height) / 100,
        0,
        0,
        outputWidth,
        outputHeight,
      );
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error("Export unavailable.")),
          "image/png",
        ),
      );
      if (version !== generation.current) return;
      await onCropComplete?.(blob, selected);
      if (version === generation.current) setOutput(URL.createObjectURL(blob));
    } catch {
      if (version === generation.current)
        setError(
          "This image could not be exported. Remote images must allow cross-origin canvas access.",
        );
    } finally {
      if (version === generation.current) setBusy(false);
    }
  };
  const start = (
    event: React.PointerEvent<HTMLDivElement | HTMLButtonElement>,
    resize: boolean,
  ) => {
    if (event.button !== 0 || !size.width) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      crop: rectangle,
      resize,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (
    event: React.PointerEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    const current = drag.current,
      box = image.current?.getBoundingClientRect();
    if (
      !current ||
      current.id !== event.pointerId ||
      !box?.width ||
      !box.height
    )
      return;
    const dx = ((event.clientX - current.x) / box.width) * 100,
      dy = ((event.clientY - current.y) / box.height) * 100;
    if (current.resize) {
      const available = Math.min(
          100 - current.crop.x,
          ((100 - current.crop.y) * ratio) / physicalRatio,
        ),
        next = clamp(
          current.crop.width + Math.max(dx, (dy * ratio) / physicalRatio),
          Math.min(5, available),
          available,
        );
      apply({
        ...current.crop,
        width: next,
        height: (next * physicalRatio) / ratio,
      });
    } else
      apply({
        ...current.crop,
        x: clamp(current.crop.x + dx, 0, 100 - current.crop.width),
        y: clamp(current.crop.y + dy, 0, 100 - current.crop.height),
      });
  };
  return (
    <div
      className={`mingu-cropper mingu-media-component ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      <div
        className="mingu-crop-stage"
        style={{ width: `min(100%, ${360 * physicalRatio}px)` }}
      >
        <img
          ref={image}
          key={src}
          crossOrigin="anonymous"
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(event) => {
            setSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            });
            setError("");
          }}
          onError={() => {
            setSize({ width: 0, height: 0 });
            setError("Image could not be loaded.");
          }}
        />
        {!!size.width && (
          <div
            className="mingu-crop-selection"
            style={{
              left: `${rectangle.x}%`,
              top: `${rectangle.y}%`,
              width: `${rectangle.width}%`,
              height: `${rectangle.height}%`,
            }}
            onPointerDown={(event) => start(event, false)}
            onPointerMove={move}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <span aria-hidden="true" />
            <button
              type="button"
              className="mingu-crop-resize"
              aria-label="Resize crop"
              onPointerDown={(event) => start(event, true)}
              onPointerMove={move}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onKeyDown={(event) => {
                if (
                  ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    event.key,
                  )
                ) {
                  event.preventDefault();
                  const available = Math.min(
                      100 - rectangle.x,
                      ((100 - rectangle.y) * ratio) / physicalRatio,
                    ),
                    next = clamp(
                      rectangle.width +
                        (["ArrowLeft", "ArrowUp"].includes(event.key)
                          ? -1
                          : 1) *
                          (event.shiftKey ? 5 : 1),
                      Math.min(5, available),
                      available,
                    );
                  apply({
                    ...rectangle,
                    width: next,
                    height: (next * physicalRatio) / ratio,
                  });
                }
              }}
            >
              <VectorIcon name="arrow-down-right" size="1em" />
            </button>
          </div>
        )}
      </div>
      <div className="mingu-crop-sliders">
        <Slider
          label="Crop width"
          min={Math.min(5, maxWidth)}
          max={maxWidth}
          step={0.01}
          value={rectangle.width}
          disabled={!size.width || busy}
          onValueChange={(next) =>
            apply({
              ...rectangle,
              width: next,
              height: (next * physicalRatio) / ratio,
            })
          }
        />
        <Slider
          label="Crop horizontal position"
          min={0}
          max={Math.max(1, 100 - rectangle.width)}
          value={rectangle.x}
          disabled={!size.width || busy || rectangle.width >= 100}
          onValueChange={(next) => apply({ ...rectangle, x: next })}
        />
        <Slider
          label="Crop vertical position"
          min={0}
          max={Math.max(1, 100 - rectangle.height)}
          value={rectangle.y}
          disabled={!size.width || busy || rectangle.height >= 100}
          onValueChange={(next) => apply({ ...rectangle, y: next })}
        />
      </div>
      <div className="mingu-media-toolbar">
        <Button disabled={!size.width} loading={busy} onClick={exportCrop}>
          Export crop
        </Button>
        <Button
          variant="ghost"
          disabled={!size.width || busy}
          onClick={() =>
            apply({
              x: (100 - maxWidth * 0.7) / 2,
              y: (100 - (maxWidth * 0.7 * physicalRatio) / ratio) / 2,
              width: maxWidth * 0.7,
              height: (maxWidth * 0.7 * physicalRatio) / ratio,
            })
          }
        >
          Center crop
        </Button>
        {output && (
          <a className="mingu-media-download" href={output} download="crop.png">
            Download crop.png <VectorIcon name="arrow-down" size="1em" />
          </a>
        )}
      </div>
      {output && (
        <img
          className="mingu-crop-result"
          src={output}
          alt="Exported crop preview"
        />
      )}
      <p className="mingu-media-status" role={error ? "alert" : "status"}>
        {error ||
          (output
            ? "PNG ready to download."
            : size.width
              ? `${Math.round(rectangle.width)}% × ${Math.round(rectangle.height)}% of original image`
              : "Loading image…")}
      </p>
    </div>
  );
}

const DAY = 86400000;
function dateNumber(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  )
    return null;
  const number = Date.UTC(year, month - 1, day);
  return new Date(number).toISOString().slice(0, 10) === value ? number : null;
}
function isoDate(value: number) {
  return new Date(value).toISOString().slice(0, 10);
}
function addDays(value: string, days: number) {
  return isoDate((dateNumber(value) ?? Date.UTC(2026, 9, 23)) + days * DAY);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function validMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value) && dateNumber(`${value}-01`) !== null;
}
function shiftMonth(value: string, amount: number) {
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + amount, 1))
    .toISOString()
    .slice(0, 7);
}
function monthTitle(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}-01T00:00:00Z`));
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
}
export interface CalendarBoardProps extends MediaSurfaceProps {
  events?: CalendarEvent[];
  defaultEvents?: CalendarEvent[];
  onEventsChange?: (events: CalendarEvent[]) => void;
  month?: string;
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
  date?: string;
  defaultDate?: string;
  onDateChange?: (date: string) => void;
}
export function CalendarBoard({
  events,
  defaultEvents = [],
  onEventsChange,
  month,
  defaultMonth,
  onMonthChange,
  date,
  defaultDate,
  onDateChange,
  label = "Calendar board",
  className = "",
  style,
}: CalendarBoardProps) {
  const initial = useRef(
      defaultDate && dateNumber(defaultDate) !== null ? defaultDate : today(),
    ),
    [items, setItems] = useControllable(events, defaultEvents, onEventsChange),
    [monthValue, setMonth] = useControllable(
      month,
      defaultMonth || initial.current.slice(0, 7),
      onMonthChange,
    ),
    shown = validMonth(monthValue) ? monthValue : initial.current.slice(0, 7),
    [selectedValue, setSelected] = useControllable(
      date,
      initial.current,
      onDateChange,
    ),
    selected =
      dateNumber(selectedValue) !== null ? selectedValue : initial.current,
    [draft, setDraft] = useState(""),
    [message, setMessage] = useState("Choose a day or drag an event onto it."),
    cells = useRef(new Map<string, HTMLButtonElement>()),
    sequence = useRef(0),
    unique = useId();
  const start = dateNumber(`${shown}-01`)!,
    first = (new Date(start).getUTCDay() + 6) % 7,
    days = new Date(start + 32 * DAY);
  days.setUTCDate(0);
  const count = days.getUTCDate(),
    dates = Array.from(
      { length: Math.ceil((first + count) / 7) * 7 },
      (_, index) => isoDate(start + (index - first) * DAY),
    );
  const choose = (next: string, focus = false) => {
    if (dateNumber(next) === null) return;
    setSelected(next);
    if (next.slice(0, 7) !== shown) setMonth(next.slice(0, 7));
    if (focus) requestAnimationFrame(() => cells.current.get(next)?.focus());
  };
  const moveEvent = (id: string, next: string) => {
    if (dateNumber(next) === null) return;
    setItems(
      items.map((item) => (item.id === id ? { ...item, date: next } : item)),
    );
    setMessage(`Event moved to ${next}.`);
  };
  const focusDate = selected.slice(0, 7) === shown ? selected : `${shown}-01`;
  return (
    <div
      className={`mingu-calendar mingu-media-component ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      <div className="mingu-media-toolbar">
        <Button
          variant="ghost"
          aria-label="Previous month"
          disabled={shown <= "1900-01"}
          onClick={() => setMonth(shiftMonth(shown, -1))}
        >
          <VectorIcon name="arrow-left" size="1em" />
        </Button>
        <h3>{monthTitle(shown)}</h3>
        <Button
          variant="ghost"
          aria-label="Next month"
          disabled={shown >= "2100-12"}
          onClick={() => setMonth(shiftMonth(shown, 1))}
        >
          <VectorIcon name="arrow-right" size="1em" />
        </Button>
      </div>
      <div
        className="mingu-calendar-grid"
        role="grid"
        aria-label={monthTitle(shown)}
      >
        <div className="mingu-calendar-week" role="row">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span role="columnheader" key={day}>
              {day}
            </span>
          ))}
        </div>
        {Array.from({ length: dates.length / 7 }, (_, week) => (
          <div className="mingu-calendar-week" role="row" key={week}>
            {dates.slice(week * 7, week * 7 + 7).map((day) => {
              const dayItems = items.filter((item) => item.date === day),
                outside = day.slice(0, 7) !== shown;
              return (
                <div key={day} role="gridcell" aria-selected={selected === day}>
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) cells.current.set(day, node);
                      else cells.current.delete(day);
                    }}
                    className="mingu-calendar-day"
                    disabled={dateNumber(day) === null}
                    data-outside={outside || undefined}
                    aria-label={`${day}${dayItems.length ? `, ${dayItems.length} events` : ""}`}
                    aria-pressed={selected === day}
                    tabIndex={day === focusDate ? 0 : -1}
                    onClick={() => choose(day)}
                    onDragOver={(event) => {
                      if (
                        event.dataTransfer.types.includes(
                          "application/x-mingu-calendar",
                        )
                      )
                        event.preventDefault();
                    }}
                    onDrop={(event) => {
                      const id = event.dataTransfer.getData(
                        "application/x-mingu-calendar",
                      );
                      if (items.some((item) => item.id === id)) {
                        event.preventDefault();
                        moveEvent(id, day);
                        choose(day);
                      }
                    }}
                    onKeyDown={(event) => {
                      const offset = {
                        ArrowLeft: -1,
                        ArrowRight: 1,
                        ArrowUp: -7,
                        ArrowDown: 7,
                      }[event.key];
                      if (offset !== undefined) {
                        event.preventDefault();
                        const next = addDays(day, offset);
                        if (dateNumber(next) !== null) choose(next, true);
                      } else if (event.key === "Home" || event.key === "End") {
                        event.preventDefault();
                        const weekday =
                          (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
                        choose(
                          addDays(
                            day,
                            event.key === "Home" ? -weekday : 6 - weekday,
                          ),
                          true,
                        );
                      }
                    }}
                  >
                    <span>{Number(day.slice(-2))}</span>
                    {dayItems.length > 0 && (
                      <small>
                        {dayItems.length}
                        <span className="mingu-visually-hidden"> events</span>
                      </small>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <section
        className="mingu-calendar-events"
        aria-label={`Events on ${selected}`}
      >
        <h4>{selected}</h4>
        {items
          .filter((item) => item.date === selected)
          .map((item) => (
            <div
              className="mingu-calendar-event"
              key={item.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "application/x-mingu-calendar",
                  item.id,
                );
                event.dataTransfer.effectAllowed = "move";
              }}
            >
              <TextField
                label="Event title"
                value={item.title}
                maxLength={100}
                onChange={(event) => {
                  const title = event.target.value;
                  setItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, title } : entry,
                    ),
                  );
                }}
              />
              <TextField
                label={`Date for ${item.title || "event"}`}
                type="date"
                min="1900-01-01"
                max="2100-12-31"
                value={item.date}
                onChange={(event) => moveEvent(item.id, event.target.value)}
              />
              <Button
                variant="ghost"
                aria-label={`Remove ${item.title || "event"}`}
                onClick={() => {
                  setItems(items.filter((entry) => entry.id !== item.id));
                  setMessage("Event removed.");
                  requestAnimationFrame(() =>
                    cells.current.get(selected)?.focus(),
                  );
                }}
              >
                <VectorIcon name="close" size="1em" />
              </Button>
            </div>
          ))}
        {!items.some((item) => item.date === selected) && (
          <p className="mingu-media-empty">No events on this day.</p>
        )}
      </section>
      <form
        className="mingu-media-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setItems([
            ...items,
            {
              id: `${unique}-event-${++sequence.current}`,
              title: draft.trim(),
              date: selected,
            },
          ]);
          setDraft("");
          setMessage(`Added event on ${selected}.`);
        }}
      >
        <TextField
          label="New event"
          value={draft}
          required
          maxLength={100}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" disabled={!draft.trim()}>
          Add event
        </Button>
      </form>
      <p role="status" className="mingu-media-status">
        {message}
      </p>
    </div>
  );
}

export interface GanttTask {
  id: string;
  title: string;
  start: string;
  end: string;
}
export interface GanttTimelineProps extends MediaSurfaceProps {
  tasks?: GanttTask[];
  defaultTasks?: GanttTask[];
  onTasksChange?: (tasks: GanttTask[]) => void;
  rangeStart: string;
  rangeDays?: number;
}
export function GanttTimeline({
  tasks,
  defaultTasks = [],
  onTasksChange,
  rangeStart,
  rangeDays = 21,
  label = "Gantt timeline",
  className = "",
  style,
}: GanttTimelineProps) {
  const [items, setItems] = useControllable(tasks, defaultTasks, onTasksChange),
    start = dateNumber(rangeStart) ?? dateNumber("2026-10-19")!,
    days = Math.min(
      clamp(Math.round(rangeDays), 2, 62),
      Math.floor((Date.UTC(2100, 11, 31) - start) / DAY) + 1,
    ),
    finish = start + (days - 1) * DAY,
    drag = useRef<{
      id: number;
      task: GanttTask;
      x: number;
      span: number;
      resize: boolean;
      element: HTMLElement;
    } | null>(null),
    live = useRef(items),
    [message, setMessage] = useState(
      "Drag task bars or use their arrow keys. Resize with the end handle.",
    );
  live.current = items;
  const normalize = (task: GanttTask) => {
    const a = clamp(dateNumber(task.start) ?? start, start, finish),
      b = clamp(dateNumber(task.end) ?? a, a, finish);
    return { ...task, start: isoDate(a), end: isoDate(b) };
  };
  const update = (task: GanttTask) => {
    setItems(
      live.current.map((item) =>
        item.id === task.id ? normalize(task) : item,
      ),
    );
    setMessage(`${task.title}: ${task.start} to ${task.end}.`);
  };
  const shift = (task: GanttTask, amount: number, resize = false) => {
    const normalized = normalize(task),
      a = dateNumber(normalized.start)!,
      b = dateNumber(normalized.end)!;
    if (resize)
      return {
        ...normalized,
        end: isoDate(clamp(b + amount * DAY, a, finish)),
      };
    const delta = clamp(amount, (start - a) / DAY, (finish - b) / DAY);
    return {
      ...normalized,
      start: isoDate(a + delta * DAY),
      end: isoDate(b + delta * DAY),
    };
  };
  const begin = (
    event: React.PointerEvent<HTMLButtonElement>,
    task: GanttTask,
    resize: boolean,
  ) => {
    if (event.button !== 0) return;
    const area = event.currentTarget.closest(
      ".mingu-gantt-track",
    ) as HTMLElement | null;
    if (!area) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      task: normalize(task),
      x: event.clientX,
      span: area.clientWidth / days,
      resize,
      element: event.currentTarget,
    };
  };
  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (current && event.pointerId === current.id)
      update(
        shift(
          current.task,
          Math.round((event.clientX - current.x) / current.span),
          current.resize,
        ),
      );
  };
  const key = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    task: GanttTask,
    resize: boolean,
  ) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      update(
        shift(
          task,
          (event.key === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? 7 : 1),
          resize,
        ),
      );
    }
  };
  if (dateNumber(rangeStart) === null)
    return (
      <div
        className={`mingu-gantt mingu-media-component ${className}`}
        style={style}
        role="group"
        aria-label={label}
      >
        <p role="alert">
          Choose a valid range start date between 1900 and 2100.
        </p>
      </div>
    );
  return (
    <div
      className={`mingu-gantt mingu-media-component ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      <p className="mingu-media-status">
        {isoDate(start)} — {isoDate(finish)}
      </p>
      <div
        className="mingu-gantt-scroll"
        tabIndex={0}
        aria-label="Scrollable timeline"
      >
        <div className="mingu-gantt-inner">
          <div className="mingu-gantt-axis" aria-hidden="true">
            <span>Task</span>
            <div>
              {Array.from({ length: days }, (_, index) => (
                <span key={index}>
                  {Number(isoDate(start + index * DAY).slice(-2))}
                </span>
              ))}
            </div>
          </div>
          {items.map((item) => {
            const task = normalize(item),
              offset = (dateNumber(task.start)! - start) / DAY,
              length =
                (dateNumber(task.end)! - dateNumber(task.start)!) / DAY + 1;
            return (
              <div className="mingu-gantt-row" key={task.id}>
                <strong>{task.title}</strong>
                <div
                  className="mingu-gantt-track"
                  style={{ "--gantt-days": days } as CSSProperties}
                >
                  <div
                    className="mingu-gantt-bar"
                    style={{
                      left: `${(offset / days) * 100}%`,
                      width: `${(length / days) * 100}%`,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Move ${task.title}`}
                      onPointerDown={(event) => begin(event, task, false)}
                      onPointerMove={move}
                      onPointerUp={() => {
                        drag.current = null;
                      }}
                      onPointerCancel={() => {
                        drag.current = null;
                      }}
                      onKeyDown={(event) => key(event, task, false)}
                    >
                      <span aria-hidden="true">{task.title}</span>
                    </button>
                    <button
                      type="button"
                      className="mingu-gantt-resize"
                      aria-label={`Resize ${task.title}`}
                      onPointerDown={(event) => begin(event, task, true)}
                      onPointerMove={move}
                      onPointerUp={() => {
                        drag.current = null;
                      }}
                      onPointerCancel={() => {
                        drag.current = null;
                      }}
                      onKeyDown={(event) => key(event, task, true)}
                    >
                      <VectorIcon name="move" size="1em" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {!items.length && (
        <p className="mingu-media-empty">No tasks on the timeline.</p>
      )}
      <details className="mingu-gantt-editor">
        <summary>Edit task dates</summary>
        {items.map((item) => {
          const task = normalize(item);
          return (
            <div className="mingu-media-toolbar" key={task.id}>
              <TextField
                label="Task title"
                value={task.title}
                maxLength={80}
                onChange={(event) =>
                  update({ ...task, title: event.target.value })
                }
              />
              <TextField
                type="date"
                label={`Start of ${task.title}`}
                min={isoDate(start)}
                max={task.end}
                value={task.start}
                onChange={(event) => {
                  if (dateNumber(event.target.value) !== null)
                    update({ ...task, start: event.target.value });
                }}
              />
              <TextField
                type="date"
                label={`End of ${task.title}`}
                min={task.start}
                max={isoDate(finish)}
                value={task.end}
                onChange={(event) => {
                  if (dateNumber(event.target.value) !== null)
                    update({ ...task, end: event.target.value });
                }}
              />
            </div>
          );
        })}
      </details>
      <p className="mingu-media-status" role="status">
        {message}
      </p>
    </div>
  );
}

export interface KanbanColumn {
  id: string;
  title: string;
}
export interface KanbanCard {
  id: string;
  title: string;
  column: string;
}
export interface KanbanBoardProps extends MediaSurfaceProps {
  columns: readonly KanbanColumn[];
  cards?: KanbanCard[];
  defaultCards?: KanbanCard[];
  onCardsChange?: (cards: KanbanCard[]) => void;
}
export function KanbanBoard({
  columns,
  cards,
  defaultCards = [],
  onCardsChange,
  label = "Kanban board",
  className = "",
  style,
}: KanbanBoardProps) {
  const [items, setItems] = useControllable(cards, defaultCards, onCardsChange),
    [draft, setDraft] = useState(""),
    [message, setMessage] = useState(
      "Drag cards between columns or choose a destination.",
    ),
    handles = useRef(new Map<string, HTMLButtonElement>()),
    add = useRef<HTMLInputElement>(null),
    unique = useId(),
    sequence = useRef(0);
  const columnFor = (card: KanbanCard) =>
    columns.some((column) => column.id === card.column)
      ? card.column
      : columns[0]?.id;
  const move = (id: string, column: string, targetIndex?: number) => {
    const card = items.find((item) => item.id === id);
    if (!card || !columns.some((item) => item.id === column)) return;
    const remaining = items.filter((item) => item.id !== id),
      same = remaining.filter((item) => columnFor(item) === column),
      target =
        targetIndex === undefined
          ? undefined
          : same[clamp(targetIndex, 0, same.length)];
    const next = { ...card, column };
    if (target) remaining.splice(remaining.indexOf(target), 0, next);
    else remaining.push(next);
    setItems(remaining);
    setMessage(
      `${card.title} moved to ${columns.find((item) => item.id === column)?.title}.`,
    );
    requestAnimationFrame(() => handles.current.get(id)?.focus());
  };
  return (
    <div
      className={`mingu-kanban mingu-media-component ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      <div className="mingu-kanban-columns">
        {columns.map((column, columnIndex) => {
          const cardsInColumn = items.filter(
            (item) => columnFor(item) === column.id,
          );
          return (
            <section
              className="mingu-kanban-column"
              key={column.id}
              aria-label={column.title}
              onDragOver={(event) => {
                if (
                  event.dataTransfer.types.includes(
                    "application/x-mingu-kanban",
                  )
                )
                  event.preventDefault();
              }}
              onDrop={(event) => {
                const id = event.dataTransfer.getData(
                  "application/x-mingu-kanban",
                );
                if (items.some((item) => item.id === id)) {
                  event.preventDefault();
                  move(id, column.id);
                }
              }}
            >
              <h3>
                {column.title}
                <span>{cardsInColumn.length}</span>
              </h3>
              {cardsInColumn.map((card, cardIndex) => (
                <article className="mingu-kanban-card" key={card.id}>
                  <button
                    type="button"
                    className="mingu-kanban-grip"
                    ref={(node) => {
                      if (node) handles.current.set(card.id, node);
                      else handles.current.delete(card.id);
                    }}
                    aria-label={`Move ${card.title || "Untitled card"}`}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        "application/x-mingu-kanban",
                        card.id,
                      );
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onKeyDown={(event) => {
                      if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
                        event.preventDefault();
                        const destination = clamp(
                          columnIndex + (event.key === "ArrowLeft" ? -1 : 1),
                          0,
                          columns.length - 1,
                        );
                        if (destination !== columnIndex)
                          move(card.id, columns[destination].id);
                      } else if (
                        ["ArrowUp", "ArrowDown", "Home", "End"].includes(
                          event.key,
                        )
                      ) {
                        event.preventDefault();
                        move(
                          card.id,
                          column.id,
                          event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? cardsInColumn.length - 1
                              : clamp(
                                  cardIndex +
                                    (event.key === "ArrowUp" ? -1 : 1),
                                  0,
                                  cardsInColumn.length - 1,
                                ),
                        );
                      }
                    }}
                  >
                    <VectorIcon name="grip" size="1em" />
                    <span>{card.title || "Untitled card"}</span>
                  </button>
                  <TextField
                    label={`Title for ${card.title || "card"}`}
                    value={card.title}
                    maxLength={100}
                    onChange={(event) => {
                      const title = event.target.value;
                      setItems(
                        items.map((item) =>
                          item.id === card.id ? { ...item, title } : item,
                        ),
                      );
                    }}
                  />
                  <label className="mingu-media-label">
                    Move to
                    <Select
                      aria-label={`Column for ${card.title || "card"}`}
                      value={column.id}
                      onChange={(event) => move(card.id, event.target.value)}
                    >
                      {columns.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.title}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setItems(items.filter((item) => item.id !== card.id));
                      setMessage("Card removed.");
                      requestAnimationFrame(() => add.current?.focus());
                    }}
                    aria-label={`Remove ${card.title || "card"}`}
                  >
                    Remove
                  </Button>
                </article>
              ))}
              {!cardsInColumn.length && (
                <p className="mingu-media-empty">Drop an idea here.</p>
              )}
            </section>
          );
        })}
      </div>
      {!columns.length && (
        <p className="mingu-media-empty">Add a column to start organizing.</p>
      )}
      <form
        className="mingu-media-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim() || !columns.length) return;
          setItems([
            ...items,
            {
              id: `${unique}-card-${++sequence.current}`,
              title: draft.trim(),
              column: columns[0].id,
            },
          ]);
          setDraft("");
          setMessage("Card added.");
        }}
      >
        <TextField
          label="New card"
          ref={add}
          value={draft}
          required
          maxLength={100}
          disabled={!columns.length}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" disabled={!draft.trim() || !columns.length}>
          Add card
        </Button>
      </form>
      <p className="mingu-media-status" role="status">
        {message}
      </p>
    </div>
  );
}

export interface FileTreeNode {
  id: string;
  name: string;
  children?: readonly FileTreeNode[];
  disabled?: boolean;
}
export interface FileTreeProps extends MediaSurfaceProps {
  nodes: readonly FileTreeNode[];
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelect?: (id: string, node: FileTreeNode) => void;
}
interface TreeRow {
  node: FileTreeNode;
  level: number;
  parent?: string;
  position: number;
  size: number;
}
export function FileTree({
  nodes,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedChange,
  selectedId,
  defaultSelectedId = "",
  onSelect,
  label = "Files",
  className = "",
  style,
}: FileTreeProps) {
  const [expanded, setExpanded] = useControllable(
      expandedIds,
      defaultExpandedIds,
      onExpandedChange,
    ),
    [selected, setSelected] = useState(defaultSelectedId),
    current = selectedId === undefined ? selected : selectedId,
    [focused, setFocused] = useState(""),
    elements = useRef(new Map<string, HTMLButtonElement>()),
    search = useRef({ value: "", time: 0 });
  const rows: TreeRow[] = [],
    seen = new Set<string>();
  const visit = (
    entries: readonly FileTreeNode[],
    level: number,
    parent?: string,
  ) => {
    if (level > 20 || rows.length >= 1000) return;
    entries.forEach((node, index) => {
      if (seen.has(node.id) || rows.length >= 1000) return;
      seen.add(node.id);
      rows.push({
        node,
        level,
        parent,
        position: index + 1,
        size: entries.length,
      });
      if (node.children && expanded.includes(node.id))
        visit(node.children, level + 1, node.id);
    });
  };
  visit(nodes, 1);
  const enabled = rows.filter((row) => !row.node.disabled),
    focusId = enabled.some((row) => row.node.id === focused)
      ? focused
      : enabled.some((row) => row.node.id === current)
        ? current
        : enabled[0]?.node.id;
  const focus = (id?: string) => {
    if (!id) return;
    setFocused(id);
    elements.current.get(id)?.focus();
  };
  const select = (node: FileTreeNode) => {
    if (selectedId === undefined) setSelected(node.id);
    onSelect?.(node.id, node);
  };
  const toggle = (id: string) =>
    setExpanded(
      expanded.includes(id)
        ? expanded.filter((item) => item !== id)
        : [...expanded, id],
    );
  return (
    <div className={`mingu-file-tree ${className}`} style={style}>
      <div role="tree" aria-label={label}>
        {rows.map((row) => {
          const { node } = row,
            folder = node.children !== undefined;
          return (
            <button
              type="button"
              role="treeitem"
              key={node.id}
              ref={(element) => {
                if (element) elements.current.set(node.id, element);
                else elements.current.delete(node.id);
              }}
              aria-level={row.level}
              aria-posinset={row.position}
              aria-setsize={row.size}
              aria-expanded={folder ? expanded.includes(node.id) : undefined}
              aria-selected={current === node.id}
              disabled={node.disabled}
              tabIndex={node.id === focusId ? 0 : -1}
              className="mingu-tree-row"
              style={{ "--tree-level": row.level } as CSSProperties}
              onFocus={() => setFocused(node.id)}
              onClick={() => {
                select(node);
                if (folder) toggle(node.id);
              }}
              onKeyDown={(event) => {
                const position = enabled.findIndex(
                  (entry) => entry.node.id === node.id,
                );
                if (
                  ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  focus(
                    enabled[
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? enabled.length - 1
                          : clamp(
                              position + (event.key === "ArrowUp" ? -1 : 1),
                              0,
                              enabled.length - 1,
                            )
                    ]?.node.id,
                  );
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  if (folder && !expanded.includes(node.id)) toggle(node.id);
                  else
                    focus(
                      enabled[position + 1]?.parent === node.id
                        ? enabled[position + 1]?.node.id
                        : node.id,
                    );
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  if (folder && expanded.includes(node.id)) toggle(node.id);
                  else focus(row.parent);
                } else if (
                  event.key.length === 1 &&
                  !event.ctrlKey &&
                  !event.metaKey &&
                  event.key !== " "
                ) {
                  const now = performance.now();
                  search.current = {
                    value:
                      now - search.current.time < 600
                        ? search.current.value + event.key.toLowerCase()
                        : event.key.toLowerCase(),
                    time: now,
                  };
                  const next = [
                    ...enabled.slice(position + 1),
                    ...enabled.slice(0, position + 1),
                  ].find((entry) =>
                    entry.node.name
                      .toLowerCase()
                      .startsWith(search.current.value),
                  );
                  if (next) {
                    event.preventDefault();
                    focus(next.node.id);
                  }
                }
              }}
            >
              <span className="mingu-tree-arrow" aria-hidden="true">
                {folder ? (
                  expanded.includes(node.id) ? (
                    <VectorIcon name="chevron" size="1em" />
                  ) : (
                    <VectorIcon name="chevron-right" size="1em" />
                  )
                ) : (
                  ""
                )}
              </span>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                {folder ? (
                  <path d="M3 7V5h7l2 3h9v12H3V7Z" />
                ) : (
                  <path d="M6 3h8l4 4v14H6V3Zm8 0v5h4" />
                )}
              </svg>
              <span>{node.name}</span>
            </button>
          );
        })}
      </div>
      {!rows.length && <p className="mingu-media-empty">No files.</p>}
    </div>
  );
}
