import React from "react";
import { Platform } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { NativeProvider, DatePicker } from "../../packages/native/src";

jest.mock("@react-native-community/datetimepicker/package.json", () => ({
  version: "8.4.4",
}));

test("datetimepicker v8 consumers retain change and dismissal behavior", async () => {
  const previous = Platform.OS;
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    value: "android",
  });
  const changed = jest.fn();
  const initial = new Date(2026, 9, 26);
  try {
    await render(
      <NativeProvider>
        <DatePicker
          label="Legacy date"
          defaultValue={initial}
          onValueChange={changed}
        />
      </NativeProvider>,
    );
    await fireEvent.press(
      screen.getByRole("button", { name: /^Legacy date,/ }),
    );
    await fireEvent(
      screen.getByTestId("native-date-control"),
      "change",
      { type: "dismissed" },
      initial,
    );
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByTestId("native-date-control")).toBeNull();
    await fireEvent.press(
      screen.getByRole("button", { name: /^Legacy date,/ }),
    );
    const next = new Date(2026, 9, 28);
    await fireEvent(
      screen.getByTestId("native-date-control"),
      "change",
      { type: "set" },
      next,
    );
    expect(changed).toHaveBeenCalledWith(next);
    expect(screen.queryByTestId("native-date-control")).toBeNull();
  } finally {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: previous,
    });
  }
});
