"use client";
import * as React from "react";
import {
  motion as nativeMotion,
  Reorder as nativeReorder,
  MotionConfigContext,
  isMotionValue,
  type Transition,
  type MotionProps,
} from "motion/react";
import { useReducedMotion } from "./motion-policy";

function withoutMotion(transition: Transition = {}): Transition {
  const result: Record<string, unknown> = { ...transition };
  for (const [key, value] of Object.entries(result)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = withoutMotion(value as Transition);
    }
  }
  return {
    ...result,
    type: false,
    duration: 0,
    delay: 0,
    repeat: 0,
    repeatDelay: 0,
  } as Transition;
}
type ElementProps = MotionProps & React.RefAttributes<unknown>;
/** Reorder must keep layout measurement even when its transition is immediate. */
function scopedComponent(
  Element: React.ComponentType<ElementProps>,
  preserveLayout = false,
) {
  return React.forwardRef<unknown, MotionProps>(
    function MinguMotion(props, ref) {
      const reduced = useReducedMotion();
      const parent = React.useContext(MotionConfigContext);
      const native = React.useMemo(
        () => ({ ...parent, reducedMotion: "never" as const }),
        [parent],
      );
      const transition = props.transition?.inherit
        ? { ...parent.transition, ...props.transition }
        : (props.transition ?? parent.transition);
      // Only this primitive bypasses Motion's mount-time preference cache.
      // Restore the caller's config for content supplied inside it.
      const content =
        props.children === undefined || isMotionValue(props.children) ? (
          props.children
        ) : (
          <MotionConfigContext.Provider value={parent}>
            {props.children as React.ReactNode}
          </MotionConfigContext.Provider>
        );
      return (
        <MotionConfigContext.Provider value={native}>
          <Element
            {...props}
            ref={ref}
            layout={
              preserveLayout ? props.layout : reduced ? false : props.layout
            }
            layoutId={reduced ? undefined : props.layoutId}
            transition={reduced ? withoutMotion(transition) : transition}
          >
            {content}
          </Element>
        </MotionConfigContext.Provider>
      );
    },
  );
}
const components = new Map<string, React.ComponentType<ElementProps>>();
/** Stable component identities keep form/focus state intact when policy changes. */
export const motion: typeof nativeMotion = new Proxy(nativeMotion, {
  get(target, tag, receiver) {
    if (typeof tag !== "string" || tag === "create")
      return Reflect.get(target, tag, receiver);
    let component = components.get(tag);
    if (!component) {
      const Element = Reflect.get(
        target,
        tag,
        receiver,
      ) as React.ComponentType<ElementProps>;
      component = scopedComponent(Element);
      components.set(tag, component);
    }
    return component;
  },
});

export const Reorder: typeof nativeReorder = {
  Group: nativeReorder.Group,
  Item: scopedComponent(
    nativeReorder.Item as React.ComponentType<ElementProps>,
    true,
  ) as typeof nativeReorder.Item,
};
