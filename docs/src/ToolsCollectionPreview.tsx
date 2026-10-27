import { Icon as VectorIcon } from "../../src/icons";
import { useState } from "react";
import { Button, TextField } from "../../src/system/base";
import {
  TagInput,
  WheelPicker,
  ColorPicker,
  BezierEditor,
  CollaborativeCursor,
  SlashCommandEditor,
  ChartRangeNavigator,
  CarouselScrubber,
  DialogStack,
  LiveCodeSandbox,
  type CursorPeer,
  type EditorBlock,
} from "../../src/collections/tools";

const chart = Array.from({ length: 48 }, (_, i) => ({
  label: `Day ${i + 1}`,
  value: Math.round(
    130 + Math.sin(i * 0.48) * 52 + i * 2.4 + Math.cos(i * 0.9) * 18,
  ),
}));
function CursorDemo() {
  const [peers, setPeers] = useState<CursorPeer[]>([
    {
      id: "mina",
      name: "Mina",
      x: 0.2,
      y: 0.24,
      message: "Try a little more space.",
    },
    { id: "jun", name: "Jun", x: 0.68, y: 0.63, message: "This feels better." },
  ]);
  const [follow, setFollow] = useState(false);
  return (
    <>
      <CollaborativeCursor
        peers={peers}
        onPositionChange={(p) => {
          if (follow && p)
            setPeers((current) =>
              current.map((peer, i) => ({
                ...peer,
                x: Math.max(0, Math.min(1, p.x + (i ? -0.18 : 0.1))),
                y: Math.max(0, Math.min(1, p.y + (i ? 0.14 : -0.12))),
              })),
            );
        }}
      >
        <small>LOCAL PEER SIMULATION</small>
        <h3>Good ideas travel together.</h3>
        <p>Move your pointer or focus this canvas and use arrow keys.</p>
        <TextField
          label="Canvas note"
          defaultValue="Keep the little details."
        />
      </CollaborativeCursor>
      <div className="mingu-tool-row">
        <Button
          variant="secondary"
          aria-pressed={follow}
          onClick={() => setFollow(!follow)}
        >
          {follow ? "Stop local followers" : "Follow my cursor"}
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            setPeers(
              peers.length
                ? []
                : [
                    {
                      id: "mina",
                      name: "Mina",
                      x: 0.25,
                      y: 0.3,
                      message: "Back again.",
                    },
                  ],
            )
          }
        >
          {peers.length ? "Remove peers" : "Add local peer"}
        </Button>
      </div>
      <small>
        This demo supplies local peer positions. Connect your own presence
        service in a consuming app.
      </small>
    </>
  );
}
function WheelDemo() {
  const [value, setValue] = useState("30"),
    [changed, setChanged] = useState(false);
  return (
    <>
      <WheelPicker
        label="Focus session"
        value={value}
        onValueChange={setValue}
        options={(changed
          ? [15, 20, 25, 45, 60, 90]
          : [15, 20, 25, 30, 45, 60, 90]
        ).map((n) => ({
          value: String(n),
          label: `${n} minutes`,
          disabled: changed && n === 15,
        }))}
      />
      <Button
        variant="ghost"
        disabled={changed}
        onClick={() => setChanged(true)}
      >
        Remove selected option
      </Button>
    </>
  );
}
function EditorDemo() {
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    { id: "title", type: "heading", text: "A place to think." },
    {
      id: "intro",
      type: "paragraph",
      text: "Make a new block with Enter. Type / to change its shape.",
    },
  ]);
  return (
    <>
      <SlashCommandEditor value={blocks} onValueChange={setBlocks} />
      <details>
        <summary>Document data</summary>
        <pre className="mingu-tool-code">{JSON.stringify(blocks, null, 2)}</pre>
      </details>
    </>
  );
}
function StackDemo() {
  const [open, setOpen] = useState(false),
    [step, setStep] = useState(0),
    [project, setProject] = useState("My next idea"),
    [done, setDone] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
      >
        Create a project
      </Button>
      <DialogStack
        open={open}
        onOpenChange={setOpen}
        value={step}
        onValueChange={setStep}
        onComplete={() => setDone(true)}
        steps={[
          {
            id: "name",
            title: "Start with a name.",
            description: "You can always change it later.",
            content: (
              <TextField
                label="Project name"
                value={project}
                maxLength={60}
                onChange={(e) => setProject(e.currentTarget.value)}
              />
            ),
          },
          {
            id: "shape",
            title: "Give it room.",
            description: "One focused place for your next idea.",
            content: (
              <div className="mingu-tool-demo-art" aria-hidden="true">
                Aa <VectorIcon name="external" size="1em" />
              </div>
            ),
          },
          {
            id: "review",
            title: "Ready to begin?",
            content: (
              <p>
                <strong>{project || "Untitled project"}</strong> is ready in
                this local demo.
              </p>
            ),
          },
        ]}
      />
      <small role="status">
        {done
          ? `Created “${project || "Untitled project"}” in this demo.`
          : "Three steps. One focused conversation."}
      </small>
    </>
  );
}
export default function ToolsCollectionPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`mingu-tools-preview${compact ? " is-compact" : ""}`}
      data-tool-demo={id}
    >
      {id === "tag-input" ? (
        <TagInput
          label="Project topics"
          defaultValue={["Design", "Interaction"]}
          suggestions={[
            "React",
            "Motion",
            "TypeScript",
            "Prototyping",
            "Accessibility",
          ]}
          maxTags={6}
        />
      ) : id === "wheel-picker" ? (
        <WheelDemo />
      ) : id === "color-picker" ? (
        <ColorPicker label="Find your accent" />
      ) : id === "bezier-editor" ? (
        <BezierEditor />
      ) : id === "collaborative-cursor" ? (
        <CursorDemo />
      ) : id === "slash-command-editor" ? (
        <EditorDemo />
      ) : id === "chart-range-navigator" ? (
        <ChartRangeNavigator
          label="Daily visits"
          data={chart}
          defaultValue={[12, 32]}
        />
      ) : id === "carousel-scrubber" ? (
        <CarouselScrubber
          label="Selected studies"
          items={["Move softly.", "Make room.", "Stay curious."].map(
            (title, i) => ({
              id: String(i),
              title,
              content: (
                <div className="mingu-tool-demo-art" data-art={i}>
                  {
                    [
                      <>
                        Aa <VectorIcon name="external" size="1em" />
                      </>,
                      <>
                        <VectorIcon name="circle" size="1em" />{" "}
                        <VectorIcon name="circle" size="1em" />
                      </>,
                      <VectorIcon name="move" size="1em" />,
                    ][i]
                  }
                </div>
              ),
            }),
          )}
        />
      ) : id === "dialog-stack" ? (
        <StackDemo />
      ) : id === "live-code-sandbox" ? (
        <LiveCodeSandbox autoRun />
      ) : (
        <p>Choose a tool to try.</p>
      )}
    </div>
  );
}
