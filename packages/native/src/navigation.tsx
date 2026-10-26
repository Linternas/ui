import React, { type ReactNode } from "react";
import {
  View,
  Pressable,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./theme";
import { Text, Heading } from "./typography";
import { IconButton } from "./actions";
import { useValue } from "./state";
export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content?: ReactNode;
}
export interface TabsProps {
  label: string;
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  safeArea?: boolean;
}
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  disabled,
  style,
}: TabsProps) {
  const [selected, setSelected] = useValue(
      value,
      defaultValue ?? items.find((i) => !i.disabled)?.value ?? "",
      onValueChange,
    ),
    { colors: c } = useTheme();
  return (
    <View style={[{ gap: 16 }, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 4 }}
      >
        <View
          accessibilityRole="tablist"
          accessibilityLabel={label}
          style={{ flexDirection: "row", gap: 4 }}
        >
          {items.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{
                selected: selected === item.value,
                disabled: !!(disabled || item.disabled),
              }}
              disabled={disabled || item.disabled}
              onPress={() => setSelected(item.value)}
              style={{
                minHeight: 44,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderBottomWidth: 2,
                borderBottomColor:
                  selected === item.value ? c.accent : "transparent",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                opacity: disabled || item.disabled ? 0.5 : 1,
              }}
            >
              {item.icon}
              <Text
                size="sm"
                tone={selected === item.value ? "accent" : "muted"}
                weight="medium"
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {items.find((item) => item.value === selected)?.content}
    </View>
  );
}
export function BottomNavigation({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  disabled,
  style,
  safeArea = true,
}: TabsProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useValue(
      value,
      defaultValue ?? items.find((i) => !i.disabled)?.value ?? "",
      onValueChange,
    ),
    { colors: c } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[
        {
          flexDirection: "row",
          backgroundColor: c.raised,
          borderTopWidth: 1,
          borderTopColor: c.border,
          padding: 8,
          paddingBottom: safeArea ? Math.max(8, insets.bottom) : 8,
          gap: 4,
        },
        style,
      ]}
    >
      {items.map((item) => (
        <Pressable
          key={item.value}
          accessibilityRole="tab"
          accessibilityLabel={`${item.label}${item.badge ? `, ${item.badge}` : ""}`}
          accessibilityState={{
            selected: selected === item.value,
            disabled: !!(disabled || item.disabled),
          }}
          disabled={disabled || item.disabled}
          onPress={() => setSelected(item.value)}
          style={{
            flex: 1,
            minHeight: 56,
            padding: 8,
            gap: 4,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor:
              selected === item.value ? c["accent-soft"] : "transparent",
            opacity: disabled || item.disabled ? 0.5 : 1,
          }}
        >
          {item.icon}
          <Text
            size="xs"
            tone={selected === item.value ? "accent" : "muted"}
            style={{ textAlign: "center" }}
          >
            {item.label}
          </Text>
          {item.badge != null && (
            <Text size="xs" tone="accent">
              {item.badge}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}
export function AppBar({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  leading,
  trailing,
  style,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      style={[
        {
          minHeight: 56,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: c.bg,
        },
        style,
      ]}
    >
      {onBack ? (
        <IconButton label={backLabel} variant="ghost" onPress={onBack}>
          <Text size="xl">‹</Text>
        </IconButton>
      ) : (
        leading
      )}
      <View style={{ flex: 1 }}>
        <Heading level={3}>{title}</Heading>
        {subtitle && (
          <Text size="xs" tone="muted">
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </View>
  );
}
