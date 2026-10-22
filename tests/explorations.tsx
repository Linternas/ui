import { useState } from "react";
import {
  DesignSystemProvider,
  FocusDock,
  SwipeDeck,
  ImageCompare,
  CommandPalette,
  ScrambleText,
  Button,
} from "../src";
const image = (color: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="${color}"/></svg>`,
  );
export default function ExplorationFixture() {
  const [dock, setDock] = useState("home"),
    [index, setIndex] = useState(0),
    [percent, setPercent] = useState(50);
  const [open, setOpen] = useState(false),
    [action, setAction] = useState(""),
    [clicks, setClicks] = useState(0),
    [replay, setReplay] = useState(0);
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 24 }}
    >
      <div style={{ maxWidth: 560, display: "grid", gap: 40 }}>
        <FocusDock
          value={dock}
          onValueChange={setDock}
          items={[
            { id: "home", label: "Home", icon: "⌂" },
            { id: "locked", label: "Locked", icon: "◇", disabled: true },
            { id: "projects", label: "Projects", icon: "▧" },
            { id: "settings", label: "Settings", icon: "⚙" },
          ]}
        />
        <output aria-label="Dock selection">{dock}</output>
        <SwipeDeck
          index={index}
          onIndexChange={setIndex}
          loop={false}
          label="Project cards"
          items={[
            {
              id: "one",
              label: "First project",
              content: (
                <>
                  <h2>First project</h2>
                  <Button onClick={() => setClicks((n) => n + 1)}>
                    Card action
                  </Button>
                </>
              ),
            },
            {
              id: "two",
              label: "Second project",
              content: <h2>Second project</h2>,
            },
            {
              id: "three",
              label: "Third project",
              content: <h2>Third project</h2>,
            },
          ]}
        />
        <output aria-label="Card clicks">{clicks}</output>
        <ImageCompare
          value={percent}
          onValueChange={setPercent}
          before={{ src: image("blue"), alt: "Before image" }}
          after={{ src: image("orange"), alt: "After image" }}
        />
        <Button onClick={() => setOpen(true)}>Open commands</Button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          shortcut
          onSelect={setAction}
          items={[
            {
              id: "new",
              label: "Create project",
              keywords: ["new", "프로젝트"],
            },
            { id: "disabled", label: "Unavailable command", disabled: true },
            { id: "settings", label: "Settings" },
          ]}
        />
        <output aria-label="Command selection">{action}</output>
        <ScrambleText
          data-testid="scramble"
          text="BUILD SOMETHING GOOD."
          playOnMount={false}
          replayKey={replay}
        />
        <Button onClick={() => setReplay((n) => n + 1)}>Replay text</Button>
      </div>
    </DesignSystemProvider>
  );
}
