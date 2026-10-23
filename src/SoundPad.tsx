"use client";
import * as React from "react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "./system/base";
import { Slider } from "./system/forms";
import { useExperimentCanvas } from "./experimental/canvas";
import { experimentalMotion as limits } from "./system/motion-tokens";
export interface SoundPadNote {
  id: string;
  label: string;
  frequency: number;
}
export interface SoundPadProps {
  notes?: readonly SoundPadNote[];
  onNote?: (note: SoundPadNote) => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
}
const defaultNotes: readonly SoundPadNote[] = [
  { id: "c", label: "C4", frequency: 261.63 },
  { id: "d", label: "D4", frequency: 293.66 },
  { id: "e", label: "E4", frequency: 329.63 },
  { id: "g", label: "G4", frequency: 392 },
  { id: "a", label: "A4", frequency: 440 },
  { id: "c5", label: "C5", frequency: 523.25 },
  { id: "d5", label: "D5", frequency: 587.33 },
  { id: "e5", label: "E5", frequency: 659.25 },
];
type Pulse = { x: number; y: number; age: number; note: number };
export function SoundPad({
  notes = defaultNotes,
  onNote,
  label = "Sound pad",
  className = "",
  style,
}: SoundPadProps) {
  const playable = notes.slice(0, 8),
    [enabled, setEnabled] = useState(false),
    [audioError, setAudioError] = useState(""),
    [selected, setSelected] = useState(0),
    [playing, setPlaying] = useState(false),
    [recording, setRecording] = useState(false),
    [beat, setBeat] = useState(-1),
    [steps, setSteps] = useState<(number | null)[]>(
      [
        0,
        null,
        Math.min(2, playable.length - 1),
        null,
        Math.min(4, playable.length - 1),
        null,
        Math.min(7, playable.length - 1),
        null,
      ].map((n) => (n === null || n < 0 ? null : n)),
    ),
    [volume, setVolume] = useState(25),
    [message, setMessage] = useState("Touch a note. Build a little loop.");
  const audio = useRef<AudioContext | null>(null),
    master = useRef<GainNode | null>(null),
    voices = useRef(new Set<OscillatorNode>()),
    pulses = useRef<Pulse[]>([]),
    root = useRef<HTMLDivElement>(null),
    padRefs = useRef<(HTMLButtonElement | null)[]>([]),
    cursor = useRef(0),
    mounted = useRef(false),
    opening = useRef(false),
    pointerPlayed = useRef(false),
    current = useRef({
      playable,
      onNote,
      enabled,
      recording,
      selected,
      steps,
      volume,
    });
  current.current = {
    playable,
    onNote,
    enabled,
    recording,
    selected,
    steps,
    volume,
  };
  const animation = useExperimentCanvas(
    (delta, canvas) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const width = canvas.clientWidth,
        height = canvas.clientHeight,
        ratio = canvas.width / Math.max(1, width);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const styles = getComputedStyle(canvas),
        color = styles.getPropertyValue("--mingu-accent") || "#999";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      for (let i = 0; i < 8; i++) {
        const x = (((i % 4) + 0.5) * width) / 4,
          y = ((Math.floor(i / 4) + 0.5) * height) / 2;
        ctx.globalAlpha = 0.12;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(3, width / 80), 0, Math.PI * 2);
        ctx.fill();
      }
      for (const pulse of pulses.current) {
        pulse.age += delta;
        const life = Math.max(0, 1 - pulse.age / 1.5);
        ctx.globalAlpha = life * 0.55;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
          pulse.x * width,
          pulse.y * height,
          (1 - life) * Math.min(width, height) * 0.6 + 12,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + pulse.note * 0.3,
            radius = (1 - life) * 120;
          ctx.globalAlpha = life * 0.7;
          ctx.beginPath();
          ctx.arc(
            pulse.x * width + Math.cos(angle) * radius,
            pulse.y * height + Math.sin(angle) * radius,
            2.3 * life,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      pulses.current = pulses.current.filter((p) => p.age < 1.5);
    },
    false,
    root,
  );
  useEffect(() => {
    setSelected((n) => Math.max(0, Math.min(n, playable.length - 1)));
    setSteps((list) =>
      list.map((n) => (n !== null && n >= playable.length ? null : n)),
    );
  }, [playable.length]);
  const visible = useRef(animation.active);
  visible.current = animation.active;
  const stopVoices = () => {
    for (const voice of voices.current) {
      try {
        voice.stop();
      } catch {}
    }
    voices.current.clear();
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopVoices();
      const context = audio.current;
      audio.current = null;
      master.current = null;
      if (context && context.state !== "closed")
        void context.close().catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (!animation.active) {
      setPlaying(false);
      setEnabled(false);
      pulses.current = [];
      stopVoices();
      if (audio.current?.state === "running")
        void audio.current.suspend().catch(() => {});
    }
  }, [animation.active]);
  useEffect(() => {
    if (master.current && audio.current) {
      master.current.gain.setTargetAtTime(
        enabled ? (volume / 100) * 0.18 : 0,
        audio.current.currentTime,
        0.025,
      );
    }
  }, [enabled, volume]);
  const toggleSound = async () => {
    if (enabled) {
      setEnabled(false);
      stopVoices();
      if (audio.current?.state === "running")
        void audio.current.suspend().catch(() => {});
      return;
    }
    if (opening.current) return;
    opening.current = true;
    setAudioError("");
    try {
      if (typeof window.AudioContext !== "function") throw Error("unsupported");
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      if (!master.current) {
        master.current = context.createGain();
        master.current.gain.value = (current.current.volume / 100) * 0.18;
        master.current.connect(context.destination);
      }
      await context.resume();
      if (
        mounted.current &&
        audio.current === context &&
        visible.current &&
        !document.hidden
      ) {
        setEnabled(true);
        setMessage("Sound enabled.");
      } else if (context.state === "running") await context.suspend();
    } catch {
      if (mounted.current)
        setAudioError(
          "Audio is unavailable. You can still play with the visuals.",
        );
    } finally {
      opening.current = false;
    }
  };
  const play = (index: number, capture = true) => {
    const note = current.current.playable[index];
    if (!note) return;
    setSelected(index);
    const safeIndex = index % 8;
    pulses.current = [
      ...pulses.current.slice(-(limits.pulseLimit - 1)),
      {
        x: ((safeIndex % 4) + 0.5) / 4,
        y: (Math.floor(safeIndex / 4) + 0.5) / 2,
        age: 0,
        note: index,
      },
    ];
    animation.invalidate();
    current.current.onNote?.(note);
    if (capture && current.current.recording) {
      const position = cursor.current;
      setSteps((list) =>
        list.map((value, i) => (i === position ? index : value)),
      );
      cursor.current = (position + 1) % 8;
      setBeat(position);
      setMessage(`Captured ${note.label} in step ${position + 1}.`);
    } else if (capture) setMessage(`${note.label} played.`);
    const context = audio.current;
    if (
      !current.current.enabled ||
      !context ||
      context.state !== "running" ||
      !master.current
    )
      return;
    try {
      while (voices.current.size >= limits.voiceLimit) {
        const oldest = voices.current.values().next().value as
          | OscillatorNode
          | undefined;
        if (!oldest) break;
        oldest.stop();
        voices.current.delete(oldest);
      }
      const tone = context.createOscillator(),
        gain = context.createGain(),
        now = context.currentTime;
      tone.type = "sine";
      tone.frequency.value = Math.max(
        80,
        Math.min(
          1200,
          Number.isFinite(note.frequency) ? note.frequency : 261.63,
        ),
      );
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + limits.noteLength);
      tone.connect(gain);
      gain.connect(master.current);
      voices.current.add(tone);
      tone.onended = () => {
        voices.current.delete(tone);
        tone.disconnect();
        gain.disconnect();
      };
      tone.start();
      tone.stop(now + limits.noteLength + 0.02);
    } catch {
      setAudioError("Audio playback stopped. Try enabling sound again.");
      setEnabled(false);
    }
  };
  const playRef = useRef(play);
  playRef.current = play;
  useEffect(() => {
    if (!playing || !animation.active) return;
    let step = 0;
    const tick = () => {
      setBeat(step);
      const note = current.current.steps[step];
      if (note !== null) playRef.current(note, false);
      step = (step + 1) % 8;
    };
    tick();
    const timer = setInterval(tick, limits.stepLength);
    return () => clearInterval(timer);
  }, [playing, animation.active]);
  return (
    <div
      ref={root}
      className={`mingu-sound-pad ${className}`}
      style={style}
      role="group"
      aria-label={label}
      onKeyDown={(event) => {
        if (
          (event.target as Element).closest("input,textarea,select") ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey
        )
          return;
        const n = Number(event.key) - 1;
        if (
          n >= 0 &&
          n < playable.length &&
          event.key.length === 1 &&
          !event.repeat
        ) {
          event.preventDefault();
          play(n);
        }
      }}
    >
      <div className="mingu-sound-surface mingu-experiment-surface">
        <canvas ref={animation.canvas} aria-hidden="true" />
        <div className="mingu-sound-keys" role="group" aria-label="Play notes">
          {playable.map((note, i) => (
            <button
              type="button"
              key={note.id}
              ref={(element) => {
                padRefs.current[i] = element;
              }}
              data-active={selected === i || undefined}
              aria-label={`Play ${note.label}`}
              onPointerDown={(event) => {
                pointerPlayed.current =
                  event.button === 0 && event.pointerType !== "touch";
                if (pointerPlayed.current) play(i);
              }}
              onClick={(event) => {
                if (event.detail === 0 || !pointerPlayed.current) play(i);
                pointerPlayed.current = false;
              }}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{note.label}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div className="mingu-experiment-buttons">
        <Button
          variant={enabled ? "primary" : "secondary"}
          aria-pressed={enabled}
          onClick={() => void toggleSound()}
        >
          {enabled ? "Mute sound" : "Enable sound"}
        </Button>
        <Button
          variant="ghost"
          aria-pressed={playing}
          disabled={!playable.length}
          onClick={() => {
            setPlaying(!playing);
            setRecording(false);
            if (playing) setBeat(-1);
          }}
        >
          {playing ? "Stop loop" : "Play loop"}
        </Button>
        <Button
          variant="ghost"
          aria-pressed={recording}
          disabled={!playable.length}
          onClick={() => {
            setRecording(!recording);
            setPlaying(false);
            cursor.current = 0;
            setBeat(-1);
            setMessage(
              recording
                ? "Capture stopped."
                : "Play notes to fill the eight steps.",
            );
          }}
        >
          Capture notes
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPlaying(false);
            setRecording(false);
            setSteps(Array(8).fill(null));
            setBeat(-1);
            pulses.current = [];
            animation.invalidate();
            setMessage("A blank loop. Make it yours.");
          }}
        >
          Clear loop
        </Button>
      </div>
      <div
        className="mingu-sound-sequencer"
        role="group"
        aria-label="Eight step loop"
      >
        {steps.map((note, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Step ${i + 1}: ${note === null ? "empty" : (playable[note]?.label ?? "unavailable")}`}
            aria-pressed={note !== null}
            data-beat={beat === i || undefined}
            disabled={!playable.length}
            onClick={() =>
              setSteps((list) =>
                list.map((n, index) =>
                  index === i ? (n === null ? selected : null) : n,
                ),
              )
            }
          >
            <span>{i + 1}</span>
            <strong>
              {note === null ? "—" : (playable[note]?.label ?? "—")}
            </strong>
          </button>
        ))}
      </div>
      <Slider
        label="Volume"
        value={volume}
        onValueChange={setVolume}
        min={0}
        max={50}
      />
      {audioError && (
        <p className="mingu-field-error" role="alert">
          {audioError}
        </p>
      )}
      <p className="mingu-experiment-status" role="status">
        {message}
      </p>
    </div>
  );
}
