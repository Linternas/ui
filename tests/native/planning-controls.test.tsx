import React from "react";
import { Platform } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import * as UI from "../../packages/native/src";
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UI.NativeProvider>{children}</UI.NativeProvider>
);

test("geometry close button preserves native press semantics in a long heading", async () => {
  const close = jest.fn();
  await render(
    <UI.Dialog
      open
      title="A very long form title with enough words to wrap"
      onOpenChange={close}
      closeLabel="Close editor"
    />,
    { wrapper },
  );
  const button = screen.getByRole("button", { name: "Close editor" });
  expect(screen.queryByText("×")).toBeNull();
  await fireEvent.press(button);
  expect(close).toHaveBeenCalledWith(false);
});

test("overlay close reasons are request-only, can be vetoed, and dismissible blocks every route", async () => {
  const changed = jest.fn(),
    requested = jest.fn();
  const result = await render(
    <UI.BottomSheet
      open
      title="Editor"
      onOpenChange={changed}
      onCloseRequest={requested}
      testID="surface"
    >
      <UI.Text>Draft</UI.Text>
    </UI.BottomSheet>,
    { wrapper },
  );
  await fireEvent.press(screen.getByRole("button", { name: "Close" }));
  expect(requested).toHaveBeenLastCalledWith("close-button");
  await fireEvent(screen.getByTestId("surface"), "accessibilityEscape");
  expect(requested).toHaveBeenLastCalledWith("accessibility-escape");
  await fireEvent(
    screen.container.queryAll(
      (node) => typeof node.props.onRequestClose === "function",
    )[0],
    "requestClose",
  );
  expect(requested).toHaveBeenLastCalledWith("hardware-back");
  await fireEvent.press(
    screen.container.queryAll(
      (node) => node.props.importantForAccessibility === "no",
    )[0],
  );
  expect(requested).toHaveBeenLastCalledWith("backdrop");
  expect(changed).not.toHaveBeenCalled();
  expect(screen.getByText("Draft")).toBeOnTheScreen();
  await result.rerender(
    <UI.BottomSheet
      open
      title="Editor"
      dismissible={false}
      onOpenChange={changed}
      onCloseRequest={requested}
    />,
  );
  requested.mockClear();
  await fireEvent(
    screen.container.queryAll(
      (node) => typeof node.props.onRequestClose === "function",
    )[0],
    "requestClose",
  );
  expect(requested).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
});

test("fixed overlay footer does not belong to the body scroll and supports its own scrolling", async () => {
  await render(
    <UI.BottomSheet
      open
      title="Long form"
      size="large"
      onOpenChange={() => {}}
      footer={<UI.Button>Save footer</UI.Button>}
    >
      <UI.TextField label="Body value" />
    </UI.BottomSheet>,
    { wrapper },
  );
  const ancestors = (node: ReturnType<typeof screen.getByText>) => {
    const result = [];
    for (let parent = node.parent; parent; parent = parent.parent)
      if (String(parent.type).includes("ScrollView")) result.push(parent);
    return result;
  };
  const bodyScroll = ancestors(screen.getByLabelText("Body value"));
  const footerScroll = ancestors(
    screen.getByRole("button", { name: "Save footer" }),
  );
  expect(bodyScroll.length).toBeGreaterThan(0);
  expect(footerScroll.length).toBeGreaterThan(0);
  expect(bodyScroll[0]).not.toBe(footerScroll[0]);
});

test("nullable date never displays or commits today's draft unless explicitly confirmed; clear emits null", async () => {
  const previous = Platform.OS;
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    value: "android",
  });
  const changed = jest.fn();
  try {
    const result = await render(
      <UI.DatePicker
        label="Start"
        value={null}
        placeholder="Not entered"
        clearable
        onValueChange={changed}
      />,
      { wrapper },
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Start, Not entered" }),
    );
    expect(changed).not.toHaveBeenCalled();
    await fireEvent(screen.getByTestId("native-date-control"), "dismiss");
    expect(changed).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Start, Not entered" }),
    ).toBeOnTheScreen();
    await result.rerender(
      <UI.DatePicker
        label="Start"
        value={new Date(2026, 9, 26)}
        clearable
        formatValue={(d) => UI.dateToCalendarDate(d)}
        onValueChange={changed}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Start, 2026-10-26" }),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Clear date" }));
    expect(changed).toHaveBeenCalledWith(null);
    // Controlled ownership: the committed value remains until the app accepts it.
    expect(
      screen.getByRole("button", { name: "Start, 2026-10-26" }),
    ).toBeOnTheScreen();
  } finally {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: previous,
    });
  }
});

