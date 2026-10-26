import React from "react";
import {
  Text as NativeText,
  type TextProps as NativeTextProps,
} from "react-native";
import { tokens } from "../../tokens/src";
import { useTheme } from "./theme";
export interface TextProps extends NativeTextProps {
  size?: keyof typeof tokens.fontSizes;
  tone?: "default" | "muted" | "accent" | "danger" | "success" | "warning";
  weight?: "regular" | "medium" | "semibold" | "bold";
}
export function Text({
  size = "md",
  tone = "default",
  weight = "regular",
  style,
  ...props
}: TextProps) {
  const { colors: c } = useTheme();
  return (
    <NativeText
      {...props}
      style={[
        {
          color: tone === "default" ? c.text : c[tone],
          fontSize: tokens.fontSizes[size],
          lineHeight: tokens.fontSizes[size] * 1.5,
          fontWeight:
            weight === "regular"
              ? "400"
              : weight === "medium"
                ? "500"
                : weight === "semibold"
                  ? "600"
                  : "700",
          flexShrink: 1,
        },
        style,
      ]}
    />
  );
}
export function Heading({
  level = 2,
  size,
  ...props
}: TextProps & { level?: 1 | 2 | 3 }) {
  return (
    <Text
      {...props}
      size={size ?? (level === 1 ? "2xl" : level === 2 ? "xl" : "lg")}
      weight={props.weight ?? "semibold"}
      accessibilityRole="header"
    />
  );
}
