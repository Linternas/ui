"use client";
import { useEffect, useRef, useState } from "react";
import {
  Folder,
  CodeBlock,
  GravityLetters,
  GithubActivity,
  StepPlayer,
  AnimatedCounter,
  VoiceNote,
  Faq,
  FluidOrb,
  GridReveal,
  MatrixOrb,
  WebSearch,
  WebSearchAnswer,
  WebSearchCitation,
  AiStatus,
  BounceSidebar,
  HookSidebar,
  ProximitySidebar,
  GooeyNav,
  DurationPicker,
  OtpInput,
  DeleteButton,
  TaskList,
  EmojiReaction,
  NotificationBell,
  type AiState,
  type MatrixState,
} from "@mingu/interaction-ui";
import ExplorationPreview from "./ExplorationPreview";
import GesturePreview from "./GesturePreview";
import EverydayPreview from "./EverydayPreview";
import StudioPreview from "./StudioPreview";
import PlaygroundPreview from "./PlaygroundPreview";
import MobilePreview from "./MobilePreview";
import ReadingDemos from "./ReadingDemos";
import type { ComponentId } from "./catalog";

const navItems = [
  { id: "overview", label: "Overview", icon: "⌘" },
  { id: "projects", label: "Projects", icon: "▧" },
  { id: "activity", label: "Activity", icon: "◴" },
  { id: "settings", label: "Settings", icon: "⚙" },
];
const contributions = Array.from({ length: 364 }, (_, i) => ({
  date: new Date(Date.UTC(2025, 0, i + 1)).toISOString().slice(0, 10),
  count: i % 5 === 0 ? 0 : Math.round(Math.abs(Math.sin(i * 1.71)) * 13),
}));
const sources = [
  {
    id: "react",
    title: "Thinking in React",
    url: "https://react.dev/learn/thinking-in-react",
    snippet: "Build a component hierarchy from the parts of an interface.",
  },
  {
    id: "mdn",
    title: "The platform underneath",
    url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility",
    snippet:
      "Accessible experiences built with the browser’s native capabilities.",
  },
  {
    id: "motion",
    title: "Motion for React",
    url: "https://motion.dev/docs/react",
    snippet: "Animation, gestures, and the small details between states.",
  },
];
const picture = "/ui-lab/landscape.svg";
const code = `type Point = { x: number; y: number };

export function distance(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

// Small details. Better interfaces.
const origin: Point = { x: 0, y: 0 };`;

