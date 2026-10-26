module.exports = {
  rootDir: "../..",
  preset: "@react-native/jest-preset",
  testMatch: ["<rootDir>/tests/native/**/*.test.tsx"],
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      { presets: ["module:@react-native/babel-preset"] },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-safe-area-context)/)",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/native/setup.ts"],
  clearMocks: true,
  moduleNameMapper: {
    ...require("@react-native/jest-preset").moduleNameMapper,
    // The standalone Expo app owns a different React patch release. Node tests
    // use the root renderer; Metro uses the example's runtime on devices.
    "^react$": require.resolve("react"),
    "^react/jsx-runtime$": require.resolve("react/jsx-runtime"),
    "^react/jsx-dev-runtime$": require.resolve("react/jsx-dev-runtime"),
    "^@mingu/interaction-ui/native$": "<rootDir>/packages/native/src/index.ts",
  },
};
