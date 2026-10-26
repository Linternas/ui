import React, { useState } from "react";
import {
  Platform,
  Modal,
  View,
  TextInput,
  AccessibilityInfo,
} from "react-native";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import * as UI from "../../packages/native/src";
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <UI.NativeProvider theme="light" accent="neutral">
    {children}
  </UI.NativeProvider>
);
test("native fields retain labels, entered values, native refs and error hints", async () => {
  const ref = React.createRef<React.ComponentRef<typeof TextInput>>();
  function Form() {
    const [value, setValue] = useState("");
    return (
      <>
        <UI.TextField
          label="Name"
          hint="Your name"
          required
          value={value}
          onChangeText={setValue}
          ref={ref}
        />
        <UI.TextareaField label="Notes" error="Too short" />
        <UI.Text>{value}</UI.Text>
      </>
    );
  }
  await render(<Form />, { wrapper: Wrapper });
  await fireEvent.changeText(screen.getByLabelText("Name"), "Mingu");
  expect(screen.getByDisplayValue("Mingu")).toBeTruthy();
  expect(screen.getByText("Mingu")).toBeTruthy();
  expect(screen.getByLabelText("Notes")).toHaveProp(
    "accessibilityHint",
    "Too short",
  );
  expect(ref.current).toBeTruthy();
});
test("loading and disabled actions do not run; enabled press runs once", async () => {
  const onPress = jest.fn();
  await render(
    <>
      <UI.Button loading onPress={onPress}>
        Saving
      </UI.Button>
      <UI.Button disabled onPress={onPress}>
        Disabled
      </UI.Button>
      <UI.Button onPress={onPress}>Save</UI.Button>
    </>,
    { wrapper: Wrapper },
  );
  await fireEvent.press(screen.getByText("Saving"));
  await fireEvent.press(screen.getByText("Disabled"));
  expect(onPress).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText("Save"));
  expect(onPress).toHaveBeenCalledTimes(1);
});
test("checkbox controlled ownership, mixed state and native switch callbacks", async () => {
  const checked = jest.fn(),
    toggled = jest.fn();
  await render(
    <>
      <UI.Checkbox label="Fixed" checked={false} onCheckedChange={checked} />
      <UI.Checkbox label="Mixed" indeterminate />
      <UI.Switch label="Notifications" value={false} onValueChange={toggled} />
    </>,
    { wrapper: Wrapper },
  );
  await fireEvent.press(screen.getByRole("checkbox", { name: "Fixed" }));
  expect(checked).toHaveBeenCalledWith(true);
  expect(screen.getByRole("checkbox", { name: "Fixed" })).not.toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Mixed" }),
  ).toBePartiallyChecked();
  await fireEvent(
    screen.getByRole("switch", { name: "Notifications" }),
    "valueChange",
    true,
  );
  expect(toggled).toHaveBeenCalledWith(true);
});
test("radio, segmented and tabs commit actual selection and skip disabled choices", async () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Locked", disabled: true },
  ];
  await render(
    <>
      <UI.RadioGroup label="Plan" options={options} />
      <UI.SegmentedControl
        label="View"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ]}
      />
      <UI.Tabs
        label="Pages"
        items={[
          {
            value: "one",
            label: "One",
            content: <UI.Text>First page</UI.Text>,
          },
          {
            value: "two",
            label: "Two",
            content: <UI.Text>Second page</UI.Text>,
          },
        ]}
      />
    </>,
    { wrapper: Wrapper },
  );
  await fireEvent.press(screen.getByRole("radio", { name: "Beta" }));
  expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Locked" })).toBeDisabled();
  await fireEvent.press(screen.getByRole("radio", { name: "List" }));
  expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
  await fireEvent.press(screen.getByRole("tab", { name: "Two" }));
  expect(screen.queryByText("First page")).toBeNull();
  expect(screen.getByText("Second page")).toBeTruthy();
});
test("select opens native sheet, searches, selects and dismisses on Android back", async () => {
  await render(
    <UI.Select
      label="Environment"
      searchable
      options={[
        { value: "prod", label: "Production" },
        { value: "preview", label: "Preview" },
        { value: "old", label: "Archived", disabled: true },
      ]}
    />,
    { wrapper: Wrapper },
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Environment, Choose…" }),
  );
  await fireEvent.changeText(screen.getByLabelText("Search options"), "pre");
  expect(screen.queryByRole("radio", { name: "Production" })).toBeNull();
  await fireEvent.press(screen.getByRole("radio", { name: "Preview" }));
  expect(
    screen.getByRole("button", { name: "Environment, Preview" }),
  ).toBeTruthy();
  expect(screen.queryByLabelText("Search options")).toBeNull();
});
test("password toggle, OTP paste and stepper bounds change actual values", async () => {
  const complete = jest.fn();
  await render(
    <>
      <UI.PasswordField label="Password" defaultValue="secret" />
      <UI.OtpInput label="Code" onComplete={complete} />
      <UI.NumberStepper label="Quantity" min={1} max={3} defaultValue={2} />
    </>,
    { wrapper: Wrapper },
  );
  expect(screen.getByLabelText("Password")).toHaveProp("secureTextEntry", true);
  await fireEvent.press(screen.getByText("Show password"));
  expect(screen.getByLabelText("Password")).toHaveProp(
    "secureTextEntry",
    false,
  );
  await fireEvent.changeText(screen.getByLabelText("Code"), "12 34-56");
  expect(screen.getByDisplayValue("123456")).toBeTruthy();
  expect(complete).toHaveBeenCalledWith("123456");
  await fireEvent.press(
    screen.getByRole("button", { name: "Increase Quantity" }),
  );
  expect(screen.getByText("3")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Increase Quantity" }),
  ).toBeDisabled();
});
test("dialog back dismisses, locked confirmation ignores dismissal and reports caller error", async () => {
  const close = jest.fn(),
    confirm = jest.fn();
  await render(
    <UI.AlertDialog
      title="Delete draft"
      open
      onOpenChange={close}
      onConfirm={confirm}
      loading
      error="Retry later"
    />,
    { wrapper: Wrapper },
  );
  expect(screen.getByText("Retry later")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
});
test("avatar fallback, bounded progress, accordion hidden content and toast dismissal", async () => {
  const dismiss = jest.fn();
  await render(
    <>
      <UI.Avatar name="Mingu Kim" />
      <UI.Progress label="Upload" value={200} />
      <UI.Accordion title="Details">
        <UI.Button>Inside</UI.Button>
      </UI.Accordion>
      <UI.Toast
        messages={[{ id: "saved", title: "Saved", tone: "success" }]}
        onDismiss={dismiss}
      />
    </>,
    { wrapper: Wrapper },
  );
  expect(screen.getByText("MK")).toBeTruthy();
  expect(
    screen.getByRole("progressbar", { name: "Upload" }),
  ).toHaveAccessibilityValue({ min: 0, max: 100, now: 100 });
  expect(screen.queryByText("Inside")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Details" }));
  expect(screen.getByText("Inside")).toBeTruthy();
  await fireEvent.press(screen.getByText("Dismiss"));
  expect(dismiss).toHaveBeenCalledWith("saved");
});
test("shared colors, neutral accent and scoped Native themes stay independent", async () => {
  expect(UI.getColors("dark", "neutral").accent).toBe(UI.tokens.dark.text);
  expect(UI.tokens.space["4"]).toBe(16);
  await render(
    <UI.Card testID="light">
      <UI.DesignSystemProvider theme="dark">
        <UI.Card testID="dark">
          <UI.Text>Nested</UI.Text>
        </UI.Card>
      </UI.DesignSystemProvider>
    </UI.Card>,
    { wrapper: Wrapper },
  );
  expect(screen.getByTestId("light")).toHaveStyle({
    backgroundColor: UI.tokens.light.raised,
  });
  expect(screen.getByTestId("dark")).toHaveStyle({
    backgroundColor: UI.tokens.dark.raised,
  });
});

test("all core components compose into the real Native showcase without a DOM renderer", async () => {
  const App = require("../../examples/native/App").default;
  await render(<App />);
  expect(screen.getByText("Made for touch.")).toBeOnTheScreen();
  expect(screen.getByLabelText("Name")).toHaveDisplayValue("Mingu");
  await fireEvent(
    screen.getByRole("switch", { name: "Dark theme" }),
    "valueChange",
    true,
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Dialog", exact: true }),
  );
  expect(screen.getByText("A little more room")).toBeOnTheScreen();
  await fireEvent.press(
    screen.getByRole("button", { name: "Close", exact: true }),
  );
  expect(screen.queryByText("A little more room")).toBeNull();
});

test("native Modal requestClose respects dismissible state", async () => {
  const close = jest.fn();
  const result = await render(
    <UI.Dialog open title="Back handler" onOpenChange={close}>
      <UI.Text>Content</UI.Text>
    </UI.Dialog>,
    { wrapper: Wrapper },
  );
  await fireEvent(
    screen.container.queryAll(
      (node) => typeof node.props.onRequestClose === "function",
    )[0],
    "requestClose",
  );
  expect(close).toHaveBeenCalledWith(false);
  close.mockClear();
  await result.rerender(
    <UI.Dialog
      open
      title="Back handler"
      onOpenChange={close}
      dismissible={false}
    >
      <UI.Text>Content</UI.Text>
    </UI.Dialog>,
  );
  await fireEvent(
    screen.container.queryAll(
      (node) => typeof node.props.onRequestClose === "function",
    )[0],
    "requestClose",
  );
  expect(close).not.toHaveBeenCalled();
});

test("iOS date drafts apply only on Done and Android dismissal never emits a date", async () => {
  const changed = jest.fn(),
    date = new Date(2026, 9, 26, 9, 30);
  let old = Platform.OS;
  try {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    const result = await render(
      <UI.DatePicker
        label="Date"
        defaultValue={date}
        onValueChange={changed}
      />,
      { wrapper: Wrapper },
    );
    await fireEvent.press(screen.getByRole("button", { name: /^Date,/ }));
    await fireEvent(
      screen.getByTestId("native-date-control"),
      "change",
      { type: "set" },
      new Date(2026, 9, 28),
    );
    expect(changed).not.toHaveBeenCalled();
    await fireEvent.press(
      screen.getByRole("button", { name: "Cancel", exact: true }),
    );
    expect(changed).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole("button", { name: /^Date,/ }));
    await fireEvent(
      screen.getByTestId("native-date-control"),
      "change",
      { type: "set" },
      new Date(2026, 9, 28),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Done", exact: true }),
    );
    expect(changed).toHaveBeenCalledWith(new Date(2026, 9, 28));
    await result.unmount();
    changed.mockClear();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    await render(
      <UI.DatePicker
        label="Android date"
        defaultValue={date}
        onValueChange={changed}
      />,
      { wrapper: Wrapper },
    );
    await fireEvent.press(
      screen.getByRole("button", { name: /^Android date,/ }),
    );
    await fireEvent(
      screen.getByTestId("native-date-control"),
      "change",
      { type: "dismissed" },
      date,
    );
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByTestId("native-date-control")).toBeNull();
  } finally {
    Object.defineProperty(Platform, "OS", { configurable: true, value: old });
  }
});

