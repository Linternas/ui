import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
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

/** Internal keyboard visibility for layout chrome and safe-area padding. */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(() => Keyboard.isVisible());
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}
