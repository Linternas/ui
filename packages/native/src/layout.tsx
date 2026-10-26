import React, { type ReactNode } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  type ViewProps,
  type ScrollViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokens, type Space } from "../../tokens/src";
import { useTheme } from "./theme";
import { useKeyboardVisible } from "./state";
export interface StackProps extends ViewProps {
  direction?: "row" | "column";
  gap?: Space;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
}
export function Stack({
  direction = "column",
  gap = "4",
  align = "stretch",
  justify = "start",
  wrap = false,
  style,
  ...props
}: StackProps) {
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: direction,
          gap: tokens.space[gap],
          alignItems:
            align === "start"
              ? "flex-start"
              : align === "end"
                ? "flex-end"
                : align,
          justifyContent:
            justify === "start"
              ? "flex-start"
              : justify === "end"
                ? "flex-end"
                : justify === "between"
                  ? "space-between"
                  : "center",
          flexWrap: wrap ? "wrap" : "nowrap",
        },
        style,
      ]}
    />
  );
}
export function Card({
  style,
  padding = "4",
  ...props
}: ViewProps & { padding?: Space }) {
  const { colors: c } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: c.raised,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: tokens.radii.lg,
          padding: tokens.space[padding],
          gap: 12,
        },
        style,
      ]}
    />
  );
}
export function Divider({ style, ...props }: ViewProps) {
  const { colors: c } = useTheme();
  return (
    <View
      {...props}
      accessible={false}
      style={[
        { height: 1, backgroundColor: c.border, alignSelf: "stretch" },
        style,
      ]}
    />
  );
}
export function Spacer({ size = "4" }: { size?: Space }) {
  return (
    <View
      accessible={false}
      style={{ height: tokens.space[size], width: tokens.space[size] }}
    />
  );
}
export interface ScreenProps extends ScrollViewProps {
  scroll?: boolean;
  safeEdges?: readonly ("top" | "bottom" | "left" | "right")[];
  keyboardAvoiding?: boolean;
  keyboardVerticalOffset?: number;
  padding?: Space;
  refreshing?: boolean;
  onRefresh?: () => void;
  children?: ReactNode;
  /** Persistent chrome outside the scrolling content, inside safe-area/keyboard layout. */
  header?: ReactNode;
  footer?: ReactNode;
  /** Hide navigation chrome while typing; fixed submit actions can stay visible. */
  hideFooterOnKeyboard?: boolean;
}
/** Flex root with safe area, keyboard avoidance and controlled pull-to-refresh. */
export function Screen({
  children,
  header,
  footer,
  hideFooterOnKeyboard = false,
  scroll = true,
  safeEdges = ["top", "bottom", "left", "right"],
  keyboardAvoiding = true,
  keyboardVerticalOffset = 0,
  padding = "4",
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  ...props
}: ScreenProps) {
  const { colors: c } = useTheme(),
    insets = useSafeAreaInsets(),
    keyboardVisible = useKeyboardVisible();
  const edges = {
    paddingTop: safeEdges.includes("top") ? insets.top : 0,
    paddingBottom:
      safeEdges.includes("bottom") && !(keyboardAvoiding && keyboardVisible)
        ? insets.bottom
        : 0,
    paddingLeft: safeEdges.includes("left") ? insets.left : 0,
    paddingRight: safeEdges.includes("right") ? insets.right : 0,
  };
  return (
    <KeyboardAvoidingView
      enabled={keyboardAvoiding}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={{ flex: 1, backgroundColor: c.bg }}
    >
      <View style={[{ flex: 1 }, edges]}>
        {header}
        {scroll ? (
          <ScrollView
            {...props}
            style={[{ flex: 1 }, style]}
            contentContainerStyle={[
              {
                padding: tokens.space[padding],
                gap: tokens.space[4],
                flexGrow: 1,
              },
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps={
              props.keyboardShouldPersistTaps ?? "handled"
            }
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={c.accent}
                  colors={[c.accent]}
                />
              ) : (
                props.refreshControl
              )
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              { flex: 1, padding: tokens.space[padding], gap: tokens.space[4] },
              style,
            ]}
            testID={props.testID}
          >
            {children}
          </View>
        )}
        {(!hideFooterOnKeyboard || !keyboardVisible) && footer}
      </View>
    </KeyboardAvoidingView>
  );
}
