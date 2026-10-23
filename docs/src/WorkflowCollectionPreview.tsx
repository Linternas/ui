import { useState } from "react";
import { Button, TextField } from "../../src/system/base";
import { TextareaField } from "../../src/system/forms";
import {
  DateRangePicker,
  TimePicker,
  RangeSlider,
  TreeSelect,
  Cascader,
  MentionInput,
  Stepper,
  FilterBuilder,
  ColumnManager,
  SchedulePicker,
  DraggableWindow,
  NotificationInbox,
  matchesFilter,
  type FilterModel,
  type ManagedColumn,
} from "../../src/collections/workflow";
const nodes = [
  {
    id: "design",
    label: "Design",
    children: [
      {
        id: "foundations",
        label: "Foundations",
        children: [
          { id: "color", label: "Color" },
          { id: "type", label: "Typography" },
        ],
      },
      { id: "motion", label: "Motion" },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    children: [
      { id: "react", label: "React" },
      { id: "legacy", label: "Legacy", disabled: true },
    ],
  },
];
const projects = [
  { name: "Mingu UI", status: "Active", visits: 2400 },
  { name: "Quiet notes", status: "Draft", visits: 120 },
  { name: "Motion lab", status: "Active", visits: 840 },
];
function SetupDemo() {
  const [name, setName] = useState(""),
    [done, setDone] = useState(false);
  return done ? (
    <div className="mingu-workflow">
      <h3>{name} is ready.</h3>
      <p>Your local setup is complete.</p>
      <Button onClick={() => setDone(false)}>Start again</Button>
    </div>
  ) : (
    <Stepper
      steps={[
        {
          id: "details",
          title: "Details",
          description: "Name your project",
          canContinue: !!name.trim(),
          content: (
            <TextField
              label="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The next good thing"
            />
          ),
        },
        {
          id: "review",
          title: "Review",
          description: "Make it yours",
          content: (
            <>
              <h3>{name}</h3>
              <p>A quiet place for your next idea.</p>
            </>
          ),
        },
      ]}
      onComplete={() => setDone(true)}
    />
  );
}
function FilterDemo() {
  const [filter, setFilter] = useState<FilterModel>({
    mode: "and",
    rules: [{ id: "active", field: "status", operator: "is", value: "Active" }],
  });
  const rows = projects.filter((p) => matchesFilter(p, filter));
  return (
    <div className="mingu-workflow-demo">
      <FilterBuilder
        fields={[
          { id: "name", label: "Name" },
          { id: "status", label: "Status" },
          { id: "visits", label: "Visits", type: "number" },
        ]}
        value={filter}
        onValueChange={setFilter}
      />
      <div className="mingu-demo-results" aria-label="Filtered projects">
        <strong>{rows.length} projects</strong>
        {rows.map((p) => (
          <p key={p.name}>
            {p.name} · {p.status} · {p.visits}
          </p>
        ))}
      </div>
    </div>
  );
}
function ColumnsDemo() {
  const [columns, setColumns] = useState<ManagedColumn[]>([
    { id: "name", label: "Name", visible: true, locked: true },
    { id: "status", label: "Status", visible: true },
    { id: "visits", label: "Visits", visible: false },
  ]);
  const shown = columns.filter((c) => c.visible);
  return (
    <div className="mingu-workflow-demo">
      <ColumnManager value={columns} onValueChange={setColumns} />
      <div className="mingu-demo-results">
        <table aria-label="Project table">
          <thead>
            <tr>
              {shown.map((c) => (
                <th key={c.id}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.slice(0, 2).map((p) => (
              <tr key={p.name}>
                {shown.map((c) => (
                  <td key={c.id}>{p[c.id as keyof typeof p]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default function WorkflowCollectionPreview({ id }: { id: string }) {
  let content;
  switch (id) {
    case "date-range-picker":
      content = (
        <DateRangePicker
          name="dates"
          defaultValue={{ start: "2026-10-23", end: "2026-10-29" }}
          presets={[
            { label: "A long weekend", start: "2026-10-23", end: "2026-10-25" },
            { label: "One week", start: "2026-10-23", end: "2026-10-29" },
          ]}
        />
      );
      break;
    case "time-picker":
      content = (
        <TimePicker
          label="Start time"
          defaultValue="09:30"
          timezoneLabel="UTC+09:00"
        />
      );
      break;
    case "range-slider":
      content = (
        <RangeSlider
          label="Viewport width"
          min={240}
          max={1440}
          step={40}
          minGap={160}
          defaultValue={[320, 960]}
          unit="px"
        />
      );
      break;
    case "tree-select":
      content = (
        <TreeSelect
          nodes={nodes}
          defaultExpandedIds={["design", "foundations"]}
          defaultValue={["color"]}
        />
      );
      break;
    case "cascader":
      content = (
        <Cascader
          nodes={nodes}
          defaultValue={["design", "foundations", "color"]}
        />
      );
      break;
    case "mention-input":
      content = (
        <MentionInput
          options={[
            {
              id: "mina",
              label: "Mina Park",
              handle: "mina",
              description: "Design",
            },
            {
              id: "mingu",
              label: "Mingu Kim",
              handle: "mingu",
              description: "Engineering",
            },
            {
              id: "ari",
              label: "Ari Lee",
              handle: "ari",
              description: "Product",
            },
          ]}
          placeholder="A thought for @mina…"
        />
      );
      break;
    case "stepper":
      content = <SetupDemo />;
      break;
    case "filter-builder":
      content = <FilterDemo />;
      break;
    case "column-manager":
      content = <ColumnsDemo />;
      break;
    case "schedule-picker":
      content = (
        <SchedulePicker
          hours={[9, 10, 11, 12]}
          defaultValue={["mon:9", "wed:10", "thu:11"]}
          blocked={["fri:12"]}
        />
      );
      break;
    case "draggable-window":
      content = (
        <DraggableWindow title="Draft notes">
          <TextareaField
            label="Quick note"
            defaultValue="A place for the next idea."
            rows={3}
          />
        </DraggableWindow>
      );
      break;
    case "notification-inbox":
      content = (
        <NotificationInbox
          defaultValue={[
            {
              id: "comment",
              title: "Mina left a thought",
              description: "The new interaction feels right.",
              time: "2 min",
              read: false,
            },
            {
              id: "preview",
              title: "Your preview is ready",
              description: "Take a look at your latest changes.",
              time: "12 min",
              read: false,
            },
            {
              id: "saved",
              title: "All changes saved",
              description: "A little progress, safely kept.",
              time: "1 hour",
              read: true,
            },
          ]}
        />
      );
      break;
    default:
      return null;
  }
  return <div className="mingu-workflow-demo">{content}</div>;
}
