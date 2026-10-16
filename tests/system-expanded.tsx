import { useRef, useState } from "react";
import * as UI from "../src/system";
export default function ExpandedSystemFixture() {
  const [framework, setFramework] = useState("react"),
    [result, setResult] = useState(""),
    [action, setAction] = useState(""),
    [drawer, setDrawer] = useState(false),
    [confirm, setConfirm] = useState(false),
    [page, setPage] = useState(1),
    [messages, setMessages] = useState<UI.ToastMessage[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const options = [
    { value: "react", label: "React" },
    { value: "next", label: "Next.js" },
    { value: "locked", label: "Next disabled", disabled: true },
    { value: "svelte", label: "Svelte" },
  ];
  const rows = [
    { id: "1", name: "Beta", count: 20 },
    { id: "2", name: "Alpha", count: 3 },
  ];
  return (
    <UI.DesignSystemProvider theme="light" style={{ padding: 16 }}>
      <UI.Stack gap={6}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setResult(
              JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
            );
          }}
        >
          <UI.Stack>
            <UI.TextField
              label="Project"
              name="project"
              defaultValue="Website"
              ref={input}
            />
            <UI.Button
              variant="secondary"
              onClick={() => input.current?.focus()}
            >
              Focus project
            </UI.Button>
            <UI.PasswordField
              label="Password"
              name="password"
              defaultValue="secret123"
            />
            <UI.SearchField label="Search projects" name="search" />
            <UI.NumberField
              label="Seats"
              name="seats"
              defaultValue={3}
              min={1}
            />
            <UI.DatePicker
              label="Due date"
              name="date"
              defaultValue="2026-10-16"
            />
            <UI.Checkbox name="terms" value="yes" defaultChecked>
              Accept terms
            </UI.Checkbox>
            <UI.Checkbox indeterminate>Partial selection</UI.Checkbox>
            <UI.Checkbox name="disabled" disabled defaultChecked>
              Disabled checkbox
            </UI.Checkbox>
            <UI.RadioGroup
              label="Plan"
              name="plan"
              defaultValue="personal"
              options={[
                { value: "personal", label: "Personal" },
                { value: "locked", label: "Locked plan", disabled: true },
                { value: "team", label: "Team" },
              ]}
            />
            <UI.Switch name="notifications" value="yes" defaultChecked>
              Notifications
            </UI.Switch>
            <UI.Slider
              label="Volume"
              name="volume"
              defaultValue={40}
              step={5}
            />
            <UI.Combobox
              label="Framework"
              name="framework"
              value={framework}
              onValueChange={setFramework}
              options={options}
            />
            <UI.FileUpload label="Upload" accept="text/plain" />
            <UI.Button type="submit">Submit form</UI.Button>
            <output aria-label="Form result">{result}</output>
          </UI.Stack>
        </form>
        <UI.DropdownMenu
          label="Project actions"
          items={[
            { id: "edit", label: "Edit", onSelect: () => setAction("Edit") },
            {
              id: "locked",
              label: "Disabled action",
              disabled: true,
              onSelect: () => {},
            },
            {
              id: "delete",
              label: "Delete",
              danger: true,
              onSelect: () => setAction("Delete"),
            },
          ]}
        />
        <output aria-label="Menu result">{action}</output>
        <UI.Popover trigger="Display settings" label="Display settings">
          <UI.Checkbox>Compact view</UI.Checkbox>
        </UI.Popover>
        <UI.Tooltip content="Change project settings">
          <UI.Button>Tooltip trigger</UI.Button>
        </UI.Tooltip>
        <UI.Button onClick={() => setDrawer(true)}>Open drawer</UI.Button>
        <UI.Drawer open={drawer} onOpenChange={setDrawer} title="Filters">
          <UI.Checkbox>Published</UI.Checkbox>
        </UI.Drawer>
        <UI.Button onClick={() => setConfirm(true)}>
          Open confirmation
        </UI.Button>
        <UI.AlertDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="Confirm delete"
          description="Review before confirming"
          onConfirm={() => {
            setAction("Confirmed");
            setConfirm(false);
          }}
          danger
        />
        <UI.DataTable
          label="Projects"
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "name",
              header: "Name",
              cell: (row) => row.name,
              sortValue: (row) => row.name,
            },
            {
              key: "count",
              header: "Count",
              cell: (row) => row.count,
              sortValue: (row) => row.count,
            },
          ]}
        />
        <UI.DataTable
          label="Empty records"
          rows={[]}
          rowKey={() => "x"}
          columns={[{ key: "name", header: "Name", cell: () => "" }]}
        />
        <UI.Pagination page={page} pageCount={20} onPageChange={setPage} />
        <UI.Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Current" }]}
        />
        <UI.Accordion
          items={[
            { id: "one", title: "First question", content: "First answer" },
            {
              id: "two",
              title: "Disabled question",
              content: "Hidden answer",
              disabled: true,
            },
          ]}
        />
        <UI.Progress label="Upload progress" value={120} />
        <UI.Button
          onClick={() =>
            setMessages([
              {
                id: "saved",
                title: "Saved",
                description: "Project updated",
                tone: "success",
              },
            ])
          }
        >
          Show toast
        </UI.Button>
        <UI.ToastRegion
          messages={messages}
          onDismiss={(id) =>
            setMessages((items) => items.filter((item) => item.id !== id))
          }
        />
      </UI.Stack>
    </UI.DesignSystemProvider>
  );
}
