"use client";
import * as React from "react";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";

export type MotionPreference = "system" | "full" | "reduced";
export interface MotionSettings {
  motion: MotionPreference;
  reducedMotion: boolean;
}
export interface InteractionProviderProps {
  children: ReactNode;
  motion?: MotionPreference;
}
const Context = createContext<MotionSettings | null>(null);
const query = "(prefers-reduced-motion: reduce)";
const noopSubscribe = () => () => {};
const serverSnapshot = () => false;
const snapshot = () => window.matchMedia(query).matches;
function subscribe(change: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}
/** The effective Mingu policy; providers never change the browser or OS setting. */
export function useMotionSettings(): MotionSettings {
  const inherited = useContext(Context);
  const system = useSyncExternalStore(
    inherited ? noopSubscribe : subscribe,
    inherited ? () => inherited.reducedMotion : snapshot,
    inherited ? () => inherited.reducedMotion : serverSnapshot,
  );
  return inherited ?? { motion: "system", reducedMotion: system };
}
export function useReducedMotion() {
  return useMotionSettings().reducedMotion;
}
/** Internal render boundary lets DesignSystemProvider keep its existing DOM root. */
export function MotionBoundary({
  motion,
  children,
}: {
  motion?: MotionPreference;
  children: (settings: MotionSettings) => ReactNode;
}) {
  const inherited = useContext(Context);
  const policy = motion ?? inherited?.motion ?? "system";
  const followsParent = policy === "system" && inherited?.motion === "system";
  const watchesOS = policy === "system" && !followsParent;
  const system = useSyncExternalStore(
    watchesOS ? subscribe : noopSubscribe,
    watchesOS ? snapshot : () => inherited?.reducedMotion ?? false,
    watchesOS ? serverSnapshot : () => inherited?.reducedMotion ?? false,
  );
  const reducedMotion = policy === "reduced" || (policy === "system" && system);
  const settings = React.useMemo(
    () => ({ motion: policy, reducedMotion }),
    [policy, reducedMotion],
  );
  return (
    <Context.Provider value={settings}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
        {children(settings)}
      </MotionConfig>
    </Context.Provider>
  );
}
/** Layout-neutral CSS boundary for interaction-only consumers. */
export function InteractionProvider({
  motion,
  children,
}: InteractionProviderProps) {
  return (
    <MotionBoundary motion={motion}>
      {(settings) => (
        <div
          data-mingu-motion={settings.motion}
          style={{ display: "contents" }}
        >
          {children}
        </div>
      )}
    </MotionBoundary>
  );
}
