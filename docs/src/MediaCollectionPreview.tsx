import { useEffect, useState, type ReactNode } from "react";
import { Button, TextField, Select } from "../../src/system/base";
import {
  SplitFlapDisplay,
  VariableFontProximity,
  VerticalReel,
  StoryViewer,
  VideoPlayer,
  ImageCropper,
  CalendarBoard,
  GanttTimeline,
  KanbanBoard,
  FileTree,
  type CalendarEvent,
  type GanttTask,
  type KanbanCard,
  type FileTreeNode,
} from "../../src/collections/media";

const photos = [
  {
    id: "day",
    title: "Take the long way home.",
    src: "/ui-lab/landscape.svg",
    alt: "Layered mountains under a soft peach sky",
    caption: "A little distance changes the view.",
  },
  {
    id: "night",
    title: "Stay a little later.",
    src: "/ui-lab/landscape-night.svg",
    alt: "Quiet mountain silhouettes after dark",
    caption: "Some things look better after hours.",
  },
  {
    id: "again",
    title: "Begin again.",
    src: "/ui-lab/landscape.svg",
    alt: "Sunlight returning over layered mountain ridges",
    caption: "Another day. Another small possibility.",
  },
];
function Frame({
  eyebrow,
  children,
  hint,
}: {
  eyebrow: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="ui-media-demo">
      <header>
        <span>{eyebrow}</span>
        {hint && <p>{hint}</p>}
      </header>
      {children}
    </div>
  );
}
function TypeDemo({ proximity = false }: { proximity?: boolean }) {
  const [text, setText] = useState(
      proximity ? "A little closer." : "MAKE ROOM",
    ),
    [replay, setReplay] = useState(0);
  return (
    <Frame
      eyebrow={
        proximity ? "TYPE THAT FOLLOWS YOUR ATTENTION" : "ONE LETTER AT A TIME"
      }
      hint={
        proximity
          ? "Move your pointer across the letters. Focus the type and try the arrow keys."
          : "Change the message. Each character has its own moment."
      }
    >
      {proximity ? (
        <VariableFontProximity text={text} />
      ) : (
        <SplitFlapDisplay text={text} replayKey={replay} />
      )}
      <div className="mingu-media-toolbar">
        <TextField
          label="Display text"
          value={text}
          maxLength={proximity ? 80 : 24}
          onChange={(event) => setText(event.target.value)}
        />
        {!proximity && (
          <Button variant="secondary" onClick={() => setReplay(replay + 1)}>
            Flip again
          </Button>
        )}
      </div>
    </Frame>
  );
}
function MediaUpload({ kind }: { kind: "image" | "video" }) {
  const [url, setUrl] = useState(""),
    [name, setName] = useState(""),
    [error, setError] = useState(""),
    [aspect, setAspect] = useState("1"),
    [exported, setExported] = useState(0);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return (
    <Frame
      eyebrow={
        kind === "image"
          ? "FRAME ONLY WHAT MATTERS"
          : "YOUR VIDEO. REAL CONTROLS."
      }
      hint={
        kind === "image"
          ? "Move the frame, adjust its size, then export a real PNG."
          : "Choose a local video. Playback stays in your browser; nothing is uploaded."
      }
    >
      <label className="ui-media-upload">
        {kind === "image" ? "Choose an image" : "Choose a video"}
        <input
          type="file"
          accept={`${kind}/*`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (
              !file.type.startsWith(`${kind}/`) ||
              file.size > (kind === "image" ? 10 : 100) * 1024 * 1024
            ) {
              setError(
                `Choose a ${kind} file smaller than ${kind === "image" ? 10 : 100} MB.`,
              );
              event.target.value = "";
              return;
            }
            setError("");
            setName(file.name);
            setUrl(URL.createObjectURL(file));
            setExported(0);
          }}
        />
      </label>
      {name && <span className="ui-media-result">{name}</span>}
      {error && <p role="alert">{error}</p>}
      {kind === "image" ? (
        <>
          <label className="mingu-media-label">
            Aspect ratio
            <Select
              aria-label="Aspect ratio"
              value={aspect}
              onChange={(event) => setAspect(event.target.value)}
            >
              <option value="1">Square · 1:1</option>
              <option value="1.5">Landscape · 3:2</option>
              <option value="0.75">Portrait · 3:4</option>
            </Select>
          </label>
          <ImageCropper
            src={url || "/ui-lab/landscape.svg"}
            alt={name || "Mountain landscape to crop"}
            aspect={Number(aspect)}
            onCropComplete={(blob) => setExported(blob.size)}
          />
          {exported > 0 && (
            <span className="ui-media-result">
              Exported {exported.toLocaleString()} bytes of PNG pixels.
            </span>
          )}
        </>
      ) : (
        <VideoPlayer
          src={url || undefined}
          poster="/ui-lab/landscape-night.svg"
        />
      )}
      {url && (
        <Button
          variant="ghost"
          onClick={() => {
            setUrl("");
            setName("");
            setExported(0);
          }}
        >
          Clear selected file
        </Button>
      )}
    </Frame>
  );
}
function CalendarDemo() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "review", title: "Review the little details", date: "2026-10-23" },
    { id: "ship", title: "Make room for something new", date: "2026-10-26" },
  ]);
  return (
    <Frame
      eyebrow="A LITTLE SPACE FOR YOUR DAYS"
      hint="Choose a day to add an event. Edit its title or move it with the date field, or drag it onto another day."
    >
      <CalendarBoard
        events={events}
        onEventsChange={setEvents}
        defaultMonth="2026-10"
        defaultDate="2026-10-23"
      />
    </Frame>
  );
}
function GanttDemo() {
  const [tasks, setTasks] = useState<GanttTask[]>([
    { id: "explore", title: "Explore", start: "2026-10-19", end: "2026-10-23" },
    {
      id: "shape",
      title: "Find the shape",
      start: "2026-10-23",
      end: "2026-10-28",
    },
    {
      id: "polish",
      title: "Little details",
      start: "2026-10-28",
      end: "2026-11-02",
    },
  ]);
  return (
    <Frame
      eyebrow="PLANS THAT CAN MOVE"
      hint="Drag a bar to move its dates. Drag the end to resize. Arrow keys work on both handles; Shift moves a week."
    >
      <GanttTimeline
        tasks={tasks}
        onTasksChange={setTasks}
        rangeStart="2026-10-19"
        rangeDays={21}
      />
    </Frame>
  );
}
function KanbanDemo() {
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: "idea", title: "A small idea", column: "ideas" },
    { id: "sketch", title: "Try a different angle", column: "ideas" },
    { id: "build", title: "Make it feel right", column: "making" },
  ]);
  return (
    <Frame
      eyebrow="THINK. MAKE. LET GO."
      hint="Grab the title to move a card. Arrow keys move between columns and reorder; the destination menu works on touch."
    >
      <KanbanBoard
        columns={[
          { id: "ideas", title: "Ideas" },
          { id: "making", title: "Making" },
          { id: "ready", title: "Ready" },
        ]}
        cards={cards}
        onCardsChange={setCards}
      />
    </Frame>
  );
}
const files: FileTreeNode[] = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "components",
        name: "components",
        children: [
          { id: "button", name: "Button.tsx" },
          { id: "card", name: "Card.tsx" },
        ],
      },
      { id: "tokens", name: "tokens.css" },
      { id: "index", name: "index.ts" },
    ],
  },
  { id: "docs", name: "docs", children: [{ id: "readme", name: "README.md" }] },
  { id: "locked", name: "private.env", disabled: true },
];
function FileDemo() {
  const [selection, setSelection] = useState("Nothing selected");
  return (
    <Frame
      eyebrow="A PLACE FOR EVERY LITTLE FILE"
      hint="Arrow keys explore. Right opens a folder, left closes it. Enter or Space selects. Type a name to jump."
    >
      <FileTree
        nodes={files}
        defaultExpandedIds={["src", "components"]}
        onSelect={(_, node) => setSelection(node.name)}
      />
      <span role="status" className="ui-media-result">
        {selection}
      </span>
    </Frame>
  );
}
export default function MediaCollectionPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  switch (id) {
    case "split-flap-display":
      return <TypeDemo />;
    case "variable-font-proximity":
      return <TypeDemo proximity />;
    case "vertical-reel":
      return (
        <Frame
          eyebrow="ONE FRAME. A DIFFERENT VIEW."
          hint="Scroll, swipe, use the buttons, or focus the reel and try up/down arrows."
        >
          <VerticalReel
            items={photos}
            style={
              {
                "--mingu-reel-height": compact ? "360px" : "480px",
              } as React.CSSProperties
            }
          />
        </Frame>
      );
    case "story-viewer":
      return (
        <Frame
          eyebrow="SMALL MOMENTS. ONE BY ONE."
          hint="Browse at your own pace or start automatic advance. Hover the image to pause."
        >
          <StoryViewer items={photos} />
        </Frame>
      );
    case "video-player":
      return <MediaUpload kind="video" />;
    case "image-cropper":
      return <MediaUpload kind="image" />;
    case "calendar-board":
      return <CalendarDemo />;
    case "gantt-timeline":
      return <GanttDemo />;
    case "kanban-board":
      return <KanbanDemo />;
    case "file-tree":
      return <FileDemo />;
    default:
      return null;
  }
}