test("money supports grouping at rest and unformatted middle editing without rewriting selection", async () => {
  const changed = jest.fn();
  await render(
    <UI.MoneyField
      label="Amount"
      defaultValue="10320"
      onValueChange={changed}
      allowNegative
      unit="KRW"
    />,
    { wrapper },
  );
  const input = screen.getByLabelText("Amount");
  expect(input).toHaveProp("value", "10,320");
  await fireEvent(input, "focus", { nativeEvent: {} });
  expect(input).toHaveProp("value", "10320");
  await fireEvent.changeText(input, "109320");
  expect(input).toHaveProp("value", "109320");
  expect(input.props.selection).toBeUndefined();
  await fireEvent.changeText(input, "10,320");
  expect(changed).toHaveBeenLastCalledWith("10320");
  await fireEvent.press(
    screen.getByRole("button", { name: "Change amount sign" }),
  );
  expect(changed).toHaveBeenLastCalledWith("-10320");
  await fireEvent.changeText(input, "");
  expect(changed).toHaveBeenLastCalledWith("");
  await fireEvent.press(
    screen.getByRole("button", { name: "Change amount sign" }),
  );
  expect(changed).toHaveBeenLastCalledWith("-");
  expect(UI.parseMoneyInput("-")).toBeNull();
  await fireEvent.changeText(input, "0");
  expect(UI.parseMoneyInput(input.props.value)).toBe(0);
  await fireEvent.changeText(input, "abc12x");
  expect(changed).toHaveBeenLastCalledWith("12");
});

test("money decimal precision and range error do not coerce empty or clamp edits", async () => {
  await render(
    <UI.MoneyField
      label="Adjustment"
      allowDecimal
      allowNegative
      max={100}
      decimalScale={2}
    />,
    { wrapper },
  );
  const input = screen.getByLabelText("Adjustment");
  await fireEvent.changeText(input, "-12.345");
  expect(input).toHaveProp("value", "-12.34");
  await fireEvent.changeText(input, "101.50");
  expect(
    screen.getByText("Amount is outside the allowed range"),
  ).toBeOnTheScreen();
  expect(input).toHaveProp("value", "101.50");
  await fireEvent.changeText(input, "");
  expect(screen.queryByText("Amount is outside the allowed range")).toBeNull();
  expect(UI.parseMoneyInput("")).toBeNull();
});

