import React, {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Modal as NativeModal,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  findNodeHandle,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "./theme";
import { Heading, Text } from "./typography";
import { useKeyboardVisible } from "./state";
import { Button } from "./actions";
import { CloseButton } from "./icons";
export type OverlayCloseReason =
  | "close-button"
  | "backdrop"
  | "hardware-back"
  | "accessibility-escape"
  | "cancel-button";
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Outside body scrolling; a tall footer has its own bounded scrolling area. */
  footer?: ReactNode;
  size?: "content" | "large" | "fullscreen";
  maxHeight?: number | `${number}%`;
  /** When supplied, owns dismissal: update open after any unsaved-change check. */
  onCloseRequest?: (reason: OverlayCloseReason) => void;
  closeLabel?: string;
  dismissible?: boolean;
  returnFocusRef?: RefObject<React.ComponentRef<typeof View> | null>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Disable when the content already owns a FlatList/ScrollView. */
  scrollable?: boolean;
}
function ModalSurface({
  placement = "center",
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "content",
  maxHeight,
  onCloseRequest,
  closeLabel = "Close",
  dismissible = true,
  returnFocusRef,
  style,
  testID,
  scrollable = true,
}: DialogProps & { placement?: "center" | "bottom" }) {
  const { reducedMotion } = useTheme(),
    wasOpen = useRef(open),
    viewport = useWindowDimensions(),
    [availableHeight, setAvailableHeight] = useState(viewport.height);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (wasOpen.current && !open && returnFocusRef?.current) {
      timer = setTimeout(() => {
        const node =
          returnFocusRef.current && findNodeHandle(returnFocusRef.current);
        if (node) AccessibilityInfo.setAccessibilityFocus(node);
      }, 100);
    }
    wasOpen.current = open;
    return () => clearTimeout(timer);
  }, [open, returnFocusRef]);
  if (!open) return null;
  const close = (reason: OverlayCloseReason) => {
    if (!dismissible) return;
    if (onCloseRequest) onCloseRequest(reason);
    else onOpenChange(false);
  };
  return (
    <NativeModal
      visible
      transparent
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={() => close("hardware-back")}
      statusBarTranslucent
    >
      <SafeAreaProvider>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View
            onLayout={(event) =>
              setAvailableHeight(event.nativeEvent.layout.height)
            }
            style={{
              flex: 1,
              justifyContent: placement === "bottom" ? "flex-end" : "center",
              alignItems: "center",
            }}
          >
            <Pressable
              accessible={false}
              importantForAccessibility="no"
              onPress={() => close("backdrop")}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            />
            <ModalContent
              placement={placement}
              title={title}
              description={description}
              closeLabel={closeLabel}
              dismissible={dismissible}
              close={close}
              style={style}
              testID={testID}
              scrollable={scrollable}
              footer={footer}
              size={size}
              maxHeight={maxHeight}
              availableHeight={availableHeight}
            >
              {children}
            </ModalContent>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </NativeModal>
  );
}
function ModalContent({
  placement,
  title,
  description,
  closeLabel,
  dismissible,
  close,
  style,
  children,
  testID,
  scrollable,
  footer,
  size,
  maxHeight,
  availableHeight,
}: Omit<DialogProps, "open" | "onOpenChange"> & {
  placement: "center" | "bottom";
  close: (reason: OverlayCloseReason) => void;
  availableHeight: number;
}) {
  const { colors: c } = useTheme(),
    insets = useSafeAreaInsets(),
    keyboardVisible = useKeyboardVisible();
  const requestedLimit =
    typeof maxHeight === "number"
      ? maxHeight
      : availableHeight *
        (maxHeight
          ? Math.max(0, Math.min(100, parseFloat(maxHeight))) / 100
          : size === "fullscreen"
            ? 1
            : 0.85);
  const contentLimit = Number.isFinite(requestedLimit)
    ? Math.min(availableHeight, requestedLimit)
    : availableHeight * 0.85;
  return (
    <View
      testID={testID}
      accessibilityViewIsModal
      onAccessibilityEscape={() => close("accessibility-escape")}
      style={[
        {
          width:
            placement === "bottom" || size === "fullscreen" ? "100%" : "90%",
          maxWidth: size === "fullscreen" ? undefined : 600,
          height:
            size === "fullscreen"
              ? "100%"
              : size === "large"
                ? "85%"
                : undefined,
          maxHeight: maxHeight ?? (size === "fullscreen" ? "100%" : "85%"),
          borderRadius: size === "fullscreen" ? 0 : 20,
          borderBottomLeftRadius:
            placement === "bottom" || size === "fullscreen" ? 0 : 20,
          borderBottomRightRadius:
            placement === "bottom" || size === "fullscreen" ? 0 : 20,
          backgroundColor: c.raised,
          paddingTop: 20 + (size === "fullscreen" ? insets.top : 0),
          paddingHorizontal: 20,
          paddingBottom:
            20 +
            ((placement === "bottom" || size === "fullscreen") &&
            !keyboardVisible
              ? insets.bottom
              : 0),
          gap: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{
            flex: 1,
            minWidth: 0,
            maxHeight: Math.max(44, contentLimit * 0.3),
          }}
          contentContainerStyle={{ gap: 4 }}
        >
          <Heading level={3}>{title}</Heading>
          {description && (
            <Text size="sm" tone="muted">
              {description}
            </Text>
          )}
        </ScrollView>
        {dismissible && (
          <CloseButton
            label={closeLabel ?? "Close"}
            onPress={() => close("close-button")}
          />
        )}
      </View>
      {scrollable ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 16 }}
          style={{
            flexGrow: size === "content" ? 0 : 1,
            flexShrink: 1,
            minHeight: 0,
          }}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={{
            gap: 16,
            flexShrink: 1,
            minHeight: 0,
            flex: size === "content" ? undefined : 1,
          }}
        >
          {children}
        </View>
      )}
      {footer != null && (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{
            flexGrow: 0,
            flexShrink: 0,
            maxHeight: contentLimit * 0.35,
          }}
          contentContainerStyle={{ gap: 12 }}
        >
          <View>{footer}</View>
        </ScrollView>
      )}
    </View>
  );
}
export function Dialog(props: DialogProps) {
  return <ModalSurface {...props} />;
}
export function BottomSheet(props: DialogProps) {
  return <ModalSurface {...props} placement="bottom" />;
}
export interface AlertDialogProps extends Omit<DialogProps, "children"> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  destructive?: boolean;
  error?: string;
}
export function AlertDialog({
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  destructive = false,
  error,
  onOpenChange,
  ...props
}: AlertDialogProps) {
  return (
    <Dialog
      {...props}
      onOpenChange={onOpenChange}
      dismissible={!loading && props.dismissible !== false}
    >
      <View style={{ gap: 12 }}>
        {error && (
          <Text tone="danger" accessibilityRole="alert">
            {error}
          </Text>
        )}
        <Button
          variant={destructive ? "danger" : "primary"}
          loading={loading}
          onPress={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onPress={() =>
            props.onCloseRequest
              ? props.onCloseRequest("cancel-button")
              : onOpenChange(false)
          }
        >
          {cancelLabel}
        </Button>
      </View>
    </Dialog>
  );
}
export interface ActionSheetItem {
  id: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
}
export function ActionSheet({
  items,
  ...props
}: Omit<DialogProps, "children"> & { items: readonly ActionSheetItem[] }) {
  return (
    <BottomSheet {...props}>
      {items.map((item) => (
        <Button
          key={item.id}
          variant={item.destructive ? "danger" : "ghost"}
          disabled={item.disabled}
          icon={item.icon}
          onPress={() => {
            props.onOpenChange(false);
            item.onPress();
          }}
        >
          {item.label}
        </Button>
      ))}
    </BottomSheet>
  );
}
