import React, { useState } from "react";
import { View } from "react-native";
import * as UI from "@mingu/interaction-ui/native";
export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <UI.NativeProvider theme={dark ? "dark" : "light"} accent="neutral">
      <Showcase dark={dark} setDark={setDark} />
    </UI.NativeProvider>
  );
}
function Showcase({
  dark,
  setDark,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  const [name, setName] = useState("Mingu"),
    [checked, setChecked] = useState(true),
    [enabled, setEnabled] = useState(true),
    [plan, setPlan] = useState("personal"),
    [volume, setVolume] = useState(35),
    [count, setCount] = useState(1),
    [date, setDate] = useState(new Date(2026, 9, 26, 9, 30)),
    [tab, setTab] = useState("home"),
    [modal, setModal] = useState(""),
    [messages, setMessages] = useState<UI.ToastMessage[]>([]),
    [refreshing, setRefreshing] = useState(false),
    [selected, setSelected] = useState(false),
    [query, setQuery] = useState("");
  const notify = (title: string) =>
    setMessages([{ id: "current", title, tone: "success" }]);
  const options = [
    {
      value: "personal",
      label: "Personal",
      description: "A quiet place for your ideas",
    },
    { value: "team", label: "Team", description: "Make things together" },
    { value: "archived", label: "Archived", disabled: true },
  ];
  return (
    <UI.Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        Promise.resolve().then(() => {
          notify("Local preview refreshed");
          setRefreshing(false);
        });
      }}
    >
      <UI.AppBar
        title="Mingu Native"
        subtitle="Core components · iOS / Android"
        trailing={
          <UI.IconButton
            label="Show actions"
            variant="ghost"
            onPress={() => setModal("actions")}
          >
            <UI.Text>•••</UI.Text>
          </UI.IconButton>
        }
      />
      <UI.Switch label="Dark theme" value={dark} onValueChange={setDark} />
      <UI.Card>
        <UI.Badge tone="accent">NATIVE</UI.Badge>
        <UI.Heading level={1}>Made for touch.</UI.Heading>
        <UI.Text tone="muted">
          Shared design. Native controls. A calm foundation for the next app.
        </UI.Text>
        <UI.Divider />
        <UI.Text size="xs">
          Text, headings, cards, spacing and semantic colors.
        </UI.Text>
      </UI.Card>
      <UI.Card>
        <UI.Heading level={2}>Actions</UI.Heading>
        <UI.Stack direction="row" gap="2" wrap>
          {(
            ["primary", "secondary", "outline", "ghost", "danger"] as const
          ).map((variant) => (
            <UI.Button
              key={variant}
              variant={variant}
              onPress={() => notify(`${variant} pressed`)}
            >
              {variant}
            </UI.Button>
          ))}
        </UI.Stack>
        <UI.Button loading>Loading</UI.Button>
        <UI.Button disabled>Disabled</UI.Button>
        <UI.LinkButton onPress={() => setModal("dialog")}>
          Open details
        </UI.LinkButton>
      </UI.Card>
      <UI.Card>
        <UI.Heading level={2}>Fields</UI.Heading>
        <UI.TextField
          label="Name"
          value={name}
          onChangeText={setName}
          hint="Used in this local preview"
          required
        />
        <UI.TextareaField
          label="About"
          placeholder="A little about your next idea"
        />
        <UI.PasswordField label="Password" defaultValue="mingu-native" />
        <UI.SearchField label="Search" value={query} onChangeText={setQuery} />
        <UI.NumberField label="Budget" placeholder="0" />
        <UI.TextField
          label="Validation example"
          error="Please enter a project name"
        />
        <UI.TextField label="Read only" value="Mingu UI" editable={false} />
        <UI.OtpInput
          label="Verification code"
          hint="Paste six digits"
          onComplete={(code) => notify(`Local code: ${code}`)}
        />
      </UI.Card>
      <UI.Card>
        <UI.Heading level={2}>Choices</UI.Heading>
        <UI.Checkbox
          label="Keep it simple"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <UI.Checkbox label="Partially selected" indeterminate />
        <UI.Checkbox label="Unavailable" disabled />
        <UI.Switch
          label="Notifications"
          hint="Local state only"
          value={enabled}
          onValueChange={setEnabled}
        />
        <UI.RadioGroup
          label="Plan"
          options={options}
          value={plan}
          onValueChange={setPlan}
        />
        <UI.SelectField
          label="Workspace"
          searchable
          options={options}
          value={plan}
          onValueChange={setPlan}
        />
        <UI.SegmentedControl
          label="Density"
          options={[
            { value: "calm", label: "Calm" },
            { value: "compact", label: "Compact" },
          ]}
        />
        <UI.Slider label="Intensity" value={volume} onValueChange={setVolume} />
        <UI.NumberStepper
          label="Quantity"
          value={count}
          onValueChange={setCount}
          min={1}
          max={5}
        />
        <UI.DatePicker
          label="Start date"
          value={date}
          onValueChange={setDate}
        />
        <UI.TimePicker
          label="Start time"
          value={date}
          onValueChange={setDate}
        />
      </UI.Card>
      <UI.Card>
        <UI.Heading level={2}>Display & feedback</UI.Heading>
        <UI.Stack direction="row" wrap gap="2">
          {(["neutral", "accent", "success", "warning", "danger"] as const).map(
            (tone) => (
              <UI.Badge key={tone} tone={tone}>
                {tone}
              </UI.Badge>
            ),
          )}
        </UI.Stack>
        <UI.Chip
          label="Design"
          selected={selected}
          onPress={() => setSelected(!selected)}
          onRemove={() => notify("Chip removal requested")}
        />
        <UI.ListItem
          title={name || "Your profile"}
          description="A native list item"
          leading={<UI.Avatar name={name || "Mingu"} />}
          trailing={<UI.Text>›</UI.Text>}
          onPress={() => setModal("dialog")}
        />
        <UI.Progress label="Preview progress" value={volume} />
        <UI.Spinner label="Preview loading" />
        <UI.Skeleton height={16} />
        <UI.Skeleton width="65%" height={16} />
        <UI.Alert
          title="A little progress"
          description="Your changes stay in this preview."
          tone="success"
        />
        <UI.Accordion title="What is shared?">
          <UI.Text>
            Colors, spacing, type and motion values. Each platform keeps its
            native behavior.
          </UI.Text>
        </UI.Accordion>
      </UI.Card>
      <UI.Card>
        <UI.Heading level={2}>Navigation</UI.Heading>
        <UI.Tabs
          label="Preview pages"
          items={[
            {
              value: "overview",
              label: "Overview",
              content: <UI.Text>Start with the essentials.</UI.Text>,
            },
            {
              value: "details",
              label: "Details",
              content: <UI.Text>Make room for the details.</UI.Text>,
            },
            { value: "locked", label: "Locked", disabled: true },
          ]}
        />
        <UI.BottomNavigation
          safeArea={false}
          label="App navigation"
          items={[
            { value: "home", label: "Home", icon: <UI.Text>⌂</UI.Text> },
            {
              value: "inbox",
              label: "Inbox",
              badge: 3,
              icon: <UI.Text>✉</UI.Text>,
            },
            { value: "profile", label: "Profile", icon: <UI.Text>○</UI.Text> },
          ]}
          value={tab}
          onValueChange={setTab}
        />
        <UI.Text tone="muted">Selected: {tab}</UI.Text>
      </UI.Card>
      <UI.Card>
        <UI.Heading level={2}>States & overlays</UI.Heading>
        <UI.EmptyState
          title="No notes yet"
          description="Your next good idea starts here."
          action={
            <UI.Button onPress={() => notify("New note requested")}>
              Create note
            </UI.Button>
          }
        />
        <UI.ErrorState
          description="Example failure state"
          onRetry={() => notify("Retry requested")}
        />
        <UI.Stack direction="row" wrap gap="2">
          <UI.Button variant="outline" onPress={() => setModal("dialog")}>
            Dialog
          </UI.Button>
          <UI.Button variant="outline" onPress={() => setModal("sheet")}>
            Bottom sheet
          </UI.Button>
          <UI.Button variant="danger" onPress={() => setModal("confirm")}>
            Confirmation
          </UI.Button>
          <UI.Button variant="outline" onPress={() => setModal("actions")}>
            Action sheet
          </UI.Button>
        </UI.Stack>
      </UI.Card>
      <UI.Toast
        messages={messages}
        onDismiss={(id) => setMessages((v) => v.filter((m) => m.id !== id))}
      />
      <UI.Spacer size="4" />
      <UI.Dialog
        open={modal === "dialog"}
        onOpenChange={(open) => {
          if (!open) setModal("");
        }}
        title="A little more room"
        description="Native modal with keyboard avoidance."
      >
        <UI.TextField label="Quick thought" />
        <UI.Button
          onPress={() => {
            notify("Thought saved locally");
            setModal("");
          }}
        >
          Save thought
        </UI.Button>
      </UI.Dialog>
      <UI.BottomSheet
        open={modal === "sheet"}
        onOpenChange={(open) => {
          if (!open) setModal("");
        }}
        title="Keep exploring"
      >
        <UI.Text>A bounded sheet that respects the bottom safe area.</UI.Text>
        <UI.Button onPress={() => setModal("")}>Done</UI.Button>
      </UI.BottomSheet>
      <UI.AlertDialog
        open={modal === "confirm"}
        onOpenChange={(open) => {
          if (!open) setModal("");
        }}
        title="Remove this sample?"
        description="This changes the local preview only."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          notify("Sample removal confirmed");
          setModal("");
        }}
      />
      <UI.ActionSheet
        open={modal === "actions"}
        onOpenChange={(open) => {
          if (!open) setModal("");
        }}
        title="Quick actions"
        items={[
          {
            id: "copy",
            label: "Duplicate sample",
            onPress: () => notify("Duplicate requested"),
          },
          {
            id: "disabled",
            label: "Unavailable action",
            disabled: true,
            onPress: () => {},
          },
          {
            id: "delete",
            label: "Remove sample",
            destructive: true,
            onPress: () => setModal("confirm"),
          },
        ]}
      />
    </UI.Screen>
  );
}
