/** Platform-neutral Mingu values: space and type use px on web, logical units on Native. */
export const tokens = {
  space: {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "12": 48,
    "16": 64,
  },
  radii: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 999,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    "2xl": 32,
  },
  control: {
    sm: {
      height: 36,
      padding: 10,
    },
    md: {
      height: 44,
      padding: 12,
    },
    lg: {
      height: 48,
      padding: 16,
    },
  },
  motion: {
    fast: 120,
    normal: 200,
    release: 360,
    press: 80,
  },
  light: {
    "code-keyword": "#7e35a0",
    "code-string": "#21734a",
    "code-number": "#965114",
    bg: "#fdfdfd",
    surface: "#f4f4f4",
    raised: "#fff",
    text: "#111111",
    muted: "#626972",
    border: "#dedfe2",
    "control-border": "#858c96",
    accent: "#2563a6",
    "on-accent": "#fff",
    "accent-soft": "#eaf2fb",
    danger: "#b42332",
    "danger-soft": "#fff0f1",
    success: "#187044",
    "success-soft": "#eaf7ef",
    warning: "#805600",
    "warning-soft": "#fff7df",
  },
  dark: {
    "code-keyword": "#c9a5e7",
    "code-string": "#9ccba4",
    "code-number": "#e8bc8b",
    bg: "#111111",
    surface: "#1a1a1a",
    raised: "#202020",
    text: "#ededed",
    muted: "#a0a0a5",
    border: "#343438",
    "control-border": "#73737d",
    accent: "#8bc3ff",
    "on-accent": "#102338",
    "accent-soft": "#1b2b3d",
    danger: "#ff9da6",
    "danger-soft": "#371c23",
    success: "#8bdbaf",
    "success-soft": "#142e21",
    warning: "#edcf86",
    "warning-soft": "#302917",
  },
} as const;
export type ThemeMode = "light" | "dark" | "system";
export type AccentMode = "brand" | "neutral";
export type ColorTokens = { [K in keyof typeof tokens.light]: string };
export type ControlSize = keyof typeof tokens.control;
export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";
export type Space = keyof typeof tokens.space;
export function getColors(
  mode: "light" | "dark",
  accent: AccentMode = "brand",
  overrides: Partial<ColorTokens> = {},
): ColorTokens {
  const c: ColorTokens = { ...tokens[mode], ...overrides };
  return accent === "neutral"
    ? { ...c, accent: c.text, "on-accent": c.bg, "accent-soft": c.surface }
    : c;
}
