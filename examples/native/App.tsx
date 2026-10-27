import React, { useState } from "react";
import { Keyboard, StatusBar, View } from "react-native";
import * as UI from "@mingu/interaction-ui/native";
export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <UI.NativeProvider theme={dark ? "dark" : "light"} accent="neutral">
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
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
    [query, setQuery] = useState(""),
    [optionalDate, setOptionalDate] = useState<Date | null>(null),
    [amount, setAmount] = useState("10320"),
    [month, setMonth] = useState<UI.MonthValue | null>({
      year: 2026,
      month: 10,
    }),
    [period, setPeriod] = useState<UI.DateRangeValue>({
      start: null,
      end: null,
    }),
    [weekdays, setWeekdays] = useState<UI.Weekday[]>([]),
    [calendarDay, setCalendarDay] = useState<UI.CalendarDate | null>(null),
    [protectDraft, setProtectDraft] = useState(true),
    [blockClosing, setBlockClosing] = useState(false),
    [closeReason, setCloseReason] = useState<UI.OverlayCloseReason | null>(
      null,
    );
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
      key={tab}
      hideFooterOnKeyboard
      header={
        <UI.AppBar
          title={
            tab === "home"
              ? "Mingu Native"
              : tab === "inputs"
                ? "Inputs & choices"
                : tab === "planning"
                  ? "Dates & amounts"
                  : "Display & navigation"
          }
          subtitle="Core components · iOS / Android"
          trailing={
            <UI.IconButton
              label="Show actions"
              variant="ghost"
              onPress={() => setModal("actions")}
            >
              <UI.Icon name="more" />
            </UI.IconButton>
          }
        />
      }
      footer={
        <UI.Stack gap="2">
          {messages.length > 0 && (
            <UI.Stack
              style={{
                paddingHorizontal: UI.tokens.space["4"],
                paddingTop: UI.tokens.space["2"],
              }}
            >
              <UI.Toast
                messages={messages}
                onDismiss={(id) =>
                  setMessages((v) => v.filter((m) => m.id !== id))
                }
              />
            </UI.Stack>
          )}
          <UI.BottomNavigation
            safeArea={false}
            label="Showcase navigation"
            items={[
              {
                value: "home",
                label: "Components",
                icon: <TabIcon kind="grid" active={tab === "home"} />,
              },
              {
                value: "inputs",
                label: "Inputs",
                icon: <TabIcon kind="sliders" active={tab === "inputs"} />,
              },
              {
                value: "planning",
                label: "Planning",
                icon: <UI.Icon name="chevron-right" />,
              },
              {
                value: "more",
                label: "More",
                icon: <TabIcon kind="layers" active={tab === "more"} />,
              },
            ]}
            value={tab}
            onValueChange={(next) => {
              Keyboard.dismiss();
              setModal("");
              setTab(next);
            }}
          />
        </UI.Stack>
      }
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        Promise.resolve().then(() => {
          notify("Local preview refreshed");
          setRefreshing(false);
        });
      }}
    >
      <UI.Switch label="Dark theme" value={dark} onValueChange={setDark} />
      {tab === "home" && (
        <>
          <UI.Card>
            <UI.Badge tone="accent">NATIVE</UI.Badge>
            <UI.Heading level={1}>Made for touch.</UI.Heading>
            <UI.Text tone="muted">
              Shared design. Native controls. A calm foundation for the next
              app.
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
        </>
      )}
      {tab === "inputs" && (
        <>
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
            <UI.SearchField
              label="Search"
              value={query}
              onChangeText={setQuery}
            />
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
            <UI.Slider
              label="Intensity"
              value={volume}
              onValueChange={setVolume}
            />
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
        </>
      )}
      {tab === "planning" && (
        <>
          <UI.Card>
            <UI.Heading level={2}>Dates & amounts</UI.Heading>
            <UI.DatePicker
              label="Optional start"
              value={optionalDate}
              onValueChange={setOptionalDate}
              placeholder="Not entered"
              clearable
              formatValue={UI.dateToCalendarDate}
            />
            <UI.MoneyField
              label="Adjustment amount"
              value={amount}
              onValueChange={setAmount}
              allowNegative
              unit="KRW"
              hint="Grouping on blur; empty and a minus sign remain drafts."
            />
            <UI.MonthPicker
              label="Payroll month"
              value={month}
              onValueChange={setMonth}
              minimumMonth={{ year: 2025, month: 1 }}
              maximumMonth={{ year: 2028, month: 12 }}
            />
            <UI.DateRangePicker
              label="Schedule period"
              value={period}
              onValueChange={setPeriod}
              minimumDate="2026-01-01"
              maximumDate="2027-12-31"
            />
            <UI.WeekdayPicker
              label="Repeat days"
              value={weekdays}
              onValueChange={setWeekdays}
              weekStartsOn={1}
              presets={[
                { id: "weekdays", label: "Weekdays", days: [1, 2, 3, 4, 5] },
                { id: "weekend", label: "Weekend", days: [0, 6] },
                { id: "none", label: "Clear days", days: [] },
              ]}
            />
          </UI.Card>
          <UI.Card>
            <UI.Calendar
              label="Sample calendar"
              value={calendarDay}
              onValueChange={setCalendarDay}
              defaultMonth={{ year: 2026, month: 10 }}
              weekStartsOn={1}
              items={{
                "2026-10-26": [
                  { id: "a", label: "AM" },
                  { id: "b", label: "PM" },
                  { id: "c", label: "Evening" },
                ],
              }}
            />
            <UI.Text accessibilityLiveRegion="polite">
              Selected: {calendarDay ?? "none"}
            </UI.Text>
          </UI.Card>
          <UI.Card>
            <UI.Heading level={2}>Long forms</UI.Heading>
            <UI.Text>
              Fixed actions, scrollable body and app-owned close requests.
            </UI.Text>
            <UI.Button
              onPress={() => {
                setCloseReason(null);
                setModal("long-sheet");
              }}
            >
              Open long form
            </UI.Button>
            <UI.Button
              variant="outline"
              onPress={() => {
                setCloseReason(null);
                setModal("full-form");
              }}
            >
              Open full screen
            </UI.Button>
          </UI.Card>
        </>
      )}
      {tab === "more" && (
        <>
          <UI.Card>
            <UI.Heading level={2}>Display & feedback</UI.Heading>
            <UI.Stack direction="row" wrap gap="2">
              {(
                ["neutral", "accent", "success", "warning", "danger"] as const
              ).map((tone) => (
                <UI.Badge key={tone} tone={tone}>
                  {tone}
                </UI.Badge>
              ))}
            </UI.Stack>
            <UI.Stack direction="row" wrap gap="2">
              {(
                [
                  "check",
                  "close",
                  "chevron-left",
                  "chevron-right",
                  "more",
                  "plus",
                  "minus",
                  "sign",
                ] as const
              ).map((name) => (
                <UI.IconButton
                  key={name}
                  label={`${name} icon`}
                  variant="outline"
                  onPress={() => notify(`${name} icon pressed`)}
                >
                  <UI.Icon name={name} />
                </UI.IconButton>
              ))}
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
              trailing={<UI.Icon name="chevron-right" />}
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
        </>
      )}
      <UI.Spacer size="4" />
      <UI.Dialog
        open={modal === "dialog"}
        onOpenChange={(open) => {
          if (!open) setModal("");
        }}
        title="A little more room"
        description="Native modal with keyboard avoidance."
        footer={
          <UI.Button
            onPress={() => {
              notify("Thought saved locally");
              setModal("");
            }}
          >
            Save thought
          </UI.Button>
        }
      >
        <UI.TextField label="Quick thought" />
      </UI.Dialog>
      <UI.BottomSheet
        open={modal === "sheet"}
        onOpenChange={(open) => {
          if (!open) setModal("");
        }}
        title="Keep exploring"
        footer={<UI.Button onPress={() => setModal("")}>Done</UI.Button>}
      >
        <UI.Text>A bounded sheet that respects the bottom safe area.</UI.Text>
      </UI.BottomSheet>
      <UI.BottomSheet
        open={modal === "long-sheet" || modal === "full-form"}
        size={modal === "full-form" ? "fullscreen" : "large"}
        title="A longer editor title that wraps without shrinking its close button"
        dismissible={!blockClosing}
        onOpenChange={(open) => {
          if (!open) setModal("");
        }}
        onCloseRequest={(reason) => {
          if (protectDraft) setCloseReason(reason);
          else setModal("");
        }}
        footer={
          <UI.Stack gap="2">
            {closeReason && (
              <UI.Alert
                title={`Close requested: ${closeReason}`}
                description="The app kept this draft open. Discard or continue editing."
              />
            )}
            <UI.Button
              disabled={blockClosing}
              onPress={() => {
                notify("Draft saved in this preview");
                setModal("");
              }}
            >
              Save preview draft
            </UI.Button>
            {closeReason && (
              <UI.Button
                variant="danger"
                disabled={blockClosing}
                onPress={() => setModal("")}
              >
                Discard draft
              </UI.Button>
            )}
          </UI.Stack>
        }
      >
        <UI.Checkbox
          label="Protect unsaved draft"
          checked={protectDraft}
          onCheckedChange={setProtectDraft}
        />
        <UI.Switch
          label="Block closing while busy"
          value={blockClosing}
          onValueChange={setBlockClosing}
        />
        {Array.from({ length: 8 }, (_, i) => (
          <UI.TextField
            key={i}
            label={`Form field ${i + 1}`}
            placeholder="Enter a local draft"
          />
        ))}
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

function TabIcon({
  kind,
  active,
}: {
  kind: "grid" | "sliders" | "layers";
  active: boolean;
}) {
  const { colors } = UI.useTheme();
  const color = active ? colors.accent : colors.muted;
  return (
    <View accessible={false} style={{ width: 22, height: 22 }}>
      {kind === "grid"
        ? [0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: (i % 2) * 12,
                top: Math.floor(i / 2) * 12,
                width: 9,
                height: 9,
                borderWidth: 1.5,
                borderColor: color,
                borderRadius: 2,
              }}
            />
          ))
        : kind === "sliders"
          ? [0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: 1,
                  right: 1,
                  top: 4 + i * 7,
                  height: 1.5,
                  backgroundColor: color,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: i === 1 ? 12 : 4,
                    top: -2.5,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: color,
                  }}
                />
              </View>
            ))
          : [0, 1].map((i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: 2 + i * 4,
                  top: 2 + i * 4,
                  width: 14,
                  height: 14,
                  borderWidth: 1.5,
                  borderColor: color,
                  borderRadius: 3,
                  backgroundColor: colors.raised,
                }}
              />
            ))}
    </View>
  );
}
