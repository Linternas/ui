import React from "react";
import { View } from "react-native";
import { Button } from "./actions";
import { Field, type FieldProps } from "./forms";
import { useValue } from "./state";
/** Sunday=0 through Saturday=6. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface WeekdayPreset {
  id: string;
  label: string;
  days: readonly Weekday[];
}
export interface WeekdayPickerProps extends Omit<FieldProps, "children"> {
  value?: readonly Weekday[];
  defaultValue?: readonly Weekday[];
  onValueChange?: (value: Weekday[]) => void;
  disabled?: boolean;
  disabledDays?: readonly Weekday[];
  weekStartsOn?: Weekday;
  labels?: readonly string[];
  accessibilityLabels?: readonly string[];
  locale?: string;
  presets?: readonly WeekdayPreset[];
}
export function WeekdayPicker({
  label,
  value,
  defaultValue = [],
  onValueChange,
  disabled,
  disabledDays = [],
  weekStartsOn = 0,
  labels,
  accessibilityLabels,
  locale,
  presets = [],
  ...field
}: WeekdayPickerProps) {
  const [selected, setSelected] = useValue<readonly Weekday[]>(
    value,
    defaultValue,
    (v) => onValueChange?.([...v]),
  );
  const ordered = Array.from(
    { length: 7 },
    (_, i) => ((i + weekStartsOn) % 7) as Weekday,
  );
  const names = (kind: "short" | "long") =>
    Array.from({ length: 7 }, (_, i) =>
      new Date(2026, 9, 25 + i).toLocaleDateString(locale, { weekday: kind }),
    );
  const short = labels?.length === 7 ? labels : names("short"),
    full =
      accessibilityLabels?.length === 7 ? accessibilityLabels : names("long");
  const commit = (days: readonly Weekday[]) =>
    setSelected(
      [...new Set(days)]
        .filter((d) => Number.isInteger(d) && d >= 0 && d < 7)
        .sort(),
    );
  return (
    <Field {...field} label={label}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {ordered.map((day) => (
          <Button
            key={day}
            variant={selected.includes(day) ? "primary" : "outline"}
            style={{ minWidth: 44 }}
            accessibilityRole="checkbox"
            accessibilityLabel={full[day]}
            accessibilityState={{ checked: selected.includes(day) }}
            disabled={disabled || disabledDays.includes(day)}
            onPress={() =>
              commit(
                selected.includes(day)
                  ? selected.filter((v) => v !== day)
                  : [...selected, day],
              )
            }
          >
            {short[day]}
          </Button>
        ))}
      </View>
      {presets.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant="ghost"
              disabled={disabled}
              onPress={() =>
                commit([
                  ...selected.filter((d) => disabledDays.includes(d)),
                  ...preset.days.filter((d) => !disabledDays.includes(d)),
                ])
              }
            >
              {preset.label}
            </Button>
          ))}
        </View>
      )}
    </Field>
  );
}
