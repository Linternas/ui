import React, { useState } from "react";
import { View } from "react-native";
import { Button, IconButton } from "./actions";
import { Icon } from "./icons";
import { Text } from "./typography";
import { Field, type FieldProps } from "./forms";
import { BottomSheet } from "./overlays";
import { useValue } from "./state";
import {
  calendarDate,
  calendarDateToDate,
  currentMonth,
  isMonth,
  monthKey,
  shiftMonth,
  type MonthValue,
} from "./calendar-date";
export interface MonthPickerProps extends Omit<FieldProps, "children"> {
  value?: MonthValue | null;
  defaultValue?: MonthValue | null;
  onValueChange?: (value: MonthValue | null) => void;
  minimumMonth?: MonthValue;
  maximumMonth?: MonthValue;
  locale?: string;
  formatValue?: (value: MonthValue) => string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  previousYearLabel?: string;
  nextYearLabel?: string;
}
export function MonthPicker({
  label,
  value,
  defaultValue = null,
  onValueChange,
  minimumMonth,
  maximumMonth,
  locale,
  formatValue,
  placeholder = "Choose month",
  disabled,
  clearable = true,
  confirmLabel = "Apply month",
  cancelLabel = "Cancel",
  clearLabel = "Clear month",
  previousLabel = "Previous month",
  nextLabel = "Next month",
  previousYearLabel = "Previous year",
  nextYearLabel = "Next year",
  ...field
}: MonthPickerProps) {
  const [selected, setSelected] = useValue(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState<MonthValue | null>(selected),
    [year, setYear] = useState((selected ?? currentMonth()).year);
  const allowed = (v: MonthValue) =>
    isMonth(v) &&
    (!minimumMonth || monthKey(v) >= monthKey(minimumMonth)) &&
    (!maximumMonth || monthKey(v) <= monthKey(maximumMonth));
  const display = (v: MonthValue) =>
    formatValue?.(v) ??
    calendarDateToDate(calendarDate(v.year, v.month, 1)).toLocaleDateString(
      locale,
      { year: "numeric", month: "long" },
    );
  const move = (offset: number) => {
    if (selected) {
      const next = shiftMonth(selected, offset);
      if (allowed(next)) setSelected(next);
    }
  };
  return (
    <Field {...field} label={label}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <IconButton
          variant="ghost"
          label={previousLabel}
          disabled={
            disabled ||
            !selected ||
            !allowed(shiftMonth(selected, -1)) ||
            monthKey(shiftMonth(selected, -1)) === monthKey(selected)
          }
          onPress={() => move(-1)}
        >
          <Icon name="chevron-left" />
        </IconButton>
        <Button
          variant="outline"
          disabled={disabled}
          accessibilityLabel={`${label}, ${selected ? display(selected) : placeholder}`}
          style={{ flex: 1 }}
          onPress={() => {
            setDraft(selected);
            setYear((selected ?? currentMonth()).year);
            setOpen(true);
          }}
        >
          {selected ? display(selected) : placeholder}
        </Button>
        <IconButton
          variant="ghost"
          label={nextLabel}
          disabled={
            disabled ||
            !selected ||
            !allowed(shiftMonth(selected, 1)) ||
            monthKey(shiftMonth(selected, 1)) === monthKey(selected)
          }
          onPress={() => move(1)}
        >
          <Icon name="chevron-right" />
        </IconButton>
      </View>
      <BottomSheet
        title={label}
        open={open && !disabled}
        onOpenChange={setOpen}
        footer={
          <View style={{ gap: 8 }}>
            <Button
              disabled={!!draft && !allowed(draft)}
              onPress={() => {
                setSelected(draft);
                setOpen(false);
              }}
            >
              {confirmLabel}
            </Button>
            <Button variant="ghost" onPress={() => setOpen(false)}>
              {cancelLabel}
            </Button>
          </View>
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <IconButton
            label={previousYearLabel}
            variant="ghost"
            disabled={
              year <= 1 || (!!minimumMonth && year <= minimumMonth.year)
            }
            onPress={() => setYear(year - 1)}
          >
            <Icon name="chevron-left" />
          </IconButton>
          <Text style={{ flex: 1, textAlign: "center" }}>{year}</Text>
          <IconButton
            label={nextYearLabel}
            variant="ghost"
            disabled={
              year >= 9999 || (!!maximumMonth && year >= maximumMonth.year)
            }
            onPress={() => setYear(year + 1)}
          >
            <Icon name="chevron-right" />
          </IconButton>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const candidate = { year, month: i + 1 };
            return (
              <Button
                key={i}
                variant={
                  draft && monthKey(draft) === monthKey(candidate)
                    ? "primary"
                    : "outline"
                }
                style={{ flexBasis: "29%", flexGrow: 1 }}
                disabled={!allowed(candidate)}
                accessibilityState={{
                  selected: !!draft && monthKey(draft) === monthKey(candidate),
                }}
                onPress={() => setDraft(candidate)}
              >
                {calendarDateToDate(
                  calendarDate(year, i + 1, 1),
                ).toLocaleDateString(locale, { month: "short" })}
              </Button>
            );
          })}
        </View>
        {clearable && (
          <Button variant="ghost" onPress={() => setDraft(null)}>
            {clearLabel}
          </Button>
        )}
      </BottomSheet>
    </Field>
  );
}
