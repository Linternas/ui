import { useEffect, useRef, type CSSProperties } from "react";
export interface CollectionProps {
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}
export const bounded = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
export const safeHex = (value: string, fallback = "#777777") =>
  /^#[\da-f]{6}$/i.test(value) ? value : fallback;
export function useNativeReset(
  ref: React.RefObject<HTMLElement | null>,
  reset: () => void,
) {
  const latest = useRef(reset);
  latest.current = reset;
  useEffect(() => {
    const form = ref.current?.closest("form"),
      fn = () => latest.current();
    form?.addEventListener("reset", fn);
    return () => form?.removeEventListener("reset", fn);
  }, [ref]);
}