export default function DemoPreview({
  id,
  compact = false,
}: {
  id: ComponentId;
  compact?: boolean;
}) {
  const [color, setColor] = useState("#4388ed"),
    [counter, setCounter] = useState(12849),
    [count, setCount] = useState(3),
    [reset, setReset] = useState(0);
  const [matrix, setMatrix] = useState<MatrixState>("idle"),
    [status, setStatus] = useState<AiState>("thinking"),
    [otp, setOtp] = useState<"idle" | "success" | "error">("idle");
  const [src, setSrc] = useState<string | null>(picture),
    [searching, setSearching] = useState(false),
    [generation, setGeneration] = useState(0),
    [last, setLast] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  const palette = (
    <div className="studio-swatches" role="group" aria-label="Accent color">
      {["#4388ed", "#ec6a3c", "#875ad2", "#399d76"].map((hex) => (
        <button
          type="button"
          key={hex}
          aria-label={`Use ${hex}`}
          aria-pressed={color === hex}
          style={{ background: hex }}
          onClick={() => setColor(hex)}
        />
      ))}
    </div>
  );
  const resetControl = (
    <button
      type="button"
      className="studio-tool"
      onClick={() => setReset(reset + 1)}
    >
      Reset ↻
    </button>
  );
  switch (id) {
    case "swipe-actions":
    case "pull-to-refresh":
    case "long-press-menu":
    case "selection-bar":
      return <MobilePreview id={id} />;
    case "hover-gallery":
    case "text-reveal":
    case "cursor-trail":
    case "avatar-cluster":
    case "hold-to-confirm":
    case "number-scrubber":
      return <PlaygroundPreview id={id} compact={compact} />;
    case "image-lens":
    case "directional-card":
    case "looping-ticker":
    case "rotating-text":
      return <StudioPreview id={id} compact={compact} />;
    case "image-lightbox":
    case "expandable-card":
    case "animated-filter-bar":
    case "resizable-panels":
    case "sortable-list":
    case "inline-edit":
    case "selection-toolbar":
    case "smart-header":
    case "code-tabs":
    case "bottom-sheet":
    case "action-toast":
    case "file-dropzone":
      return <EverydayPreview id={id} compact={compact} />;
    case "radial-menu":
    case "preview-link":
    case "morphing-search":
    case "elastic-slider":
      return <GesturePreview id={id} compact={compact} />;
    case "swipe-deck":
    case "focus-dock":
    case "image-compare":
    case "command-palette":
    case "scramble-text":
      return <ExplorationPreview id={id} compact={compact} />;
    case "folder":
      return (
        <>
          <Folder color={color} label="Design notes" />
          <div className="studio-demo-controls">
            {palette}
            <span>Hover · Click to open</span>
          </div>
        </>
      );
    case "code-block":
      return (
        <>
          <div className="studio-wide">
            <CodeBlock
              code={code}
              language="typescript"
              filename="geometry.ts"
              highlightLines={[4, 5, 6]}
            />
          </div>
          <div className="studio-demo-controls">
            <span>Try copying or selecting the code</span>
          </div>
        </>
      );
    case "gravity-letters":
      return (
        <>
          <GravityLetters key={reset} type="both" />
          <div className="studio-demo-controls">
            {resetControl}
            <span>Click & hold · Enter to drop</span>
          </div>
        </>
      );
    case "github-activity":
      return (
        <>
          <GithubActivity
            contributions={contributions}
            repos={[
              { name: "interaction-ui", count: 521 },
              { name: "blog", count: 312 },
              { name: "field-notes", count: 89 },
            ]}
          />
          <div className="studio-demo-controls">
            <span>Generated sample data · open the repository stack</span>
          </div>
        </>
      );
    case "step-player":
      return (
        <StepPlayer
          steps={[
            { label: "A place to begin" },
            { label: "Make something move" },
            { label: "Find the rhythm" },
            { label: "Ready to share" },
          ]}
          duration={1800}
        />
      );
    case "animated-counter":
      return (
        <>
          <div className="studio-counter">
            <AnimatedCounter value={counter} />
          </div>
          <div className="studio-demo-controls">
            <button
              type="button"
              className="studio-tool"
              onClick={() => setCounter(counter - 125)}
            >
              − 125
            </button>
            <button
              type="button"
              className="studio-tool"
              onClick={() => setCounter(counter + 125)}
            >
              + 125
            </button>
            <button
              type="button"
              className="studio-tool"
              onClick={() => setCounter(counter < 100000 ? 100001 : 999)}
            >
              Change places
            </button>
          </div>
        </>
      );
    case "voice-note":
      return (
        <>
          <VoiceNote src="/ui-lab/note.wav" duration={8} />
          <div className="studio-demo-controls">
            <span>8-second synthesized audio · no microphone access</span>
          </div>
        </>
      );
    case "faq":
      return (
        <Faq
          items={[
            {
              id: "what",
              question: "What is this little collection?",
              answer:
                "A place to explore how small interactions can make everyday interfaces feel better.",
            },
            {
              id: "keyboard",
              question: "Can I use my keyboard?",
              answer:
                "Yes. Tab to a question, use the arrow keys to move, and press Enter or Space to open it.",
            },
            {
              id: "theme",
              question: "Does it work in both themes?",
              answer:
                "Switch the theme in the blog header. The components inherit a shared set of customizable colors.",
            },
          ]}
        />
      );
    case "fluid-orb":
      return (
        <>
          <FluidOrb color={color} size={240} />
          <div className="studio-demo-controls">
            {palette}
            <span>Ambient WebGL</span>
          </div>
        </>
      );
    case "grid-reveal":
      return (
        <>
          <GridReveal
            key={generation}
            src={src}
            alt="An abstract mountain landscape at sunset"
            caption="Finding the picture"
          />
          <div className="studio-demo-controls">
            <button
              type="button"
              className="studio-tool"
              onClick={() => {
                if (timeout.current) clearTimeout(timeout.current);
                setGeneration(generation + 1);
                setSrc(null);
                timeout.current = setTimeout(() => setSrc(picture), 1900);
              }}
            >
              Generate again ↻
            </button>
            <span>Local illustration</span>
          </div>
        </>
      );
    case "matrix-orb":
      return (
        <>
          <MatrixOrb state={matrix} color={color} size={240} />
          <div className="studio-demo-controls">
            {(["idle", "listening", "thinking"] as const).map((state) => (
              <button
                type="button"
                className="studio-tool"
                key={state}
                aria-pressed={matrix === state}
                onClick={() => setMatrix(state)}
              >
                {state}
              </button>
            ))}
          </div>
        </>
      );
    case "web-search":
      return (
        <>
          <div className="studio-wide">
            <WebSearch
              sources={sources}
              status={searching ? "searching" : "done"}
              query="What makes an interface feel good?"
            />
            {!searching && (
              <>
                <WebSearchAnswer
                  key={reset}
                  text="Good interfaces make the next action clear. They offer a little feedback, keep familiar patterns, and leave enough room for the content."
                />
                <div className="studio-citations">
                  {sources.map((source, index) => (
                    <WebSearchCitation
                      source={source}
                      index={index + 1}
                      key={source.id}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="studio-demo-controls">
            <button
              type="button"
              className="studio-tool"
              onClick={() => {
                if (timeout.current) clearTimeout(timeout.current);
                setSearching(true);
                setReset(reset + 1);
                timeout.current = setTimeout(() => setSearching(false), 1200);
              }}
            >
              Replay ↻
            </button>
            <span>Illustrative answer · real documentation links</span>
          </div>
        </>
      );
    case "ai-status":
      return (
        <>
          <AiStatus
            key={reset}
            state={status}
            detail={status === "researching" ? "3 sources" : undefined}
            timer
          />
          <div className="studio-demo-controls">
            {(
              [
                "thinking",
                "researching",
                "analyzing",
                "writing",
                "done",
                "error",
              ] as const
            ).map((state) => (
              <button
                type="button"
                className="studio-tool"
                key={state}
                aria-pressed={status === state}
                onClick={() => setStatus(state)}
              >
                {state}
              </button>
            ))}
          </div>
        </>
      );
    case "bounce-sidebar":
      return <BounceSidebar items={navItems} />;
    case "hook-sidebar":
      return <HookSidebar items={navItems} />;
    case "proximity-sidebar":
      return <ProximitySidebar items={navItems} />;
    case "gooey-nav":
      return (
        <GooeyNav
          items={navItems.slice(0, 3).map(({ id, label }) => ({ id, label }))}
        />
      );
    case "rail-toc":
      return <ReadingDemos kind="rail" />;
    case "scroll-progress":
      return <ReadingDemos kind="progress" />;
    case "duration-picker":
      return (
        <>
          <DurationPicker
            onConfirm={(value) =>
              setLast(`${value.hours} hr ${value.minutes} min`)
            }
          />
          <div className="studio-demo-controls">
            <span role="status">
              {last
                ? `Selected: ${last}`
                : "Edit the time · Enter to confirm · Esc to close"}
            </span>
          </div>
        </>
      );
    case "otp-input":
      return (
        <>
          <OtpInput
            key={reset}
            status={otp}
            onChange={() => setOtp("idle")}
            onComplete={() => setOtp("success")}
          />
          <div className="studio-demo-controls">
            <button
              type="button"
              className="studio-tool"
              onClick={() => setOtp("error")}
            >
              Error state
            </button>
            <button
              type="button"
              className="studio-tool"
              onClick={() => {
                setReset(reset + 1);
                setOtp("idle");
              }}
            >
              Reset ↻
            </button>
            <span>Sample only · no authentication request</span>
          </div>
        </>
      );
    case "delete-button":
      return (
        <>
          <DeleteButton
            key={reset}
            onConfirm={() => {
              setLast("The sample item was removed.");
            }}
          />
          <div className="studio-demo-controls">
            {resetControl}
            <span role="status">{last || "Only the demo state changes"}</span>
          </div>
        </>
      );
    case "task-list":
      return (
        <TaskList
          defaultItems={[
            { id: "one", label: "Find a small idea", completed: true },
            {
              id: "two",
              label: "Make the first version",
              completed: false,
              detail: "Keep it simple, keep it useful.",
            },
            { id: "three", label: "Add the little details", completed: false },
            { id: "four", label: "Put it out in the world", completed: false },
          ]}
        />
      );
    case "emoji-reaction":
      return (
        <>
          <EmojiReaction onReact={(emoji) => setLast(emoji)} />
          <div className="studio-demo-controls">
            <span>
              {last
                ? `A little ${last} goes a long way.`
                : "Click to react · Arrow keys to choose"}
            </span>
          </div>
        </>
      );
    case "notification-bell":
      return (
        <>
          <NotificationBell count={count} onClick={() => setCount(0)} />
          <div className="studio-demo-controls">
            <button
              type="button"
              className="studio-tool"
              onClick={() => setCount(count + 1)}
            >
              + Add notification
            </button>
            <button
              type="button"
              className="studio-tool"
              onClick={() => setCount(128)}
            >
              99+ badge
            </button>
            <span>Click the bell to mark as read</span>
          </div>
        </>
      );
  }
}
