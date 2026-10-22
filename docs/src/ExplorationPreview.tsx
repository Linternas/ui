import { useState } from "react";
import {
  FocusDock,
  SwipeDeck,
  ImageCompare,
  CommandPalette,
  ScrambleText,
  Button,
  Text,
  type CommandItem,
} from "@mingu/interaction-ui";

function DockIcon({ index }: { index: number }) {
  const paths = [
    "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
    "M4 5h16v14H4zM4 10h16M9 10v9",
    "M4 17l5-5 4 3 7-10M15 5h5v5",
    "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2M16 12a4 4 0 11-8 0 4 4 0 018 0",
  ];
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index]} />
    </svg>
  );
}
const commands: CommandItem[] = [
  {
    id: "project",
    label: "Create a project",
    description: "Start with a fresh workspace",
    icon: "+",
    shortcut: "N",
    keywords: ["new", "프로젝트", "생성"],
  },
  {
    id: "files",
    label: "Find a file",
    description: "Search your collection",
    icon: "⌕",
    shortcut: "F",
    keywords: ["search", "파일"],
  },
  {
    id: "settings",
    label: "Open settings",
    description: "Make the space your own",
    icon: "⚙",
    keywords: ["설정"],
  },
  {
    id: "locked",
    label: "Team billing",
    description: "Available to administrators",
    disabled: true,
    icon: "◇",
  },
];
export default function ExplorationPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState("home");
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("");
  const [replay, setReplay] = useState(0);
  switch (id) {
    case "focus-dock":
      return (
        <div className="ui-explore-stage ui-dock-stage">
          <FocusDock
            value={selected}
            onValueChange={setSelected}
            items={[
              { id: "home", label: "Home", icon: <DockIcon index={0} /> },
              {
                id: "projects",
                label: "Projects",
                icon: <DockIcon index={1} />,
              },
              {
                id: "activity",
                label: "Activity",
                icon: <DockIcon index={2} />,
              },
              {
                id: "settings",
                label: "Settings",
                icon: <DockIcon index={3} />,
              },
            ]}
          />
          <Text muted size="sm">
            {selected.charAt(0).toUpperCase() + selected.slice(1)}
          </Text>
        </div>
      );
    case "swipe-deck":
      return (
        <div
          className={
            compact ? "ui-deck-demo ui-deck-demo-compact" : "ui-deck-demo"
          }
        >
          <SwipeDeck
            label="Design experiments"
            items={[
              {
                id: "form",
                label: "Form follows feeling",
                content: (
                  <>
                    <span className="ui-deck-index">01 / EXPLORATIONS</span>
                    <div className="ui-deck-orbit" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div>
                      <h3>
                        Form follows
                        <br />
                        feeling.
                      </h3>
                      <p>A little movement. A different perspective.</p>
                    </div>
                  </>
                ),
              },
              {
                id: "space",
                label: "Room to think",
                content: (
                  <>
                    <span className="ui-deck-index">02 / EXPLORATIONS</span>
                    <div className="ui-deck-grid" aria-hidden="true">
                      {Array.from({ length: 16 }, (_, i) => (
                        <i key={i} />
                      ))}
                    </div>
                    <div>
                      <h3>
                        Room
                        <br />
                        to think.
                      </h3>
                      <p>Space for what matters.</p>
                    </div>
                  </>
                ),
              },
              {
                id: "flow",
                label: "Find your flow",
                content: (
                  <>
                    <span className="ui-deck-index">03 / EXPLORATIONS</span>
                    <div className="ui-deck-wave" aria-hidden="true">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <i
                          key={i}
                          style={{ height: `${20 + Math.sin(i) * 15}px` }}
                        />
                      ))}
                    </div>
                    <div>
                      <h3>
                        Find
                        <br />
                        your flow.
                      </h3>
                      <p>One gesture. The next idea.</p>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </div>
      );
    case "image-compare":
      return (
        <ImageCompare
          before={{
            src: "/ui-lab/landscape.svg",
            alt: "Warm daylight over layered mountains",
          }}
          after={{
            src: "/ui-lab/landscape-night.svg",
            alt: "The same mountains with a cool evening grade",
          }}
          beforeLabel="Daylight"
          afterLabel="After hours"
        />
      );
    case "command-palette":
      return (
        <div className="ui-explore-stage">
          <Button
            variant="outline"
            className="ui-command-launcher"
            onClick={() => setOpen(true)}
          >
            <span>Jump to anything…</span>
            <kbd>⌘ K</kbd>
          </Button>
          <Text muted size="sm">
            {action
              ? `${commands.find((item) => item.id === action)?.label} selected`
              : compact
                ? "Click to explore"
                : "Click, or press Ctrl / ⌘ K"}
          </Text>
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            items={commands}
            shortcut={!compact}
            onSelect={setAction}
          />
        </div>
      );
    case "scramble-text":
      return (
        <div className="ui-explore-stage ui-scramble-stage">
          <span className="ui-scramble-eyebrow">LETTERS FIND THEIR PLACE</span>
          <ScrambleText
            className="ui-scramble-headline"
            text={
              compact ? "MAKE IT\nMATTER." : "MAKE SOMETHING\nTHAT MATTERS."
            }
            replayKey={replay}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplay((value) => value + 1)}
          >
            Replay ↻
          </Button>
        </div>
      );
    default:
      return null;
  }
}
