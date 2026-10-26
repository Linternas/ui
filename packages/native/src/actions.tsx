import React, { type ReactNode } from "react";
import {
  Pressable,
  ActivityIndicator,
  Text as NativeText,
  type PressableProps,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { tokens, type ControlSize } from "../../tokens/src";
import { useTheme } from "./theme";
export interface ButtonProps extends Omit<PressableProps, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: ControlSize;
  loading?: boolean;
  icon?: ReactNode;
  textStyle?: StyleProp<TextStyle>;
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
}
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  style,
  textStyle,
  accessibilityState,
  ...props
}: ButtonProps) {
  const { colors: c } = useTheme(),
    blocked = disabled || loading,
    ink =
      variant === "primary"
        ? c["on-accent"]
        : variant === "danger"
          ? c.danger
          : c.text;
  return (
    <Pressable
      {...props}
      disabled={blocked}
      accessibilityRole={props.accessibilityRole ?? "button"}
      accessibilityState={{
        ...accessibilityState,
        disabled: !!blocked,
        busy: loading,
      }}
      style={(state) => [
        {
          minHeight: Math.max(44, tokens.control[size].height),
          paddingHorizontal: tokens.control[size].padding,
          paddingVertical: 10,
          borderRadius: tokens.radii.md,
          borderWidth: 1,
          borderColor:
            variant === "outline"
              ? c["control-border"]
              : variant === "danger"
                ? c.danger
                : "transparent",
          backgroundColor:
            variant === "primary"
              ? c.accent
              : variant === "secondary"
                ? c.surface
                : variant === "danger"
                  ? c["danger-soft"]
                  : "transparent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: blocked ? 0.5 : state.pressed ? 0.7 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? <ActivityIndicator color={ink} accessible={false} /> : icon}
      {typeof children === "string" || typeof children === "number" ? (
        <NativeText
          allowFontScaling
          style={[
            {
              color: ink,
              fontSize: tokens.fontSizes.sm,
              fontWeight: "600",
              flexShrink: 1,
              textAlign: "center",
            },
            textStyle,
          ]}
        >
          {children}
        </NativeText>
      ) : (
        children
      )}
    </Pressable>
  );
}
export interface IconButtonProps
  extends Omit<ButtonProps, "children" | "accessibilityLabel"> {
  label: string;
  children: ReactNode;
}
export function IconButton({ label, style, ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      accessibilityLabel={label}
      style={(state) => [
        { minWidth: 44, aspectRatio: 1, paddingHorizontal: 8 },
        typeof style === "function" ? style(state) : style,
      ]}
    />
  );
}
export function LinkButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      variant={props.variant ?? "ghost"}
      accessibilityRole="link"
    />
  );
}
