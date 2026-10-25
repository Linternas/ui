import { useState } from "react";
import {
  InteractionProvider,
  Folder,
  AnimatedCounter,
  GithubActivity,
  StepPlayer,
  Faq,
  DurationPicker,
  OtpInput,
  DeleteButton,
  TaskList,
  BounceSidebar,
  HookSidebar,
  ProximitySidebar,
  GooeyNav,
  EmojiReaction,
  NotificationBell,
  VoiceNote,
  GravityLetters,
  FluidOrb,
  MatrixOrb,
  GridReveal,
  WebSearch,
  WebSearchAnswer,
  WebSearchCitation,
  AiStatus,
} from "../src";

const items = [
  { id: "a", label: "Overview" },
  { id: "b", label: "Projects" },
  { id: "c", label: "Settings" },
];
const sources = [
  {
    id: "one",
    title: "A good source",
    url: "https://example.com",
    snippet: "Some useful context.",
  },
];
const image =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>',
  );
export default function InteractionFixture() {
  const compactBell = location.search.includes("notificationCompact");
  const [selected, select] = useState("Folder"),
    [number, setNumber] = useState(999),
    [count, setCount] = useState(128),
    [src, setSrc] = useState<string | null>(null),
    [last, setLast] = useState("");
  const demos = {
    Folder: <Folder label="Files" />,
    AnimatedCounter: (
      <>
        <AnimatedCounter value={number} />
        <button onClick={() => setNumber(number + 1)}>Increment</button>
      </>
    ),
    GithubActivity: (
      <GithubActivity
        contributions={[{ date: "2026-01-01", count: 4 }]}
        repos={[{ name: "project", count: 4 }]}
      />
    ),
    StepPlayer: (
      <StepPlayer
        steps={3}
        duration={120}
        onComplete={() => setLast("Finished")}
      />
    ),
    Faq: (
      <Faq
        items={[
          { id: "q1", question: "First question", answer: "First answer" },
          { id: "q2", question: "Second question", answer: "Second answer" },
        ]}
      />
    ),
    DurationPicker: (
      <DurationPicker onConfirm={(value) => setLast(JSON.stringify(value))} />
    ),
    OtpInput: <OtpInput onComplete={(value) => setLast(value)} />,
    DeleteButton: (
      <DeleteButton
        onConfirm={() => {
          setLast("Deleted callback");
        }}
      />
    ),
    TaskList: (
      <TaskList
        defaultItems={[
          { id: "a", label: "First task", completed: false },
          { id: "b", label: "Second task", completed: false },
        ]}
      />
    ),
    BounceSidebar: <BounceSidebar items={items} />,
    HookSidebar: <HookSidebar items={items} />,
    ProximitySidebar: <ProximitySidebar items={items} />,
    GooeyNav: <GooeyNav items={items} />,
    EmojiReaction: <EmojiReaction onReact={(value) => setLast(value)} />,
    NotificationBell: (
      <NotificationBell
        count={count}
        size={compactBell ? "compact" : "default"}
        indicator={compactBell ? "dot" : "count"}
        aria-label={compactBell ? "작업 알림" : undefined}
        aria-expanded={compactBell ? false : undefined}
        aria-controls={compactBell ? "notification-list" : undefined}
        disabled={location.search.includes("notificationDisabled")}
        onClick={(event) => {setCount(0);setLast(event.currentTarget.type);}}
      />
    ),
    VoiceNote: <VoiceNote duration={2} />,
    GravityLetters: <GravityLetters maxGlyphs={3} />,
    FluidOrb: <FluidOrb size={140} />,
    MatrixOrb: <MatrixOrb size={140} />,
    GridReveal: (
      <>
        <GridReveal src={src} alt="Test image" />
        <button onClick={() => setSrc(image)}>Resolve image</button>
      </>
    ),
    WebSearch: (
      <>
        <WebSearch sources={sources} />
        <WebSearchAnswer text="An answer with context." />
        <WebSearchCitation source={sources[0]} />
      </>
    ),
    AiStatus: <AiStatus state="done" />,
  };
  return (
    <InteractionProvider>
      <main
        style={{
          maxWidth: 550,
          margin: "30px auto",
          color: "#222",
          fontFamily: "system-ui",
        }}
      >
        <label>
          Component under test{" "}
          <select
            value={selected}
            onChange={(event) => {
              select(event.target.value);
              setLast("");
            }}
          >
            {Object.keys(demos).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <div
          style={{ padding: 30, marginTop: 100, minHeight: 350 }}
          key={selected}
        >
          {demos[selected as keyof typeof demos]}
        </div>
        <output aria-label="Callback result">{last}</output>
      </main>
    </InteractionProvider>
  );
}
