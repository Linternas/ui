import React, { useRef, useState, type ComponentProps } from "react";
import { View, Platform, type StyleProp, type ViewStyle } from "react-native";
import NativeDateTimePicker from "@react-native-community/datetimepicker";
import { version as pickerVersion } from "@react-native-community/datetimepicker/package.json";
import NativeSlider from "@react-native-community/slider";
import { Text } from "./typography";
import { Button } from "./actions";
import { Field } from "./forms";
import { Dialog } from "./overlays";
import { useTheme } from "./theme";
import { useValue, clamp } from "./state";
export interface SliderProps
  extends Omit<
    ComponentProps<typeof NativeSlider>,
    "value" | "onValueChange" | "minimumValue" | "maximumValue" | "step"
  > {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (v: number) => string;
}
export function Slider({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = (v) => String(v),
  style,
  ...props
}: SliderProps) {
  const { colors: c } = useTheme(),
    low = Number.isFinite(min) ? min : 0,
    high = Number.isFinite(max) && max > low ? max : low + 100,
    [current, setCurrent] = useValue(value, defaultValue, onValueChange),
    bounded = clamp(current, low, high);
  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <Text size="sm">{label}</Text>
        <Text size="sm" tone="muted">
          {formatValue(bounded)}
        </Text>
      </View>
      <NativeSlider
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityValue={{
          min: low,
          max: high,
          now: bounded,
          text: formatValue(bounded),
        }}
        value={bounded}
        minimumValue={low}
        maximumValue={high}
        step={Number.isFinite(step) && step > 0 ? step : 1}
        onValueChange={(next) => setCurrent(clamp(next, low, high))}
        minimumTrackTintColor={c.accent}
        maximumTrackTintColor={c.border}
        thumbTintColor={c.accent}
        style={[{ minHeight: 44 }, style]}
      />
    </View>
  );
}
export interface DatePickerProps {
  label: string;
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  hint?: string;
  error?: string;
  locale?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  style?: StyleProp<ViewStyle>;
}
function DateTimeField({
  mode,
  label,
  value,
  defaultValue,
  onValueChange,
  minimumDate,
  maximumDate,
  disabled,
  hint,
  error,
  locale,
  confirmLabel = "Done",
  cancelLabel = "Cancel",
  style,
}: DatePickerProps & { mode: "date" | "time" }) {
  const { mode: theme } = useTheme(),
    initial = useRef(
      defaultValue && Number.isFinite(defaultValue.getTime())
        ? defaultValue
        : new Date(),
    ),
    [selected, setSelected] = useValue(value, initial.current, onValueChange),
    [open, setOpen] = useState(false),
    [draft, setDraft] = useState(selected);
  const valid = (d: Date) => d instanceof Date && Number.isFinite(d.getTime());
  const actual = valid(selected) ? selected : initial.current;
  const bound = (d: Date) =>
    new Date(
      clamp(
        d.getTime(),
        mode === "date" && minimumDate && valid(minimumDate)
          ? minimumDate.getTime()
          : -8640000000000000,
        mode === "date" && maximumDate && valid(maximumDate)
          ? maximumDate.getTime()
          : 8640000000000000,
      ),
    );
  const control = (
    <NativeDateTimePicker
      value={valid(draft) ? draft : actual}
      mode={mode}
      minimumDate={mode === "date" ? minimumDate : undefined}
      maximumDate={mode === "date" ? maximumDate : undefined}
      display={Platform.OS === "ios" ? "spinner" : "default"}
      locale={locale}
      themeVariant={theme}
      {...(parseInt(pickerVersion, 10) >= 9
        ? {
            onValueChange: (_event: unknown, next: Date) => {
              if (Platform.OS !== "ios") {
                setOpen(false);
                setSelected(bound(next));
              } else setDraft(bound(next));
            },
            onDismiss: () => setOpen(false),
          }
        : {
            // Preserve the v8 peer API; v9 separates changes from dismissal.
            onChange: (event: { type: string }, next?: Date) => {
              if (Platform.OS !== "ios") {
                setOpen(false);
                if (event.type === "set" && next) setSelected(bound(next));
              } else if (next) setDraft(bound(next));
            },
          })}
    />
  );
  return (
    <Field label={label} hint={hint} error={error} style={style}>
      <Button
        variant="outline"
        disabled={disabled}
        accessibilityLabel={`${label}, ${mode === "date" ? actual.toLocaleDateString(locale) : actual.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          setDraft(bound(actual));
          setOpen(true);
        }}
      >
        {mode === "date"
          ? actual.toLocaleDateString(locale)
          : actual.toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
            })}
      </Button>
      {Platform.OS === "ios" ? (
        <Dialog title={label} open={open && !disabled} onOpenChange={setOpen}>
          {control}
          <Button
            onPress={() => {
              setSelected(bound(draft));
              setOpen(false);
            }}
          >
            {confirmLabel}
          </Button>
          <Button variant="ghost" onPress={() => setOpen(false)}>
            {cancelLabel}
          </Button>
        </Dialog>
      ) : open && !disabled ? (
        control
      ) : null}
    </Field>
  );
}
export function DatePicker(props: DatePickerProps) {
  return <DateTimeField {...props} mode="date" />;
}
export function TimePicker(props: DatePickerProps) {
  return <DateTimeField {...props} mode="time" />;
}
