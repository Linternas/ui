export * from "./base";
export * from "./forms";
export * from "./overlays";
export * from "./navigation";
export * from "./display";
export { systemCatalog, systemGroups, type SystemComponentId } from "./catalog";

export {
  uiCatalog,
  uiGroups,
  uiFamilies,
  getNewestEntries,
  NEWEST_WINDOW_DAYS,
  type UiCatalogEntry,
  type UiGroup,
} from "./ui-catalog";

export * from "./micro-interactions";

export { InteractionProvider, useMotionSettings } from "../motion-policy";
export type {
  MotionPreference,
  MotionSettings,
  InteractionProviderProps,
} from "../motion-policy";
