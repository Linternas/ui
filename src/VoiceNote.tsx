"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "./shared";

export interface VoiceNoteProps {
  src?: string;
  /** Optional localized control labels; English defaults preserve existing consumers. */
  labels?: { play?: string; pause?: string; seek?: string; speed?: (speed: number) => string; error?: string };
  audioRef?: RefObject<HTMLAudioElement | null>;
  onLoadedMetadata?: () => void;
  duration?: number;
  waveform?: readonly number[];
  onEnded?: () => void;
  onError?: () => void;
}
const defaultWaveform = Array.from(
  { length: 48 },
  (_, i) => 0.15 + 0.75 * Math.abs(Math.sin(i * 2.31) * Math.cos(i * 0.61)),
);
export function VoiceNote({
  src,
  labels = {},
  audioRef,
  onLoadedMetadata,
  duration = 30,
  waveform = defaultWaveform,
  onEnded,
  onError,
}: VoiceNoteProps) {
  const internalAudio = useRef<HTMLAudioElement>(null);
  const audio = audioRef ?? internalAudio;
  const [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(0),
    [length, setLength] = useState(duration),
    [speed, setSpeed] = useState(1),
    [error, setError] = useState(false);
  const callback = useRef(onEnded);
  callback.current = onEnded;
  const readyCallback = useRef(onLoadedMetadata);
  readyCallback.current = onLoadedMetadata;
  useEffect(() => {
    // Metadata can arrive before hydration attaches React's media handlers.
    const element = audio.current;
    if (element && element.readyState >= 1) {
      if (Number.isFinite(element.duration)) setLength(element.duration);
      readyCallback.current?.();
    }
  }, [src, audio]);
  useEffect(() => {
    setPosition(0);
    setPlaying(false);
    setError(false);
    setLength(duration);
  }, [src, duration]);
  useEffect(() => {
    if (src || !playing) return;
    const timer = setInterval(
      () => setPosition((previous) => Math.min(length, previous + 0.1 * speed)),
      100,
    );
    return () => clearInterval(timer);
  }, [src, playing, length, speed]);
  useEffect(() => {
    if (!src && playing && position >= length) {
      setPlaying(false);
      setPosition(0);
      callback.current?.();
    }
  }, [src, playing, position, length]);
  async function toggle() {
    if (!src) {
      setPlaying(!playing);
      return;
    }
    if (!audio.current) return;
    if (playing) audio.current.pause();
    else
      try {
        await audio.current.play();
        setError(false);
      } catch {
        setError(true);
        onError?.();
      }
  }
  const time = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  return (
    <div className="mi-voice" data-playing={playing || undefined}>
      {src && (
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onLoadedMetadata={(event) => {
            if (Number.isFinite(event.currentTarget.duration))
              setLength(event.currentTarget.duration);
            onLoadedMetadata?.();
          }}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setPosition(0);
            callback.current?.();
          }}
          onError={() => {
            setError(true);
            setPlaying(false);
            onError?.();
          }}
        />
      )}
      <button
        type="button"
        className="mi-round"
        aria-label={playing ? (labels.pause ?? "Pause voice note") : (labels.play ?? "Play voice note")}
        onClick={toggle}
      >
        <Icon name={playing ? "pause" : "play"} />
      </button>
      <div className="mi-waveform">
        <span aria-hidden="true">
          {waveform.map((bar, index) => (
            <i
              key={index}
              style={{ height: `${Math.max(0.1, Math.min(1, bar)) * 100}%` }}
              data-played={
                index / waveform.length <= position / Math.max(1, length) ||
                undefined
              }
            />
          ))}
        </span>
        <input
          type="range"
          aria-label={labels.seek ?? "Seek voice note"}
          aria-valuetext={`${time(position)} / ${time(length)}`}
          min={0}
          max={length}
          step={0.1}
          value={Math.min(position, length)}
          onChange={(event) => {
            const next = Number(event.target.value);
            setPosition(next);
            if (audio.current) audio.current.currentTime = next;
          }}
        />
      </div>
      <button
        type="button"
        className="mi-voice-time"
        aria-label={labels.speed?.(speed) ?? `Voice playback speed ${speed} times. Change speed`}
        onClick={() => {
          const next = speed === 2 ? 1 : speed + 0.5;
          setSpeed(next);
          if (audio.current) audio.current.playbackRate = next;
        }}
      >
        <span>{time(position)} / {time(length)}</span>
        <small>{speed}×</small>
      </button>
      <span className={error ? "mi-voice-error" : "mru-sr-only"} role="status">
        {error ? (labels.error ?? "Audio could not be played. Press play to retry.") : ""}
      </span>
    </div>
  );
}
