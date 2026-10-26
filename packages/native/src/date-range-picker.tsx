import React, { useState } from "react";
import { View } from "react-native";
import { Calendar, type CalendarProps } from "./calendar";
import { calendarDateToDate, type DateRangeValue } from "./calendar-date";
import { Button } from "./actions";
import { Field, type FieldProps } from "./forms";
import { Text } from "./typography";
import { BottomSheet } from "./overlays";
import { useValue } from "./state";
export interface DateRangePickerProps
  extends Omit<FieldProps, "children">,
    Pick<
      CalendarProps,
      | "minimumDate"
      | "maximumDate"
      | "isDateDisabled"
      | "weekStartsOn"
      | "locale"
    > {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  disabled?: boolean;
  allowPartial?: boolean;
  placeholder?: string;
  formatValue?: (value: DateRangeValue) => string;
  confirmLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
}
const empty: DateRangeValue = { start: null, end: null };
export function DateRangePicker({
  label,
  value,
  defaultValue = empty,
  onValueChange,
  disabled,
  allowPartial = true,
  placeholder = "Choose dates",
  formatValue,
  confirmLabel = "Apply dates",
  cancelLabel = "Cancel",
  clearLabel = "Clear dates",
  minimumDate,
  maximumDate,
  isDateDisabled,
  weekStartsOn,
  locale,
  ...field
}: DateRangePickerProps) {
  const [selected, setSelected] = useValue(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState<DateRangeValue>(selected);
  const display = (v: DateRangeValue) =>
    formatValue?.(v) ??
    (v.start
      ? `${calendarDateToDate(v.start).toLocaleDateString(locale)} – ${v.end ? calendarDateToDate(v.end).toLocaleDateString(locale) : "…"}`
      : placeholder);
  const valid = !draft.start
    ? !draft.end
    : (!draft.end ? allowPartial : draft.end >= draft.start) &&
      (!minimumDate || draft.start >= minimumDate) &&
      (!maximumDate || (draft.end ?? draft.start) <= maximumDate) &&
      !isDateDisabled?.(draft.start) &&
      (!draft.end || !isDateDisabled?.(draft.end));
  return (
    <Field {...field} label={label}>
      <Button
        variant="outline"
        disabled={disabled}
        accessibilityLabel={`${label}, ${display(selected)}`}
        onPress={() => {
          setDraft({ ...selected });
          setOpen(true);
        }}
      >
        {display(selected)}
      </Button>
      <BottomSheet
        title={label}
        size="large"
        open={open && !disabled}
        onOpenChange={setOpen}
        footer={
          <View style={{ gap: 8 }}>
            <Button
              disabled={!valid}
              onPress={() => {
                setSelected({ ...draft });
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
        <Text accessibilityLiveRegion="polite">{display(draft)}</Text>
        <Calendar
          key={open ? "open" : "closed"}
          label={label}
          showLabel={false}
          value={draft.end ?? draft.start}
          defaultMonth={
            draft.start
              ? {
                  year: Number(draft.start.slice(0, 4)),
                  month: Number(draft.start.slice(5, 7)),
                }
              : undefined
          }
          range={draft}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          locale={locale}
          onValueChange={(date) =>
            setDraft(
              !draft.start || draft.end
                ? { start: date, end: null }
                : date < draft.start
                  ? { start: date, end: draft.start }
                  : { start: draft.start, end: date },
            )
          }
        />
        <Button variant="ghost" onPress={() => setDraft({ ...empty })}>
          {clearLabel}
        </Button>
      </BottomSheet>
    </Field>
  );
}
