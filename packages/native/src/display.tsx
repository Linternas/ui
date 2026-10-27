import { Icon } from "./icons";
import React, { useEffect, useState, type ReactNode } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  Pressable,
  type ViewProps,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { tokens, type Tone } from "../../tokens/src";
import { useTheme, toneColors } from "./theme";
import { Text, Heading } from "./typography";
import { Button } from "./actions";
import { useValue, clamp } from "./state";
export function Badge({
  children,
  tone = "neutral",
  style,
}: {
  children: string | number;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors: c } = useTheme(),
    paint = toneColors(c, tone);
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: paint.background,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 999,
        },
        style,
      ]}
    >
      <Text size="xs" weight="medium" style={{ color: paint.ink }}>
        {children}
      </Text>
    </View>
  );
}
export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  removeLabel,
  disabled = false,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "flex-start",
        alignItems: "center",
        borderWidth: 1,
        borderColor: selected ? c.accent : c.border,
        backgroundColor: selected ? c["accent-soft"] : c.surface,
        borderRadius: 999,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected, disabled }}
          disabled={disabled}
          onPress={onPress}
          style={{
            minHeight: 44,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text size="sm">{label}</Text>
        </Pressable>
      ) : (
        <Text size="sm" style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          {label}
        </Text>
      )}
      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? `Remove ${label}`}
          disabled={disabled}
          onPress={onRemove}
          style={{
            width: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="close" />
        </Pressable>
      )}
    </View>
  );
}
export function Avatar({
  source,
  name,
  size = 44,
  style,
}: {
  source?: ImageSourcePropType;
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors: c } = useTheme(),
    [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  const width = clamp(size, 24, 120);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      accessible
      style={[
        {
          width,
          height: width,
          borderRadius: width / 2,
          overflow: "hidden",
          backgroundColor: c["accent-soft"],
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {source && !failed ? (
        <Image
          accessible={false}
          source={source}
          onError={() => setFailed(true)}
          style={{ width, height: width }}
        />
      ) : (
        <Text style={{ fontSize: width * 0.35, color: c.accent }}>
          {name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0])
            .join("")
            .toUpperCase() || "?"}
        </Text>
      )}
    </View>
  );
}
export function Spinner({
  label = "Loading",
  size = "small",
}: {
  label?: string;
  size?: "small" | "large";
}) {
  const { colors: c } = useTheme();
  return (
    <ActivityIndicator
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      color={c.accent}
      size={size}
    />
  );
}
export function Skeleton({
  width = "100%",
  height = 20,
  rounded = false,
  style,
  ...props
}: ViewProps & {
  width?: number | `${number}%`;
  height?: number;
  rounded?: boolean;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: rounded ? 999 : 6,
          backgroundColor: c.border,
        },
        style,
      ]}
    />
  );
}
export function Progress({
  value = 0,
  max = 100,
  label = "Progress",
  indeterminate = false,
}: {
  value?: number;
  max?: number;
  label?: string;
  indeterminate?: boolean;
}) {
  const { colors: c } = useTheme(),
    maximum = Number.isFinite(max) && max > 0 ? max : 100,
    current = clamp(value, 0, maximum);
  return indeterminate ? (
    <Spinner label={label} />
  ) : (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: maximum,
        now: current,
        text: `${Math.round((current / maximum) * 100)}%`,
      }}
      style={{
        height: 8,
        borderRadius: 4,
        backgroundColor: c.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${(current / maximum) * 100}%`,
          backgroundColor: c.accent,
        }}
      />
    </View>
  );
}
export interface AlertProps {
  title: string;
  description?: string;
  tone?: Tone;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}
export function Alert({
  title,
  description,
  tone = "neutral",
  action,
  onDismiss,
  dismissLabel = "Dismiss",
}: AlertProps) {
  const { colors: c } = useTheme(),
    paint = toneColors(c, tone);
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: paint.ink,
        backgroundColor: paint.background,
        gap: 8,
      }}
    >
      <Text weight="semibold" style={{ color: paint.ink }}>
        {title}
      </Text>
      {description && (
        <Text size="sm" style={{ color: paint.ink }}>
          {description}
        </Text>
      )}
      {action}
      {onDismiss && (
        <Button variant="ghost" size="sm" onPress={onDismiss}>
          {dismissLabel}
        </Button>
      )}
    </View>
  );
}
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={{ padding: 24, gap: 12, alignItems: "center" }}>
      {icon}
      <Heading level={3} style={{ textAlign: "center" }}>
        {title}
      </Heading>
      {description && (
        <Text size="sm" tone="muted" style={{ textAlign: "center" }}>
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="outline" onPress={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
    />
  );
}
export function ListItem({
  title,
  description,
  leading,
  trailing,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}: {
  title: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { colors: c } = useTheme(),
    content = (
      <>
        {leading}
        <View style={{ flex: 1, gap: 2 }}>
          <Text weight="medium">{title}</Text>
          {description && (
            <Text size="sm" tone="muted">
              {description}
            </Text>
          )}
        </View>
        {trailing}
      </>
    ),
    base = {
      minHeight: 56,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 12,
      backgroundColor: c.raised,
      opacity: disabled ? 0.5 : 1,
    };
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? [title, description].filter(Boolean).join(". ")
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        base,
        { backgroundColor: pressed ? c.surface : c.raised },
        style,
      ]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={[base, style]}>{content}</View>
  );
}
export function Accordion({
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useValue(open, defaultOpen, onOpenChange),
    { colors: c } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded, disabled }}
        disabled={disabled}
        onPress={() => setExpanded(!expanded)}
        style={{
          minHeight: 48,
          padding: 16,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text weight="medium" style={{ flex: 1 }}>
          {title}
        </Text>
        <Icon name={expanded ? "minus" : "plus"} />
      </Pressable>
      {expanded && (
        <View style={{ padding: 16, paddingTop: 0, gap: 12 }}>{children}</View>
      )}
    </View>
  );
}
export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: Tone;
  action?: { label: string; onPress: () => void };
}
/** Controlled inline host; consumer controls lifetime, placement and actual undo state. */
export function Toast({
  messages,
  onDismiss,
  dismissLabel = "Dismiss",
}: {
  messages: readonly ToastMessage[];
  onDismiss: (id: string) => void;
  dismissLabel?: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      {messages.map((message) => (
        <Alert
          key={message.id}
          title={message.title}
          description={message.description}
          tone={message.tone}
          onDismiss={() => onDismiss(message.id)}
          dismissLabel={dismissLabel}
          action={
            message.action ? (
              <Button
                variant="outline"
                size="sm"
                onPress={message.action.onPress}
              >
                {message.action.label}
              </Button>
            ) : undefined
          }
        />
      ))}
    </View>
  );
}
