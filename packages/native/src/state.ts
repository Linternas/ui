import { useState } from "react";
export function useValue<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [local, setLocal] = useState(initial);
  return [
    value === undefined ? local : value,
    (next: T) => {
      if (value === undefined) setLocal(next);
      onChange?.(next);
    },
  ] as const;
}
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