test("civil dates validate leap years and retain local identity over month/year boundaries", () => {
  expect(UI.parseCalendarDate("2024-02-29")).not.toBeNull();
  expect(UI.parseCalendarDate("2025-02-29")).toBeNull();
  expect(UI.parseCalendarDate("1900-02-29")).toBeNull();
  expect(UI.parseCalendarDate("2000-02-29")).not.toBeNull();
  expect(UI.shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({
    year: 2027,
    month: 1,
  });
  expect(UI.shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({
    year: 2025,
    month: 12,
  });
  expect(UI.dateToCalendarDate(UI.calendarDateToDate("2026-01-01"))).toBe(
    "2026-01-01",
  );
});

test("calendar preserves controlled selection and exposes event overflow and disabled dates", async () => {
  const changed = jest.fn();
  await render(
    <UI.Calendar
      label="Schedule"
      value="2024-02-28"
      defaultMonth={{ year: 2024, month: 2 }}
      locale="en-US"
      onValueChange={changed}
      maximumDate="2024-02-29"
      isDateDisabled={(d) => d === "2024-02-27"}
      items={{
        "2024-02-28": [
          { id: "1", label: "One" },
          { id: "2", label: "Two" },
          { id: "3", label: "Three" },
        ],
      }}
    />,
    { wrapper },
  );
  expect(screen.getByText("+2")).toBeOnTheScreen();
  const day = screen.getByRole("button", {
    name: /Wednesday, February 28, 2024/,
  });
  expect(day.props.accessibilityState.selected).toBe(true);
  expect(
    screen.getByRole("button", { name: /Tuesday, February 27, 2024/ }),
  ).toBeDisabled();
  await fireEvent.press(
    screen.getByRole("button", { name: /Thursday, February 29, 2024/ }),
  );
  expect(changed).toHaveBeenCalledWith("2024-02-29");
  expect(day.props.accessibilityState.selected).toBe(true);
  expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
});

test("month picker cancels drafts and crosses December to January without selecting a day", async () => {
  const changed = jest.fn();
  const result = await render(
    <UI.MonthPicker
      label="Payroll"
      defaultValue={{ year: 2026, month: 12 }}
      maximumMonth={{ year: 2027, month: 1 }}
      onValueChange={changed}
      locale="en-US"
    />,
    { wrapper },
  );
  await fireEvent.press(screen.getByRole("button", { name: "Next month" }));
  expect(changed).toHaveBeenLastCalledWith({ year: 2027, month: 1 });
  expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
  await fireEvent.press(
    screen.getByRole("button", { name: "Payroll, January 2027" }),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Clear month" }));
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(
    screen.getByRole("button", { name: "Payroll, January 2027" }),
  ).toBeOnTheScreen();
  expect(changed).toHaveBeenCalledTimes(1);
});

test("date ranges normalize reverse endpoints, cancel drafts, commit same day and permit partial ranges", async () => {
  const changed = jest.fn();
  const result = await render(
    <UI.DateRangePicker
      label="Period"
      defaultValue={{ start: "2026-10-28", end: null }}
      onValueChange={changed}
      locale="en-US"
    />,
    { wrapper },
  );
  await fireEvent.press(screen.getByRole("button", { name: /^Period,/ }));
  await fireEvent.press(
    screen.getByRole("button", { name: /Monday, October 26, 2026/ }),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(changed).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: /^Period,/ }));
  await fireEvent.press(
    screen.getByRole("button", { name: /Monday, October 26, 2026/ }),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Apply dates" }));
  expect(changed).toHaveBeenLastCalledWith({
    start: "2026-10-26",
    end: "2026-10-28",
  });
  await fireEvent.press(screen.getByRole("button", { name: /^Period,/ }));
  await fireEvent.press(
    screen.getByRole("button", { name: /Monday, October 26, 2026/ }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: /Monday, October 26, 2026/ }),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Apply dates" }));
  expect(changed).toHaveBeenLastCalledWith({
    start: "2026-10-26",
    end: "2026-10-26",
  });
  await fireEvent.press(screen.getByRole("button", { name: /^Period,/ }));
  await fireEvent.press(screen.getByRole("button", { name: "Clear dates" }));
  await fireEvent.press(
    screen.getByRole("button", { name: /Tuesday, October 27, 2026/ }),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Apply dates" }));
  expect(changed).toHaveBeenLastCalledWith({ start: "2026-10-27", end: null });
});

test("weekday presets preserve disabled selections and permit individual edits", async () => {
  const changed = jest.fn();
  await render(
    <UI.WeekdayPicker
      label="Repeat"
      defaultValue={[0]}
      disabledDays={[0]}
      locale="en-US"
      weekStartsOn={1}
      onValueChange={changed}
      presets={[{ id: "weekdays", label: "Weekdays", days: [1, 2, 3, 4, 5] }]}
    />,
    { wrapper },
  );
  expect(screen.getByRole("checkbox", { name: "Sunday" })).toBeDisabled();
  await fireEvent.press(screen.getByRole("button", { name: "Weekdays" }));
  expect(changed).toHaveBeenLastCalledWith([0, 1, 2, 3, 4, 5]);
  await fireEvent.press(screen.getByRole("checkbox", { name: "Wednesday" }));
  expect(changed).toHaveBeenLastCalledWith([0, 1, 2, 4, 5]);
  expect(screen.getByRole("checkbox", { name: "Wednesday" })).toHaveProp(
    "accessibilityState",
    expect.objectContaining({ checked: false }),
  );
});
