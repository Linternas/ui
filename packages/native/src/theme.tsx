import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  tokens,
  getColors,
  type AccentMode,
  type ColorTokens,
  type ThemeMode,
} from "../../tokens/src";
export { tokens, getColors };
export type {
  AccentMode,
  ColorTokens,
  ThemeMode,
  ControlSize,
  Tone,
  Space,
} from "../../tokens/src";
export interface NativeTheme {
  colors: ColorTokens;
  mode: "light" | "dark";
  reducedMotion: boolean;
}
const ThemeContext = createContext<NativeTheme | null>(null);
/** Mount once per app; nested providers override colors without adding a native View. */
export function DesignSystemProvider({
  children,
  theme = "system",
  accent = "brand",
  colors,
  reducedMotion,
}: {
  children: ReactNode;
  theme?: ThemeMode;
  accent?: AccentMode;
  colors?: Partial<ColorTokens>;
  reducedMotion?: boolean;
}) {
  const system = useColorScheme(),
    [osReduced, setOsReduced] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (v) => {
        if (live) setOsReduced(v);
      },
      () => {},
    );
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setOsReduced,
    );
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  const mode =
    theme === "system" ? (system === "dark" ? "dark" : "light") : theme;
  const value = useMemo(
    () => ({
      colors: getColors(mode, accent, colors),
      mode,
      reducedMotion: reducedMotion ?? osReduced,
    }),
    [mode, accent, colors, reducedMotion, osReduced],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme)
    throw new Error("Mingu Native components require DesignSystemProvider.");
  return theme;
}
/** Convenience root. SafeAreaProvider should wrap app navigation and native modals. */
export function NativeProvider(
  props: React.ComponentProps<typeof DesignSystemProvider>,
) {
  return (
    <SafeAreaProvider>
      <DesignSystemProvider {...props} />
    </SafeAreaProvider>
  );
}
export function toneColors(
  c: ColorTokens,
  tone: import("../../tokens/src").Tone,
) {
  return tone === "neutral"
    ? { ink: c.text, background: c.surface }
    : tone === "accent"
      ? { ink: c.accent, background: c["accent-soft"] }
      : { ink: c[tone], background: c[`${tone}-soft`] };
}