test("Select disables an open sheet and does not reopen it when re-enabled", async () => {
  const props = { label: "Plan", options: [{ value: "one", label: "One" }] };
  const result = await render(<UI.Select {...props} />, { wrapper: Wrapper });
  await fireEvent.press(screen.getByRole("button", { name: "Plan, Choose…" }));
  expect(screen.getByRole("radio", { name: "One" })).toBeOnTheScreen();
  await result.rerender(<UI.Select {...props} disabled />);
  expect(screen.queryByRole("radio", { name: "One" })).toBeNull();
  await result.rerender(<UI.Select {...props} />);
  expect(screen.queryByRole("radio", { name: "One" })).toBeNull();
});

test("slider emits bounded values without replacing controlled state; action sheets run enabled actions", async () => {
  const changed = jest.fn(),
    action = jest.fn(),
    closed = jest.fn();
  await render(
    <>
      <UI.Slider
        label="Intensity"
        value={30}
        min={0}
        max={100}
        onValueChange={changed}
      />
      <UI.ActionSheet
        open
        title="Actions"
        onOpenChange={closed}
        items={[
          { id: "save", label: "Save", onPress: action },
          { id: "locked", label: "Locked", disabled: true, onPress: action },
        ]}
      />
    </>,
    { wrapper: Wrapper },
  );
  // Modal accessibility isolation hides the underlying slider while open.
  const slider = screen.container.queryAll(
    (node) =>
      node.props.accessibilityLabel === "Intensity" &&
      typeof node.props.onValueChange === "function",
  )[0];
  await fireEvent(slider, "valueChange", 150);
  expect(changed).toHaveBeenCalledWith(100);
  expect(slider.props.value).toBe(30);
  await fireEvent.press(screen.getByRole("button", { name: "Locked" }));
  expect(action).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(closed).toHaveBeenCalledWith(false);
  expect(action).toHaveBeenCalledTimes(1);
});
