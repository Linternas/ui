import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
// OS date dialogs and sliders require a device. Keep only the native host boundary mocked.
jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react"),
    { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: "native-date-control" }),
  };
});
jest.mock("@react-native-community/slider", () => {
  const React = require("react"),
    { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, accessibilityRole: "adjustable" }),
  };
});
