"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
export interface TouchAction {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onAction: () => void | Promise<void>;
}
export const nativeTouchTarget =
  "a,button,input,textarea,select,[contenteditable]:not([contenteditable=false]),[data-touch-native]";
/** Keep asynchronous action feedback consistent across touch surfaces. */
export function useTouchAction(errorMessage: string) {
  const [pending, setPending] = useState<string | null>(null),
    [error, setError] = useState("");
  const busy = useRef(false),
    mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const run = async (action: TouchAction) => {
    if (busy.current || action.disabled) return false;
    busy.current = true;
    setPending(action.id);
    setError("");
    try {
      await action.onAction();
      return mounted.current;
    } catch {
      if (mounted.current) setError(errorMessage);
      return false;
    } finally {
      busy.current = false;
      if (mounted.current) setPending(null);
    }
  };
  const clearError = useCallback(() => setError(""), []);
  return { pending, error, run, clearError };
}
