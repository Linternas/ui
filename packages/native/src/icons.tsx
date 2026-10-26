import React from "react";
import { View } from "react-native";
import { IconButton, type IconButtonProps } from "./actions";
import { useTheme } from "./theme";

export interface IconProps {
  name: "close" | "chevron-left" | "chevron-right" | "more";
  size?: number;
  color?: string;
}
/** Decorative, font-independent geometry. Name the enclosing interactive control. */
export function Icon({ name, size = 22, color }: IconProps) {
  const { colors } = useTheme();
  const ink = color ?? colors.text;
  const span = Number.isFinite(size) ? Math.max(12, Math.min(64, size)) : 22;
  const stroke = {
    position: "absolute" as const,
    height: 2,
    borderRadius: 1,
    backgroundColor: ink,
  };
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: span, height: span, flexShrink: 0 }}
    >
      {name === "more"
        ? [0.2, 0.5, 0.8].map((x) => (
            <View
              key={x}
              style={{
                position: "absolute",
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: ink,
                left: span * x - 1.5,
                top: span / 2 - 1.5,
              }}
            />
          ))
        : name === "close"
          ? [-45, 45].map((angle) => (
              <View
                key={angle}
                style={{
                  ...stroke,
                  width: span * 0.8,
                  left: span * 0.1,
                  top: span / 2 - 1,
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            ))
          : [-1, 1].map((direction) => (
              <View
                key={direction}
                style={{
                  ...stroke,
                  width: span * 0.48,
                  left: span * 0.26,
                  top: span / 2 - 1 + direction * span * 0.16,
                  transform: [
                    {
                      rotate: `${direction * (name === "chevron-left" ? 45 : -45)}deg`,
                    },
                  ],
                }}
              />
            ))}
    </View>
  );
}
export interface CloseButtonProps extends Omit<IconButtonProps, "children"> {}
export function CloseButton({ iconSize = 22, ...props }: CloseButtonProps) {
  return (
    <IconButton
      {...props}
      iconSize={iconSize}
      variant={props.variant ?? "ghost"}
    >
      <Icon name="close" size={iconSize} />
    </IconButton>
  );
}
