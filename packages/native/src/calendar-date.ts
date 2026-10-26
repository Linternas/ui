/** Local civil date YYYY-MM-DD, not an instant or a UTC timestamp. */
export type CalendarDate = string;
export interface MonthValue {
  year: number;
  month: number;
}
export interface DateRangeValue {
  start: CalendarDate | null;
  end: CalendarDate | null;
}
export function isMonth(value: MonthValue): boolean {
  return (
    Number.isInteger(value.year) &&
    value.year >= 1 &&
    value.year <= 9999 &&
    Number.isInteger(value.month) &&
    value.month >= 1 &&
    value.month <= 12
  );
}
export function daysInMonth({ year, month }: MonthValue) {
  return month === 2
    ? year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
      ? 29
      : 28
    : [4, 6, 9, 11].includes(month)
      ? 30
      : 31;
}
export function parseCalendarDate(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]),
    month = Number(match[2]),
    day = Number(match[3]);
  return isMonth({ year, month }) &&
    day >= 1 &&
    day <= daysInMonth({ year, month })
    ? { year, month, day }
    : null;
}
export function calendarDate(
  year: number,
  month: number,
  day: number,
): CalendarDate {
  const value = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (!parseCalendarDate(value)) throw new RangeError("Invalid civil date");
  return value;
}
/** Uses local calendar fields; never use toISOString().slice(0, 10) for civil dates. */
export function dateToCalendarDate(value: Date): CalendarDate {
  return calendarDate(
    value.getFullYear(),
    value.getMonth() + 1,
    value.getDate(),
  );
}
export function calendarDateToDate(value: CalendarDate): Date {
  const parts = parseCalendarDate(value);
  if (!parts) throw new RangeError("Expected a valid YYYY-MM-DD date");
  const result = new Date(0);
  result.setFullYear(parts.year, parts.month - 1, parts.day);
  result.setHours(12, 0, 0, 0);
  return result;
}
export const currentMonth = (): MonthValue => ({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
});
export const monthKey = (v: MonthValue) =>
  `${String(v.year).padStart(4, "0")}-${String(v.month).padStart(2, "0")}`;
export function shiftMonth(v: MonthValue, offset: number): MonthValue {
  const index = Math.max(
    12,
    Math.min(9999 * 12 + 11, v.year * 12 + v.month - 1 + offset),
  );
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}
export function monthOf(value: CalendarDate): MonthValue {
  const p = parseCalendarDate(value);
  if (!p) throw new RangeError("Invalid civil date");
  return { year: p.year, month: p.month };
}
export function monthIntersects(
  v: MonthValue,
  minimum?: CalendarDate,
  maximum?: CalendarDate,
): boolean {
  return (
    (!minimum || calendarDate(v.year, v.month, daysInMonth(v)) >= minimum) &&
    (!maximum || calendarDate(v.year, v.month, 1) <= maximum)
  );
}
