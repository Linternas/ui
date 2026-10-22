"use client";
import ButtonInteractions from "./ButtonInteractions";
import { useState } from "react";
import * as UI from "@mingu/interaction-ui/system";
const options = [
  { value: "next", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue", disabled: true },
  { value: "svelte", label: "Svelte" },
];
const rows = [
  { id: "1", name: "Personal website", status: "Published", visits: 1240 },
  { id: "2", name: "Dashboard", status: "Draft", visits: 36 },
  { id: "3", name: "Documentation", status: "Published", visits: 680 },
];
const nav = [
  { id: "home", label: "Overview", href: "#overview" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "team", label: "Team", href: "#team" },
  { id: "billing", label: "Billing", href: "#billing", disabled: true },
];
export default function SystemComponentDemo({
  id,
}: {
  id: UI.SystemComponentId;
}) {
  const [value, setValue] = useState("next"),
    [tab, setTab] = useState("overview"),
    [open, setOpen] = useState(false),
    [page, setPage] = useState(1),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState("No action selected"),
    [progress, setProgress] = useState(45);
  const [messages, setMessages] = useState<UI.ToastMessage[]>([]);
  const columns: UI.DataColumn<(typeof rows)[number]>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => row.name,
      sortValue: (row) => row.name,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <UI.Badge tone={row.status === "Published" ? "success" : "neutral"}>
          {row.status}
        </UI.Badge>
      ),
    },
    {
      key: "visits",
      header: "Visits",
      cell: (row) => row.visits.toLocaleString("ko-KR"),
      sortValue: (row) => row.visits,
    },
  ];
  switch (id) {
    case "copy-button":
      return (
        <UI.Stack direction="row">
          <UI.CopyButton
            text="hello@mingu.xyz"
            label="Copy email"
            copiedLabel="Email copied"
            interaction="ripple"
          />
          <UI.CopyButton
            text="https://github.com/Linternas/ui"
            label="Copy repository"
            variant="outline"
          />
        </UI.Stack>
      );
    case "floating-field":
      return (
        <UI.Stack gap={6}>
          <UI.FloatingField
            label="Email address"
            type="email"
            hint="Your work email"
          />
          <UI.FloatingField
            label="Project name"
            defaultValue="My next website"
          />
          <UI.FloatingField
            label="Invalid email"
            defaultValue="hello"
            error="Enter a valid email address."
          />
          <UI.FloatingField label="Disabled field" disabled />
        </UI.Stack>
      );
    case "segmented-control":
      return (
        <UI.Stack gap={6}>
          <UI.SegmentedControl
            label="Billing period"
            defaultValue="monthly"
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
              { value: "lifetime", label: "Lifetime", disabled: true },
            ]}
          />
          <UI.SegmentedControl
            label="View"
            defaultValue="grid"
            options={[
              { value: "grid", label: "Grid" },
              { value: "list", label: "List" },
              { value: "board", label: "Board" },
            ]}
          />
        </UI.Stack>
      );
    case "interactive-card":
      return (
        <UI.Grid min="14rem">
          <UI.InteractiveCard>
            <UI.Stack gap={6}>
              <UI.Badge tone="accent">SPOTLIGHT</UI.Badge>
              <UI.Heading level={3}>Follow the light.</UI.Heading>
              <UI.Text size="sm" muted>
                포인터를 움직이면 표면의 빛과 테두리가 함께 반응합니다.
              </UI.Text>
              <UI.Button variant="secondary" interaction="ripple">
                Explore <span aria-hidden="true">↗</span>
              </UI.Button>
            </UI.Stack>
          </UI.InteractiveCard>
          <UI.InteractiveCard effect="tilt">
            <UI.Stack gap={6}>
              <UI.Badge tone="success">PERSPECTIVE</UI.Badge>
              <UI.Heading level={3}>A little depth.</UI.Heading>
              <UI.Text size="sm" muted>
                포인터 방향에 따라 가볍게 기울고, 벗어나면 제자리로 돌아옵니다.
              </UI.Text>
              <UI.CopyButton text="Mingu UI" label="Copy name" />
            </UI.Stack>
          </UI.InteractiveCard>
        </UI.Grid>
      );

    case "button":
      return (
        <UI.Stack gap={6}>
          <ButtonInteractions />
          <UI.Separator />
          {(
            ["primary", "secondary", "outline", "ghost", "danger"] as const
          ).map((variant) => (
            <UI.Stack key={variant} direction="row" align="center" gap={2}>
              <UI.Button variant={variant} size="sm">
                Small
              </UI.Button>
              <UI.Button variant={variant}>Default</UI.Button>
              <UI.Button variant={variant} size="lg">
                Large
              </UI.Button>
              <UI.Button variant={variant} disabled>
                Disabled
              </UI.Button>
              <UI.Button variant={variant} loading>
                Saving
              </UI.Button>
            </UI.Stack>
          ))}
        </UI.Stack>
      );
    case "icon-button":
      return (
        <UI.Stack direction="row">
          <UI.IconButton label="Add project">＋</UI.IconButton>
          <UI.IconButton label="Settings" variant="secondary">
            ⚙
          </UI.IconButton>
          <UI.IconButton label="Delete project" variant="danger">
            ×
          </UI.IconButton>
          <UI.IconButton label="Unavailable" disabled>
            ＋
          </UI.IconButton>
        </UI.Stack>
      );
    case "button-group":
      return (
        <UI.ButtonGroup label="Text alignment">
          {["Left", "Center", "Right"].map((item) => (
            <UI.Button
              key={item}
              variant={menu === item ? "primary" : "secondary"}
              aria-pressed={menu === item}
              onClick={() => setMenu(item)}
            >
              {item}
            </UI.Button>
          ))}
        </UI.ButtonGroup>
      );
    case "link-button":
      return (
        <UI.Stack direction="row">
          <UI.LinkButton href="/lab/ui">Interaction library ↗</UI.LinkButton>
          <UI.LinkButton href="#usage" variant="secondary">
            Usage ↓
          </UI.LinkButton>
          <UI.LinkButton href="/" disabled>
            Disabled
          </UI.LinkButton>
        </UI.Stack>
      );
    case "input":
      return (
        <UI.Stack>
          {(["sm", "md", "lg"] as const).map((size) => (
            <UI.Field
              key={size}
              label={`${size} input`}
              htmlFor={`input-${size}`}
            >
              <UI.Input
                id={`input-${size}`}
                controlSize={size}
                placeholder="Project name"
              />
            </UI.Field>
          ))}
          <UI.Input
            aria-label="Invalid input"
            aria-invalid
            defaultValue="Invalid value"
          />
          <UI.Input
            aria-label="Read only input"
            readOnly
            defaultValue="Read only"
          />
          <UI.Input
            aria-label="Disabled input"
            disabled
            placeholder="Disabled"
          />
        </UI.Stack>
      );
    case "text-field":
      return (
        <UI.Stack>
          <UI.FloatingField
            label="Floating label"
            hint="Focus and type to follow the label."
          />
          <UI.TextField
            label="Email"
            type="email"
            required
            hint="We use this for notifications."
          />
          <UI.TextField
            label="Invalid email"
            type="email"
            error="Enter a valid email address."
            defaultValue="hello"
          />
          <UI.TextField
            label="Disabled field"
            disabled
            defaultValue="Unavailable"
          />
        </UI.Stack>
      );
    case "textarea-field":
      return (
        <UI.Stack gap={6}>
          <UI.TextareaField
            label="Project description"
            rows={3}
            maxLength={200}
            hint="Up to 200 characters"
            placeholder="Describe your project"
          />
          <UI.TextareaField
            label="Invalid description"
            error="Enter a description"
            required
          />
          <UI.TextareaField
            label="Read-only description"
            defaultValue="An independent design system."
            readOnly
          />
          <UI.TextareaField label="Disabled description" disabled />
        </UI.Stack>
      );
    case "select-field":
      return (
        <UI.Stack gap={6}>
          <UI.SelectField
            label="Visibility"
            hint="Who can see this project?"
            defaultValue="private"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </UI.SelectField>
          <UI.SelectField
            label="Environment"
            required
            error="Select an environment"
            defaultValue=""
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="preview">Preview</option>
            <option value="production">Production</option>
          </UI.SelectField>
          <UI.SelectField label="Disabled environment" disabled>
            <option>Preview</option>
          </UI.SelectField>
        </UI.Stack>
      );
    case "textarea":
      return (
        <UI.Stack>
          <UI.Field
            label="Description"
            htmlFor="demo-description"
            hint="Up to 300 characters"
          >
            <UI.Textarea
              id="demo-description"
              aria-describedby="demo-description-description"
              rows={4}
              maxLength={300}
              placeholder="Tell us about your project"
            />
          </UI.Field>
          <UI.Textarea
            aria-label="Disabled description"
            disabled
            defaultValue="Disabled"
          />
        </UI.Stack>
      );
    case "select":
      return (
        <UI.Stack>
          {(["sm", "md", "lg"] as const).map((size) => (
            <UI.Field
              key={size}
              label={`Environment (${size})`}
              htmlFor={`select-${size}`}
            >
              <UI.Select id={`select-${size}`} controlSize={size}>
                <option>Production</option>
                <option>Preview</option>
                <option disabled>Archived</option>
              </UI.Select>
            </UI.Field>
          ))}
          <UI.Select aria-label="Disabled select" disabled>
            <option>Disabled</option>
          </UI.Select>
        </UI.Stack>
      );
    case "field":
      return (
        <UI.Field
          label="Custom field"
          htmlFor="custom-field"
          error="A value is required."
        >
          <UI.Input
            id="custom-field"
            aria-invalid
            aria-describedby="custom-field-description"
          />
        </UI.Field>
      );
    case "password-field":
      return (
        <UI.Stack>
          <UI.PasswordField
            label="Password"
            autoComplete="new-password"
            hint="At least 8 characters."
          />
          <UI.PasswordField
            label="Invalid password"
            error="Use at least 8 characters."
            defaultValue="short"
          />
        </UI.Stack>
      );
    case "search-field":
      return (
        <UI.Stack>
          <UI.SearchField
            label="Find a project"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <UI.Text muted size="sm">
            {rows
              .filter((row) =>
                row.name.toLowerCase().includes(query.toLowerCase()),
              )
              .map((row) => row.name)
              .join(" · ") || "No matching projects"}
          </UI.Text>
        </UI.Stack>
      );
    case "number-field":
      return (
        <UI.Stack>
          <UI.NumberField
            label="Seats"
            min={1}
            max={100}
            step={1}
            defaultValue={3}
            hint="Between 1 and 100"
          />
          <UI.NumberField
            label="Budget"
            min={0}
            step={0.5}
            defaultValue={12.5}
          />
        </UI.Stack>
      );
    case "date-picker":
      return (
        <UI.Stack>
          <UI.DatePicker
            label="Due date"
            defaultValue="2026-10-16"
            min="2026-01-01"
            max="2027-12-31"
          />
          <UI.DatePicker
            label="Disabled date"
            disabled
            defaultValue="2026-10-16"
          />
        </UI.Stack>
      );
    case "checkbox":
      return (
        <UI.Stack>
          <UI.Checkbox defaultChecked>Selected</UI.Checkbox>
          <UI.Checkbox>Unselected</UI.Checkbox>
          <UI.Checkbox indeterminate>Partially selected</UI.Checkbox>
          <UI.Checkbox disabled defaultChecked>
            Disabled
          </UI.Checkbox>
        </UI.Stack>
      );
    case "radio-group":
      return (
        <UI.RadioGroup
          label="Choose a plan"
          name="plan"
          defaultValue="personal"
          options={[
            {
              value: "personal",
              label: "Personal",
              description: "For your own projects",
            },
            {
              value: "team",
              label: "Team",
              description: "For shared workspaces",
            },
            { value: "enterprise", label: "Enterprise", disabled: true },
          ]}
        />
      );
    case "switch":
      return (
        <UI.Stack>
          <UI.Switch defaultChecked>Notifications</UI.Switch>
          <UI.Switch>Weekly summary</UI.Switch>
          <UI.Switch disabled defaultChecked>
            Managed by your team
          </UI.Switch>
        </UI.Stack>
      );
    case "slider":
      return (
        <UI.Stack>
          <UI.Slider label="Volume" defaultValue={40} step={5} />
          <UI.Slider label="Disabled volume" defaultValue={70} disabled />
        </UI.Stack>
      );
    case "file-upload":
      return (
        <UI.Stack>
          <UI.FileUpload
            label="Attachments"
            accept="image/*"
            multiple
            hint="Select images. No files are uploaded by this demo."
          />
          <UI.FileUpload label="Disabled upload" disabled />
        </UI.Stack>
      );
    case "combobox":
      return (
        <UI.Stack>
          <UI.Combobox
            label="Framework"
            options={options}
            value={value}
            onValueChange={setValue}
            name="framework"
          />
          <UI.Text size="sm" muted>
            Selected value: {value}
          </UI.Text>
          <UI.Combobox
            label="Disabled framework"
            disabled
            options={options}
            value="react"
            onValueChange={() => {}}
          />
        </UI.Stack>
      );
    case "tabs":
      return (
        <UI.Tabs
          animated
          label="Project sections"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: "overview",
              label: "Overview",
              content: <UI.Text>Project overview</UI.Text>,
            },
            {
              value: "activity",
              label: "Activity",
              content: <UI.Text>Latest activity</UI.Text>,
            },
            {
              value: "locked",
              label: "Disabled",
              disabled: true,
              content: null,
            },
          ]}
        />
      );
    case "breadcrumbs":
      return (
        <UI.Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "UI", href: "/lab/ui" },
            { label: "Components" },
          ]}
        />
      );
    case "pagination":
      return (
        <UI.Stack>
          <UI.Pagination page={page} pageCount={20} onPageChange={setPage} />
          <UI.Text size="sm" muted>
            Current page: {page}
          </UI.Text>
          <UI.Pagination
            page={1}
            pageCount={3}
            onPageChange={() => {}}
            disabled
            label="Disabled pagination"
          />
        </UI.Stack>
      );
    case "navigation":
      return (
        <UI.Stack gap={6}>
          <UI.Navigation items={nav} activeId="projects" />
          <UI.Navigation
            items={nav}
            activeId="home"
            orientation="vertical"
            label="Vertical navigation"
          />
        </UI.Stack>
      );
    case "sidebar":
      return (
        <UI.Sidebar>
          <UI.Heading level={3} size="md">
            Workspace
          </UI.Heading>
          <UI.Separator />
          <UI.Navigation items={nav} activeId="home" orientation="vertical" />
        </UI.Sidebar>
      );
    case "dialog":
      return (
        <>
          <UI.Button onClick={() => setOpen(true)}>Open dialog</UI.Button>
          <UI.Dialog
            open={open}
            onOpenChange={setOpen}
            title="Project settings"
            description="Change your project name."
          >
            <UI.Stack>
              <UI.TextField label="Name" defaultValue="My website" />
              <UI.Button onClick={() => setOpen(false)}>Save</UI.Button>
            </UI.Stack>
          </UI.Dialog>
        </>
      );
    case "alert-dialog":
      return (
        <>
          <UI.Button variant="danger" onClick={() => setOpen(true)}>
            Delete project
          </UI.Button>
          <UI.AlertDialog
            open={open}
            onOpenChange={setOpen}
            title="Delete project?"
            description="This demo does not delete any data."
            danger
            confirmLabel="Delete"
            onConfirm={() => {
              setOpen(false);
              setMenu("Confirmed — demo only");
            }}
          />
          <UI.Text muted size="sm">
            {menu}
          </UI.Text>
        </>
      );
    case "drawer":
      return (
        <>
          <UI.Button onClick={() => setOpen(true)}>Open filters</UI.Button>
          <UI.Drawer open={open} onOpenChange={setOpen} title="Filters">
            <UI.Stack>
              <UI.Checkbox defaultChecked>Published</UI.Checkbox>
              <UI.Checkbox>Draft</UI.Checkbox>
              <UI.Button onClick={() => setOpen(false)}>
                Apply filters
              </UI.Button>
            </UI.Stack>
          </UI.Drawer>
        </>
      );
    case "popover":
      return (
        <UI.Popover trigger="Display settings" label="Display settings">
          <UI.Stack>
            <UI.Heading level={3} size="md">
              Display settings
            </UI.Heading>
            <UI.Switch defaultChecked>Show timestamps</UI.Switch>
            <UI.Checkbox>Compact rows</UI.Checkbox>
          </UI.Stack>
        </UI.Popover>
      );
    case "dropdown-menu":
      return (
        <UI.Stack>
          <UI.DropdownMenu
            label="Actions"
            items={[
              {
                id: "edit",
                label: "Edit",
                onSelect: () => setMenu("Edit selected"),
              },
              {
                id: "duplicate",
                label: "Duplicate",
                onSelect: () => setMenu("Duplicate selected"),
              },
              {
                id: "archive",
                label: "Archive",
                disabled: true,
                onSelect: () => {},
              },
              {
                id: "delete",
                label: "Delete",
                danger: true,
                onSelect: () => setMenu("Delete selected — demo only"),
              },
            ]}
          />
          <UI.Text size="sm" muted>
            {menu}
          </UI.Text>
        </UI.Stack>
      );
    case "tooltip":
      return (
        <UI.Stack direction="row">
          <UI.Tooltip content="Edit project settings">
            <UI.IconButton label="Settings" variant="secondary">
              ⚙
            </UI.IconButton>
          </UI.Tooltip>
          <UI.Tooltip content="This action saves your changes">
            <UI.Button>Hover or focus</UI.Button>
          </UI.Tooltip>
        </UI.Stack>
      );
    case "toast":
      return (
        <>
          <UI.Button
            onClick={() =>
              setMessages((items) =>
                [
                  ...items,
                  {
                    id: String(Date.now()),
                    title: "Changes saved",
                    description: "Your project is up to date.",
                    tone: "success" as const,
                  },
                ].slice(-3),
              )
            }
          >
            Show notification
          </UI.Button>
          <UI.ToastRegion
            messages={messages}
            onDismiss={(id) =>
              setMessages((items) => items.filter((item) => item.id !== id))
            }
          />
        </>
      );
    case "alert":
      return (
        <UI.Stack>
          {(["neutral", "accent", "success", "warning", "danger"] as const).map(
            (tone) => (
              <UI.Alert key={tone} tone={tone} title={tone}>
                A clear description of the current state.
              </UI.Alert>
            ),
          )}
        </UI.Stack>
      );
    case "badge":
      return (
        <UI.Stack direction="row">
          {(["neutral", "accent", "success", "warning", "danger"] as const).map(
            (tone) => (
              <UI.Badge key={tone} tone={tone}>
                {tone}
              </UI.Badge>
            ),
          )}
        </UI.Stack>
      );
    case "status-dot":
      return (
        <UI.Stack direction="row">
          <UI.StatusDot tone="success" label="Online" />
          <UI.StatusDot tone="warning" label="Pending" />
          <UI.StatusDot tone="danger" label="Offline" />
        </UI.Stack>
      );
    case "spinner":
      return (
        <UI.Stack direction="row" align="center">
          <UI.Spinner label="Loading projects" />
          <UI.Text muted size="sm">
            Loading projects…
          </UI.Text>
          <UI.Button loading>Saving</UI.Button>
        </UI.Stack>
      );
    case "progress":
      return (
        <UI.Stack>
          <UI.Progress label="Upload" value={progress} />
          <UI.Button
            variant="secondary"
            onClick={() => setProgress((current) => (current + 10) % 110)}
          >
            Advance
          </UI.Button>
          <UI.Progress label="Connecting" />
        </UI.Stack>
      );
    case "skeleton":
      return (
        <UI.Stack>
          <UI.Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
          <UI.Skeleton style={{ width: "70%", height: 20 }} />
          <UI.Skeleton style={{ width: "90%", height: 16 }} />
          <UI.Skeleton style={{ width: "50%", height: 16 }} />
        </UI.Stack>
      );
    case "empty-state":
      return (
        <UI.EmptyState
          icon="◇"
          title="No projects yet"
          description="Create a project to start building."
          action={
            <UI.Button onClick={() => setMenu("Create project selected")}>
              Create project
            </UI.Button>
          }
        />
      );
    case "avatar":
      return (
        <UI.Stack direction="row" align="center">
          <UI.Avatar name="Mingu Kim" size="sm" />
          <UI.Avatar name="Mingu Kim" />
          <UI.Avatar name="김민구" size="lg" />
          <UI.Avatar
            name="Image fallback"
            src="data:image/png;base64,invalid"
          />
        </UI.Stack>
      );
    case "table":
      return (
        <UI.Table caption="Project overview">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Status</th>
              <th scope="col">Visits</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.status}</td>
                <td>{row.visits}</td>
              </tr>
            ))}
          </tbody>
        </UI.Table>
      );
    case "data-table":
      return (
        <UI.Stack gap={6}>
          <UI.DataTable
            label="Projects — sortable columns"
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
          />
          <UI.DataTable
            label="Empty projects"
            rows={[]}
            columns={columns}
            rowKey={(row) => row.id}
          />
          <UI.DataTable
            label="Loading projects"
            rows={[]}
            loading
            columns={columns}
            rowKey={(row) => row.id}
          />
        </UI.Stack>
      );
    case "accordion":
      return (
        <UI.Accordion
          items={[
            {
              id: "first",
              title: "Can I change the theme?",
              content: "Use semantic tokens and DesignSystemProvider.",
            },
            {
              id: "second",
              title: "Does it work without Next.js?",
              content:
                "Yes. Use a React TSX bundler and import the stylesheet.",
            },
            {
              id: "disabled",
              title: "Disabled question",
              content: "",
              disabled: true,
            },
          ]}
        />
      );
    case "typography":
      return (
        <UI.Stack>
          <UI.Heading level={1}>Page heading</UI.Heading>
          <UI.Heading level={2}>Section heading</UI.Heading>
          <UI.Heading level={3}>Card heading</UI.Heading>
          <UI.Text>Body text. 차분한 화면과 명확한 정보 위계.</UI.Text>
          <UI.Text size="sm" muted>
            Supporting text
          </UI.Text>
          <UI.Text size="xs" muted>
            Caption / metadata
          </UI.Text>
        </UI.Stack>
      );
    case "card":
      return (
        <UI.Card>
          <UI.Stack>
            <UI.Badge tone="success">Published</UI.Badge>
            <UI.Heading level={3}>My website</UI.Heading>
            <UI.Text muted size="sm">
              A shared surface for related content.
            </UI.Text>
            <UI.Button variant="secondary">View project</UI.Button>
          </UI.Stack>
        </UI.Card>
      );
    case "container":
      return (
        <UI.Container reading>
          <UI.Card>Reading-width container with responsive gutters.</UI.Card>
        </UI.Container>
      );
    case "stack":
      return (
        <UI.Stack gap={6}>
          <UI.Stack direction="row" gap={2}>
            <UI.Button>Save</UI.Button>
            <UI.Button variant="secondary">Cancel</UI.Button>
          </UI.Stack>
          <UI.Stack gap={2}>
            <UI.Card>Vertical item one</UI.Card>
            <UI.Card>Vertical item two</UI.Card>
          </UI.Stack>
        </UI.Stack>
      );
    case "grid":
      return (
        <UI.Grid min="10rem">
          {["One", "Two", "Three", "Four"].map((item) => (
            <UI.Card key={item}>{item}</UI.Card>
          ))}
        </UI.Grid>
      );
    case "separator":
      return (
        <>
          <UI.Text>First section</UI.Text>
          <UI.Separator />
          <UI.Text>Second section</UI.Text>
        </>
      );
  }
}
