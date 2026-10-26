import React, { type ReactNode } from "react";
import {
  View,
  ScrollView,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "./typography";
import { Button, IconButton } from "./actions";
import { Icon } from "./icons";
import { useTheme } from "./theme";
import { useValue } from "./state";
import {
  calendarDate,
  calendarDateToDate,
  dateToCalendarDate,
  daysInMonth,
  currentMonth,
  isMonth,
  monthIntersects,
  monthOf,
  parseCalendarDate,
  shiftMonth,
  type CalendarDate,
  type DateRangeValue,
  type MonthValue,
} from "./calendar-date";
export interface CalendarItem {
  id: string;
  label: string;
}
export interface CalendarDayState {
  date: CalendarDate;
  day: number;
  today: boolean;
  selected: boolean;
  disabled: boolean;
  inRange: boolean;
}
export interface CalendarProps {
  label: string;
  showLabel?: boolean;
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onValueChange?: (date: CalendarDate) => void;
  month?: MonthValue;
  defaultMonth?: MonthValue;
  onMonthChange?: (month: MonthValue) => void;
  minimumDate?: CalendarDate;
  maximumDate?: CalendarDate;
  isDateDisabled?: (date: CalendarDate) => boolean;
  disabled?: boolean;
  weekStartsOn?: number;
  locale?: string;
  /** Sunday-first names; reordered according to weekStartsOn. */
  weekdayLabels?: readonly string[];
  items?: Readonly<Record<CalendarDate, readonly CalendarItem[]>>;
  maxVisibleItems?: number;
  renderDay?: (day: CalendarDayState) => ReactNode;
  getDayAccessibilityLabel?: (
    day: CalendarDayState,
    items: readonly CalendarItem[],
  ) => string;
  range?: DateRangeValue;
  todayLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  style?: StyleProp<ViewStyle>;
}
export function Calendar({
  label,
  showLabel = true,
  value,
  defaultValue = null,
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  minimumDate,
  maximumDate,
  isDateDisabled,
  disabled = false,
  weekStartsOn = 0,
  locale,
  weekdayLabels,
  items = {},
  maxVisibleItems = 1,
  renderDay,
  getDayAccessibilityLabel,
  range,
  todayLabel = "Today",
  previousLabel = "Previous month",
  nextLabel = "Next month",
  style,
}: CalendarProps) {
  const { colors: c } = useTheme();
  const [selected, setSelected] = useValue<CalendarDate | null>(
    value,
    defaultValue,
    (next) => {
      if (next) onValueChange?.(next);
    },
  );
  const [visible, setVisible] = useValue(
    month,
    defaultMonth ??
      (selected && parseCalendarDate(selected)
        ? monthOf(selected)
        : currentMonth()),
    onMonthChange,
  );
  const shown = isMonth(visible) ? visible : currentMonth();
  const min =
    minimumDate && parseCalendarDate(minimumDate) ? minimumDate : undefined;
  const max =
    maximumDate && parseCalendarDate(maximumDate) ? maximumDate : undefined;
  const blocked = (date: CalendarDate) =>
    disabled ||
    !!(min && date < min) ||
    !!(max && date > max) ||
    !!isDateDisabled?.(date);
  const first = calendarDate(shown.year, shown.month, 1);
  const start =
    (((Number.isFinite(weekStartsOn) ? Math.trunc(weekStartsOn) : 0) % 7) + 7) %
    7;
  const leading = (calendarDateToDate(first).getDay() - start + 7) % 7;
  const count = daysInMonth(shown),
    slots = Math.ceil((leading + count) / 7) * 7;
  const today = dateToCalendarDate(new Date());
  const limit = Number.isFinite(maxVisibleItems)
    ? Math.max(0, Math.min(3, Math.floor(maxVisibleItems)))
    : 1;
  const weekdays =
    weekdayLabels?.length === 7
      ? weekdayLabels
      : Array.from({ length: 7 }, (_, i) =>
          new Date(2026, 9, 25 + i).toLocaleDateString(locale, {
            weekday: "short",
          }),
        );
  const prev = shiftMonth(shown, -1),
    next = shiftMonth(shown, 1);
  return (
    <View style={[{ gap: 12 }, style]}>
      {showLabel && (
        <Text weight="semibold" accessibilityRole="header">
          {label}
        </Text>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <IconButton
          label={previousLabel}
          variant="ghost"
          disabled={
            disabled ||
            first === calendarDate(prev.year, prev.month, 1) ||
            !monthIntersects(prev, min, max)
          }
          onPress={() => setVisible(prev)}
        >
          <Icon name="chevron-left" />
        </IconButton>
        <Text
          weight="semibold"
          style={{ flex: 1, textAlign: "center" }}
          accessibilityLiveRegion="polite"
        >
          {calendarDateToDate(first).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
          })}
        </Text>
        <IconButton
          label={nextLabel}
          variant="ghost"
          disabled={
            disabled ||
            first === calendarDate(next.year, next.month, 1) ||
            !monthIntersects(next, min, max)
          }
          onPress={() => setVisible(next)}
        >
          <Icon name="chevron-right" />
        </IconButton>
      </View>
      <Button
        variant="ghost"
        disabled={blocked(today)}
        onPress={() => {
          setVisible(monthOf(today));
          setSelected(today);
        }}
      >
        {todayLabel}
      </Button>
      <ScrollView
        horizontal
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ flex: 1, minWidth: 308 }}>
          <View style={{ flexDirection: "row" }}>
            {Array.from({ length: 7 }, (_, i) => (
              <View
                key={i}
                style={{
                  width: `${100 / 7}%`,
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text size="xs" tone="muted">
                  {weekdays[(i + start) % 7]}
                </Text>
              </View>
            ))}
          </View>
          {Array.from({ length: slots / 7 }, (_, row) => (
            <View
              key={row}
              style={{ flexDirection: "row", alignItems: "stretch" }}
            >
              {Array.from({ length: 7 }, (_, col) => {
                const day = row * 7 + col - leading + 1;
                if (day < 1 || day > count)
                  return (
                    <View
                      key={`blank-${col}`}
                      style={{ width: `${100 / 7}%` }}
                    />
                  );
                const date = calendarDate(shown.year, shown.month, day);
                const state: CalendarDayState = {
                  date,
                  day,
                  today: date === today,
                  selected: date === selected,
                  disabled: blocked(date),
                  inRange: !!(
                    range?.start &&
                    date >= range.start &&
                    date <= (range.end ?? range.start)
                  ),
                };
                const entries = items[date] ?? [];
                const description =
                  getDayAccessibilityLabel?.(state, entries) ??
                  `${calendarDateToDate(date).toLocaleDateString(locale, { dateStyle: "full" })}${state.today ? `, ${todayLabel}` : ""}${entries.length ? `, ${entries.length}: ${entries.map((e) => e.label).join(", ")}` : ""}`;
                return (
                  <Pressable
                    key={date}
                    disabled={state.disabled}
                    accessibilityRole="button"
                    accessibilityLabel={description}
                    accessibilityState={{
                      selected: state.selected,
                      disabled: state.disabled,
                    }}
                    onPress={() => setSelected(date)}
                    style={({ pressed }) => ({
                      width: `${100 / 7}%`,
                      minHeight: 44,
                      paddingVertical: 8,
                      paddingHorizontal: 2,
                      gap: 4,
                      alignItems: "center",
                      borderRadius: 8,
                      borderWidth: state.today ? 1 : 0,
                      borderColor: c.accent,
                      backgroundColor: state.selected
                        ? c.accent
                        : state.inRange
                          ? c["accent-soft"]
                          : "transparent",
                      opacity: state.disabled ? 0.35 : pressed ? 0.65 : 1,
                    })}
                  >
                    <Text
                      size="sm"
                      weight={
                        state.today || state.selected ? "bold" : "regular"
                      }
                      style={{
                        color: state.selected ? c["on-accent"] : c.text,
                      }}
                    >
                      {day}
                    </Text>
                    {state.today && (
                      <View
                        accessible={false}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: state.selected
                            ? c["on-accent"]
                            : c.accent,
                        }}
                      />
                    )}
                    {renderDay ? (
                      renderDay(state)
                    ) : (
                      <>
                        {entries.slice(0, limit).map((entry) => (
                          <Text
                            key={entry.id}
                            size="xs"
                            numberOfLines={1}
                            style={{
                              color: state.selected ? c["on-accent"] : c.muted,
                            }}
                          >
                            {entry.label}
                          </Text>
                        ))}
                        {entries.length > limit && (
                          <Text
                            size="xs"
                            style={{
                              color: state.selected ? c["on-accent"] : c.muted,
                            }}
                          >
                            +{entries.length - limit}
                          </Text>
                        )}
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
