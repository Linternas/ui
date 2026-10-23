import { useState } from "react";
import {
  DesignSystemProvider,
  Button,
  DateRangePicker,
  TimePicker,
  RangeSlider,
  TreeSelect,
  Cascader,
  MentionInput,
  FilterBuilder,
  ColumnManager,
  SchedulePicker,
  FlipCard,
  ClipPathEditor,
} from "../src";
const nodes = [
  {
    id: "root",
    label: "Root",
    children: [
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta" },
      { id: "locked", label: "Locked", disabled: true },
    ],
  },
];
export default function WorkflowFixture() {
  const [data, setData] = useState(""),
    [notice, setNotice] = useState("");
  const fixed = new URLSearchParams(location.search).has("controlled");
  return (
    <DesignSystemProvider theme="light" accent="neutral">
      <main style={{ maxWidth: 600, margin: "24px auto", padding: 16 }}>
        {fixed ? (
          <>
            <DateRangePicker
              value={{ start: "2026-10-23", end: "2026-10-25" }}
              onValueChange={(v) => setNotice(JSON.stringify(v))}
            />
            <RangeSlider
              value={[20, 80]}
              onValueChange={(v) => setNotice(JSON.stringify(v))}
            />
            <FlipCard
              front="Front"
              back="Back"
              flipped={false}
              onFlippedChange={(v) => setNotice(String(v))}
            />
            <ClipPathEditor
              value={[
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 50, y: 100 },
              ]}
              onValueChange={(v) => setNotice(JSON.stringify(v))}
            />
            <output aria-label="Change request">{notice}</output>
          </>
        ) : (
          <form
            style={{ display: "grid", gap: 32 }}
            onSubmit={(e) => {
              e.preventDefault();
              setData(
                JSON.stringify(
                  Array.from(new FormData(e.currentTarget).entries()),
                ),
              );
            }}
          >
            <DateRangePicker
              name="dates"
              defaultValue={{ start: "2026-10-23", end: "2026-10-25" }}
            />
            <TimePicker name="time" />
            <RangeSlider name="width" defaultValue={[20, 80]} />
            <TreeSelect
              name="topics"
              nodes={nodes}
              defaultExpandedIds={["root"]}
              defaultValue={["a"]}
            />
            <Cascader name="path" nodes={nodes} defaultValue={["root", "a"]} />
            <MentionInput
              name="message"
              defaultValue="Hello"
              options={[{ id: "mina", label: "Mina" }]}
            />
            <FilterBuilder
              name="filter"
              fields={[{ id: "name", label: "Name" }]}
            />
            <ColumnManager
              name="columns"
              defaultValue={[
                { id: "name", label: "Name", visible: true, locked: true },
                { id: "status", label: "Status", visible: false },
              ]}
            />
            <SchedulePicker
              name="slots"
              hours={[9, 10]}
              blocked={["mon:9"]}
              defaultValue={["tue:9"]}
            />
            <TimePicker name="omitted" label="Disabled time" disabled />
            <Button type="submit">Read form</Button>
            <Button type="reset">Reset form</Button>
            <output aria-label="Form data">{data}</output>
          </form>
        )}
      </main>
    </DesignSystemProvider>
  );
}
