import { useState } from "react";
import { Button } from "../../src/system/base";
import {
  GradientEditor,
  PixelEditor,
  ScratchCard,
  UndoHistory,
  MultiSelect,
  TransferList,
  Rating,
  CircularDial,
} from "../../src/collections/creative";
const stack = [
  { value: "react", label: "React", description: "The component foundation" },
  {
    value: "motion",
    label: "Motion",
    description: "A little life between states",
  },
  {
    value: "typescript",
    label: "TypeScript",
    description: "Make the contract clear",
  },
  { value: "css", label: "CSS", description: "Keep the surface lightweight" },
  { value: "legacy", label: "Legacy adapter", disabled: true },
];
const versions = [
  {
    id: "v1",
    label: "A place to begin",
    description: "First draft",
    title: "A small idea",
    text: "Start with the essential things.",
  },
  {
    id: "v2",
    label: "Give it room",
    description: "Refined spacing",
    title: "Room to think",
    text: "Space makes a small idea feel clear.",
  },
  {
    id: "v3",
    label: "Find the words",
    description: "Reworked the headline",
    title: "Good things take shape",
    text: "A quiet place for the next good thing.",
  },
  {
    id: "v4",
    label: "Make it yours",
    description: "Final details",
    title: "Your next good thing",
    text: "Thoughtfully made. Ready to become something.",
  },
];
function HistoryDemo() {
  const [count, setCount] = useState(3),
    [version, setVersion] = useState("v3");
  const current = versions.find((v) => v.id === version)!;
  return (
    <>
      <div className="mingu-history-sample">
        <h3>{current.title}</h3>
        <p>{current.text}</p>
      </div>
      <UndoHistory
        entries={versions.slice(0, count)}
        value={version}
        onValueChange={setVersion}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={count === 4 && version === "v4"}
        onClick={() => {
          const next = Math.min(
            versions.findIndex((v) => v.id === version) + 1,
            3,
          );
          setCount(next + 1);
          setVersion(versions[next].id);
        }}
      >
        Make a change
      </Button>
    </>
  );
}
export default function CreativeCollectionPreview({ id }: { id: string }) {
  const [selected, setSelected] = useState<string[]>(["react", "motion"]);
  let content;
  switch (id) {
    case "gradient-editor":
      content = <GradientEditor />;
      break;
    case "pixel-editor":
      content = (
        <PixelEditor
          columns={10}
          rows={6}
          defaultValue={Array.from({ length: 60 }, (_, i) =>
            [13, 16, 22, 24, 25, 27, 32, 37, 43, 44, 45, 46].includes(i)
              ? "#a599f1"
              : "transparent",
          )}
        />
      );
      break;
    case "scratch-card":
      content = (
        <ScratchCard>
          <span className="mingu-creative-muted">A SMALL DISCOVERY</span>
          <strong>Stay curious.</strong>
          <p>The next good idea is already here.</p>
        </ScratchCard>
      );
      break;
    case "undo-history":
      content = <HistoryDemo />;
      break;
    case "multi-select":
      content = (
        <>
          <MultiSelect
            label="Project stack"
            options={stack}
            value={selected}
            onValueChange={setSelected}
            maxSelected={3}
          />
          <p className="mingu-creative-muted">
            Choose up to three building blocks.
          </p>
        </>
      );
      break;
    case "transfer-list":
      content = (
        <TransferList
          label="Project access"
          options={[
            { value: "mina", label: "Mina" },
            { value: "jun", label: "Jun" },
            { value: "ara", label: "Ara" },
            { value: "sol", label: "Sol" },
            { value: "owner", label: "Owner", disabled: true },
          ]}
          defaultValue={["mina", "owner"]}
        />
      );
      break;
    case "rating":
      content = <Rating label="How did that feel?" defaultValue={3} />;
      break;
    case "circular-dial":
      content = <CircularDial label="Intensity" defaultValue={40} step={5} />;
      break;
    default:
      return null;
  }
  return <div className="mingu-creative-demo">{content}</div>;
}
